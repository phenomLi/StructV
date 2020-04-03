"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 交互模块基类
 */
class Interaction {
    constructor() {
        this.elementList = [];
        this.globalShape = null;
    }
    // constructor(elementList: Element[], globalContainer: ViewContainer) {
    //     this.elementList = elementList;
    //     this.globalContainer = globalContainer;
    // }
    trigger() {
    }
    feedback() {
    }
}
exports.Interaction = Interaction;
