import { ViewModel } from "../View/viewModel";
import { Renderer } from "../View/renderer";
import { DataModel } from "../Model/dataModel";
import { Interaction } from "./interaction";
import { InteractionOption } from "../option";
import { Zoom } from "./zoom";
import { Move } from "./move";




/**
 * 交互管理器
 */
export class InteractionModel {
    dataModel: DataModel;
    viewModel: ViewModel;
    renderer: Renderer;

    private dataStore: { [key: string]: any } = {};

    // 从交互配置项映射至交互模块的表
    private interactionMap: { [key in keyof InteractionOption]: { new(...arg): Interaction} } = {
        wheelScale: Zoom,
        dragView: Move
    };

    constructor(dataModel: DataModel, viewModel: ViewModel) {
        this.dataModel = dataModel;
        this.viewModel = viewModel;
        this.renderer = this.viewModel.renderer;
    }

    /**
     * 初始化所有交互模块
     * @param interactionOption
     */
    initInteractions(interactionOption: InteractionOption) {
        Object.keys(interactionOption).map(key => {
            this.register(key, interactionOption[key]);
        });
    }

    /**
     * 注册一个交互模块
     * @param optionValue
     */
    register(interactionName: string, optionValue: any) {
        let interactionConstructor = this.interactionMap[interactionName],
            interaction = new interactionConstructor(this, this.dataModel.getElementList(), this.renderer);
        
        interaction.init(optionValue);
    }

    /**
     * 设置交互全局数据
     * @param dataName 
     * @param value 
     */
    setData(dataName: string, value: any) {
        this.dataStore[dataName] = value;
    }

    /**
     * 获取交互数据
     * @param dataName 
     */
    getData(dataName: string): any {
        return this.dataStore[dataName];
    }
}