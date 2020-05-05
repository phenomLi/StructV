import { Shape, mountState } from "./../Shapes/shape";
import { AnimationOption } from '../option';
import { shapeContainer, ViewModel } from "./viewModel";
import { Util } from "../Common/util";
import { Text } from "../Shapes/text";
import { GlobalShape } from "./globalShape";
import * as zrender from './../lib/zrender.min';
import { Bound, BoundingRect } from "./boundingRect";
import { Animations } from "./animations";
import { ResizeOption } from "../engine";



export type zrenderShape = any;



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
    public globalShape: GlobalShape;
    // 配置项
    private animationOption: AnimationOption;
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
    // 上一次视图的真实中心（不考虑 position）
    public lastCenter: [number, number];

    constructor(container: HTMLElement, viewModel: ViewModel, opt: AnimationOption) {
        this.viewModel = viewModel;
        this.zr = Renderer.zrender.init(container);
        this.animations = new Animations(opt);
        this.globalShape = new GlobalShape(this);
        this.globalShape.setOrigin(container.offsetWidth / 2, container.offsetHeight / 2);
        this.animationOption = opt;

        this.container = container;
        this.containerWidth = container.offsetWidth;
        this.containerHeight = container.offsetHeight;

        this.zr.add(this.globalShape.zrenderGroup);
    }

    /**
     * 设置zrender图形属性
     * @param zrenderShape
     * @param props
     * @param animation
     */
    setAttribute(zrenderShape, props, animation: boolean) {
        if(animation === undefined) {
            animation = this.animationOption.enableAnimation;
        }

        let queue = animation? this.animatePropsQueue: this.propsQueue;

        let item = queue.find(item => zrenderShape.id === item.zrenderShape.id);

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
                        shape.updateText(shape.zrenderShape);
                    }
                }
                // 将图形加入到全局图形容器
                this.globalShape.add(shape);
                // 在图形加入容器后，设置为隐藏，为淡入淡出动画做铺垫
                shape.updateZrenderShape('hide', false);
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
                shape.updateZrenderShape('hide', true, (shape => {
                    return () => {
                        this.globalShape.remove(shape);
                        shape.zrenderShape = null;
                    }
                })(shape));
            }
        });

        // 更新视图缩放 / 旋转中心
        let globalBound = this.getGlobalBound(),
            cx = globalBound.x + globalBound.width / 2,
            cy = globalBound.y + globalBound.height / 2;

        this.globalShape.setOrigin(cx, cy);
    }

    /**
     * 根据属性更新队列更新zrender图形
     */
    updateZrenderShapes(callback?: () => void) {
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

            if(this.animationOption.enableAnimation === false) {
                this.viewModel.isViewUpdating = false;
                callback && callback();
            }
        }

        setTimeout(() => {
            if(this.animatePropsQueue.length) {
                this.lastAnimatePropsQueue = this.animatePropsQueue;
                this.animatePropsQueue = [];

                let queue = this.lastAnimatePropsQueue,
                    queueLength = queue.length,
                    counter = 0;

                // 遍历动画属性列表，执行动画
                queue.map(item => {
                    item.zrenderShape.animateTo(
                        item.props, 
                        this.animationOption.duration, 
                        this.animationOption.timingFunction, 
                        () => {
                            counter++;

                            // 所有动画结束，触发afterUpadte回调事件
                            if(counter === queueLength && this.isLastUpdateInterrupt === false) {
                                this.viewModel.isViewUpdating = false;
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
            this.viewModel.isViewUpdating = false;
            this.lastAnimatePropsQueue.length = 0;
            this.isLastUpdateInterrupt = false;
        }
    }

    /**
     * 根据 translate 和 scale 调整视图
     * @param translate 
     * @param scale 
     */
    adjustGlobalShape(translate: [number, number] | 'auto', scale: [number, number] | 'auto') {
        let globalBound = this.getGlobalBound(),
            isFirstRender = this.viewModel.isFirstRender;

        if(translate !== undefined) {
            if(Array.isArray(translate)) {
                this.globalShape.translate(translate[0], translate[1], !isFirstRender);
            }

            if(translate === 'auto') {
                this.autoGlobalCenter(globalBound, !isFirstRender);
            }
        }

        if(scale !== undefined) {
            if(Array.isArray(scale)) {

                // 限制缩放大小在 [0.25, 4]
                if(scale[0] > 4) scale[0] = 4;
                if(scale[0] < 0.25) scale[0] = 0.25;
                if(scale[1] > 4) scale[1] = 4;
                if(scale[1] < 0.25) scale[1] = 0.25;

                this.globalShape.scale(scale[0], scale[1], !isFirstRender);
            }

            if(scale === 'auto') {
                this.autoGlobalSize(globalBound, !isFirstRender);
            }
        }
    }

    /**
     * 重新整视图尺寸
     * @param option
     * @param translate
     * @param scale
     */
    resizeGlobalShape(option: ResizeOption, translate: [number, number] | 'auto', scale: [number, number] | 'auto') {
        // 视图正在更新，不进行操作
        if(this.viewModel.isViewUpdating) return;

        let targetWidth = option.width === 'auto'? this.container.offsetWidth: option.width,
            targetHeight = option.height === 'auto'? this.container.offsetHeight: option.height;

        // 容器尺寸没有发生变化，不执行操作
        if(targetWidth === this.containerWidth && targetHeight === this.containerHeight) {
            return;
        }

        let position = this.globalShape.getPosition();

        this.viewModel.isViewUpdating = true;
        this.containerWidth = targetWidth;
        this.containerHeight = targetHeight;

        this.zr.resize(option);

        let newTranslate = [
            this.containerWidth / 2 - (this.lastCenter[0] + position[0]),
            this.containerHeight / 2 - (this.lastCenter[1] + position[1])
        ];

        // 调整视图
        this.adjustGlobalShape(newTranslate as [number, number], scale);
        // 更新视图
        this.updateZrenderShapes();
    }

    /**
     * 调整视图至容器中央
     * @param bound
     * @param enableAnimation
     */
    autoGlobalCenter(bound: BoundingRect, enableAnimation: boolean = false) {
        let position = this.globalShape.getPosition(),
            isFirstRender = this.viewModel.isFirstRender,
            cx = bound.x + bound.width / 2,
            cy = bound.y + bound.height / 2,
            dx, dy;

        // 首次调整
        if(isFirstRender) {
            dx = this.containerWidth / 2 - cx;
            dy = this.containerHeight / 2 - cy;
        }
        else {
            dx = this.lastCenter[0] - cx;
            dy = this.lastCenter[1] - cy;
        }

        this.globalShape.translate(dx, dy, enableAnimation);
        this.lastCenter = [cx, cy];
    }

    /**
     * 调整视图使视图适应容器尺寸
     * @param bound
     * @param enableAnimation 
     */
    autoGlobalSize(bound: BoundingRect, enableAnimation: boolean = false) {
        let globalScale = this.globalShape.getScale(),
            globalWidth = bound.width * globalScale[0],
            globalHeight = bound.height * globalScale[1],
            maxEdge =  globalWidth > globalHeight? this.containerWidth: this.containerHeight,
            maxBoundEdge = globalWidth > globalHeight? globalWidth: globalHeight,
            dWidth = globalWidth - this.containerWidth,
            dHeight = globalHeight - this.containerHeight,
            edge, boundEdge;

        if(dWidth < 0 && dHeight < 0) {
            edge = maxEdge;
            boundEdge = maxBoundEdge;
        }
        else {
            if(dWidth > dHeight) {
                boundEdge = globalWidth;
                edge = this.containerWidth;
            }
            else {
                boundEdge = globalHeight;
                edge = this.containerHeight;
            }
        }

        let scaleCoefficient = edge * 0.75 / boundEdge,
            scaleX = globalScale[0] * scaleCoefficient,
            scaleY = globalScale[1] * scaleCoefficient;

        if(scaleX > 1) scaleX = 1;
        if(scaleY > 1) scaleY = 1;
        if(scaleX < 0.25) scaleX = 0.25;
        if(scaleY < 0.25) scaleY = 0.25;

        this.globalShape.scale(scaleX, scaleY, enableAnimation);
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
     * 获取由所有图形组成的包围盒
     * @param shapes
     */
    getGlobalBound(shapesBound: boolean = true): BoundingRect {
        return shapesBound?
            Bound.union(...this.viewModel.getShapeList().map(item => item.getBound())):
            this.globalShape.getBound();
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