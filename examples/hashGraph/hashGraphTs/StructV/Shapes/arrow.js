"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const renderer_1 = require("../View/renderer");
/**
 * zrender Arrow shape
 */
let ZrenderArrow = renderer_1.Renderer.zrender.Path.extend({
    type: 'arrow',
    shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    buildPath: function (ctx, shape) {
        var height = shape.height;
        var width = shape.width;
        var x = shape.x;
        var y = shape.y;
        var dx = width / 3 * 2;
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + height);
        ctx.lineTo(x, y + height / 4 * 3);
        ctx.lineTo(x - dx, y + height);
        ctx.lineTo(x, y);
        ctx.closePath();
    }
});
class Arrow extends shape_1.Shape {
    constructor(id, name, opt) {
        super(id, name, opt);
    }
    createZrenderShape() {
        let zrenderShape = new ZrenderArrow({
            position: [this.x, this.y],
            rotation: this.rotation,
            shape: {
                x: 0,
                y: -this.height / 2,
                width: this.width,
                height: this.height
            },
            style: this.style
        });
        return zrenderShape;
    }
}
exports.Arrow = Arrow;
