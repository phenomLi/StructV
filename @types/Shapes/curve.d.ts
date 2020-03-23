import { PolyLine } from "./polyLine";
import { zrenderShape } from "../View/renderer";
import { BaseOption } from "./shape";
import { BaseShapeOption } from "../option";
export declare class Curve extends PolyLine {
    controlPoint: [number, number];
    constructor(id: string, name: string, opt: BaseShapeOption);
    defaultOption(baseOption: BaseOption): BaseOption;
    /**
     * 由曲率计算控制点
     * @param start
     * @param end
     */
    calcControlPoint(start: any, end: any): [number, number];
    restoreData(): void;
    createZrenderShape(): zrenderShape;
}
