import { Element } from "./element";
import { Engine } from "../engine";
import { Shape } from "../Shapes/shape";
import { ViewModel } from "../View/viewModel";
import { Sources } from "../sources";
export declare type ElementContainer = {
    [key: string]: Element[];
};
export declare class DataModel {
    private engine;
    private viewModel;
    private linkHelper;
    private pointerHelper;
    private bindingInfos;
    private elementList;
    private elementContainer;
    constructor(engine: Engine, viewModel: ViewModel);
    /**
     * 从源数据构建element集
     * 主要工作：
     * - 遍历源数据，将每个SourceElement转化为Element
     * - 处理连接
     * - 处理指针
     * @param sources
     */
    constructElements(sources: Sources): void;
    /**
     * 根据sources结构，将element绑定shape
     */
    bindShapes(): void;
    /**
     * 响应绑定（更新绑定的shapes）
     */
    emitShapes(): void;
    /**
     * 获取Elements
     */
    getElements(): ElementContainer;
    /**
     * 元素工厂，创建Element
     * @param elementName
     * @param sourceElement
     */
    private createElement;
    /**
     * 解析元素文本内容
     * @param ele
     * @param content
     */
    parserElementContent(ele: Element, content: string): string;
    /**
     * 绑定shape
     * @param bindingInfo
     */
    bind<T extends Element | Element[] = Element, U extends Shape | Shape[] = Shape>(ele: T, shape: U, bindFn: (element: T, shape: U, param?: any) => void, param?: any): void;
    /**
     * 重置上一次的数据，包括：
     * - elementList
     * - elementContainer
     * - bindingInfo绑定信息
     * @param shapeContainer
     */
    resetData(): void;
    /**
     * 清空数据
     */
    clear(): void;
}
