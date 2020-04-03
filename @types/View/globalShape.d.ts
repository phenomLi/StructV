import { zrenderShape, Renderer } from "./renderer";
import { Shape } from "../Shapes/shape";
import { BoundingRect } from "./boundingRect";
export declare class GlobalShape {
    renderer: Renderer;
    zrenderGroup: zrenderShape;
    scaleX: number;
    scaleY: number;
    constructor(renderer: Renderer);
    /**
     * 添加图形
     * @param shape
     */
    add(shape: Shape | Shape[]): void;
    /**
     * 移除图形
     * @param shape
     */
    remove(shape: Shape | Shape[]): void;
    /**
     * 清空所以子图形
     */
    clear(): void;
    /**
     * 缩放
     * @param x
     * @param y
     * @param animation
     */
    scale(x: number, y: number, animation?: boolean): void;
    /**
     * 位移
     * @param dx
     * @param dy
     * @param animation
     */
    translate(dx: number, dy: number, animation?: boolean): void;
    /**
     * 获取图形组中心
     */
    getCenter(): {
        x: number;
        y: number;
    };
    /**
     * 获取position
     */
    getPosition(): [number, number];
    /**
     * 获取包围盒
     */
    getBound(): BoundingRect;
    /**
     * 设置原点
     * @param x
     * @param y
     */
    setOrigin(x: number, y: number): void;
    /**
     * 设置position
     * @param x
     * @param y
     */
    setPosition(x: number, y: number): void;
}
