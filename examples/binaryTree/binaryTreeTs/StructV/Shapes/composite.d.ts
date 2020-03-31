import { Shape, Style } from "./shape";
import { zrenderShape } from "../View/renderer";
import { BoundingRect } from "../View/boundingRect";
export declare type subShapeInfo = {
    label: string;
    shape: Shape;
    shapeName: string;
    draw: (parent: Composite, subShape: Shape) => void;
    init: (parentOption: any, style: Style) => any;
};
export declare class Composite extends Shape {
    type: string;
    subShapes: subShapeInfo[];
    constructor(id: string, name: string, opt: any);
    /**
     * 添加子图形
     * @param subShapeConfig
     */
    addSubShape(subShapeConfig: {
        [key: string]: Partial<subShapeInfo>;
    }): void;
    /**
     * 获取子图形
     * @param name
     */
    getSubShape(name: string): Shape;
    /**
     * 更新子图形属性
     */
    updateSubShapes(): void;
    getBound(): BoundingRect;
    createZrenderShape(): zrenderShape;
}
