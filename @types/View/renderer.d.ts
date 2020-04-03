import { Shape } from "./../Shapes/shape";
import { AnimationOption } from '../option';
import { shapeContainer, ViewModel } from "./viewModel";
import { GlobalShape } from "./globalShape";
import { BoundingRect } from "./boundingRect";
export declare type zrenderShape = any;
/**
 * 渲染器
 */
export declare class Renderer {
    static zrender: any;
    private zr;
    private viewModel;
    globalShape: GlobalShape;
    private option;
    private animations;
    private animatePropsQueue;
    private propsQueue;
    private container;
    private containerWidth;
    private containerHeight;
    private viewCenterX;
    private viewCenterY;
    private isLastUpdateInterrupt;
    private firstRender;
    constructor(container: HTMLElement, viewModel: ViewModel, opt: AnimationOption);
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
     * 根据动画名称，获取animations对象的对应动画属性
     * @param shape
     * @param animationName
     */
    getAnimationProps(shape: Shape, animationName: string): any;
    /**
     * 获取全局容器图形
     */
    getGlobalShape(): GlobalShape;
    /**
     * 获取容器宽度
     */
    getContainerWidth(): number;
    /**
     * 获取容器高度
     */
    getContainerHeight(): number;
    /**
     * 获取由所有图形组成的包围盒
     * @param shapes
     */
    getGlobalBound(shapesBound?: boolean): BoundingRect;
    /**
     * 根据 translate 和 scale 调整视图
     * @param translate
     * @param scale
     */
    adjustGlobalShape(translate: [number, number] | 'auto', scale: [number, number] | 'auto'): void;
    /**
     * 重新整视图尺寸
     * @param translate
     * @param scale
     */
    resizeGlobalShape(translate: [number, number] | 'auto', scale: [number, number] | 'auto'): void;
    /**
     * 调整视图至容器中央
     * @param bound
     * @param enableAnimation
     */
    autoGlobalCenter(bound: BoundingRect, enableAnimation?: boolean): void;
    /**
     * 调整视图使视图适应容器尺寸
     * @param bound
     * @param enableAnimation
     */
    autoGlobalSize(bound: BoundingRect, enableAnimation?: boolean): void;
    /**
     * 清空数据
     */
    clear(): void;
}
