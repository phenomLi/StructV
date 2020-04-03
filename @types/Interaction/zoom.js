"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interaction_1 = require("./interaction");
class Zoom extends interaction_1.Interaction {
    constructor() {
        super();
        // 当前缩放比例
        this.zoomValue = 1;
        // 最大缩放值
        this.maxZoomValue = 3;
        // 最小缩放值
        this.minZoomValue = 0.5;
    }
    zoom() {
    }
}
exports.Zoom = Zoom;
