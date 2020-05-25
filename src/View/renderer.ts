import { Shape, mountState } from "./../Shapes/shape";
import { AnimationOption, ViewOption } from '../option';
import { ViewModel } from "./viewModel";
import { Util } from "../Common/util";
import { Text } from "../Shapes/text";
import { GlobalShape } from "./globalShape";
import * as zrender from './../lib/zrender.min';
import { Bound, BoundingRect } from "./boundingRect";
import { Animations } from "./animations";
import { ResizeOption } from "../engine";
import { OffScreen } from "./offscreen";



export type zrenderShape = any;


export enum zrenderUpdateType {
    // 立刻更新
    IMMED = 0,
    // 在 render 阶段统一更新
    TICK = 1,
    // 动画后更新
    ANIMATED = 2
};


/**
 * 渲染器
 */
export class Renderer {
    static zrender = zrender;
    // zrender实例
    private zr: any = null;
    // 视图管理器
    private viewModel: ViewModel;
    // 全局图形容器
    private globalShape: GlobalShape;
    // 离屏缓存
    private offscreen: OffScreen;
    // 配置项
    private viewOption: ViewOption;
    // 动画表
    private animations: Animations;
    // 需使用动画更新的zrender属性的队列
    private animatePropsQueue: {
        zrenderShape: zrenderShape,
        props: { [key: string]: any }
    }[] = [];
    // 上一批需使用动画更新的zrender属性的队列
    private lastAnimatePropsQueue: {
        zrenderShape: zrenderShape,
        props: { [key: string]: any }
    }[] = [];
    // 需更新的zrender属性的队列
    private propsQueue: {
        zrenderShape: zrenderShape,
        props: { [key: string]: any }
    }[] = [];

    // HTML容器
    private container: HTMLElement;
    // 容器宽度
    private containerWidth: number;
    // 容器高度
    private containerHeight: number;
    // 上一次更新是否被该次打断
    private isLastUpdateInterrupt: boolean = false;

    constructor(container: HTMLElement, viewModel: ViewModel, opt: ViewOption) {
        this.viewModel = viewModel;
        this.zr = Renderer.zrender.init(container);
        this.animations = new Animations(opt.animation as AnimationOption);
        this.globalShape = new GlobalShape(this);
        this.offscreen = new OffScreen(this.globalShape.id, this);
        this.viewOption = opt;

        this.container = container;
        this.containerWidth = container.offsetWidth;
        this.containerHeight = container.offsetHeight;

        this.zr.add(this.globalShape.getZrenderShape());
    }

    /**
     * 设置zrender图形属性
     * @param shape
     * @param props
     * @param updateType
     */
    setAttribute(shape: Shape | GlobalShape, props, updateType?: number) {
        let animation = this.viewOption.animation.enableAnimation,
            zrenderShape = shape instanceof Shape? shape.zrenderShape: shape.getZrenderShape();

        if(zrenderShape === null) {
            return
        }

        if(updateType === undefined) {
            updateType = animation? zrenderUpdateType.ANIMATED: zrenderUpdateType.TICK;
        }

        if(updateType === zrenderUpdateType.TICK || updateType === zrenderUpdateType.ANIMATED) {
            let queue = updateType === zrenderUpdateType.ANIMATED? this.animatePropsQueue: this.propsQueue,
            item = queue.find(item => zrenderShape.id === item.zrenderShape.id);

            if(!item) {
                queue.push({
                    zrenderShape,
                    props
                });
            }
            else {
                Util.extends(item.props, props);
            }
        }
        else {
            zrenderShape.attr(props);
        }

        // 更新离屏图形
        this.offscreen.update(shape.id, props);
    }

