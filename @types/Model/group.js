"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../Common/util");
const boundingRect_1 = require("../View/boundingRect");
const vector_1 = require("../Common/vector");
/**
 * element组
 */
class Group {
    constructor(...arg) {
        this.elements = [];
        this.elementId = util_1.Util.generateId();
        if (arg) {
            this.add(...arg);
        }
    }
    /**
     * 添加element
     * @param arg
     */
    add(...arg) {
        arg.map(ele => {
            this.elements.push(ele);
        });
    }
    /**
     * 移除element
     * @param ele
     */
    remove(ele) {
        util_1.Util.removeFromList(this.elements, item => item.elementId === ele.elementId);
    }
    /**
     * 获取group的包围盒
     */
    getBound() {
        return boundingRect_1.Bound.union(...this.elements.map(item => item.getBound()));
    }
    getWidth() {
        return this.getBound().width;
    }
    getHeight() {
        return this.getBound().height;
    }
    /**
     * 位移group
     * @param dx
     * @param dy
     */
    translate(dx, dy) {
        this.elements.map(item => {
            if (item instanceof Group) {
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
    rotate(rotation, center) {
        if (rotation === 0)
            return;
        let { x, y, width, height } = this.getBound(), cx = x + width / 2, cy = y + height / 2;
        if (center) {
            cx = center[0];
            cy = center[1];
        }
        this.elements.map(item => {
            if (item instanceof Group) {
                item.rotate(rotation, [cx, cy]);
            }
            else {
                let d = vector_1.Vector.rotation(rotation, [item.x, item.y], [cx, cy]);
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
exports.Group = Group;
