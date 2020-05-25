import { Engine } from "../engine";
import { Renderer } from "./renderer";
import { Reconciler } from "./reconciler";
import { BaseShapeOption } from "../option";
import { Shape, mountState } from "../Shapes/shape";
import { Util } from "../Common/util";
import { Composite } from "../Shapes/composite";
import { Text } from "../Shapes/text";


// 图形容器类型
export type shapeContainer = {
    [key: string]: Shape[];
};



export class ViewModel {
    // 差异比较器
    private reconciler: Reconciler;
    // 主视图容器
    private shapeContainer: shapeContainer = {};
    // 图形队列
    private shapeList: Shape[] = [];
    // 移除图形队列。需要移除的图形将被放进这个列表
    private removeList: Shape[] = [];
    // 静态文本id
    public staticTextId: number = 0;
    // 渲染器
    public renderer: Renderer;
    // 是否正在执行视图更新
    public isViewUpdating: boolean = false;
    // 是否首次渲染
    public isFirstRender: boolean = true;
    // 是否是结构性更新
    public structuralUpdate: boolean = false;

    constructor(private engine: Engine, container: HTMLElement) {
        this.reconciler = new Reconciler(this);
        this.renderer = new Renderer(container, this, engine.viewOption);
    };


    /**
     * 图形工厂,创建Shape
     * @param id
     * @param shapeValue
     * @param opt
     */
    createShape(id: string, shapeValue: string | { new(...arg): Shape }, opt: Partial<BaseShapeOption>): Shape {
        let shapeConstruct = null,
            shapeName: string = null;

        if(typeof shapeValue === 'string') {
            shapeConstruct = Engine.ShapesTable[shapeValue];
            shapeName = shapeValue;
        }
        else {
            shapeConstruct = shapeValue;
            shapeName = shapeConstruct.prototype.constructor.name.toLowerCase();
        }

        // 若都找不到图形，报错
        Util.assert(shapeConstruct === undefined, '图形 ' + shapeName + ' 未注册！');

        let shape = this.reuseShape(id, shapeName, opt);
        // 若没有找到复用的图形，则创建新图形
        if(shape === null) {
            shape = new shapeConstruct(id, shapeName, opt);
        }

        // 若图形是复合图形，则创建子图形
        if(shape instanceof Composite) {
            this.createCompositeSubShapes(shape);
        }

        // 将图形加入图形管理器
        shape.renderer = this.renderer;
        this.shapeList.push(shape);

        // 若为文本类型，则先创建zrender图形实例
        if(shapeName === 'text' && shape.zrenderShape === null) {
            shape.zrenderShape = shape.createZrenderShape();
        }
        
        return shape;
    }

    /**
     * 创建复合图形的子图形
     * @param shape 
     */
    createCompositeSubShapes(shape: Composite) {
        shape.subShapes.map((item, index) => {
            let subShapeOption = { style: {} };

            Util.extends(subShapeOption, shape.option);
            Util.extends(subShapeOption.style, shape.style);
            if(item.init) {
                Util.extends(subShapeOption, item.init(shape.option, shape.style));
            } 

            item.shape = this.createShape(shape.id + '#' + index, item.shapeName, subShapeOption);
            item.shape.parentShape = shape;
        });
    }

    /**
     * 将图形加入到view
     * @param shape 
     */
    addShape(shape: Shape) {
        let shapeContainer = this.shapeContainer,
            name = shape.name;
            
        if(shapeContainer[name] === undefined) {
            shapeContainer[name] = [];
        }

        shapeContainer[name].push(shape);
    }

    /**
     * 将图形从view中移除
     * @param shape 
     * @param listName
     */
    removeShape(shape: Shape) {
        // 从shapeContainer中移除图形
        Util.removeFromList<Shape>(this.shapeContainer[shape.name], item => item.id === shape.id);
        // 更改图形挂载状态为需卸载
        shape.mountState = mountState.NEEDUNMOUNT;

        if(this.shapeContainer[shape.name].length === 0) {
            delete this.shapeContainer[shape.name];
        }

        this.removeList.push(shape);
    }

