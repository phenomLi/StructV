import { Engine } from "../engine";
import { Renderer } from "./renderer";
import { Differ } from "./differ";
import { LayoutOption } from "../option";
import { Shape, mountState } from "../Shapes/shape";
import { Util } from "../Common/util";
import { Composite } from "../Shapes/composite";
import { ElementContainer } from "../Model/dataModel";
import { Text } from "../Shapes/text";


// 图形容器类型
export type shapeContainer = {
    [key: string]: Shape[];
};



export class ViewModel {
    // 差异比较器
    private differ: Differ;
    // 主视图容器
    private mainShapeContainer: shapeContainer = {};
    // 当前视图容器
    private curShapeContainer: shapeContainer = {};
    // 图形队列
    private shapeList: Shape[] = [];
    // 持续的图形队列
    private maintainShapeList: Shape[] = [];
    // 移除图形队列。需要移除的图形将被放进这个列表
    private removeList: Shape[] = [];
    // 布局配置项
    private layoutOption: LayoutOption;
    // 静态文本id
    public staticTextId: number = 0;
    // 渲染器
    public renderer: Renderer;
    // 是否正在执行视图更新
    public isViewUpdating: boolean = false;

    constructor(private engine: Engine, container: HTMLElement) {
        this.differ = new Differ();
        this.layoutOption = engine.layoutOption;
        this.renderer = new Renderer(container, this, engine.animationOption);

        this.curShapeContainer = this.mainShapeContainer;
    };


    /**
     * 图形工厂,创建Shape
     * @param id
     * @param shapeName
     * @param opt
     * @param subShapeConfig
     */
    createShape(id: string, shapeName: string, opt): Shape {
        let shapeConstruct = Engine.ShapesTable[shapeName];

        // 全局图形表没有，去私有表找
        if(shapeConstruct === undefined) {
            shapeConstruct = this.engine.scopedShapesTable[shapeName];
        }

        // 若都找不到图形，报错
        Util.assert(shapeConstruct === undefined, '图形' + shapeName + ' 未注册！');

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
        this.addShape(shape, shapeName);

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
     * @param listName
     */
    addShape(shape: Shape, listName: string) {
        let shapeContainer = this.curShapeContainer;
            
        if(shapeContainer[listName] === undefined) {
            shapeContainer[listName] = [];
        }

        shapeContainer[listName].push(shape);
        this.shapeList.push(shape);
    }

    /**
     * 将图形从view中移除
     * @param shape 
     * @param listName
     */
    removeShape(shape: Shape) {
        // 从shapeContainer中移除图形
        Util.removeFromList<Shape>(this.curShapeContainer[shape.name], item => item.id === shape.id);
        // 更改图形挂载状态为需卸载
        shape.mountState = mountState.NEEDUNMOUNT;

        if(this.curShapeContainer[shape.name].length === 0) {
            delete this.curShapeContainer[shape.name];
        }

        this.removeList.push(shape);
    }

    /**
     * 更新复合图形
     */
    private updateComposite() {
        this.shapeList.map(shape => {
            if(shape instanceof Composite) {
                shape.updateSubShapes();
            }
        });
    }

    /**
     * 寻找可复用的Shape
     * @param id
     * @param shapeName
     */
    private reuseShape(id: string, shapeName: string, opt): Shape {
        // 若图形容器中根本没有这个类型的图形，则表明不能复用
        if(this.mainShapeContainer[shapeName] === undefined) {
            return null;
        }

        let existShape = this.mainShapeContainer[shapeName].find(item => item.id === id);

        // 若找到复用的图形
        if(existShape) {
            // 重置图形的数据
            existShape.restoreData();
            existShape.applyShapeOption(opt);
            existShape.visible = true;

            if(existShape instanceof Text) {
                existShape.updateTextSize(existShape.zrenderShape);
            }

            return existShape;
        }

        return null;
    }

    /**
     * 布局view
     * @param elements 
     * @param layoutFn 
     */
    layoutElements(elements: ElementContainer | Element[], layoutFn: Function) {
        if(Object.keys(elements).length === 1 && elements['element']) {
            elements = elements['element'];
        }

        // 调用自定义布局函数
        layoutFn(elements, this.renderer.getContainerWidth(), this.renderer.getContainerHeight());
    }

    /**
     * 渲染view
     */
    renderShapes() {
        // 更新所有复合图形
        this.updateComposite();

        // 如果进行这次更新时上次更新还未完成，跳过上次更新的动画
        if(this.isViewUpdating) {
            this.renderer.skipUpdateZrenderShapes(() => {
                this.afterUpdate.call(this);
            });
        }

        if(this.curShapeContainer !== this.mainShapeContainer) {
            // 对图形容器进行differ
            let patchList = this.differ.differShapeContainer(this.mainShapeContainer, this.curShapeContainer);

            this.curShapeContainer = this.mainShapeContainer;
            // 对图形容器进行patch
            this.differ.patch(this, patchList);
        }

        this.isViewUpdating = true;
        this.beforeUpdate();
        // 渲染zrender图形实例
        this.renderer.renderZrenderShapes(this.mainShapeContainer, this.removeList);
        // 调整视图
        this.renderer.adjustGlobalShape(this.layoutOption.translate, this.layoutOption.scale);
        // 更新zrender图形实例
        this.renderer.updateZrenderShapes(() => {
            this.afterUpdate.call(this);
        });

        //console.log(this.mainShapeContainer);
    }


    /**
     * 重置上一次的数据，包括：
     * - shape的visited状态
     * - tempShapeContainer保存的内容
     */
    resetData() {
        Object.keys(this.mainShapeContainer).map(shapeList => {
            this.mainShapeContainer[shapeList].map((shape: Shape) => shape.visited && (shape.visited = false));
        });

        this.maintainShapeList = this.shapeList;

        this.staticTextId = 0;
        this.shapeList = [];
        this.removeList.length = 0;
        this.curShapeContainer = {};
    }

    /**
     * 清空所有图形
     */
    clearShape() {
        this.curShapeContainer = {};
        this.mainShapeContainer = {};
        this.shapeList.length = 0;
        this.removeList.length = 0;
        this.renderer.clear();
    }

    /**
     * 获取图形队列
     */
    getShapeList(): Shape[] {
        return this.shapeList.length? this.shapeList: this.maintainShapeList;
    }

    // ----------------------------------------------------------------

    /**
     * 视图更新前 
     */
    beforeUpdate() {
        this.engine.beforeUpdate();
    }

    /**
     * 视图更新后
     */
    afterUpdate() {
        this.engine.afterUpdate();
    }
}