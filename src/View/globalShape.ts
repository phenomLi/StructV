import { zrenderShape, Renderer } from "./renderer";
import { Shape } from "../Shapes/shape";
import { BoundingRect } from "./boundingRect";



export class GlobalShape {
    renderer: Renderer;
    zrenderGroup: zrenderShape = null;

    scaleX: number;
    scaleY: number;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.zrenderGroup = new Renderer.zrender.Group();
    }

    /**
     * 添加图形
     * @param shape 
     */
    add(shape: Shape | Shape[]) {
        if(Array.isArray(shape)) {
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
    remove(shape: Shape | Shape[]) {
        if(shape instanceof Array) {
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
    scale(x: number, y: number, animation: boolean = false) {
        let prop = {
            scale: [x, y]
        };

        this.renderer.setAttribute(this.zrenderGroup, prop, animation);

        this.scaleX = x;
        this.scaleY = y;
    }

    /**
     * 位移
     * @param dx 
     * @param dy 
     * @param animation
     */
    translate(dx: number, dy: number, animation: boolean = false) {
        let position = this.getPosition(),
            prop = {
                position: [position[0] + dx, position[1] + dy]
            };

        this.renderer.setAttribute(this.zrenderGroup, prop, animation);
    }

    /**
     * 获取图形组中心
     */
    getCenter(): { x: number, y: number } {
        let bound = this.zrenderGroup.getBoundingRect();

        return {
            x: bound.x + bound.width / 2,
            y: bound.y + bound.height / 2
        };
    }

    /**
     * 获取position
     */
    getPosition(): [number, number] {
        return this.zrenderGroup.position;
    }

    /**
     * 获取包围盒
     */
    getBound(): BoundingRect {
        return this.zrenderGroup.getBoundingRect();
    }

    /**
     * 设置原点
     * @param x
     * @param y
     */
    setOrigin(x: number, y: number) {
        this.zrenderGroup.attr('origin', [x, y]);
    }

    /**
     * 设置position
     * @param x 
     * @param y 
     */
    setPosition(x: number, y: number) {
        this.zrenderGroup.attr('position', [x, y]);
    }
}