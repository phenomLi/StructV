import { Shape, Style } from '../Shapes/shape';
import { SourceElement, LinkData } from '../sources';
import { LayoutOption } from '../option';
import { BoundingRect } from '../View/boundingRect';
export declare class Element<T extends SourceElement = SourceElement> {
    id: any;
    elementId: string;
    name: string;
    x: number;
    y: number;
    rotation: number;
    width: number;
    height: number;
    style: Style;
    shape: Shape;
    layoutOption: LayoutOption;
    [key: string]: any;
    /**
     * 应用源数据元素的属性
     * @param sourceElement
     */
    constructor(sourceElement: T);
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
     * @param sourceTarget
     */
    onLinkTo(targetEle: Element, linkStyle: Style, linkName: string, sourceTarget: LinkData): void;
    /**
     * 当结点被其他结点连接时触发
     * @param emitEle
     * @param linkStyle
     * @param linkName
     * @param sourceTarget
     */
    onLinkFrom(emitEle: Element, linkStyle: Style, linkName: string, sourceTarget: LinkData): void;
    /**
     * 当结点断开与其他结点触发
     * @param linkName
     */
    onUnlinkTo(linkName: string): void;
    /**
     * 当结点被其他结点断开连接时触发
     * @param linkName
     */
    onUnlinkFrom(linkName: string): void;
    /**
     * 当指向结点时触发
     * @param pointerStyle
     * @param pointerName
     * @param pointerValue
     */
    onRefer(pointerStyle: Style, pointerName: string, pointerValue: string | string[]): void;
    /**
     * 当指针离开该结点触发
     * @param pointerName
     */
    onUnrefer(pointerName: string): void;
    /**
     * 当元素发生变化
     * @param type
     */
    onChange(type: number): void;
}
