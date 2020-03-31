"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const renderer_1 = require("../View/renderer");
const util_1 = require("../Common/util");
const boundingRect_1 = require("../View/boundingRect");
class PolyLine extends shape_1.Shape {
    constructor(id, name, opt) {
        super(id, name, opt);
        this.path = [];
        this.prevPath = [];
        // 添加路径动画项
        this.animationsTable = Object.assign({}, this.animationsTable, { path: 'path' });
    }
    restoreData() {
        super.restoreData();
        this.prevPath = this.path;
        this.path = [];
    }
    defaultStyle(baseStyle) {
        return Object.assign({}, baseStyle, { 
            // 线段平缓程度
            smooth: 0, 
            // 虚线样式
            lineDash: null });
    }
    getBound() {
        return boundingRect_1.Bound.fromPoints(this.path);
    }
    createZrenderShape() {
        let zrenderShape = new renderer_1.Renderer.zrender.Polyline({
            position: [this.x, this.y],
            origin: util_1.Util.getPathCenter(this.path),
            shape: {
                points: this.path,
                smooth: this.style.smooth
            },
            style: this.style
        });
        return zrenderShape;
    }
}
exports.PolyLine = PolyLine;
