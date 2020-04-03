import { ViewModel } from "../View/viewModel";
import { DataModel } from "../Model/dataModel";
import { Interaction } from "./interaction";
/**
 * 交互管理器
 */
export declare class InteractionModel {
    private dataModel;
    private viewModel;
    private renderer;
    private interactionTable;
    constructor(dataModel: DataModel, viewModel: ViewModel);
    /**
     * 注册一个交互模块
     * @param interaction
     * @param name
     */
    register(interaction: {
        new (): Interaction;
    }, name: string): void;
    /**
     * 响应事件
     * @param interactionName
     */
    response(interactionName: string): void;
}
