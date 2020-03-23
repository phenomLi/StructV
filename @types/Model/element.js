"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boundingRect_1 = require("../View/boundingRect");
class Element {
    constructor() {
        this.name = 'element';
        this.type = 'element';
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.style = null;
        this.shape = null;
    }
    /**
     * 应用源数据元素的属性
     * @param sourceElement
     */
    applySourceElement(sourceElement, field) {
        // 若有已声明的默认字段，则按照字段复制
        if (field) {
            field.map(prop => {
                // 复制sourceElement中存在的字段到element
                if (sourceElement[prop] !== undefined) {
                    this[prop] = sourceElement[prop];
                }
                // element中存在sourceElement中不存在的字段，则element删除该字段
                if (sourceElement[prop] === undefined && this[prop] !== undefined) {
                    delete this[prop];
                }
            });
        }
        // 若没有，则全部复制
        else {
            Object.keys(sourceElement).map(prop => {
                this[prop] = sourceElement[prop];
            });
        }
    }
    getWidth() {
        return this.shape.width;
    }
    getHeight() {
        return this.shape.height;
    }
    /**
     * 获取元素包围盒
     */
    getBound() {
        let w = this.getWidth(), h = this.getHeight();
        let originBound = {
            x: this.x - w / 2,
            y: this.y - h / 2,
            width: w,
            height: h
        };
        if (this.rotation) {
            return boundingRect_1.Bound.rotation(originBound, this.rotation);
        }
        else {
            return originBound;
        }
    }
    // ------------------------钩子方法-------------------------
    /**
     * 定义如何更新元素自身对应的图形
     */
    updateShape(shape) {
        return false;
    }
    /**
     * 当结点连接其他结点触发
     * @param targetEle
     * @param linkStyle
     * @param linkName
     */
    onLink(targetEle, linkStyle, linkName) { }
    ;
    /**
     * 当指向结点时触发
     * @param pointerStyle
     * @param pointerName
     * @param pointerValue
     */
    onRefer(pointerStyle, pointerName, pointerValue) { }
    /**
     * 当元素发生变化
     * @param type
     */
    onChange(type) { }
}
exports.Element = Element;
