import { Renderer } from "../View/renderer";
import { InteractionModel } from "./interactionModel";
import { Engine } from "../engine";
import { Element } from "../Model/element";



/**
 * 交互模块基类
 */
export class Interaction {
    protected name: string;
    protected interactionModel: InteractionModel;
    protected elementList: Element[];
    protected engine: Engine;
    protected renderer: Renderer;
    protected zr;
    protected optionValue: any;

    isEnable: boolean;

    constructor(name: string, interactionModel: InteractionModel, engine: Engine) {
        this.name = name;
        this.interactionModel = interactionModel;
        this.engine = engine;
        this.elementList = engine.getElementList();
        this.renderer = engine.getRenderer();
        this.zr = this.renderer.getZrender();

        this.isEnable = true;
    }

    /**
     * 设置配置项的值
     * @param optionVal 
     */
    setOptionVal(optionVal: any) {
        this.optionValue = optionVal;
    }

    /**
     * 更新交互模块信息
     */
    update() {}

    /**
     * 根据配置值应用交互
     */
    init() { }

    /**
     * 事件触发器
     * @param param 
     */
    trigger(param: any) { }

    /**
     * 事件响应器 
     * @param param 
     */
    handler(param: any): Element[] | boolean | void { return null }

    /**
     * 事件结束器
     * @param param
     */
    finish(param: any) { }

    /**
     * 该交互的触发条件
     * - 默认为 true 即无条件触发
     */
    protected triggerCondition(): boolean { return true }

    /**
     * 处理交互
     * @param param 
     */
    protected emitHandler(param?: any) {
        if(this.isEnable) {
            this.interactionModel.handler(this.name, param);
        }
    }

    /**
     * 处理触发器
     * @param param 
     */
    protected emitTrigger(param?: any) {
        if(this.isEnable && this.triggerCondition()) {
            this.trigger(param);
        }
    }

    /**
     * 
     * @param param 
     */
    protected emitFinish(param?: any) {
        if(this.isEnable) {
            this.finish(param);
        }
    }

    /**
     * 设置交互全局数据
     * @param dataName 
     * @param value 
     */
    protected setData(dataName: string, value: any) {
        this.interactionModel.dataStore[dataName] = value;
    }

    /**
     * 获取交互数据
     * @param dataName 
     */
    protected getData(dataName: string): any {
        return this.interactionModel.dataStore[dataName];
    }

    /**
     * 开启/关闭交互
     * @param isEnable
     */
    toggleEnable(isEnable: boolean) {
        this.isEnable = isEnable;
    }
}