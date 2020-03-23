"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_1 = require("./element");
const util_1 = require("../Common/util");
const linkModel_1 = require("./linkModel");
const pointerModel_1 = require("./pointerModel");
const containerModel_1 = require("./containerModel");
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
        this.linkModel = new linkModel_1.LinkModel(engine, this, viewModel);
        this.pointerModel = new pointerModel_1.PointerModel(engine, this, viewModel);
        this.containerModel = new containerModel_1.ContainerModel(engine, this, viewModel);
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
        // 构建连接模型
        if (this.engine.layoutOption.link) {
            this.linkModel.constructLinks(this.elementContainer, this.elementList, this.engine.layoutOption.link);
        }
        // 构建容器模型
        if (this.engine.layoutOption.container) {
            this.containerModel.constructContainers(this.elementContainer, this.engine.layoutOption.container);
        }
        // 构建指针模型
        if (this.engine.layoutOption.pointer) {
            this.pointerModel.constructPointers(this.elementList, this.engine.layoutOption.pointer);
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
    }
    /**
     * 响应绑定（更新绑定的shapes）
     */
    emitShapes() {
        // 更新与元素绑定的图形
        this.bindingInfos.map(bindingItem => {
            bindingItem.bindFn(bindingItem.element, bindingItem.shape);
        });
        if (this.engine.layoutOption.container) {
            this.containerModel.updateContainerShape();
        }
        // 若声明连接，则进行连接绑定
        if (this.engine.layoutOption.link) {
            this.linkModel.updateLinkShape();
        }
        // 若存在指针，则处理指针
        if (this.engine.layoutOption.pointer) {
            this.pointerModel.updatePointerShape();
        }
    }
    /**
     * 获取Elements
     */
    getElements() {
        // 筛去container元素，不暴露到engine的render方法（不允许用户修改container元素）
        if (this.engine.layoutOption.container) {
            let elementContainer = {};
            Object.keys(this.elementContainer).map(key => {
                if (!this.engine.layoutOption.container[key]) {
                    elementContainer[key] = this.elementContainer[key];
                }
            });
            return elementContainer;
        }
        else {
            return this.elementContainer;
        }
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
        ele.applySourceElement(sourceElement, this.engine.sourcesField ? this.engine.sourcesField[elementName] : null);
        ele.elementId = elementId;
        ele.name = elementName;
        let shapeOption = null, contents = null, shapeName = null, shape = null;
        // 若是容器元素
        if (this.engine.layoutOption.container && this.engine.layoutOption.container[elementName]) {
            ele.type = 'container';
            shapeOption = this.engine.layoutOption.container[elementName];
            shape = this.viewModel.createShape(ele.elementId, 'rect', shapeOption);
        }
        // 普通元素
        else {
            shapeOption = this.engine.layoutOption[elementName];
            shapeName = typeof this.engine.elementsOption === 'object' ?
                this.engine.elementsOption[elementName] :
                this.engine.elementsOption;
            contents = Array.isArray(shapeOption.content) ?
                shapeOption.content.map(item => this.parserElementContent(ele, item)) :
                this.parserElementContent(ele, shapeOption.content);
            shape = this.viewModel.createShape(ele.elementId, shapeName, Object.assign({}, shapeOption, { content: contents }));
        }
        // 初始化元素数据
        ele.shape = shape;
        ele.rotation = shape.rotation;
        ele.style = shape.style;
        ele.layoutOption = this.engine.layoutOption;
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
        this.linkModel.clear();
        this.pointerModel.clear();
        this.containerModel.clear();
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
