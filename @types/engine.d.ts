import { ElementContainer } from "./Model/dataModel";
import { LayoutOption, AnimationOption, EngineOption, ElementsOption } from "./option";
import { Sources, SourceElement } from "./sources";
import { Shape, Style } from "./Shapes/shape";
import { Element } from "./Model/element";
import { Group } from "./Model/group";
import { anchor } from "./Model/linkModel";
/**
 * 注册一个可视化引擎所需的信息
 */
export interface EngineInfo {
    name: string;
    element?: {
        new (...arg: any[]): Element;
    } | {
        [key: string]: {
            new (...arg: any[]): Element;
        };
    };
    shape?: {
        [key: string]: {
            new (...arg: any[]): Shape;
        };
    };
    defaultOption: EngineOption;
}
export declare class Engine<S extends Sources = Sources, P extends EngineOption = EngineOption> {
    private id;
    name: string;
    private stringifySources;
    private dataModel;
    private viewModel;
    private sourcesProxy;
    ElementsTable: {
        [key: string]: {
            new (sourceElement: SourceElement): Element;
        };
    };
    elementsOption: ElementsOption;
    layoutOption: LayoutOption;
    animationOption: AnimationOption;
    isViewUpdatingFlag: boolean;
    proxySources: S;
    static ShapesTable: {
        [key: string]: {
            new (id: string, name: string, opt: any): Shape;
        };
    };
    scopedShapesTable: {
        [key: string]: {
            new (id: string, name: string, opt: any): Shape;
        };
    };
    constructor(container: HTMLElement, engineInfo: EngineInfo);
    /**
     * 输入源数据
     * （可视化主流程）
     * @param sources
     * @param proxySources
     */
    source(sources: S, proxySources?: boolean): void | S;
    /**
     * 应用配置项
     * @param opt
     */
    applyOption(opt: P): void;
    /**
     * 清空引擎
     */
    clear(): void;
    /**
     * 获取引擎id
     */
    getId(): string;
    /**
     * 获取引擎名称
     */
    getName(): string;
    /**
     * 动态添加一个连接信息
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的连接
     * @param emitElement
     * @param targetElement
     * @param linkName
     * @param anchorPair
     */
    link(emitElement: Element, targetElement: Element, linkName: string, anchorPair?: [anchor, anchor]): void;
    /**
     * 动态添加一个外部指针
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的外部指针
     * @param targetElement
     * @param referName
     * @param referValue
     */
    refer(targetElement: Element, referName: string, referValue: string): void;
    /**
     * 创建一个静态文本
     * @param content
     * @param style
     */
    text(content: string, style?: Style): Shape;
    /**
     * 创建一个元素组
     */
    group(...arg: Element[]): Group;
    /**
     * 自动适应视图
     */
    adjust(): void;
    /**
     * 缩放视图
     * @param x
     * @param y
     */
    scale(x: number, y: number): void;
    /**
     * 位移视图
     * @param x
     * @param y
     */
    translate(x: number, y: number): void;
    /**
     * 重置数据
     * @param sources
     * @param stringifySources
     */
    private reset;
    /**
     * 渲染数据结构方法
     */
    protected render(elements: ElementContainer | Element[], containerWidth: number, containerHeight: number): void;
    /**
     * 视图更新前
     */
    beforeUpdate(): void;
    /**
     * 视图更新后
     * @param patchList
     */
    afterUpdate(): void;
}
/**
 * 注册一个或多个图形
 */
export declare function RegisterShape(target: {
    new (...arg: any[]): Shape;
}, shapeName: string): void;
