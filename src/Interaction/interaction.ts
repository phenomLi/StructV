import { Renderer } from "../View/renderer";
import { InteractionModel } from "./interactionModel";
import { Engine } from "../engine";
import { Element } from "../Model/element";



/**
 * 交互模块基类
 */
export class Interaction {
    protected interactionModel: InteractionModel;
    protected elementList: Element[];
    protected engine: Engine;
    protected renderer: Renderer;
    protected container: HTMLElement;
    protected isEnable: boolean;

    public optionValue: any = null;

    constructor(interactionModel: InteractionModel, engine: Engine) {
        this.interactionModel = interactionModel;
        this.engine = engine;
        this.elementList = engine.getElementList();
        this.renderer = engine.getRenderer();
        this.container = this.renderer.getContainer();

        this.isEnable = true;
    }

    /**
     * 根据配置值应用交互
     * @param optionValue
     */
    apply(optionValue: any) { }

    /**
     * 根据配置值更新交互
     * @param optionValue 
     */
    update(optionValue: any) { }

    /**
     * 响应交互
     * @param param 
     */
    response(param: any): Element[] | void { }

    /**
     * 处理交互
     * @param param 
     */
    handle(param: any) {
        // 正在更新视图时不执行
        if(this.engine.isViewUpdating() === false) {
            let dirtyElements = this.response(param);
            this.engine.updateElement(dirtyElements || []);
        }
    }

    /**
     * 响应事件
     * @param eventName 
     * @param param 
     */
    emitEvent(eventName: string, ...param: any[]) {
        if(this.isEnable) {
            this[eventName](...param);
        }
    }

    /**
     * 关闭交互
     */
    disable() {
        this.isEnable = true;
    }
}