import { Interaction } from "./interaction";
import { InteractionOption } from "../option";
import { Zoom } from "./zoom";
import { Move } from "./move";
import { Drag } from "./drag";
import { Hover } from "./hover";
import { Focus } from "./focus";
import { Engine } from "../engine";




/**
 * 交互管理器
 */
export class InteractionModel {
    private engine: Engine;
    private dataStore: { [key: string]: any } = {};

    // 从交互配置项映射至交互模块的表
    private interactionConstructorMap: { [key in keyof InteractionOption]: { new(...arg): Interaction} } = {
        wheelScale: Zoom,
        dragView: Move,
        drag: Drag,
        hover: Hover,
        focus: Focus
    };

    public interactionMap: { [key: string]: Interaction } = {};
    
    constructor(engine: Engine) {
        this.engine = engine;
    }

    /**
     * 开启交互模块
     * @param interactionOption
     */
    applyInteractions(interactionOption: InteractionOption) {
        Object.keys(interactionOption).map(key => {
            if(!interactionOption[key]) {
                if(this.interactionMap[key]) {
                    this.interactionMap[key].disable();
                    delete this.interactionMap[key];
                }
                return;
            }

            if(this.interactionMap[key] === undefined) {
                let interactionConstructor = this.interactionConstructorMap[key],
                    interaction = new interactionConstructor(this, this.engine);

                this.interactionMap[key] = interaction;
                requestAnimationFrame(() => interaction.apply(interactionOption[key]));
            }
            else {
                this.interactionMap[key].update(interactionOption[key]);
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