import { Renderer, zrenderShape } from "../View/renderer";
import { BoundingRect } from "../View/boundingRect";
import { anchorSet } from "../Model/linkModel";
import { BaseShapeOption } from "../option";
export interface BaseOption {
    content: string | string[];
    size: [number, number] | number;
    zIndex: number;
    show: string | [string, string];
    [key: string]: any;
}
export interface Style {
    fill: string;
    text: string;
    textFill: string;
    fontSize: number;
    fontWeight: number;
    stroke: string;
    opacity: number;
    lineWidth: number;
    [key: string]: any;
}
/**
 * 图形挂载状态
 */
export declare enum mountState {
    NEEDMOUNT = 0,
    MOUNTED = 1,
    NEEDUNMOUNT = 2,
    UNMOUNTED = 3
}
export declare class Shape {
    id: string;
    type: string;
    name: string;
    zrenderShape: any;
    x: number;
    y: number;
    visible: boolean;
    rotation: number;
    style: Style;
    prevX: number;
    prevY: number;
    prevVisible: boolean;
    prevRotation: number;
    prevStyle: Style;
    baseStyle: Style;
    option: BaseOption;
    width: number;
    height: number;
    renderer: Renderer;
    parentShape: Shape;
    visited: boolean;
    mountState: number;
    animationsTable: {
        [key: string]: string;
    };
    constructor(id: string, name: string, opt: BaseShapeOption);
    /**
     * 定义默认配置项
     */
    defaultOption(baseOption: BaseOption): BaseOption;
    /**
     * 定义默认样式
     */
    defaultStyle(baseStyle: Style): Style;
    /**
     * 设置图形的基础锚点
     * - 对于没有默认锚点基础图形，比如圆形，多边形和矩形，模式锚点设置为：上，下，左，右，中5个，按顺时针方向对5个锚点进行编号，分别为0，1，2，3. 4：
     *          0
     *      \---*---\
     *    3 *   4   * 1
     *      \---*---\
     *          2
     * - 自定义的锚点，格式为 [number]：anchor，若number为0或1或2或3或4，则覆盖之前的锚点
     */
    getBaseAnchors(): anchorSet;
    /**
     * 获取图形的默认锚点
     * @param baseAnchors
     * @param width
     * @param height
     */
    defaultAnchors(baseAnchors: anchorSet, width: number, height: number): anchorSet;
    /**
     * 重置所有可变属性
     */
    restoreData(): void;
    /**
     * 应用元素配置项（尺寸，样式等）
     * @param style
     */
    applyShapeOption(opt: Partial<BaseShapeOption>): void;
    /**
     * 获取图形包围盒
     */
    getBound(): BoundingRect;
    /**
     * 更新zrender图形
     * @param name
     * @param animation
     */
    updateZrenderShape(name: string, animation?: boolean, fn?: Function): void;
    /**
     * 创建zrender图形
     */
    createZrenderShape(): zrenderShape;
}
