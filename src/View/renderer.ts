import { Shape, mountState } from "./../Shapes/shape";
import { AnimationOption } from '../option';
import { shapeContainer } from "./viewModel";
import { Util } from "../Common/util";
import { Text } from "../Shapes/text";
import { ViewContainer } from "./viewContainer";
import { PolyLine } from "../Shapes/polyLine";
import * as zrender from 'zrender';
import { Curve } from "../Shapes/curve";
import { Bound } from "./boundingRect";
import { Composite } from "../Shapes/composite";


export type zrenderShape = any;


/**
 * 封装动画
 */
export class Animations {
    // 有方向淡入淡出动画的位移
    fadeOffset: number = 60;
    // 动画配置项
    option: AnimationOption;

    constructor(animationOption: AnimationOption) {
        this.option = animationOption;
    }

    /**
     * 位移动画
     * @param shape
     */
    translate(shape: Shape) {
        return { position: [shape.x, shape.y] };
    }

    /**
     * 旋转动画
     * @param shape 
     */
    rotation(shape: Shape) {
        return { rotation: shape.rotation };
    }

    /**
     * 缩放动画
     * @param shape
     */
    scale(shape: Shape) {
        // 对复合图形的子图形的’scale‘动画作特殊处理，保证scale只对父图形作用
        if(shape.parentShape) {
            return {
                style: {
                    opacity: shape.visible? shape.style.opacity: 0
                }
            };
        }
        else {
            return {
                scale: shape.visible? [1, 1]: [0, 0],
                style: {
                    opacity: shape.visible? shape.style.opacity: 0
                }
            };
        }
    }

    /**
     * 淡入淡出动画
     * @param shape
     */
    fade(shape: Shape) {
        return {
            style: {
                opacity: shape.visible? shape.style.opacity: 0
            }
        };
    }

    /**
     * 从上方淡入淡出动画
     * @param shape 
     */
    fadeTop(shape: Shape) {
        return {
            position: [shape.x, shape.visible? shape.y: (shape.y - this.fadeOffset)],
            style: {
                opacity: shape.visible? shape.style.opacity: 0
            }
        };
    }

    /**
     * 从右方淡入淡出动画
     * @param shape
     */
    fadeRight(shape: Shape) {
        return {
            position: [shape.visible? shape.x: shape.x + this.fadeOffset, shape.y],
            style: {
                opacity: shape.visible? shape.style.opacity: 0
            }
        };
    }

    /**
     * 从下方淡入淡出动画
     * @param shape 
     */
    fadeBottom(shape: Shape) {
        return {
            position: [shape.x, shape.visible? shape.y: shape.y + this.fadeOffset],
            style: {
                opacity: shape.visible? shape.style.opacity: 0
            }
        };
    }

    /**
     * 从左方淡入淡出动画
     * @param shape 
     */
    fadeLeft(shape: Shape) {
        return {
            position: [shape.visible? shape.x: shape.x - this.fadeOffset, shape.y],
            style: {
                opacity: shape.visible? shape.style.opacity: 0
            }
        };
    }

    /**
     * 样式动画
     * @param shape
     */
    style(shape: Shape) {
        if(shape.style.text) {
            shape.zrenderShape.attr('style', {
                text: shape.style.text
            });
        }

        return { style: shape.style };
    }

    /**
     * 路径动画
     * @param shape
     */
    path(shape: PolyLine) {
        return {
            shape: {
                points: shape.path
            }
        };
    }

    /**
     * 二次贝塞尔曲线动画
     * @param shape 
     */
    curve(shape: Curve) {
        return {
            shape: {
                x1: shape.path[0][0],
                y1: shape.path[0][1],
                x2: shape.path[1][0],
                y2: shape.path[1][1],
                cpx1: shape.controlPoint[0],
                cpy1: shape.controlPoint[1]
            }
        };
    }
};




/**
 * 渲染器
 */
export class Renderer {
    static zrender = zrender;
    // zrender实例
    private zr: any = null;
    // 全局图形容器
    public globalContainer: ViewContainer;
    // 配置项
    private option: AnimationOption;
    // 动画表
    public animations: Animations;
    // 需使用动画更新的zrender属性的队列
    private animatePropsQueue: {
        zrenderShape: zrenderShape,
        props: { [key: string]: any }
    }[] = [];
    // 需更新的zrender属性的队列
    private propsQueue: {
        zrenderShape: zrenderShape,
        props: { [key: string]: any }
    }[] = [];

