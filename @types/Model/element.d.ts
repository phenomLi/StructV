import { Shape, Style } from '../Shapes/shape';
import { SourceElement } from '../sources';
import { LayoutOption } from '../option';
import { BoundingRect } from '../View/boundingRect';
export declare class Element<T extends SourceElement = SourceElement> {
    id: any;
    elementId: string;
    name: string;
    x: number;
    y: number;
    rotation: number;
    style: Style;
    shape: Shape;
    layoutOption: LayoutOption;
    [key: string]: any;
    /**
     * 应用源数据元素的属性
     * @param sourceElement
     */
    applySourceElement(sourceElement: T, field: string[]): void;
    getWidth(): number;
    getHeight(): number;
    /**
     * 获取元素包围盒
     */
    getBound(): BoundingRect;
    /**
     * 定义如何更新元素自身对应的图形
     */
    updateShape(shape: Shape): boolean | void;
    /**
     * 当结点连接其他结点触发
     * @param targetEle
     * @param linkStyle
     * @param linkName
     */
    onLink(targetEle: Element, linkStyle: LinkStyle, linkName: string): void;
    /**
     * 当指向结点时触发
     * @param pointerStyle
     * @param pointerName
     * @param pointerValue
     */
    onRefer(pointerStyle: LinkStyle, pointerName: string, pointerValue: string | string[]): void;
    /**
     * 当元素发生变化
     * @param type
     */
    onChange(type: number): void;
}
