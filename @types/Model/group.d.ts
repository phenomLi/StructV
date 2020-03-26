import { Element } from "./element";
import { BoundingRect } from "../View/boundingRect";
/**
 * element组
 */
export declare class Group {
    elementId: string;
    private elements;
    constructor(...arg: Array<Element | Group>);
    /**
     * 添加element
     * @param arg
     */
    add(...arg: Array<Element | Group>): void;
    /**
     * 移除element
     * @param ele
     */
    remove(ele: Element): void;
    /**
     * 获取group的包围盒
     */
    getBound(): BoundingRect;
    getWidth(): number;
    getHeight(): number;
    /**
     * 位移group
     * @param dx
     * @param dy
     */
    translate(dx: number, dy: number): void;
    /**
     * 旋转group
     * @param rotation
     * @param center
     */
    rotation(rotation: number, center?: [number, number]): void;
    /**
     * 清空group
     */
    clear(): void;
}
