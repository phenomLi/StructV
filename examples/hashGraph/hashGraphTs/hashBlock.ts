import { Composite } from "./StructV/Shapes/composite";
import { BaseShapeOption } from "./StructV/option";
import { anchorSet } from "./StructV/Model/linkModel";




export class HashBlock extends Composite {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);

        this.addSubShape({
            cell1: {
                shapeName: 'rect',
                init: option => ({
                    content: option.content[0],
                }),
                draw: (parent, block) => {
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
                draw: (parent, block) => {
                    let widthPart = parent.width / 2;
    
                    block.y = parent.y;
                    block.x = parent.x + widthPart / 2;
                    block.height = parent.height - block.style.lineWidth;
                    block.width = widthPart;
                }
            }
        });
    }

    /**
     * 修改默认锚点
     * @param baseAnchors 默认的5个锚点
     * @param width 图形的宽
     * @param height 图形的高
     */
    defaultAnchors(baseAnchors: anchorSet, width: number, height: number): anchorSet {
        return {
            ...baseAnchors,
            1: [width / 4, 0]
        };
    }
}



