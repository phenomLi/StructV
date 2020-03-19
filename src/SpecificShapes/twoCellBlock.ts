import { Composite } from "../Shapes/composite";
import { Rect } from "../Shapes/rect";




export class TwoCellBlock extends Composite {
    constructor(id: string, name: string) {
        super(id, name);

        this.addSubShape({
            cell1: {
                shapeName: 'rect',
                init: parent => ({
                    content: parent.option.content[0],
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
                init: parent => ({
                    content: parent.option.content[1],
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