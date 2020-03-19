import { Composite } from "../Shapes/composite";
import { Rect } from "../Shapes/rect";





/**
 * 单侧（右）连接结点
 */
export class Node extends Composite {
    constructor(id: string, name: string) {
        super(id, name);

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
                init: (parent) => ({
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
}