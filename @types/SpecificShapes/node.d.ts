import { Composite } from "../Shapes/composite";
import { Style } from "../Shapes/shape";
import { anchorSet } from "../Model/linkHelper";
import { BaseShapeOption } from "../option";
/**
 * 单侧（右）连接结点
 */
export declare class Node extends Composite {
    constructor(id: string, name: string, opt: BaseShapeOption);
    defaultStyle(baseStyle: Style): Style;
    defaultAnchors(baseAnchors: anchorSet, w: number): anchorSet;
}
