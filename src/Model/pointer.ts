import { Element } from "./element";
import { SourcePointer } from "../sources";
import { Shape } from "../Shapes/shape";



export class Pointer extends Element<SourcePointer> {
    // 若指针发生合并，该字段保存合并主指针
    masterPointer: Pointer = null;
    // 多个指针指向同一个结点时的指针名称图形列表（Text对象列表）
    titleShapes: Shape[] = [];
    // 是否被遗弃的指针（被合并就被遗弃）
    discard: boolean = false;

    constructor(sourcePointer: SourcePointer) {
        super(sourcePointer);
    }
}




