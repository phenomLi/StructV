export declare type BoundingRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare const Bound: {
    /**
     * 从点集生成包围盒
     * @param points
     */
    fromPoints(points: [number, number][]): BoundingRect;
    /**
     * 由包围盒转化为四个顶点（顺时针）
     * @param bound
     */
    toPoints(bound: BoundingRect): [number, number][];
    /**
     * 求包围盒并集
     * @param arg
     */
    union(...arg: BoundingRect[]): BoundingRect;
    /**
     * 包围盒求交集
     * @param b1
     * @param b2
     */
    intersect(b1: BoundingRect, b2: BoundingRect): BoundingRect;
    /**
     * 求包围盒旋转后新形成的包围盒
     * @param bound
     * @param rot
     */
    rotation(bound: BoundingRect, rot: number): BoundingRect;
    /**
     * 判断两个包围盒是否相交
     * @param b1
     * @param b2
     */
    isOverlap(b1: BoundingRect, b2: BoundingRect): boolean;
};
