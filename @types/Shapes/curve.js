"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const polyLine_1 = require("./polyLine");
const renderer_1 = require("../View/renderer");
const util_1 = require("../Common/util");
class Curve extends polyLine_1.PolyLine {
    constructor(id, name, opt) {
        super(id, name, opt);
        // 控制点
        this.prevControlPoint = null;
        this.controlPoint = null;
        // 添加路径动画项
        this.animationsTable = Object.assign({}, this.animationsTable, { path: 'curve' });
    }
    defaultOption(baseOption) {
        return Object.assign({}, baseOption, { 
            // 曲率
            curveness: 0.2 });
    }
    /**
     * 由曲率计算控制点
     * @param start
     * @param end
     */
    calcControlPoint(start, end) {
        // 若已经计算好，直接返回计算好的控制点
        if (this.controlPoint)
            return this.controlPoint;
        return [
            (start.x + end.x) / 2 - (start.y - end.y) * this.option.curveness,
            (start.y + end.y) / 2 - (end.x - start.x) * this.option.curveness
        ];
    }
    restoreData() {
        super.restoreData();
        this.prevControlPoint = this.controlPoint;
        this.controlPoint = null;
    }
    createZrenderShape() {
        let x1 = this.path[0][0], y1 = this.path[0][1], x2 = this.path[1][0], y2 = this.path[1][1];
        let zrenderShape = new renderer_1.Renderer.zrender.BezierCurve({
            origin: util_1.Util.getPathCenter(this.path),
            shape: {
                x1, y1, x2, y2,
                cpx1: this.controlPoint[0],
                cpy1: this.controlPoint[1]
            },
            style: this.style
        });
        return zrenderShape;
    }
}
exports.Curve = Curve;