    /**
     * 根据图形的mountState渲染zrender图形
     * @param shapeList
     * @param removeList
     */
    renderZrenderShapes(shapeList: Shape[], removeList: Shape[]) {
        let shape: Shape, i;

        // 遍历shapeList中的图形
        for(i = 0; i < shapeList.length; i++) {
            shape = shapeList[i];

            // 若图形状态为NEEDMOUNT，即需挂载
            if(shape.mountState === mountState.NEEDMOUNT) {
                // 若zrender图形未创建，则创建zrender图形
                if(shape.zrenderShape === null) {
                    shape.zrenderShape = shape.createZrenderShape();
                }
                else {
                    // 文本图形特殊处理
                    if(shape instanceof Text) {
                        shape.updateText();
                    }
                }
                // 将图形加入到全局图形容器
                this.globalShape.add(shape);
                // 在图形加入容器后，设置为隐藏，为淡入淡出动画做铺垫
                shape.updateZrenderShape('hide', { type: zrenderUpdateType.IMMED });
                // 修改挂载状态为已挂载
                shape.mountState = mountState.MOUNTED;
                // 设置图形可见性
                shape.visible = true;
                shape.updateZrenderShape('show');
            }

            // 将该图形实例添加到 zrender 图形上
            shape.zrenderShape.svShape = shape;
            // 设置叠层优先级
            shape.zrenderShape.attr('z', shape.option.zIndex);
        }
        

        // 处理需要移除的图形
        removeList.length && removeList.map(shape => {
            // 若图形状态为NEEDUNMOUNT)，即需卸载
            if(shape.mountState === mountState.NEEDUNMOUNT) {
                // 修改挂载状态为已卸载
                shape.mountState = mountState.UNMOUNTED;
                // 设置图形可见性
                shape.visible = false;
                shape.updateZrenderShape('hide', {
                    fn:  (shape => {
                        return () => {
                            this.globalShape.remove(shape);
                            Util.removeFromList(this.viewModel.getShapeList(), item => shape.id === item.id);
                        }
                    })(shape)
                });
                this.getOffScreen().remove(shape.id);
            }
        });
    }

    /**
     * 根据属性更新队列更新zrender图形
     */
    updateZrenderShapes(callback?: () => void) {
        let animationOption = this.viewOption.animation;

        // 遍历属性列表，直接修改属性
        if(this.propsQueue.length) {
            this.propsQueue.map(item => {
                Object.keys(item.props).map(prop => {
                    if(prop !== 'callback') {
                        item.zrenderShape.attr(prop, item.props[prop]);
                    }
                });

                // 执行回调
                item.props['callback'] && item.props['callback']();
            });

            this.propsQueue.length = 0;

            if(animationOption.enableAnimation === false) {
                callback && callback();
            }
        }

        setTimeout(() => {
            if(this.animatePropsQueue.length) {
                this.lastAnimatePropsQueue = this.animatePropsQueue;
                this.animatePropsQueue = [];

                let queue = this.lastAnimatePropsQueue,
                    queueLength = queue.length;

                // 遍历动画属性列表，执行动画
                queue.map((item, index) => {
                    item.zrenderShape.animateTo(
                        item.props, 
                        animationOption.duration, 
                        animationOption.timingFunction, 
                        () => {
                            // 所有动画结束，触发afterUpadte回调事件
                            if(index === queueLength - 1 && this.isLastUpdateInterrupt === false) {
                                queue.length = 0;
                                callback && callback();
                            }

                            item.props.callback && item.props.callback();
                        }
                    )
                });
            }
        }, 0);
    }

    /**
     * 跳过上一次更新的动画过程
     * @param callback 
     */
    skipUpdateZrenderShapes(callback?: () => void) {
        if(this.lastAnimatePropsQueue.length) {
            this.isLastUpdateInterrupt = true;

            // 遍历动画属性列表，执行动画
            this.lastAnimatePropsQueue.map(item => {
                item.zrenderShape.stopAnimation(true)
                item.props['callback'] && item.props['callback']();
            });

            // 所有动画结束，触发afterUpadte回调事件
            callback && callback();
            this.lastAnimatePropsQueue.length = 0;
            this.isLastUpdateInterrupt = false;
        }
    }

    /**
     * 重新整视图尺寸
     * @param option
     */
    resizeGlobalShape(option: ResizeOption) {
        // 视图正在更新，不进行操作
        if(this.viewModel.isViewUpdating) return;

        let targetWidth = option.width === 'auto'? this.container.offsetWidth: option.width,
            targetHeight = option.height === 'auto'? this.container.offsetHeight: option.height,
            bound = this.globalShape.getBound();

        // 容器尺寸没有发生变化，不执行操作
        if(targetWidth === this.containerWidth && targetHeight === this.containerHeight && option.force === false) {
            return;
        }

        this.containerWidth = targetWidth;
        this.containerHeight = targetHeight;

        this.zr.resize(option);

        // 调整视图
        this.setGlobalShapePosition(bound);
        this.setGlobalShapeScale(bound);
        // 更新视图
        this.updateZrenderShapes();
    }

