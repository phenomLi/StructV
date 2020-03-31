import { DataModel } from "./dataModel";
import { Element } from "./element";
import { ViewModel } from "../View/viewModel";
import { LayoutOption } from "../option";
import { Line } from "../SpecificShapes/line";
export interface PointerPair {
    id: string;
    pointerShape: Line;
    label: string;
    target: Element;
    pointerName: string;
    branchPairs: PointerPair[];
    masterPair: PointerPair;
}
/**
 * 指针处理器
 */
export declare class PointerModel {
    private dataModel;
    private viewModel;
    private layoutOption;
    private pointerOptions;
    private lastPointerPairs;
    private pointerPairs;
    constructor(dataModel: DataModel, viewModel: ViewModel, layoutOption: LayoutOption);
    /**
     * 构建指针模型
     * @param elementList
     * @param pointerOptions
     */
    constructPointers(elementList: Element[]): void;
    /**
     * 添加一个外部指针信息pointerPair
     * @param targetElement
     * @param pointerName
     * @param label
     */
    addPointerPair(targetElement: Element, pointerName: string, label: string | string[]): void;
    /**
     * 根据配置项，更新指针图形
     * @param elementList
     */
    emitPointerShapes(elementList: Element[]): void;
    /**
     * 外部指针指向某结点
     * @param pointerPair
     */
    private referElement;
    /**
     * 找出对比上一次被取消的外部指针指向
     * @param elementList
     */
    private applyCanceledRefer;
    clear(): void;
}
