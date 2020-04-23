import { Node } from "./node";
import { Rect } from "../Shapes/rect";
import { anchorSet } from "../Model/linkModel";
import { BaseShapeOption } from "../option";
import { Composite } from "../Shapes/composite";
import { Style } from "../Shapes/shape";



const fieldBlockOption = {
    shapeName: 'rect',
    init: (option, style) => ({
        zIndex: -1,
        content: '^',
        style: {
            fill: '#eee',
            textFill: style.leftFieldEmpty? '#000': 'rgba(0, 0, 0, 0)' 
        }
    }),
    draw: (parent: Node, block: Rect) => {
        let part = parent.width / 8;

        block.y = parent.y;
        block.x = parent.x - 3 * part;
        block.width = parent.width / 4;
        block.height = parent.height;
    }
};


/**
 * 双侧连接结点
 */
export class DualNode extends Composite {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);

        this.addSubShape({
            block: {
                shapeName: 'rect',
                draw: (parent: DualNode, block: Rect) => {
                    let widthPart = parent.width / 4;
    
                    block.y = parent.y;
                    block.x = parent.x;
                    block.height = parent.height;
                    block.width = 2 * widthPart;
                }
            },
            leftFieldBlock: {
                ...fieldBlockOption
            },
            rightFieldBlock: {
                ...fieldBlockOption,
                init: (option, style) => ({
                    zIndex: -1,
                    content: '^',
                    style: {
                        fill: style.fieldColor,
                        textFill: style.rightFieldEmpty? '#000': 'rgba(0, 0, 0, 0)' 
                    }
                }),
                draw: (parent: Node, block: Rect) => {
                    let part = parent.width / 8;
            
                    block.y = parent.y;
                    block.x = parent.x + 3 * part;
                    block.width = parent.width / 4;
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
            leftFieldEmpty: true,
            rightFieldEmpty: true
        };
    }

    defaultAnchors(baseAnchors: anchorSet, w: number): anchorSet {
        return {
            ...baseAnchors,
            1: [w * (3 / 8), 0],
            3: [-w * ( 3 / 8), 0]
        };
    }
}