import { Shape, BaseOption } from "./shape";
import { zrenderShape } from "../View/renderer";
import { BaseShapeOption } from "../option";
export declare class Isogon extends Shape {
    constructor(id: string, name: string, opt: BaseShapeOption);
    defaultOption(baseOption: BaseOption): BaseOption;
    createZrenderShape(): zrenderShape;
}
