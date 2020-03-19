import { Util } from "../Common/util";
import { Composite } from "../Shapes/composite";
import { Line, LineStyle } from "../Shapes/line";
import { Isogon } from "../Shapes/isogon";



export class Arrow extends Composite {
    start = { x: 0, y: 0 };
    end = { x: 0, y: 0 };
    zIndex = -1;

    constructor(id: string, name: string) {
        super(id, name, [{
                shape: 'line',
                option: style => ({
                    style: {
                        ...style,
                        stroke: style.fill,
                        fill: null
                    }
                }),
                update: (parent: Arrow, line: Line) => {
                    let start = parent.start,
                        end = parent.end;

                    line.path = [ [start.x, start.y], [end.x, end.y] ];
                }
            }, {
                shape: 'isogon',
                update: (parent: Arrow, arrow: Isogon) => {
                    let start = parent.start,
                        end = parent.end;

                    arrow.x = end.x;
                    arrow.y = end.y;
                    
                    arrow.rotation = this.getArrowRotation(start.x, start.y, end.x, end.y);
                    arrow.width = ((<LineStyle>this.getSubShape(0).style).lineWidth + 1) * 2;
                }
            }
        ]);
    }

    /**
     * 计算箭头角度
     * @param startX 
     * @param startY 
     * @param endX 
     * @param endY
     */
    getArrowRotation(startX: number, startY: number, endX: number, endY: number): number {
        if(endX === startX) {
            return startY < endY? Math.PI: -Math.PI;
        }
        else {
            let k = Math.atan((endY - startY) / (endX - startX));
            return -k + Util.sign(startX - endX) * 0.5 * Math.PI;
        }
    }
}
