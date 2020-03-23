import { DataModel, ElementContainer } from "./dataModel";
import { ViewModel } from "../View/viewModel";
import { Engine } from "../engine";
import { ContainerOption } from "../option";
import { Element } from "./element";
import { Rect } from "../Shapes/rect";
export interface ContainerInfo {
    containerName: string;
    children: Element[];
    shape: Rect;
    padding: number | [number, number, number, number];
}
export declare class ContainerModel {
    private engine;
    private dataModel;
    private viewModel;
    protected containerTable: ContainerInfo[];
    constructor(engine: Engine, dataModel: DataModel, viewModel: ViewModel);
    /**
     * 构建容器模型
     * @param elements
     * @param containerOptions
     */
    constructContainers(elements: ElementContainer, containerOptions: {
        [k: string]: Partial<ContainerOption>;
    }): void;
    /**
     * 获取容器的真实子元素
     * @param elements
     * @param children
     */
    fetchChildren(elements: ElementContainer, children: {
        element: string;
        target: string | number;
    }[]): Element[];
    /**
     * 根据配置项，更新容器图形
     * @param containerOptions
     * @param elementList
     */
    updateContainerShape(): void;
    clear(): void;
}
