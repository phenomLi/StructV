"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_1 = require("./element");
const util_1 = require("../Common/util");
const linkModel_1 = require("./linkModel");
const pointerModel_1 = require("./pointerModel");
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
        this.linkModel = new linkModel_1.LinkModel(this, viewModel, this.engine.layoutOption);
        this.pointerModel = new pointerModel_1.PointerModel(this, viewModel, this.engine.layoutOption);
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
            this.elementContainer['element'] = [];
            sources.map(item => {
                if (item) {
                    this.elementContainer['element'].push(this.createElement(item, 'element'));
                }
            });
        }
        else {
            Object.keys(sources).map(prop => {
                this.elementContainer[prop] = [];
                sources[prop].map(item => {
                    if (item) {
                        this.elementContainer[prop].push(this.createElement(item, prop));
                    }
                });
            });
        }
        // 构建连接模型
        this.linkModel.constructLinks(this.elementContainer, this.elementList);
        // 构建指针模型
        this.pointerModel.constructPointers(this.elementList);
        //console.log(this.elementContainer);
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
                        shape.width = ele.width;
                        shape.height = ele.height;
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
        // 若声明连接，则进行连接绑定
        this.linkModel.emitLinkShapes(this.elementList);
        // 若存在指针，则处理指针
        this.pointerModel.emitPointerShapes(this.elementList);
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
        ele = new eleConstructor(sourceElement);
        ele.elementId = elementId;
        ele.name = elementName;
        let shapeOption = null, contents = null, shapeName = null, shape = null;
        shapeOption = this.engine.layoutOption[elementName];
        shapeName = typeof this.engine.elementsOption === 'object' ?
            this.engine.elementsOption[elementName] :
            this.engine.elementsOption;
        contents = Array.isArray(shapeOption.content) ?
            shapeOption.content.map(item => this.parserElementContent(ele, item)) :
            this.parserElementContent(ele, shapeOption.content);
        shape = this.viewModel.createShape(ele.elementId, shapeName, Object.assign({}, shapeOption, { content: contents }));
        // 初始化元素数据
        ele.shape = shape;
        ele.width = shape.width;
        ele.height = shape.height;
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
     * 动态添加一个连接
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的连接
     * @param emitElement
     * @param targetElement
     * @param linkName
     * @param anchorPair
     */
    addLink(emitElement, targetElement, linkName, value = null, anchorPair = null) {
        // 若emitElement中的linkName字段有且仅有一个元素
        if (emitElement[linkName] && !Array.isArray(emitElement[linkName])) {
            emitElement[linkName] = [emitElement[linkName], targetElement];
        }
        // 若emitElement中的linkName字段有多个元素
        else if (emitElement[linkName] && Array.isArray(emitElement[linkName])) {
            emitElement[linkName].push(targetElement);
        }
        // 若emitElement中的linkName字段为空
        else {
            emitElement[linkName] = targetElement;
        }
        this.linkModel.addLinkPair({
            element: emitElement,
            target: targetElement,
            linkName,
            sourceTarget: null,
            label: value ? value.toString() : null,
            anchorPair
        });
    }
    /**
     * 动态添加一个外部指针
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的外部指针
     * @param targetElement
     * @param pointerName
     * @param value
     */
    addPointer(targetElement, pointerName, value) {
        this.pointerModel.addPointerPair(targetElement, pointerName, value);
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
