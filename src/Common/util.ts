import { Vector } from "./vector";
import { anchor } from "../Model/linkModel";




/**
 * 工具函数
 */
export const Util = {

    /**
     * 生成唯一id
     */
    generateId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    /**
     * 扩展对象
     * @param origin 原对象 
     * @param ext 扩展的对象
     * @param excludeProps 
     */
    extends(origin, ext, excludeProps: string[] = []) {
        if(ext === null || ext === undefined) return;

        Object.keys(ext).map(prop => {
            if(excludeProps.find(item => item === prop)) return;

            if(ext[prop] !== null && typeof ext[prop] === 'object' && !Array.isArray(ext[prop])) {
                if(origin[prop] === undefined) {
                    origin[prop] = {};
                }

                Util.extends(origin[prop], ext[prop]);
            }
            else {
                origin[prop] = ext[prop];
            }
        });
    },

    /**
     * 合并对象
     * @param origin 
     * @param dest 
     */
    merge(origin, dest) {
        if(dest === undefined || dest === null) return;

        Object.keys(dest).map(key => {
            if(origin[key] === undefined || dest[key] === undefined) {
                return;
            }

            if(typeof dest[key] === 'object' && !Array.isArray(dest[key])) {
                if(origin[key] !== null && typeof origin[key] === 'object' && !Array.isArray(origin[key])) {
                    Util.merge(origin[key], dest[key]);
                }
                else {
                    origin[key] = dest[key];
                }
            }
            else {
                origin[key] = dest[key];
            }
        });
    },

    /**
     * 从列表中移除元素
     * @param list 移除列表
     * @param fn 移除判断规则
     */
    removeFromList<T>(list: T[], fn: (item: T) => boolean) {
        for(let i = 0; i < list.length; i++) {
            fn(list[i]) && list.splice(i, 1) && i--;
        }
    },

    /**
     * 从列表中寻找元素
     * @param list 
     * @param fn 
     */
    findInList<T>(list: T[], fn: (item: T) => boolean): T {
        return list[list.findIndex(fn)];
    },

    /**
     * 获取一个数的符号
     * @param number 
     */
    sign(number: number): number {
        return number < 0? -1: 1;
    },

    /**
     * 从一个由数组组成的路径中获取几何中心
     * @param path 
     */
    getPathCenter(path: Array<[number, number]>): [number, number] {
        let maxX = -Infinity,
            minX = Infinity,
            maxY = -Infinity,
            minY = Infinity;

        path.map(item => {
            if(item[0] > maxX) maxX = item[0];
            if(item[0] < minX) minX = item[0];
            if(item[1] > maxY) maxY = item[1];
            if(item[1] < minY) minY = item[1];
        });

        return [(maxX + minX) / 2, (maxY + minY) / 2];
    },

    /**
     * 断言函数
     * @param assertFn 
     * @param errorText 
     */
    assert(condition: boolean, errorText: string): void | never {
        if(condition) {
            throw errorText;
        }
    },

    /**
     * 锚点转化为世界坐标
     * @param shape 
     * @param anchor 
     * @param offset
     */
    anchor2position(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        rotation: number,
        anchor: anchor, 
        offset?: number
    ): [number, number] {
        let pos = typeof anchor === 'function'? 
            anchor(width, height, offset):
            anchor;

        return rotation? Vector.rotation(rotation, [x + pos[0], y + pos[1]], [x, y]): [x + pos[0], y + pos[1]];
    },

    /**
     * 获取类的名称
     * @param classConstructor 
     */
    getClassName(classConstructor): string {
        return classConstructor.prototype.constructor.toString().split(' ')[1];
    },

    /**
     * 文本解析
     * @param text 
     */
    textParser(text: string): string[] | string {
        let fieldReg = /\[[^\]]*\]/g;

        if(fieldReg.test(text)) {
            let contents = text.match(fieldReg),
                values = contents.map(item => item.replace(/\[|\]/g, ''));
            return values;
        }
        else {
            return text;
        }
    }
};