    // 容器宽度
    private containerWidth: number;
    // 容器高度
    private containerHeight: number;
    // 是否为首次加载状态
    private init: boolean = true;
    // 上一次更新是否被该次打断
    private isLastUpdateInterrupt: boolean = false;

    constructor(container: HTMLElement, opt: AnimationOption) {
        this.zr = Renderer.zrender.init(container);
        this.animations = new Animations(opt);
        this.globalContainer = new ViewContainer(this);
        this.globalContainer.setOrigin(container.offsetWidth / 2, container.offsetHeight / 2);
        this.option = opt;

        this.containerWidth = container.offsetWidth;
        this.containerHeight = container.offsetHeight;

        this.zr.add(this.globalContainer.zrenderGroup);
    }

    /**
     * 设置zrender图形属性
     * @param zrenderShape
     * @param props
     * @param animation
     */
    setAttribute(zrenderShape, props, animation: boolean = false) {
        let queue = animation? this.animatePropsQueue: this.propsQueue;

        if(!this.option.enableAnimation) {
            queue = this.propsQueue;
        }

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
     * @param shapeContainer 
     * @param removeList
     */
    renderZrenderShapes(shapeContainer: shapeContainer, removeList: Shape[]) {
        let shape: Shape, i;

        // 遍历shapeContainer中的图形
        Object.keys(shapeContainer).map(shapeList => {
            for(i = 0; i < shapeContainer[shapeList].length; i++) {
                shape = shapeContainer[shapeList][i];

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
                    this.globalContainer.add(shape);
                    // 设置叠层优先级
                    shape.zrenderShape.attr('z', shape.option.zIndex);
                    // 在图形加入容器后，设置为隐藏，为淡入淡出动画做铺垫
                    shape.updateZrenderShape('hide');
                    // 修改挂载状态为已挂载
                    shape.mountState = mountState.MOUNTED;
                    // 设置图形可见性
                    shape.visible = true;
                    shape.updateZrenderShape('show', true);
                }
            }
        });

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
                        this.globalContainer.remove(shape);
                        shape.zrenderShape = null;
                    }
                })(shape));
            }
        });
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

            if(this.option.enableAnimation === false) {
                callback && callback();;
            }
        }

        setTimeout(() => {
            if(this.animatePropsQueue.length) {
                let queueLength = this.animatePropsQueue.length,
                    counter = 0;

                // 遍历动画属性列表，执行动画
                this.animatePropsQueue.map(item => {
                    item.zrenderShape.animateTo(
                        item.props, 
                        this.option.duration, 
                        this.option.timingFunction, 
                        () => {
                            counter++;

                            // 所有动画结束，触发afterUpadte回调事件
                            if(counter === queueLength && this.isLastUpdateInterrupt === false) {
                                callback && callback();
                                this.animatePropsQueue.length = 0;
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
        if(this.animatePropsQueue.length) {
            this.isLastUpdateInterrupt = true;

            // 遍历动画属性列表，执行动画
            this.animatePropsQueue.map(item => {
                item.zrenderShape.stopAnimation(true)
                item.props['callback'] && item.props['callback']();
            });

            // 所有动画结束，触发afterUpadte回调事件
            callback && callback();
            this.animatePropsQueue.length = 0;
            this.isLastUpdateInterrupt = false;
        }
    }

    /**
     * 调整视图至容器中央
     * @param shapes
     * @param globalContainer
     */
    adjustShapes(shapes: Shape[]) {
        if(shapes.length === 0) return;

        // 求视图上所有图形的包围盒并集
        let globalBound = Bound.union(...shapes.map(item => item.getBound())),
        cx = globalBound.x + globalBound.width / 2,
        cy = globalBound.y + globalBound.height / 2;

        this.globalContainer.translate(this.containerWidth / 2 - cx, this.containerHeight / 2 - cy, !this.init);

        if(this.init) {
            this.init = !this.init;
        }
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
     * 清空数据
     */
    clear() {
        this.animatePropsQueue.length = 0;
        this.propsQueue.length = 0;
        this.globalContainer.clear();
    }
}