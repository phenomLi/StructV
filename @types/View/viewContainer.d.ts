import { zrenderShape, Renderer } from "./renderer";
import { Shape } from "../Shapes/shape";
export declare class ViewContainer {
    renderer: Renderer;
    zrenderGroup: zrenderShape;
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
     * 位移至（是目标不是距离）
     * @param x
     * @param y
     * @param animation
     */
    translate(x: number, y: number, animation?: boolean): void;
    /**
     * 获取图形组中心
     */
    getCenter(): {
        x: number;
        y: number;
    };
    /**
     * 设置原点
     * @param x
     * @param y
     */
    setOrigin(x?: number, y?: number): void;
}
