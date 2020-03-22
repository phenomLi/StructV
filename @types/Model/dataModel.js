"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_1 = require("./element");
const composite_1 = require("../Shapes/composite");
const util_1 = require("../Common/util");
const linkHelper_1 = require("./linkHelper");
const pointerHelper_1 = require("./pointerHelper");
// 数据模型管理器
class DataModel {
    constructor(engine, viewModel) {
        this.engine = engine;
        // 图形绑定队列
        this.bindingInfos = [];
        // 元素队列
        this.elementList = [];
        // 元素容器，即源数据经element包装后的结构
        this.elementContainer = {};
        this.engine = engine;
        this.viewModel = viewModel;
        this.linkHelper = new linkHelper_1.LinkHelper(engine, this, viewModel);
        this.pointerHelper = new pointerHelper_1.PointerHelper(engine, this, viewModel);
    }
    /**
     * 从源数据构建element集
     * 主要工作：
     * - 遍历源数据，将每个SourceElement转化为Element
     * - 处理连接
     * - 处理指针
     * @param sources
     */
    constructElements(sources) {
        if (Array.isArray(sources)) {
            this.elementContainer['element'] = sources.map(item => {
                return this.createElement(item, 'element');
            });
        }
        else {
            Object.keys(sources).map(prop => {
                this.elementContainer[prop] = sources[prop].map(item => {
                    return this.createElement(item, prop);
                });
            });
        }
        // 若存在连接，则处理结点间的连接
        if (this.engine.layoutOption.link) {
            this.linkHelper.buildLinkRelation(this.elementContainer, this.elementList);
        }
    }
    /**
     * 根据sources结构，将element绑定shape
     */
    bindShapes() {
        Object.keys(this.elementContainer).map(prop => {
            this.elementContainer[prop].map(ele => {
                // 元素绑定对应图形
                this.bind(ele, ele.shape, (ele, shape) => {
                    if (!ele.updateShape(shape)) {
                        shape.x = ele.x;
                        shape.y = ele.y;
                        shape.rotation = ele.rotation;
                    }
                });
            });
        });
        // 若存在指针，则处理指针
        if (this.engine.layoutOption.pointer) {
            this.pointerHelper.bindPointerShape(this.engine.layoutOption.pointer, this.elementList);
        }
        // 若声明连接，则进行连接绑定
        if (this.engine.layoutOption.link) {
            this.linkHelper.bindLinkShape(this.engine.layoutOption.link, this.elementList);
        }
    }
    /**
     * 响应绑定（更新绑定的shapes）
     */
    emitShapes() {
        this.bindingInfos.map(bindingItem => {
            bindingItem.bindFn(bindingItem.element, bindingItem.shape);
        });
        this.bindingInfos.map(bindingItem => {
            // 若绑定的是多个图形
            if (Array.isArray(bindingItem.shape)) {
                bindingItem.shape.map(item => {
                    // 若某个图形为复合图形，则更新其子图形
                    if (item instanceof composite_1.Composite) {
                        item.updateSubShapes();
                    }
                });
            }
            else {
                // 若某个图形为复合图形，则更新其子图形
                if (bindingItem.shape instanceof composite_1.Composite) {
                    bindingItem.shape.updateSubShapes();
                }
            }
        });
    }
    /**
     * 获取Elements
     */
    getElements() {
        return this.elementContainer;
    }
    /**
     * 元素工厂，创建Element
     * @param elementName
     * @param sourceElement
     */
    createElement(sourceElement, elementName) {
        let elementId = elementName + '#' + sourceElement.id, ele = null;
        let eleConstructor = this.engine.ElementsTable[elementName];
        // 若没有声明元素，退回至基类Element
        if (eleConstructor === undefined) {
            eleConstructor = element_1.Element;
        }
        ele = new eleConstructor();
        let shapeOption = this.engine.layoutOption[elementName], contents = null, shapeName = null, shape = null;
        shapeName = typeof this.engine.elementsOption === 'object' ?
            this.engine.elementsOption[elementName] :
            this.engine.elementsOption;
        ele.applySourceElement(sourceElement, this.engine.sourcesField ? this.engine.sourcesField[elementName] : null);
        ele.elementId = elementId;
        ele.name = elementName;
        contents = Array.isArray(shapeOption.content) ?
            shapeOption.content.map(item => this.parserElementContent(ele, item)) :
            this.parserElementContent(ele, shapeOption.content);
        shape = this.viewModel.createShape(ele.elementId, shapeName, Object.assign({}, shapeOption, { content: contents }));
        shape.element = ele;
        // 初始化元素数据
        ele.shape = shape;
        ele.rotation = shape.rotation;
        ele.style = shape.style;
        ele.layoutOption = this.engine.layoutOption;
        // 初始化元素自定义数据
        ele.init && ele.init();
        this.elementList.push(ele);
        return ele;
    }
    /**
     * 解析元素文本内容
     * @param ele
     * @param content
     */
    parserElementContent(ele, content) {
        // 若存在文本声明，解析文本
        if (content) {
            let contents = util_1.Util.textParser(content);
            if (Array.isArray(contents)) {
                let values = contents.map(item => ele[item]);
                values.map((item, index) => {
                    content = content.replace('[' + contents[index] + ']', item);
                });
            }
            return content;
        }
        else {
            content = null;
        }
    }
    /**
     * 绑定shape
     * @param bindingInfo
     */
    bind(ele, shape, bindFn, param) {
        this.bindingInfos.push({
            element: ele,
            shape,
            param,
            bindFn
        });
    }
    /**
     * 重置上一次的数据，包括：
     * - elementList
     * - elementContainer
     * - bindingInfo绑定信息
     * @param shapeContainer
     */
    resetData() {
        this.elementList.length = 0;
        this.bindingInfos.length = 0;
        this.elementContainer = {};
        this.linkHelper.clear();
    }
    /**
     * 清空数据
     */
    clear() {
        this.resetData();
    }
}
exports.DataModel = DataModel;
;
