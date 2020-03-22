import { Node } from "./node";
import { anchorSet } from "../Model/linkHelper";
import { BaseShapeOption } from "../option";
/**
 * 双侧连接结点
 */
export declare class DualNode extends Node {
    constructor(id: string, name: string, opt: BaseShapeOption);
    defaultAnchors(baseAnchors: anchorSet, w: number): anchorSet;
}
