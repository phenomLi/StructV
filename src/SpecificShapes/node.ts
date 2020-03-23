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
                    let widthPart = parent.width / 3;
    
                    block.y = parent.y;
                    block.x = parent.x - parent.width / 2 + widthPart;
                    block.height = parent.height;
                    block.width = 2 * widthPart;
                }
            }, 
            wrapper: {
                shapeName: 'rect',
                init: () => ({
                    zIndex: -1,
                    content: null,
                    style: {
                        fill: '#eee'
                    }
                }),
                draw: (parent: Node, block: Rect) => {
                    block.y = parent.y;
                    block.x = parent.x;
                    block.width = parent.width;
                    block.height = parent.height;
                }
            }
        });
    }

    defaultStyle(baseStyle: Style): Style {
        return {
            ...baseStyle,
            // 外层容器颜色
            wrapperColor: '#eee'
        };
    }

    defaultAnchors(baseAnchors: anchorSet, w: number): anchorSet {
        return {
            ...baseAnchors,
            1: [w / 3, 0]
        };
    }
}