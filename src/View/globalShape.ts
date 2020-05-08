import { zrenderShape, Renderer } from "./renderer";
import { Shape } from "../Shapes/shape";
import { BoundingRect } from "./boundingRect";



export class GlobalShape {
    renderer: Renderer;
    zrenderGroup: zrenderShape = null;

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
     * - 每次缩放都要重新设置缩放原点
     * @param x 
     * @param y 
     * @param animation
     */
    scale(x: number, y: number, animation: boolean = false) {
        let [px, py] = this.getPosition(),
            bound = this.getBound(),
            originX = bound.x + bound.width / 2 - px,
            originY = bound.y + bound.height / 2 - py,
            prop = {
                scale: [x, y]
            };

        this.setOrigin(originX, originY);    
        this.renderer.setAttribute(this.zrenderGroup, prop, animation);
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
     * 获取 zrender 图形的 position
     */
    getPosition(): [number, number] {
        return [this.zrenderGroup.position[0], this.zrenderGroup.position[1]];
    }

    /**
     * 获取 zrender 图形的 scale
     */
    getScale(): [number, number] {
        return this.zrenderGroup.scale;
    }

    /**
     * 获取包围盒
     */
    getBound(): BoundingRect {
        let bound = this.zrenderGroup.getBoundingRect();
        this.zrenderGroup.updateTransform();
        bound.applyTransform(this.zrenderGroup.transform);
        return bound;
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