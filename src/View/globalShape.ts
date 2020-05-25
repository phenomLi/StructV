import { zrenderShape, Renderer, zrenderUpdateType } from "./renderer";
import { Shape } from "../Shapes/shape";
import { BoundingRect } from "./boundingRect";



export class GlobalShape {
    id: string;
    type: string;
    name: string;
    private renderer: Renderer = null;
    private zrenderGroup: zrenderShape = null;

    private originX: number;
    private originY: number;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.zrenderGroup = new Renderer.zrender.Group();
        this.id = this.zrenderGroup.id.toString();
    }

    /**
     * 添加图形
     * @param shape 
     */
    add(shape: Shape | Shape[]) {
        if(Array.isArray(shape)) {
            shape.map(item => this.add(item));
        }
        else {
            if(shape.parentShape === null) {
                this.zrenderGroup.add(shape.zrenderShape);

                if(shape.name !== 'text') {
                    this.renderer.getOffScreen().add(shape.createZrenderShape(), shape.id);
                }
            }
        }
    }

    /**
     * 移除图形
     * @param shape 
     */
    remove(shape: Shape | Shape[]) {
        if(shape instanceof Array) {
            shape.map(item => this.remove(item));
        }
        else {
            this.zrenderGroup.remove(shape.zrenderShape);
            shape.zrenderShape = null;
        }
    }

    /**
     * 清空所以子图形
     */
    clear() {
        this.zrenderGroup.removeAll();
    }

    /**
     * 缩放
     * - 每次缩放都要重新设置缩放原点
     * @param x 
     * @param y 
     * @param type
     */
    scale(x: number, y: number, type: number = zrenderUpdateType.ANIMATED) {
        let prop = {
                scale: [x, y]
            };

        this.renderer.setAttribute(this, prop, type);
    }

    /**
     * 位移
     * @param dx 
     * @param dy 
     * @param type
     */
    translate(dx: number, dy: number, type: number = zrenderUpdateType.ANIMATED) {
        let position = this.getPosition(),
            prop = {
                position: [position[0] + dx, position[1] + dy]
            };

        this.renderer.setAttribute(this, prop, type);
    }

    /**
     * 获取 zrender 图形的 position
     */
    getPosition(): [number, number] {
        return this.zrenderGroup.position;
    }

    /**
     * 获取 zrender 图形的 scale
     */
    getScale(): [number, number] {
        return this.zrenderGroup.scale;
    }

    /**
     * 获取 zrender 图形的 origin
     */
    getOrigin(): [number, number] {
        return this.renderer.getOffScreen().getOrigin();
    }

    /**
     * 获取包围盒
     */
    getBound(): BoundingRect {
        return this.renderer.getOffScreen().getBound();
    }

    /**
     * 获取没有经过变换的包围盒
     */
    getNaiveBound(): BoundingRect {
        return this.renderer.getOffScreen().getNaiveBound();
    }

    /**
     * 获取 zrender 图形
     */
    getZrenderShape(): zrenderShape {
        return this.zrenderGroup;
    }

    /**
     * 将 origin 修正至几何中心
     */
    updateOriginToCenter() {
        this.renderer.getOffScreen().updateOriginToCenter();

        let [ox, oy] = this.getOrigin(),
            [px, py] = this.getPosition();

        this.zrenderGroup.attr('origin', [ox, oy]);

        // 对在缩放情况下修改 origin 后进行的视图漂移进行修正
        if(this.originX !== undefined && this.originY !== undefined) {
            let [sx, sy] = this.getScale(),
                tx, ty;

            tx = (this.originX - ox) * (1 - sx);
            ty = (this.originY - oy) * (1 - sy);

            this.zrenderGroup.attr('position', [px + tx, py + ty]);
        }

        this.originX = ox;
        this.originY = oy;
    }
}