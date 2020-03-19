import { Element } from "./element";
import { SourceElement } from "../sources";
import { Pointer } from "./pointer";
import { Shape } from "../Shapes/shape";
import { LayoutOption } from "../option";



export class Node extends Element {

    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    rotation: number = 0;
    
    layoutOption: LayoutOption;
    // 指向该元素的指针列表
    referPointers: Pointer[] = [];

    constructor(sourceElement: SourceElement) {
        super(sourceElement);
    }

    // ------------------------钩子方法-------------------------

    /**
     * 初始化自定义属性（需子类重写）
     */
    init() {}

    /**
     * 定义如何更新指向该元素的指针的图形
     * @param pointerName
     */
    updateReferShape(pointerShape: Shape, titleShapes: Shape[], pointerName: string): boolean | void {
        return false;
    }

    /**
     * 定义如何更新该图形发出的连线
     * @param linkShape 
     * @param linkName 
     * @param anchorPos 
     * @param targetNode 
     */
    updateLinkShape(linkShape: Shape, linkName: string, anchorPos: number[], targetNode?: Node): boolean | void {
        return false;
    }

    /**
     * 当结点连接其他结点触发
     * @param targetNode 
     * @param linkShape
     */
    onLink(targetNode?: Node) {};

    /**
     * 当指向结点时触发
     * @param targetNode 
     */
    onRefer(targetNode: Node) {}
}