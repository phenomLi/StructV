"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composite_1 = require("../Shapes/composite");
const util_1 = require("../Common/util");
const curve_1 = require("../Shapes/curve");
/**
 * 线段
 */
class Line extends composite_1.Composite {
    constructor(id, name, opt) {
        super(id, name, opt);
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };
        let fromMarker, toMarker;
        // 添加marker
        if (this.option.markers) {
            // 若只配置了结尾marker
            if (typeof this.option.markers === 'string') {
                toMarker = this.option.markers;
            }
            // 配置了两端marker
            else {
                fromMarker = this.option.markers[0];
                toMarker = this.option.markers[1];
            }
        }
        this.addSubShape({
            line: {
                shapeName: this.option.curveness ? 'curve' : 'polyLine',
                init: (option, style) => ({
                    style: {
                        stroke: style.fill,
                        fill: null
                    }
                }),
                draw: (parent, line) => {
                    let start = parent.start, end = parent.end;
                    line.path = [[start.x, start.y], [end.x, end.y]];
                    if (line instanceof curve_1.Curve) {
                        line.controlPoint = line.calcControlPoint(start, end);
                    }
                }
            },
            fromMarker: fromMarker ? {
                shapeName: fromMarker,
                init: () => ({
                    zIndex: 2
                }),
                draw: (parent, marker) => {
                    let start = parent.start;
                    marker.x = start.x;
                    marker.y = start.y;
                    marker.rotation = parent.tangentAt(0) + Math.PI;
                    marker.width = parent.getSubShape('line').style.lineWidth + 5;
                    marker.height = marker.width;
                }
            } : null,
            toMarker: toMarker ? {
                shapeName: toMarker,
                init: () => ({
                    zIndex: 2
                }),
                draw: (parent, marker) => {
                    let end = parent.end;
                    marker.x = end.x;
                    marker.y = end.y;
                    marker.rotation = parent.tangentAt(1);
                    marker.width = parent.getSubShape('line').style.lineWidth + 5;
                    marker.height = marker.width;
                }
            } : null
        });
    }
    defaultOption(baseOption) {
        return Object.assign({}, baseOption, { 
            // 曲率
            curveness: 0, 
            // 线段两端图案
            markers: '', zIndex: 0 });
    }
    defaultStyle(baseStyle) {
        return Object.assign({}, baseStyle, { 
            // 线段平缓程度
            smooth: 0, 
            // 虚线样式
            lineDash: null });
        ;
    }
    /**
     * 求在线段某个位置的坐标点
     * @param percent
     */
    pointAt(percent) {
        let line = this.getSubShape('line'), startX = this.start.x, startY = this.start.y, endX = this.end.x, endY = this.end.y;
        if (line.name === 'polyLine') {
            return [
                startX * (1 - percent) + endX * percent,
                startY * (1 - percent) + endY * percent
            ];
        }
        // 线段为二次贝塞尔
        if (line.name === 'curve') {
            let [cpx, cpy] = line.calcControlPoint(this.start, this.end);
            return [
                (1 - percent) * ((1 - percent) * startX + 2 * percent * cpx) + Math.pow(percent, 2) * endX,
                (1 - percent) * ((1 - percent) * startY + 2 * percent * cpy) + Math.pow(percent, 2) * endY
            ];
        }
    }
    /**
     * 获取线段在某个位置的斜率
     * @param percent
     */
    tangentAt(percent) {
        let line = this.getSubShape('line'), startX = this.start.x, startY = this.start.y, endX = this.end.x, endY = this.end.y;
        // 若线段为直线
        if (line.name === 'polyLine') {
            if (endX === startX) {
                return startY < endY ? Math.PI : -Math.PI;
            }
            else {
                let k = Math.atan((endY - startY) / (endX - startX));
                return -k + util_1.Util.sign(startX - endX) * 0.5 * Math.PI;
            }
        }
        // 线段为二次贝塞尔
        if (line.name === 'curve') {
            let [cpx, cpy] = line.calcControlPoint(this.start, this.end), derivativeX = 2 * ((1 - percent) * (cpx - startX) + percent * (endX - cpx)), derivativeY = 2 * ((1 - percent) * (cpy - startY) + percent * (endY - cpy));
            return Math.PI * 1.5 - Math.atan2(derivativeY, derivativeX);
        }
    }
}
exports.Line = Line;
