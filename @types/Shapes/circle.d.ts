import { Shape } from "./shape";
import { zrenderShape } from "../View/renderer";
import { BaseShapeOption } from "../option";
export declare class Circle extends Shape {
    constructor(id: string, name: string, opt: BaseShapeOption);
    createZrenderShape(): zrenderShape;
}
