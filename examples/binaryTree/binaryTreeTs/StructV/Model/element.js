"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boundingRect_1 = require("../View/boundingRect");
class Element {
    /**
     * 应用源数据元素的属性
     * @param sourceElement
     */
    constructor(sourceElement) {
        this.name = 'element';
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.width = 0;
        this.height = 0;
        this.style = null;
        this.shape = null;
        Object.keys(sourceElement).map(prop => {
            this[prop] = sourceElement[prop];
        });
    }
    /**
     * 获取元素包围盒
     */
    getBound() {
        let w = this.width, h = this.height;
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
     * @param sourceTarget
     */
    onLinkTo(targetEle, linkStyle, linkName, sourceTarget) { }
    ;
    /**
     * 当结点被其他结点连接时触发
     * @param emitEle
     * @param linkStyle
     * @param linkName
     * @param sourceTarget
     */
    onLinkFrom(emitEle, linkStyle, linkName, sourceTarget) { }
    ;
    /**
     * 当结点断开与其他结点触发
     * @param linkName
     */
    onUnlinkTo(linkName) { }
    /**
     * 当结点被其他结点断开连接时触发
     * @param linkName
     */
    onUnlinkFrom(linkName) { }
    /**
     * 当指向结点时触发
     * @param pointerStyle
     * @param pointerName
     * @param pointerValue
     */
    onRefer(pointerStyle, pointerName, pointerValue) { }
    /**
     * 当指针离开该结点触发
     * @param pointerName
     */
    onUnrefer(pointerName) { }
    /**
     * 当元素发生变化
     * @param type
     */
    onChange(type) { }
}
exports.Element = Element;
