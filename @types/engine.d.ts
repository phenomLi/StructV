import { ElementContainer } from "./Model/dataModel";
import { LayoutOption, AnimationOption, EngineOption, ElementsOption } from "./option";
import { Sources } from "./sources";
import { Shape, Style } from "./Shapes/shape";
import { Element } from "./Model/element";
import { Group } from "./Model/group";
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
    defaultOption: EngineOption;
}
export declare class Engine<S extends Sources = Sources, P extends EngineOption = EngineOption> {
    private id;
    name: string;
    private sources;
    private stringifySources;
    private dataModel;
    private viewModel;
    ElementsTable: {
        [key: string]: {
            new (): Element;
        };
    };
    sourcesField: {
        [key: string]: string[];
    };
    elementsOption: ElementsOption;
    layoutOption: LayoutOption;
    animationOption: AnimationOption;
    isViewUpdatingFlag: boolean;
    static ShapesTable: {
        [key: string]: {
            constructor: {
                new (id: string, name: string, opt: any): Shape;
            };
            scope: string;
        };
    };
    constructor(container: HTMLElement, engineInfo: EngineInfo);
    /**
     * 输入源数据
     * （可视化主流程）
     * @param sources
     * @param callback
     */
    source(sources: S, callback?: ((elements: ElementContainer) => void)): void;
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
     * 创建一个静态文本
     * @param content
     * @param style
     */
    text(content: string, style?: Style): Shape;
    /**
     * 创建一个元素组
     */
    group(...arg: Element[]): Group;
    isViewUpdating(isViewUpdatingFlag?: boolean): boolean;
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
}, shapeName: string, scope?: string): void;
