"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("./node");
/**
 * 双侧连接结点
 */
class DualNode extends node_1.Node {
    constructor(id, name, opt) {
        super(id, name, opt);
        this.addSubShape({
            block: {
                shapeName: 'rect',
                draw: (parent, block) => {
                    let widthPart = parent.width / 4;
                    block.y = parent.y;
                    block.x = parent.x;
                    block.height = parent.height;
                    block.width = 2 * widthPart;
                }
            }
        });
    }
    defaultAnchors(baseAnchors, w) {
        return Object.assign({}, baseAnchors, { 1: [w * (3 / 8), 0], 3: [-w * (3 / 8), 0] });
    }
}
exports.DualNode = DualNode;
