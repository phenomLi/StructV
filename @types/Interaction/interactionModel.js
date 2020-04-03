"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 交互管理器
 */
class InteractionModel {
    constructor(dataModel, viewModel) {
        this.interactionTable = {};
        this.dataModel = dataModel;
        this.viewModel = viewModel;
    }
    /**
     * 注册一个交互模块
     * @param interaction
     * @param name
     */
    register(interaction, name) {
        this.interactionTable[name] = new interaction();
    }
    /**
     * 响应事件
     * @param interactionName
     */
    response(interactionName) {
    }
}
exports.InteractionModel = InteractionModel;
