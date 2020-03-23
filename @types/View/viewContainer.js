"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
class ViewContainer {
    constructor(renderer) {
        this.zrenderGroup = null;
        this.renderer = renderer;
        this.zrenderGroup = new renderer_1.Renderer.zrender.Group();
    }
    /**
     * 添加图形
     * @param shape
     */
    add(shape) {
        if (Array.isArray(shape)) {
            shape.map(item => this.add(item));
        }
        else {
            shape.parentShape === null && this.zrenderGroup.add(shape.zrenderShape);
        }
    }
    /**
     * 移除图形
     * @param shape
     */
    remove(shape) {
        if (shape instanceof Array) {
            shape.map(item => this.remove(item));
        }
        else {
            this.zrenderGroup.remove(shape.zrenderShape);
            shape.zrenderShape = null;
        }
    }
    /**
     * 清空所以子图形
     */
    clear() {
        this.zrenderGroup.removeAll();
    }
    /**
     * 缩放
     * @param x
     * @param y
     * @param animation
     */
    scale(x, y, animation = false) {
        let prop = {
            scale: [x, y]
        };
        this.renderer.setAttribute(this.zrenderGroup, prop, animation);
    }
    /**
     * 位移至（是目标不是距离）
     * @param x
     * @param y
     * @param animation
     */
    translate(x, y, animation = false) {
        let prop = {
            position: [x, y]
        };
        this.renderer.setAttribute(this.zrenderGroup, prop, animation);
    }
    /**
     * 获取图形组中心
     */
    getCenter() {
        let bound = this.zrenderGroup.getBoundingRect();
        return {
            x: bound.x + bound.width / 2,
            y: bound.y + bound.height / 2
        };
    }
    /**
     * 设置原点
     * @param x
     * @param y
     */
    setOrigin(x, y) {
        if (x !== undefined && y !== undefined) {
            this.zrenderGroup.attr('origin', [x, y]);
        }
        else {
            let center = this.getCenter();
            this.zrenderGroup.attr('origin', [center.x, center.y]);
        }
    }
}
exports.ViewContainer = ViewContainer;
