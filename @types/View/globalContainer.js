"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = require("./renderer");
class GlobalContainer {
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
     * 位移
     * @param dx
     * @param dy
     * @param animation
     */
    translate(dx, dy, animation = false) {
        let position = this.getPosition(), prop = {
            position: [position[0] + dx, position[1] + dy]
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
     * 获取position
     */
    getPosition() {
        return this.zrenderGroup.position;
    }
    /**
     * 获取包围盒
     */
    getBound() {
        return this.zrenderGroup.getBoundingRect();
    }
    /**
     * 设置原点
     * @param x
     * @param y
     */
    setOrigin(x, y) {
        this.zrenderGroup.attr('origin', [x, y]);
    }
    /**
     * 设置position
     * @param x
     * @param y
     */
    setPosition(x, y) {
        this.zrenderGroup.attr('position', [x, y]);
    }
}
exports.GlobalContainer = GlobalContainer;
