import { Composite } from "../Shapes/composite";
import { Util } from "../Common/util";
import { Curve } from "../Shapes/curve";
import { Style } from "../Shapes/shape";
import { LineStyle } from "../Shapes/polyLine";


/**
 * 线段
 */
export class Line extends Composite {
    style: Style = new LineStyle();
    option = {
        ...this.option,
        zIndex: 0
    };

    start: {x: number, y: number};
    end: {x: number, y: number};

    constructor(id: string, name: string) {
        super(id, name);
    }

    init() {
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };
    }

    /**
     * 求在线段某个位置的坐标点
     * @param percent 
     */
    pointAt(percent: number): [number, number] {
        let line = this.getSubShape('line'),
            startX: number = this.start.x,
            startY: number = this.start.y,
            endX: number = this.end.x,
            endY: number = this.end.y;

        if(line.name === 'polyLine') {
            return [
                startX * (1 - percent) + endX * percent,
                startY * (1 - percent) + endY * percent
            ];
        }

        // 线段为二次贝塞尔
        if(line.name === 'curve') {
            let [cpx, cpy] = (<Curve>line).calcControlPoint(this.start, this.end);

            return  [
                (1 - percent) * ( (1 - percent) * startX + 2 * percent * cpx) + percent**2 * endX,
                (1 - percent) * ( (1 - percent) * startY + 2 * percent * cpy) + percent**2 * endY
            ];
        }
    }

    /**
     * 获取线段在某个位置的斜率
     * @param percent 
     */
    tangentAt(percent: number): number {
        let line = this.getSubShape('line'),
            startX: number = this.start.x,
            startY: number = this.start.y,
            endX: number = this.end.x,
            endY: number = this.end.y;

        // 若线段为直线
        if(line.name === 'polyLine') {
            if(endX === startX) {
                return startY < endY? Math.PI: -Math.PI;
            }
            else {
                let k = Math.atan((endY - startY) / (endX - startX));
                return -k + Util.sign(startX - endX) * 0.5 * Math.PI;
            }
        }

        // 线段为二次贝塞尔
        if(line.name === 'curve') {
            let [cpx, cpy] = (<Curve>line).calcControlPoint(this.start, this.end),
                derivativeX = 2 * ((1 - percent) * (cpx - startX) + percent * (endX - cpx)),
                derivativeY = 2 * ((1 - percent) * (cpy - startY) + percent * (endY - cpy));

            return Math.PI * 1.5 - Math.atan2(derivativeY, derivativeX);
        }
    }
}


