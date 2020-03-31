import { Shape, Style } from "./shape";
import { zrenderShape } from "../View/renderer";
import { BoundingRect } from "../View/boundingRect";
import { BaseShapeOption } from "../option";
export declare class PolyLine extends Shape {
    path: Array<[number, number]>;
    prevPath: Array<[number, number]>;
    constructor(id: string, name: string, opt: BaseShapeOption);
    restoreData(): void;
    defaultStyle(baseStyle: Style): Style;
    getBound(): BoundingRect;
    createZrenderShape(): zrenderShape;
}
