"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const renderer_1 = require("../View/renderer");
class Circle extends shape_1.Shape {
    constructor(id, name, opt) {
        super(id, name, opt);
    }
    createZrenderShape() {
        let zrenderShape = new renderer_1.Renderer.zrender.Circle({
            position: [this.x, this.y],
            rotation: this.rotation,
            shape: {
                cx: 0,
                cy: 0,
                r: this.width / 2
            },
            style: this.style
        });
        return zrenderShape;
    }
}
exports.Circle = Circle;
