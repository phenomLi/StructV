"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composite_1 = require("../Shapes/composite");
class TwoCellBlock extends composite_1.Composite {
    constructor(id, name, opt) {
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
}
exports.TwoCellBlock = TwoCellBlock;