    /**
     * 寻找可复用的Shape
     * @param id
     * @param shapeName
     */
    private reuseShape(id: string, shapeName: string, opt): Shape {
        // 若图形容器中根本没有这个类型的图形，则表明不能复用
        if(this.shapeContainer[shapeName] === undefined) {
            return null;
        }

        let existShape = this.shapeContainer[shapeName].find(item => item.id === id);

        // 若找到复用的图形
        if(existShape) {
            // 重置图形的数据
            existShape.restoreData();
            existShape.applyShapeOption(opt);
            existShape.visible = true;

            if(existShape instanceof Text) {
                existShape.updateTextSize();
            }

            return existShape;
        }

        return null;
    }

    /**
     * 进行 shape 的调和（即 differ + patch） 
     * @param reconcileShapeOnly
     */
    reconciliation(reconcileShapeOnly: boolean = false) {
        // 更新复合图形
        this.shapeList.forEach(shape => {
            if(shape instanceof Composite && shape.isDirty) {
                shape.updateSubShapes();
            }
        });

        if(reconcileShapeOnly) {
            for(let i = 0; i < this.shapeList.length; i++) {
                this.reconciler.reconcileShape(this.shapeList[i], this.shapeList[i]);
            }
        }
        else {
            if(this.isFirstRender) {
                this.shapeList.forEach(item => {
                    this.addShape(item);
                });
            }
            else {
                // 对图形容器进行 differ 调和
                this.reconciler.reconcileShapeList(this.shapeContainer, this.shapeList);
            }
        }
    }

    /**
     * 渲染 view
     * @param adjustView
     */
    renderShapes(adjustView: boolean = true) {
        // 如果进行这次更新时上次更新还未完成，跳过上次更新的动画
        if(this.isViewUpdating) {
            this.renderer.skipUpdateZrenderShapes(this.afterUpdate.bind(this));
        }

        if(this.structuralUpdate) {
            // 渲染（创建和销毁） zrender 图形实例
            this.renderer.renderZrenderShapes(this.shapeList, this.removeList);
        }

        // 若不是只单纯地更新视图某个元素（涉及结构变化），需要进行下面步骤
        if(adjustView) {
            // 调整视图
            let globalShape = this.renderer.getGlobalShape();
            this.renderer.setGlobalShapePosition(globalShape.getBound());
            this.renderer.setGlobalShapeScale(globalShape.getBound());
        }

        // 更新 zrender 图形实例
        this.renderer.updateZrenderShapes(this.afterUpdate.bind(this));

        // 取消首次渲染的标志
        if(this.isFirstRender) {
            this.isFirstRender = false;
        }

        // console.log(this.shapeContainer);
    }


    /**
     * 重置上一次的数据
     */
    resetData() {
        Object.keys(this.shapeContainer).map(shapeList => {
            this.shapeContainer[shapeList].map((shape: Shape) => shape.visited && (shape.visited = false));
        });

        this.staticTextId = 0;
        this.shapeList.length = 0;
        this.removeList.length = 0;
    }

    /**
     * 清空所有图形
     */
    clearShapes() {
        this.shapeContainer = {};
        this.shapeList.length = 0;
        this.removeList.length = 0;
        this.renderer.clear();
    }

    /**
     * 获取图形队列
     */
    getShapeList(): Shape[] {
        return this.shapeList.filter(item => item.mountState !== mountState.NEEDUNMOUNT);
    }

    /**
     * 获取某个图形
     * @param id 
     */
    getShape(id: string): Shape {
        return this.shapeList.find(item => item.id === id);
    }

    /**
     * 完成更新后的回调
     */
    private afterUpdate() {
        this.renderer.getGlobalShape().updateOriginToCenter();

        this.structuralUpdate = false;
        this.isViewUpdating = false;
        this.shapeList.forEach(item => {
            item.isDirty = false;
        });

        this.engine.afterUpdate();
    }
}