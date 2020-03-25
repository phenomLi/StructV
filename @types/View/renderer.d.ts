import { Shape } from "./../Shapes/shape";
import { AnimationOption } from '../option';
import { shapeContainer } from "./viewModel";
import { ViewContainer } from "./viewContainer";
export declare type zrenderShape = any;
/**
 * 渲染器
 */
export declare class Renderer {
    static zrender: any;
    private zr;
    globalContainer: ViewContainer;
    private option;
    private animations;
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
     * 根据动画名称，获取animations对象的对应动画属性
     * @param shape
     * @param animationName
     */
    getAnimationProps(shape: Shape, animationName: string): any;
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
