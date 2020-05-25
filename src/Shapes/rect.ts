import { Shape } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";
import { BaseShapeOption } from "../option";



export class Rect extends Shape {

    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);
    }

    updateSize(type?: number) {
        this.updateZrenderShape('position');
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Rect({
            position: [this.x, this.y],
            rotation: this.rotation,
            shape: {
                x: -this.width / 2, 
                y: -this.height / 2,
                width: this.width,
                height: this.height
            },
            style: this.style,
            z: this.option.zIndex
        });

        return zrenderShape;
    }
}