    /**
     * 设置视图 position
     * @param bound
     */
    setGlobalShapePosition(bound: BoundingRect) {
        let position = this.viewOption.position,
            isFirstRender = this.viewModel.isFirstRender,
            cx = bound.x + bound.width / 2,
            cy = bound.y + bound.height / 2,
            dx, dy;

        if(position === undefined || position === false) {
            return;
        }

        if(Array.isArray(position)) {
            dx = position[0] - cx;
            dy = position[1] - cy;
        }

        if(position === 'auto') {
            dx = this.containerWidth / 2 - cx;
            dy = this.containerHeight / 2 - cy;
        }

        this.globalShape.translate(dx, dy, isFirstRender? zrenderUpdateType.TICK: zrenderUpdateType.ANIMATED);
    }

    /**
     * 设置视图 scale
     * @param bound
     */
    setGlobalShapeScale(bound: BoundingRect) {
        let scale = this.viewOption.scale,
            isFirstRender = this.viewModel.isFirstRender,
            scaleX, scaleY;

        if(scale === undefined || scale === false) {
            return;
        }

        if(Array.isArray(scale)) {
            // 限制缩放大小在 [0.25, 4]
            if(scale[0] > 4) scale[0] = 4;
            if(scale[0] < 0.25) scale[0] = 0.25;
            if(scale[1] > 4) scale[1] = 4;
            if(scale[1] < 0.25) scale[1] = 0.25;

            scaleX = scale[0];
            scaleY = scale[1];
        }

        if(scale === 'auto') {
            let globalScale = this.globalShape.getScale(),
                globalWidth = bound.width,
                globalHeight = bound.height,
                dWidth = globalWidth - this.containerWidth,
                dHeight = globalHeight - this.containerHeight,
                targetCoefficient = 0.75,
                edge, boundEdge;

            if(dWidth > dHeight) {
                boundEdge = globalWidth;
                edge = this.containerWidth;
            }
            else {
                boundEdge = globalHeight;
                edge = this.containerHeight;
            }

            let scaleCoefficient = edge * targetCoefficient / boundEdge;

            scaleX = globalScale[0] * scaleCoefficient,
            scaleY = globalScale[1] * scaleCoefficient;

            if(scaleX > 1) scaleX = 1;
            if(scaleY > 1) scaleY = 1;
            if(scaleX < 0.25) scaleX = 0.25;
            if(scaleY < 0.25) scaleY = 0.25;
        }

        this.globalShape.scale(scaleX, scaleY, isFirstRender? zrenderUpdateType.TICK: zrenderUpdateType.ANIMATED);
    }

    /**
     * 设置位置
     * @param value
     */
    toggleAutoPosition(value: false | 'auto') {
        this.viewOption.position = value;
    }

    /**
     * 设置缩放
     * @param value
     */
    toggleAutoScale(value: false | 'auto') {
        this.viewOption.scale = value;
    }

    /**
     * 根据动画名称，获取animations对象的对应动画属性
     * @param shape 
     * @param animationName 
     */
    getAnimationProps(shape: Shape, animationName: string) {
        return this.animations[animationName](shape);
    }

    /**
     * 获取离屏缓存
     */
    getOffScreen(): OffScreen {
        return this.offscreen;
    }

    /**
     * 获取全局容器图形
     */
    getGlobalShape(): GlobalShape {
        return this.globalShape;
    }

    /**
     * 获取 html 容器
     */
    getContainer(): HTMLElement {
        return this.container;
    }

    /**
     * 获取容器宽度
     */
    getContainerWidth(): number {
        return this.containerWidth;
    }

    /**
     * 获取容器高度
     */
    getContainerHeight(): number {
        return this.containerHeight;
    }

    /**
     * 获取 zrender 实例
     */
    getZrender() {
        return this.zr;
    }

    /**
     * 清空数据
     */
    clear() {
        this.animatePropsQueue.length = 0;
        this.propsQueue.length = 0;
        this.globalShape.clear();
    }
}