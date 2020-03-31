"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const composite_1 = require("../Shapes/composite");
/**
 * 单侧（右）连接结点
 */
class Node extends composite_1.Composite {
    constructor(id, name, opt) {
        super(id, name, opt);
        this.addSubShape({
            block: {
                shapeName: 'rect',
                draw: (parent, block) => {
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
                draw: (parent, block) => {
                    block.y = parent.y;
                    block.x = parent.x;
                    block.width = parent.width;
                    block.height = parent.height;
                }
            }
        });
    }
    defaultStyle(baseStyle) {
        return Object.assign({}, baseStyle, { 
            // 外层容器颜色
            wrapperColor: '#eee' });
    }
    defaultAnchors(baseAnchors, w) {
        return Object.assign({}, baseAnchors, { 1: [w / 3, 0] });
    }
}
exports.Node = Node;
