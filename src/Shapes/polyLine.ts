import { Shape, Style } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";
import { Util } from "../Common/util";
import { Bound, BoundingRect } from "../View/boundingRect";
import { BaseShapeOption } from "../option";




export class PolyLine extends Shape {
    path: Array<[number, number]> = [];
    prevPath: Array<[number, number]> = [];
    
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);

        // 添加路径动画项
        this.animationsTable = {
            ...this.animationsTable,
            path: 'path'
        };
    }

    restoreData() {
        super.restoreData();
        this.path = [];
    }

    defaultStyle(baseStyle: Style): Style {
        return {
            ...baseStyle,
            // 线段平缓程度
            smooth: 0,
            // 虚线样式
            lineDash: null
        };
    }

    getBound(): BoundingRect {
        return Bound.fromPoints(this.path);
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Polyline({
            position: [this.x, this.y],
            origin: Util.getPathCenter(this.path),
            shape: {
                points: this.path,
                smooth: this.style.smooth
            },
            style: this.style
        });

        return zrenderShape;
    }
}