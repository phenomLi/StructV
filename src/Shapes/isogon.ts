import { Shape, BaseOption } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";
import { BaseShapeOption } from "../option";




export class Isogon extends Shape {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);
    }

    defaultOption(baseOption: BaseOption): BaseOption {
        return {
            ...baseOption,
            // 边数
            edges: 5
        };
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
            style: this.style,
            z: this.option.zIndex
        });

        return zrenderShape;
    }
}