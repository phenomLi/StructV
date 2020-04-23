import { Composite } from "../Shapes/composite";
import { Rect } from "../Shapes/rect";
import { Style } from "../Shapes/shape";
import { anchorSet } from "../Model/linkModel";
import { BaseShapeOption } from "../option";





/**
 * 单侧（右）连接结点
 */
export class Node extends Composite {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);

        this.addSubShape({
            block: {
                shapeName: 'rect',
                draw: (parent: Node, block: Rect) => {
                    let widthPart = parent.width / 6;
    
                    block.y = parent.y;
                    block.x = parent.x - widthPart;
                    block.height = parent.height;
                    block.width = 4 * widthPart;
                }
            }, 
            fieldBlock: {
                shapeName: 'rect',
                init: (option, style) => ({
                    zIndex: -1,
                    content: '^',
                    style: {
                        fill: style.fieldColor,
                        textFill: style.fieldEmpty? '#000': 'rgba(0, 0, 0, 0)' 
                    }
                }),
                draw: (parent: Node, block: Rect) => {
                    let part = parent.width / 6;
            
                    block.y = parent.y;
                    block.x = parent.x + 2 * part;
                    block.width = parent.width / 3;
                    block.height = parent.height;
                }
            }
        });
    }

    defaultStyle(baseStyle: Style): Style {
        return {
            ...baseStyle,
            // 外层容器颜色
            fieldColor: '#eee',
            fieldEmpty: true
        };
    }

    defaultAnchors(baseAnchors: anchorSet, w: number): anchorSet {
        return {
            ...baseAnchors,
            1: [w / 3, 0]
        };
    }
}