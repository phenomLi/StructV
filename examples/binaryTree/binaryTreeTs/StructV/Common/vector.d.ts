export declare const Vector: {
    /**
     * 向量相加
     * @param v1
     * @param v2
     */
    add(v1: [number, number], v2: [number, number]): [number, number];
    /**
     * 向量相减
     * @param v1
     * @param v2
     */
    subtract(v1: [number, number], v2: [number, number]): [number, number];
    /**
     * 向量点积
     * @param v1
     * @param v2
     */
    dot(v1: [number, number], v2: [number, number]): number;
    /**
     * 向量缩放
     * @param v
     * @param n
     */
    scale(v: [number, number], n: number): [number, number];
    /**
     * 向量求模长
     * @param v
     */
    length(v: [number, number]): number;
    /**
     * 绕某点旋转向量
     * @param radian 角度（弧度制）
     * @param point 旋转的点
     * @param center 绕的点
     */
    rotation(radian: number, point: [number, number], center?: [number, number]): [number, number];
    /**
     * 求向量法向
     */
    tangent(v: [number, number]): [number, number];
    /**
     * 向量单位化
     */
    normalize(v: [number, number]): [number, number];
    /**
     * 求一个向量（点）按照direction方向，延长len长度后的坐标
     * @param v
     * @param direction
     * @param len
     */
    location(v: [number, number], direction: [number, number], len: number): [number, number];
    /**
     * 向量取反
     */
    negative(v: [number, number]): [number, number];
};
