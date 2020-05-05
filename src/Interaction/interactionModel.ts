import { Interaction } from "./interaction";
import { InteractionOption } from "../option";
import { Zoom } from "./zoom";
import { Move } from "./move";
import { Drag } from "./drag";
import { Focus } from "./focus";
import { Engine } from "../engine";
import { Zone } from "./zone";
import { Element } from "../Model/element";




/**
 * 交互管理器
 */
export class InteractionModel {
    private engine: Engine;
    // 从交互配置项映射至交互模块的表
    private interactionConstructorMap: { [key in keyof InteractionOption]: { new(...arg): Interaction} } = {
        zoomView: Zoom,
        moveView: Move,
        drag: Drag,
        focus: Focus,
        frameSelect: Zone
    };

    public interactionMap: { [key: string]: Interaction } = { };
    public dataStore: { [key: string]: any } = {
        selectedElements: null
    };
    
    constructor(engine: Engine) {
        this.engine = engine;
    }

    /**
     * 开启交互模块
     * @param interactionOption
     */
    applyInteractions(interactionOption: InteractionOption) {
        Object.keys(interactionOption).map(key => {
            if(this.interactionMap[key] === undefined) {
                let interactionConstructor = this.interactionConstructorMap[key],
                    interaction: Interaction = new interactionConstructor(key, this, this.engine);

                this.interactionMap[key] = interaction;
                interaction.setOptionVal(interactionOption[key]);
                interaction.init();
            }
            else {
                this.interactionMap[key].setOptionVal(interactionOption[key]);
                this.interactionMap[key].update();

                // 值直接为 false
                if(!interactionOption[key]) {
                    this.interactionMap[key].disable();
                    delete this.interactionMap[key];
                }
            }
        });
    }

    /**
     * 获取交互模块
     * @param interactionName 
     */
    getInteraction(interactionName: string): Interaction {
        return this.interactionMap[interactionName];
    }

    /**
     * 手动触发交互事件
     * @param interactionName 
     * @param param 
     */
    trigger(interactionName: string, param?: any) {
        if(this.interactionMap[interactionName]) {
            this.interactionMap[interactionName].trigger(param);
        }
    }

    /**
     * 手动响应交互事件
     * @param interactionName 
     * @param param 
     */
    handler(interactionName: string, param?: any) {
        // 正在更新视图时或者交互模块不存在时不执行
        if(this.engine.isViewUpdating() === false && this.interactionMap[interactionName]) {
            let value = this.interactionMap[interactionName].handler(param);

            if(value === false || value === undefined) {
                return;
            }

            this.engine.updateElement(Array.isArray(value)? value: []);
        }
    }

    /**
     * 手动结束交互事件
     * @param interactionName 
     * @param param 
     */
    finish(interactionName: string, param?: any) {
        if(this.interactionMap[interactionName]) {
            this.interactionMap[interactionName].finish(param);
        }
    }
}