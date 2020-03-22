import { Shape } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";
import { BaseShapeOption } from "../option";




/**
 * zrender Arrow shape
 */
let ZrenderArrow = Renderer.zrender.Path.extend({

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



export class Arrow extends Shape {

    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);
    }

    createZrenderShape(): zrenderShape {
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
