import { Shape } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";



export class Circle extends Shape {

    constructor(id: string, name: string) {
        super(id, name);
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Circle({
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