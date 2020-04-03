import { ViewModel } from "../View/viewModel";
import { Renderer } from "../View/renderer";
import { DataModel } from "../Model/dataModel";
import { Interaction } from "./interaction";




/**
 * 交互管理器
 */
export class InteractionModel {
    private dataModel: DataModel;
    private viewModel: ViewModel;
    private renderer: Renderer;

    private interactionTable: { [key: string]: Interaction} = {};

    constructor(dataModel: DataModel, viewModel: ViewModel) {
        this.dataModel = dataModel;
        this.viewModel = viewModel;
    }

    /**
     * 注册一个交互模块
     * @param interaction 
     * @param name 
     */
    register(interaction: { new(): Interaction}, name: string) {
        this.interactionTable[name] = new interaction();
    }

    /**
     * 响应事件
     * @param interactionName 
     */
    response(interactionName: string) {
        
    }
}