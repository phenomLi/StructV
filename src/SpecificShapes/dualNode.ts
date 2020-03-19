import { Node } from "./node";
import { Rect } from "../Shapes/rect";






/**
 * 双侧连接结点
 */
export class DualNode extends Node {
    constructor(id: string, name: string) {
        super(id, name);

        this.addSubShape({
            block: {
                shapeName: 'rect',
                draw: (parent: Node, block: Rect) => {
                    let widthPart = parent.width / 4;
    
                    block.y = parent.y;
                    block.x = parent.x;
                    block.height = parent.height;
                    block.width = 2 * widthPart;
                }
            }
        });
    }
}