


export const Vector = {

    /**
     * 向量相加
     * @param v1 
     * @param v2 
     */
    add(v1: [number, number], v2: [number, number]): [number, number] {
        return [v1[0] + v2[0], v1[1] + v2[1]];
    },

    /**
     * 向量相减
     * @param v1 
     * @param v2 
     */
    subtract(v1: [number, number], v2: [number, number]): [number, number] {
        return [v1[0] - v2[0], v1[1] - v2[1]];
    },

    /**
     * 向量点积
     * @param v1 
     * @param v2 
     */
    dot(v1: [number, number], v2: [number, number]): number {
        return v1[0] * v2[0] + v1[1] * v2[1];
    },

    /**
     * 向量缩放
     * @param v 
     * @param n 
     */
    scale(v: [number, number], n: number): [number, number] {
        return [v[0] * n, v[1] * n];
    },

    /**
     * 向量求模长
     * @param v 
     */
    length(v: [number, number]): number {
        return Math.sqrt(v[0]**2 + v[1]**2);
    },

    /**
     * 绕某点旋转向量
     * @param radian 角度（弧度制）
     * @param point 旋转的点
     * @param center 绕的点
     */
    rotation(radian: number, point: [number, number], center: [number, number] = [0, 0]): [number, number] {
        if(radian === 0) return point;

        radian = -radian;

        let cos = Math.cos(radian),
            sin = Math.sin(radian),
            dv = [point[0] - center[0], point[1] - center[1]],
            v = [0, 0];
                
            v[0] = center[0] + (dv[0] * cos - dv[1] * sin);
            v[1] = center[1] + (dv[0] * sin + dv[1] * cos);
        
        return v as [number, number];
    },

    /**
     * 求向量法向
     */
    tangent(v: [number, number]): [number, number] {
        return [-v[1], v[0]];
    },

    /**
     * 向量单位化
     */
    normalize(v: [number, number]): [number, number] {
        let len = Vector.length(v);

        if(len === 0) {
            return [0, 0];
        }
        else if(len === 1) {
            return v;
        }
        else {
            return [v[0] / len, v[1] / len];
        }
    },

    /**
     * 求一个向量（点）按照direction方向，延长len长度后的坐标
     * @param v
     * @param direction
     * @param len 
     */
    location(v: [number, number], direction: [number, number], len: number): [number, number] {
        return Vector.add(v, Vector.scale(Vector.normalize(direction), len));
    },

    /**
     * 向量取反
     */
    negative(v: [number, number]): [number, number] {
        return Vector.scale(v, -1);
    }
};





