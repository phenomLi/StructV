import { Shape, Style } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";
import { Util } from "../Common/util";
import { Bound, BoundingRect } from "../View/boundingRect";




export class LineStyle extends Style {
    smooth?: number = 0;
    lineDash?: number[] = null;
}

export class PolyLine extends Shape {
    style: Style = new LineStyle();

    path: Array<[number, number]> = [];
    prevPath: Array<[number, number]> = [];
    
    constructor(id: string, name: string) {
        super(id, name);

        // 添加路径动画项
        this.animationsTable = {
            ...this.animationsTable,
            path: 'path'
        };
    }

    restoreData() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.prevRotation = this.rotation;
        this.prevVisible = this.visible;
        this.prevStyle = this.style;
        this.prevPath = this.path;
        
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.visible = false;
        this.style = new LineStyle();
        this.path = [];
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
                smooth: (<LineStyle>this.style).smooth
            },
            style: this.style
        });

        return zrenderShape;
    }
}