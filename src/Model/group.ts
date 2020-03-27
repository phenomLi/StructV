import { Element } from "./element";
import { Util } from "../Common/util";
import { BoundingRect, Bound } from "../View/boundingRect";
import { Vector } from "../Common/vector";



/**
 * element组
 */
export class Group {
    elementId: string;
    private elements: Array<Element | Group> = [];

    constructor(...arg: Array<Element | Group>) {
        this.elementId = Util.generateId();

        if(arg) {
            this.add(...arg);
        }
    }

    /**
     * 添加element
     * @param arg 
     */
    add(...arg: Array<Element | Group>) {
        arg.map(ele => {
            this.elements.push(ele);
        });
    }

    /**
     * 移除element
     * @param ele 
     */
    remove(ele: Element) {
        Util.removeFromList(this.elements, item => item.elementId === ele.elementId);
    }

    /**
     * 获取group的包围盒
     */
    getBound(): BoundingRect {
        return Bound.union(...this.elements.map(item => item.getBound()));
    }

    getWidth(): number {
        return this.getBound().width;
    }

    getHeight(): number {
        return this.getBound().height;
    }

    /**
     * 位移group
     * @param dx 
     * @param dy 
     */
    translate(dx: number, dy: number) {
        this.elements.map(item => {
            if(item instanceof Group) {
                item.translate(dx, dy);
            }
            else {
                item.x += dx;
                item.y += dy;
            }
        });
    }

    /**
     * 旋转group
     * @param rotation 
     * @param center
     */
    rotate(rotation: number, center?: [number, number]) {
        if(rotation === 0) return;

        let {x, y, width, height} = this.getBound(),
            cx = x + width / 2, 
            cy = y + height / 2;

        if(center) {
            cx = center[0];
            cy = center[1];
        }

        this.elements.map(item => {
            if(item instanceof Group) {
                item.rotate(rotation, [cx, cy]);
            }
            else {
                let d = Vector.rotation(rotation, [item.x, item.y], [cx, cy]);
                item.x = d[0];
                item.y = d[1];
                item.rotation = rotation;
            }
        });
    }

    /**
     * 清空group
     */
    clear() {
        this.elements.length = 0;
    }
}