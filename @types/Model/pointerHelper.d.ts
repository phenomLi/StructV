import { Engine } from "../engine";
import { DataModel } from "./dataModel";
import { Element } from "./element";
import { ViewModel } from "../View/viewModel";
import { PointerOption } from "../option";
/**
 * 指针处理器
 */
export declare class PointerHelper {
    private engine;
    private dataModel;
    private viewModel;
    constructor(engine: Engine, dataModel: DataModel, viewModel: ViewModel);
    /**
     * 根据配置项，绑定指针图形
     * @param pointerOptions
     * @param elementList
     */
    bindPointerShape(pointerOptions: {
        [key: string]: Partial<PointerOption>;
    }, elementList: Element[]): void;
    /**
     * 外部指针指向某结点
     * @param pointer
     * @param targetElement
     */
    private referELement;
}
