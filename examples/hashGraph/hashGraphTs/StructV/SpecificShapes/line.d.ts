import { Composite } from "../Shapes/composite";
import { BaseOption, Style } from "../Shapes/shape";
import { BaseShapeOption } from "../option";
/**
 * 线段
 */
export declare class Line extends Composite {
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    constructor(id: string, name: string, opt: BaseShapeOption);
    defaultOption(baseOption: BaseOption): BaseOption;
    defaultStyle(baseStyle: Style): Style;
    /**
     * 求在线段某个位置的坐标点
     * @param percent
     */
    pointAt(percent: number): [number, number];
    /**
     * 获取线段在某个位置的斜率
     * @param percent
     */
    tangentAt(percent: number): number;
}
