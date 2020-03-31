"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("../Common/vector");
// 包围盒操作
exports.Bound = {
    /**
     * 从点集生成包围盒
     * @param points
     */
    fromPoints(points) {
        let maxX = -Infinity, minX = Infinity, maxY = -Infinity, minY = Infinity;
        points.map(item => {
            if (item[0] > maxX)
                maxX = item[0];
            if (item[0] < minX)
                minX = item[0];
            if (item[1] > maxY)
                maxY = item[1];
            if (item[1] < minY)
                minY = item[1];
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    },
    /**
     * 由包围盒转化为四个顶点（顺时针）
     * @param bound
     */
    toPoints(bound) {
        return [
            [bound.x, bound.y],
            [bound.x + bound.width, bound.y],
            [bound.x + bound.width, bound.y + bound.height],
            [bound.x, bound.y + bound.height]
        ];
    },
    /**
     * 求包围盒并集
     * @param arg
     */
    union(...arg) {
        return arg.length > 1 ?
            arg.reduce((total, cur) => {
                let minX = total.x < cur.x ? total.x : cur.x, maxX = total.x + total.width < cur.x + cur.width ? cur.x + cur.width : total.x + total.width, minY = total.y < cur.y ? total.y : cur.y, maxY = total.y + total.height < cur.y + cur.height ? cur.y + cur.height : total.y + total.height;
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY
                };
            }) : arg[0];
    },
    /**
     * 包围盒求交集
     * @param b1
     * @param b2
     */
    intersect(b1, b2) {
        let x, y, maxX, maxY, overlapsX, overlapsY;
        if (b1.x < b2.x + b2.width && b1.x + b1.width > b2.x) {
            x = b1.x < b2.x ? b2.x : b1.x;
            maxX = b1.x + b1.width < b2.x + b2.width ? b1.x + b1.width : b2.x + b2.width;
            overlapsX = maxX - x;
        }
        if (b1.y < b2.y + b2.height && b1.y + b1.height > b2.y) {
            y = b1.y < b2.y ? b2.y : b1.y;
            maxY = b1.y < b2.y ? b1.y + b1.height : b2.y + b2.height;
            overlapsY = maxY - y;
        }
        if (!overlapsX || !overlapsY)
            return null;
        return {
            x,
            y,
            width: overlapsX,
            height: overlapsY
        };
    },
    /**
     * 求包围盒旋转后新形成的包围盒
     * @param bound
     * @param rot
     */
    rotation(bound, rot) {
        let cx = bound.x + bound.width / 2, cy = bound.y + bound.height / 2;
        return exports.Bound.fromPoints(exports.Bound.toPoints(bound).map(item => vector_1.Vector.rotation(rot, item, [cx, cy])));
    },
    /**
     * 判断两个包围盒是否相交
     * @param b1
     * @param b2
     */
    isOverlap(b1, b2) {
        let maxX1 = b1.x + b1.width, maxY1 = b1.y + b1.height, maxX2 = b2.x + b2.width, maxY2 = b2.y + b2.height;
        if (b1.x < maxX2 && b2.x < maxX1 && b1.y < maxY2 && b2.y < maxY1) {
            return true;
        }
        return false;
    }
};
