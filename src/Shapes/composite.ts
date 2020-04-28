import { Shape, Style } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";
import { Bound, BoundingRect } from "../View/boundingRect";
import { Vector } from "../Common/vector";





export type subShapeInfo = {
    label: string;
    shape: Shape;
    shapeName: string;
    draw: (parent: Composite, subShape: Shape) => void;
    init: (parentOption: any, style: Style) => any;
};



export class Composite extends Shape {
    // 类型为复合图形
    type = 'composite';
    // 组成复合图形的子图形`
    subShapes: subShapeInfo[] = [];

    constructor(id: string, name: string, opt) {
        super(id, name, opt);
    }

    /**
     * 添加子图形
     * @param subShapeConfig 
     */
    addSubShape(subShapeConfig: { [key: string]: Partial<subShapeInfo> }) {
        Object.keys(subShapeConfig).map(prop => {
            if(!subShapeConfig[prop]) return;

            let subShape = {
                label: prop,
                shape: null,
                shapeName: subShapeConfig[prop].shapeName,
                draw: subShapeConfig[prop].draw,
                init: subShapeConfig[prop].init
            },
            existSubShapeIndex = this.subShapes.findIndex(item => item.label === prop);

            if(existSubShapeIndex >= 0) {
                this.subShapes[existSubShapeIndex] = {
                    ...this.subShapes[existSubShapeIndex],
                    ...subShapeConfig[prop]
                };
            }
            else {
                this.subShapes.push(subShape);
            }
        });
    }

    /**
     * 获取子图形
     * @param name
     */
    getSubShape(name: string): Shape {
        return this.subShapes.find(info => info.label === name).shape;
    }

    /**
     * 更新子图形属性
     */
    updateSubShapes() {
        this.subShapes.map(item => {
            item.shape.applyShapeOption({ style: this.style });
            item.init && item.shape.applyShapeOption(item.init(this.option, this.style));
            item.draw(this, item.shape);

            item.shape.x -= this.x;
            item.shape.y -= this.y; 
            item.shape.isDirty = this.isDirty;

            let {x, y, width, height} = this.getBound(),
                cx = x + width / 2, 
                cy = y + height / 2;

            if(this.rotation) {
                this.subShapes.map(item => {
                    let d = Vector.rotation(this.rotation, [item.shape.x, item.shape.y], [cx, cy]);
                    item.shape.x = d[0];
                    item.shape.y = d[1];
                    item.shape.rotation = this.rotation;
                });
            }

            if(item.shape instanceof Composite) {
                item.shape.updateSubShapes();
            }
        });
    }

    // -------------------------------------------------------
    
    getBound(): BoundingRect {
        return Bound.union(...this.subShapes.map(item => item.shape.getBound()))
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Group({
            position: [this.x, this.y],
            z: this.option.zIndex
        });

        this.subShapes.map(item => {
            if(item.shape.zrenderShape === null) {
                item.shape.zrenderShape = item.shape.createZrenderShape();
                item.shape.zrenderShape.attr('z', item.shape.option.zIndex);
            }
            
            zrenderShape.add(item.shape.zrenderShape);
        });

        return zrenderShape;
    }
}