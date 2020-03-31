"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const renderer_1 = require("../View/renderer");
class Isogon extends shape_1.Shape {
    constructor(id, name, opt) {
        super(id, name, opt);
    }
    defaultOption(baseOption) {
        return Object.assign({}, baseOption, { 
            // 边数
            edges: 5 });
    }
    createZrenderShape() {
        let zrenderShape = new renderer_1.Renderer.zrender.Isogon({
            position: [this.x, this.y],
            rotation: this.rotation,
            shape: {
                x: 0,
                y: 0,
                n: this.option.edges,
                r: this.width / 2
            },
            style: this.style
        });
        return zrenderShape;
    }
}
exports.Isogon = Isogon;
