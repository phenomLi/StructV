"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const renderer_1 = require("../View/renderer");
const boundingRect_1 = require("../View/boundingRect");
const vector_1 = require("../Common/vector");
class Composite extends shape_1.Shape {
    constructor(id, name, opt) {
        super(id, name, opt);
        // 类型为复合图形
        this.type = 'composite';
        // 组成复合图形的子图形
        this.subShapes = [];
    }
    /**
     * 添加子图形
     * @param subShapeConfig
     */
    addSubShape(subShapeConfig) {
        Object.keys(subShapeConfig).map(prop => {
            if (!subShapeConfig[prop])
                return;
            let subShape = {
                label: prop,
                shape: null,
                shapeName: subShapeConfig[prop].shapeName,
                draw: subShapeConfig[prop].draw,
                init: subShapeConfig[prop].init
            }, existSubShapeIndex = this.subShapes.findIndex(item => item.label === prop);
            if (existSubShapeIndex >= 0) {
                this.subShapes[existSubShapeIndex] = Object.assign({}, this.subShapes[existSubShapeIndex], subShapeConfig[prop]);
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
    getSubShape(name) {
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
            let { x, y, width, height } = this.getBound(), cx = x + width / 2, cy = y + height / 2;
            if (this.rotation) {
                this.subShapes.map(item => {
                    let d = vector_1.Vector.rotation(this.rotation, [item.shape.x, item.shape.y], [cx, cy]);
                    item.shape.x = d[0];
                    item.shape.y = d[1];
                    item.shape.rotation = this.rotation;
                });
            }
            if (item.shape instanceof Composite) {
                item.shape.updateSubShapes();
            }
        });
    }
    // -------------------------------------------------------
    getBound() {
        return boundingRect_1.Bound.union(...this.subShapes.map(item => item.shape.getBound()));
    }
    createZrenderShape() {
        let zrenderShape = new renderer_1.Renderer.zrender.Group({
            position: [this.x, this.y],
            z: this.option.zIndex
        });
        this.subShapes.map(item => {
            if (item.shape.zrenderShape === null) {
                item.shape.zrenderShape = item.shape.createZrenderShape();
                item.shape.zrenderShape.attr('z', item.shape.option.zIndex);
            }
            zrenderShape.add(item.shape.zrenderShape);
        });
        return zrenderShape;
    }
}
exports.Composite = Composite;
