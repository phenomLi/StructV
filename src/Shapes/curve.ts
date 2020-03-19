import { PolyLine, LineStyle } from "./polyLine";
import { zrenderShape, Renderer } from "../View/renderer";
import { Util } from "../Common/util";




export class Curve extends PolyLine {
    option = {
        ...this.option,
        // 曲率
        curveness: 0.2
    };

    // 控制点
    prevControlPoint: [number, number] = null;
    controlPoint: [number, number] = null;

    constructor(id: string, name: string) {
        super(id, name);

        // 添加路径动画项
        this.animationsTable = {
            ...this.animationsTable,
            path: 'curve'
        };
    }

    /**
     * 由曲率计算控制点
     * @param start
     * @param end
     */
    calcControlPoint(start, end): [number, number] {
        // 若已经计算好，直接返回计算好的控制点
        if(this.controlPoint) return this.controlPoint;

        return [
            (start.x + end.x) / 2 - (start.y - end.y) * this.option.curveness,
            (start.y + end.y) / 2 - (end.x - start.x) * this.option.curveness
        ]
    }

    restoreData() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.prevRotation = this.rotation;
        this.prevVisible = this.visible;
        this.prevStyle = this.style;
        this.prevPath = this.path;
        this.prevControlPoint = this.controlPoint;
        
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.visible = false;
        this.style = new LineStyle();
        this.path = [];
        this.controlPoint = null;
    }

    createZrenderShape(): zrenderShape {
        let x1 = this.path[0][0],
            y1 = this.path[0][1],
            x2 = this.path[1][0],
            y2 = this.path[1][1];

        let zrenderShape = new Renderer.zrender.BezierCurve({
            origin: Util.getPathCenter(this.path),
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