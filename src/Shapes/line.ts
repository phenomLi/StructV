import { Shape, Style } from "./shape";
import { zrenderShape } from "../View/renderer";
import { Util } from "../Common/util";
import { Bound, BoundingRect } from "../View/boundingRect";




export class LineStyle extends Style {
    lineWidth?: number = 3;
    smooth?: number = 0;
    lineDash?: number[] = null;
}



export class Line extends Shape {
    path: Array<[number, number]> = [];
    style: LineStyle = new LineStyle();

    constructor(id: string, name: string) {
        super(id, name);

        this.addSetter('path', (shape: Line) => {
            return {
                origin: Util.getPathCenter(shape.path),
                shape: {
                    points: shape.path
                }
            };
        });
    }

    getBound(): BoundingRect {
        return Bound.fromPoints(this.path);
    }

    createShape(): zrenderShape {
        let zrenderShape = new this.renderer.zrender.Polyline({
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