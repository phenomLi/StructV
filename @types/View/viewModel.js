"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("../engine");
const renderer_1 = require("./renderer");
const differ_1 = require("./differ");
const shape_1 = require("../Shapes/shape");
const util_1 = require("../Common/util");
const composite_1 = require("../Shapes/composite");
class ViewModel {
    constructor(engine, container) {
        this.engine = engine;
        // 主视图容器
        this.mainShapeContainer = {};
        // 当前视图容器
        this.curShapeContainer = {};
        // 图形队列
        this.shapeList = [];
        // 移除图形队列。需要移除的图形将被放进这个列表
        this.removeList = [];
        // 静态文本id
        this.staticTextId = 0;
        this.differ = new differ_1.Differ();
        this.layoutOption = engine.layoutOption;
        this.renderer = new renderer_1.Renderer(container, engine.animationOption);
        this.curShapeContainer = this.mainShapeContainer;
    }
    ;
    /**
     * 图形工厂,创建Shape
     * @param id
     * @param shapeName
     * @param opt
     * @param subShapeConfig
     */
    createShape(id, shapeName, opt) {
        let shapeConstruct = engine_1.Engine.ShapesTable[shapeName];
        // 若图形没有注册，报错
        util_1.Util.assert(shapeConstruct === undefined ||
            (shapeConstruct.scope && shapeConstruct.scope !== this.engine.getName()), '图形' + shapeName + ' 未注册！');
        let shape = this.reuseShape(id, shapeName, opt);
        // 若没有找到复用的图形，则创建新图形
        if (shape === null) {
            shape = new shapeConstruct.constructor(id, shapeName, opt);
        }
        // 若图形是复合图形，则创建子图形
        if (shape instanceof composite_1.Composite) {
            this.createCompositeSubShapes(shape);
        }
        // 将图形加入图形管理器
        shape.renderer = this.renderer;
        this.addShape(shape, shapeName);
        // 若为文本类型，则先创建zrender图形实例
        if (shapeName === 'text' && shape.zrenderShape === null) {
            shape.zrenderShape = shape.createZrenderShape();
        }
        return shape;
    }
    createCompositeSubShapes(shape) {
        shape.subShapes.map((item, index) => {
            let subShapeOption = { style: {} };
            util_1.Util.extends(subShapeOption, shape.option);
            util_1.Util.extends(subShapeOption.style, shape.style);
            if (item.init) {
                util_1.Util.extends(subShapeOption, item.init(shape.option, shape.style));
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
    addShape(shape, listName) {
        let shapeContainer = this.curShapeContainer;
        if (shapeContainer[listName] === undefined) {
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
    removeShape(shape) {
        // 从shapeContainer中移除图形
        util_1.Util.removeFromList(this.curShapeContainer[shape.name], item => item.id === shape.id);
        // 更改图形挂载状态为需卸载
        shape.mountState = shape_1.mountState.NEEDUNMOUNT;
        if (this.curShapeContainer[shape.name].length === 0) {
            delete this.curShapeContainer[shape.name];
        }
        this.removeList.push(shape);
    }
    /**
     * 更新复合图形
     */
    updateComposite() {
        this.shapeList.map(shape => {
            if (shape instanceof composite_1.Composite) {
                shape.updateSubShapes();
            }
        });
    }
    /**
     * 寻找可复用的Shape
     * @param id
     * @param shapeName
     */
    reuseShape(id, shapeName, opt) {
        // 若图形容器中根本没有这个类型的图形，则表明不能复用
        if (this.mainShapeContainer[shapeName] === undefined) {
            return null;
        }
        let existShape = this.mainShapeContainer[shapeName].find(item => item.id === id);
        // 若找到复用的图形
        if (existShape) {
            // 重置图形的数据
            existShape.restoreData();
            existShape.applyShapeOption(opt);
            existShape.visible = true;
            return existShape;
        }
        return null;
    }
    /**
     * 布局view
     * @param elements
     * @param layoutFn
     */
    layoutElements(elements, layoutFn) {
        if (Object.keys(elements).length === 1 && elements['element']) {
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
        if (this.engine.isViewUpdating()) {
            this.renderer.skipUpdateZrenderShapes(() => {
                this.afterUpdate.call(this);
            });
        }
        if (this.curShapeContainer !== this.mainShapeContainer) {
            // 对图形容器进行differ
            let patchList = this.differ.differShapeContainer(this.mainShapeContainer, this.curShapeContainer);
            this.curShapeContainer = this.mainShapeContainer;
            // 对图形容器进行patch
            this.differ.patch(this, patchList);
        }
        this.beforeUpdate();
        // 渲染zrender图形实例
        this.renderer.renderZrenderShapes(this.mainShapeContainer, this.removeList);
        // 调整视图元素
        if (this.layoutOption.autoAdjust === undefined || this.layoutOption.autoAdjust === true) {
            this.renderer.adjustShapes(this.shapeList);
        }
        // 更新zrender图形实例
        this.renderer.updateZrenderShapes(() => {
            this.afterUpdate.call(this);
        });
        // 将当前图形容器改为临时容器
        this.curShapeContainer = {};
        //console.log(this.mainShapeContainer);
    }
    /**
     * 重置上一次的数据，包括：
     * - shape的visited状态
     * - tempShapeContainer保存的内容
     */
    resetData() {
        Object.keys(this.mainShapeContainer).map(shapeList => {
            this.mainShapeContainer[shapeList].map((shape) => shape.visited && (shape.visited = false));
        });
        this.staticTextId = 0;
        this.shapeList.length = 0;
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
    // ----------------------------------------------------------------
    /**
     * 视图更新前
     */
    beforeUpdate() {
        this.engine.isViewUpdating(true);
        this.engine.beforeUpdate();
    }
    /**
     * 视图更新后
     */
    afterUpdate() {
        this.engine.isViewUpdating(false);
        this.engine.afterUpdate();
    }
}
exports.ViewModel = ViewModel;