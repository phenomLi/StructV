import { Shape } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";



export class Isogon extends Shape {
    option = {
        ...this.option,
        // 边数
        edges: 5
    };

    constructor(id: string, name: string) {
        super(id, name);
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Isogon({
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