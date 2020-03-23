import { Shape } from "./../Shapes/shape";
import { AnimationOption } from '../option';
import { shapeContainer } from "./viewModel";
import { ViewContainer } from "./viewContainer";
import { PolyLine } from "../Shapes/polyLine";
import { Curve } from "../Shapes/curve";
export declare type zrenderShape = any;
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
/**
 * 渲染器
 */
export declare class Renderer {
    static zrender: any;
    private zr;
    globalContainer: ViewContainer;
    private option;
    animations: Animations;
    private animatePropsQueue;
    private propsQueue;
    private containerWidth;
    private containerHeight;
    private init;
    private isLastUpdateInterrupt;
    constructor(container: HTMLElement, opt: AnimationOption);
    /**
     * 设置zrender图形属性
     * @param zrenderShape
     * @param props
     * @param animation
     */
    setAttribute(zrenderShape: any, props: any, animation?: boolean): void;
    /**
     * 根据图形的mountState渲染zrender图形
     * @param shapeContainer
     * @param removeList
     */
    renderZrenderShapes(shapeContainer: shapeContainer, removeList: Shape[]): void;
    /**
     * 根据属性更新队列更新zrender图形
     */
    updateZrenderShapes(callback?: () => void): void;
    /**
     * 跳过上一次更新的动画过程
     * @param callback
     */
    skipUpdateZrenderShapes(callback?: () => void): void;
    /**
     * 调整视图至容器中央
     * @param shapes
     * @param globalContainer
     */
    adjustShapes(shapes: Shape[]): void;
    /**
     * 获取容器宽度
     */
    getContainerWidth(): number;
    /**
     * 获取容器高度
     */
    getContainerHeight(): number;
    /**
     * 清空数据
     */
    clear(): void;
}
