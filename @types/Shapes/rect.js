"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const renderer_1 = require("../View/renderer");
class Rect extends shape_1.Shape {
    constructor(id, name, opt) {
        super(id, name, opt);
    }
    createZrenderShape() {
        let zrenderShape = new renderer_1.Renderer.zrender.Rect({
            position: [this.x, this.y],
            rotation: this.rotation,
            shape: {
                x: -this.width / 2,
                y: -this.height / 2,
                width: this.width,
                height: this.height
            },
            style: this.style
        });
        return zrenderShape;
    }
}
exports.Rect = Rect;
