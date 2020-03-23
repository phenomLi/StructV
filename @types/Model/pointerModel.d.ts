import { Engine } from "../engine";
import { DataModel } from "./dataModel";
import { Element } from "./element";
import { ViewModel } from "../View/viewModel";
import { PointerOption } from "../option";
import { Line } from "../SpecificShapes/line";
export interface PointerPair {
    pointerShape: Line;
    labels: string[] | string;
    target: Element;
    pointerName: string;
}
/**
 * 指针处理器
 */
export declare class PointerModel {
    private engine;
    private dataModel;
    private viewModel;
    private pointerPairs;
    constructor(engine: Engine, dataModel: DataModel, viewModel: ViewModel);
    /**
     * 构建指针模型
     * @param elementList
     * @param pointerOptions
     */
    constructPointers(elementList: Element[], pointerOptions: {
        [key: string]: Partial<PointerOption>;
    }): void;
    /**
     * 根据配置项，更新指针图形
     * @param pointerOptions
     * @param elementList
     */
    updatePointerShape(): void;
    /**
     * 外部指针指向某结点
     * @param pointerPair
     */
    private referElement;
    clear(): void;
}
