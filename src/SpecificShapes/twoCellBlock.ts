import { Composite } from "../Shapes/composite";
import { Rect } from "../Shapes/rect";
import { BaseShapeOption } from "../option";




export class TwoCellBlock extends Composite {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);

        this.addSubShape({
            cell1: {
                shapeName: 'rect',
                init: option => ({
                    content: option.content[0],
                }),
                draw: (parent: TwoCellBlock, block: Rect) => {
                    let widthPart = parent.width / 2;
    
                    block.y = parent.y;
                    block.x = parent.x - widthPart / 2;
                    block.height = parent.height;
                    block.width = widthPart;
                }
            }, 
            cell2: {
                shapeName: 'rect',
                init: option => ({
                    content: option.content[1],
                    zIndex: -1,
                    style: {
                        fill: '#eee'
                    }
                }),
                draw: (parent: TwoCellBlock, block: Rect) => {
                    let widthPart = parent.width / 2;
    
                    block.y = parent.y;
                    block.x = parent.x + widthPart / 2;
                    block.height = parent.height - block.style.lineWidth;
                    block.width = widthPart;
                }
            }
        });
    }
}