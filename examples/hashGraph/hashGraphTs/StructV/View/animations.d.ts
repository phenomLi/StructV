import { AnimationOption } from "../option";
import { Shape } from "../Shapes/shape";
import { PolyLine } from "../Shapes/polyLine";
import { Curve } from "../Shapes/curve";
/**
 * 封装动画
 */
export declare class Animations {
    fadeOffset: number;
    option: AnimationOption;
    constructor(animationOption: AnimationOption);
    /**
     * 位移动画
     * @param shape
     */
    translate(shape: Shape): {
        position: number[];
    };
    /**
     * 旋转动画
     * @param shape
     */
    rotation(shape: Shape): {
        rotation: number;
    };
    /**
     * 缩放动画
     * @param shape
     */
    scale(shape: Shape): {
        style: {
            opacity: number;
        };
        scale?: undefined;
    } | {
        scale: number[];
        style: {
            opacity: number;
        };
    };
    /**
     * 淡入淡出动画
     * @param shape
     */
    fade(shape: Shape): {
        style: {
            opacity: number;
        };
    };
    /**
     * 从上方淡入淡出动画
     * @param shape
     */
    fadeTop(shape: Shape): {
        position: number[];
        style: {
            opacity: number;
        };
    };
    /**
     * 从右方淡入淡出动画
     * @param shape
     */
    fadeRight(shape: Shape): {
        position: number[];
        style: {
            opacity: number;
        };
    };
    /**
     * 从下方淡入淡出动画
     * @param shape
     */
    fadeBottom(shape: Shape): {
        position: number[];
        style: {
            opacity: number;
        };
    };
    /**
     * 从左方淡入淡出动画
     * @param shape
     */
    fadeLeft(shape: Shape): {
        position: number[];
        style: {
            opacity: number;
        };
    };
    /**
     * 尺寸动画
     * @param shape
     */
    size(shape: Shape): {
        shape: {
            width: number;
            height: number;
            r?: undefined;
        };
    } | {
        shape: {
            r: number;
            width?: undefined;
            height?: undefined;
        };
    } | {
        shape?: undefined;
    };
    /**
     * 样式动画
     * @param shape
     */
    style(shape: Shape): {
        style: import("../Shapes/shape").Style;
    };
    /**
     * 路径动画
     * @param shape
     */
    path(shape: PolyLine): {
        shape: {
            points: [number, number][];
        };
    };
    /**
     * 二次贝塞尔曲线动画
     * @param shape
     */
    curve(shape: Curve): {
        shape: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            cpx1: number;
            cpy1: number;
        };
    };
}
