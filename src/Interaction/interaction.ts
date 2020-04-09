import { Element } from "../Model/element";
import { Renderer } from "../View/renderer";
import { InteractionModel } from "./interactionModel";



/**
 * 交互模块基类
 */
export class Interaction {
    protected interactionModel: InteractionModel;
    protected elementList: Element[] = [];
    protected renderer: Renderer;

    constructor(interactionModel: InteractionModel, elementList: Element[], renderer: Renderer) {
        this.interactionModel = interactionModel;
        this.elementList = elementList;
        this.renderer = renderer;
    }

    /**
     * 交互条件初始化
     * @param optionValue
     */
    init(optionValue: any) { }

    /**
     * 响应交互
     * @param param 
     */
    response(param: any) { }

    /**
     * 处理交互
     * @param param 
     */
    handle(param: any) {
        // 正在更新视图时不执行
        if(this.interactionModel.viewModel.isViewUpdating === false) {
            this.response(param);
            this.renderer.updateZrenderShapes();
        }
    }
}