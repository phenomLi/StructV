import { anchor } from "../Model/linkModel";
/**
 * 工具函数
 */
export declare const Util: {
    /**
     * 生成唯一id
     */
    generateId(): string;
    /**
     * 扩展对象
     * @param origin 原对象
     * @param ext 扩展的对象
     * @param excludeProps
     */
    extends(origin: any, ext: any, excludeProps?: string[]): void;
    /**
     * 合并对象
     * @param origin
     * @param dest
     */
    merge(origin: any, dest: any): void;
    /**
     * 从列表中移除元素
     * @param list 移除列表
     * @param fn 移除判断规则
     */
    removeFromList<T>(list: T[], fn: (item: T) => boolean): void;
    /**
     * 从列表中寻找元素
     * @param list
     * @param fn
     */
    findInList<T>(list: T[], fn: (item: T) => boolean): T;
    /**
     * 获取一个数的符号
     * @param number
     */
    sign(number: number): number;
    /**
     * 从一个由数组组成的路径中获取几何中心
     * @param path
     */
    getPathCenter(path: [number, number][]): [number, number];
    /**
     * 断言函数
     * @param assertFn
     * @param errorText
     */
    assert(condition: boolean, errorText: string): void;
    /**
     * 锚点转化为世界坐标
     * @param shape
     * @param anchor
     * @param offset
     */
    anchor2position(x: number, y: number, width: number, height: number, rotation: number, anchor: anchor, offset?: number): [number, number];
    /**
     * 获取类的名称
     * @param classConstructor
     */
    getClassName(classConstructor: any): string;
    /**
     * 文本解析
     * @param text
     */
    textParser(text: string): import("../sources").PointerData;
};
