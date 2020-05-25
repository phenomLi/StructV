import { Renderer, zrenderShape } from "./renderer";
import { BoundingRect } from "./boundingRect";



/**
 * 离屏缓存
 * - 主要功能用来获取准确的包围盒
 */
export class OffScreen {
    private renderer: Renderer;
    private zrenderShape = null;
    private originX: number;
    private originY: number;

    constructor(id: string, renderer: Renderer) {
        this.zrenderShape = new Renderer.zrender.Group();
        this.zrenderShape.shapeId = id;
        this.renderer = renderer;
    }

    /**
     * 添加图形
     * @param zrenderShape 
     * @param id
     */
    add(zrenderShape: zrenderShape, id: string) {
        zrenderShape.shapeId = id;
        zrenderShape.copy = true;
        this.zrenderShape.add(zrenderShape);
    }

    /**
     * 移除图形
     * @param id 
     */
    remove(id: string) {
        let children = this.zrenderShape.children();

        for(let i = 0; i < children.length; i++) {
            if(children[i].shapeId === id) {
                this.zrenderShape.remove(children[i]);
                return;
            }
        }
    }

    /**
     * 更新离屏缓存里的图形
     * @param id
     * @param key 
     * @param value 
     */
    update(id: string, key: string | object, value?: any) {
        const updateFn = children => {
            for(let i = 0; i < children.length; i++) {
                let item = children[i];

                if(item.shapeId === id) {
                    this.updateAttributes(item, key, value);
                    return;
                }

                if(typeof item.children === 'function') {
                    updateFn(item.children());
                }
            }
        }

        if(id === this.zrenderShape.shapeId) {
            this.updateAttributes(this.zrenderShape, key, value);
        }
        else {
            updateFn(this.zrenderShape.children());
        }
    }

    /**
     * 获取包围盒
     */
    getBound(): BoundingRect {
        let bound = this.zrenderShape.getBoundingRect();
        this.zrenderShape.updateTransform();
        bound.applyTransform(this.zrenderShape.transform);
        return bound;
    }
    
    /**
     * 获取没有经过变换的包围盒
     */
    getNaiveBound(): BoundingRect {
        return this.zrenderShape.getBoundingRect();
    }

    /**
     * 获取图形包围盒
     * @param id
     * @param transformed
     */
    getShapeBound(id: string, transformed: boolean = true): BoundingRect {
        const getBoundFn = children => {
            for(let i = 0; i < children.length; i++) {
                let shape = children[i];
                
                if(shape.shapeId === id) {
                    let bound = shape.getBoundingRect();
                    
                    if(transformed) {
                        shape.updateTransform();
                        bound.applyTransform(shape.transform);
                    }

                    return bound;
                }

                if(shape.children) {
                    let bound = getBoundFn(shape.children());

                    if(bound) {
                        return bound;
                    }
                }
            }
        }

        return getBoundFn(this.zrenderShape.children());
    }

    /**
     * 获取所有子图形
     */
    getChildren(): zrenderShape[] {
        return this.zrenderShape.children();
    }

    /**
     * 获取某个图形
     * @param id 
     */
    getZrenderShape(id: string): zrenderShape {
        const getZrenderShape = children => {
            for(let i = 0; i < children.length; i++) {
                let item = children[i];

                if(item.shapeId === id) {
                    return item;
                }

                if(typeof item.children === 'function') {
                    let target = getZrenderShape(item.children());

                    if(target) {
                        return target;
                    }
                }
            }
        }

        return getZrenderShape(this.zrenderShape.children());
    }

    /**
     * 获取 origin
     */
    getOffscreenShape(): zrenderShape {
        return this.zrenderShape;
    }

    /**
     * 获取 origin
     */
    getOrigin(): [number, number] {
        return this.zrenderShape.origin;
    }

    /**
     * 获取 position
     */
    getPosition(): [number, number] {
        return [this.zrenderShape.position[0], this.zrenderShape.position[1]];
    }

    /**
     * 获取 scale
     */
    getScale(): [number, number] {
        return this.zrenderShape.scale;
    }

    clear() {
        this.zrenderShape.removeAll();
    }

    /**
     * 更新图形属性
     * @param zrenderShape 
     * @param key 
     * @param value 
     */
    private updateAttributes(zrenderShape: zrenderShape, key, value?) {
        if(typeof key === 'object') {
            Object.keys(key).map(item => {
                zrenderShape.attr(item, key[item]);
            });
        }
        else {
            zrenderShape.attr(key, value);
        }
    }

    /**
     * 修正 origin
     */
    updateOriginToCenter() {
        let [px, py] = this.zrenderShape.position,
            naiveBound = this.getNaiveBound(),
            ox, oy;

        ox = naiveBound.x + naiveBound.width / 2;
        oy = naiveBound.y + naiveBound.height / 2;

        this.zrenderShape.attr('origin', [ox, oy]);

        // 对在缩放情况下修改 origin 后进行的视图漂移进行修正
        if(this.originX !== undefined && this.originY !== undefined) {
            let [sx, sy] = this.zrenderShape.scale,
                tx, ty;

            tx = (this.originX - ox) * (1 - sx);
            ty = (this.originY - oy) * (1 - sy);
            
            this.zrenderShape.attr('position', [px + tx, py + ty]);
        }

        this.originX = ox;
        this.originY = oy;
    }

    
}