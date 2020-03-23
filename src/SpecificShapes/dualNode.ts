import { Node } from "./node";
import { Rect } from "../Shapes/rect";
import { anchorSet } from "../Model/linkModel";
import { BaseShapeOption } from "../option";






/**
 * 双侧连接结点
 */
export class DualNode extends Node {
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
            }
        });
    }

    defaultAnchors(baseAnchors: anchorSet, w: number): anchorSet {
        return {
            ...baseAnchors,
            1: [w * (3 / 8), 0],
            3: [-w * ( 3 / 8), 0]
        };
    }
}