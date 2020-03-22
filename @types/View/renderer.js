"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./../Shapes/shape");
const util_1 = require("../Common/util");
const text_1 = require("../Shapes/text");
const container_1 = require("./container");
const zrender = require("zrender");
const boundingRect_1 = require("./boundingRect");
/**
 * 封装动画
 */
class Animations {
    constructor(animationOption) {
        // 有方向淡入淡出动画的位移
        this.fadeOffset = 60;
        this.option = animationOption;
    }
    /**
     * 位移动画
     * @param shape
     */
    translate(shape) {
        return { position: [shape.x, shape.y] };
    }
    /**
     * 旋转动画
     * @param shape
     */
    rotation(shape) {
        return { rotation: shape.rotation };
    }
    /**
     * 缩放动画
     * @param shape
     */
    scale(shape) {
        // 对复合图形的子图形的’scale‘动画作特殊处理，保证scale只对父图形作用
        if (shape.parentShape) {
            return {
                style: {
                    opacity: shape.visible ? shape.style.opacity : 0
                }
            };
        }
        else {
            return {
                scale: shape.visible ? [1, 1] : [0, 0],
                style: {
                    opacity: shape.visible ? shape.style.opacity : 0
                }
            };
        }
    }
    /**
     * 淡入淡出动画
     * @param shape
     */
    fade(shape) {
        return {
            style: {
                opacity: shape.visible ? shape.style.opacity : 0
            }
        };
    }
    /**
     * 从上方淡入淡出动画
     * @param shape
     */
    fadeTop(shape) {
        return {
            position: [shape.x, shape.visible ? shape.y : (shape.y - this.fadeOffset)],
            style: {
                opacity: shape.visible ? shape.style.opacity : 0
            }
        };
    }
    /**
     * 从右方淡入淡出动画
     * @param shape
     */
    fadeRight(shape) {
        return {
            position: [shape.visible ? shape.x : shape.x + this.fadeOffset, shape.y],
            style: {
                opacity: shape.visible ? shape.style.opacity : 0
            }
        };
    }
    /**
     * 从下方淡入淡出动画
     * @param shape
     */
    fadeBottom(shape) {
        return {
            position: [shape.x, shape.visible ? shape.y : shape.y + this.fadeOffset],
            style: {
                opacity: shape.visible ? shape.style.opacity : 0
            }
        };
    }
    /**
     * 从左方淡入淡出动画
     * @param shape
     */
    fadeLeft(shape) {
        return {
            position: [shape.visible ? shape.x : shape.x - this.fadeOffset, shape.y],
            style: {
                opacity: shape.visible ? shape.style.opacity : 0
            }
        };
    }
    /**
     * 样式动画
     * @param shape
     */
    style(shape) {
        if (shape.style.text) {
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
    path(shape) {
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
    curve(shape) {
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
}
exports.Animations = Animations;
;
/**
 * 渲染器
 */
class Renderer {
    constructor(container, opt) {
        // zrender实例
        this.zr = null;
        // 需使用动画更新的zrender属性的队列
        this.animatePropsQueue = [];
        // 需更新的zrender属性的队列
        this.propsQueue = [];
        // 是否为首次加载状态
        this.init = true;
        // 上一次更新是否被该次打断
        this.isLastUpdateInterrupt = false;
        this.zr = Renderer.zrender.init(container);
        this.animations = new Animations(opt);
        this.globalContainer = new container_1.Container(this);
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
    setAttribute(zrenderShape, props, animation = false) {
        let queue = animation ? this.animatePropsQueue : this.propsQueue;
        if (!this.option.enableAnimation) {
            queue = this.propsQueue;
        }
        let item = queue.find(item => zrenderShape.id === item.zrenderShape.id);
        if (!item) {
            queue.push({
                zrenderShape,
                props
            });
        }
        else {
            util_1.Util.extends(item.props, props);
        }
    }
    /**
     * 根据图形的mountState渲染zrender图形
     * @param shapeContainer
     * @param removeList
     */
    renderZrenderShapes(shapeContainer, removeList) {
        let shape, i;
        // 遍历shapeContainer中的图形
        Object.keys(shapeContainer).map(shapeList => {
            for (i = 0; i < shapeContainer[shapeList].length; i++) {
                shape = shapeContainer[shapeList][i];
                // 若图形状态为NEEDMOUNT，即需挂载
                if (shape.mountState === shape_1.mountState.NEEDMOUNT) {
                    // 若zrender图形未创建，则创建zrender图形
                    if (shape.zrenderShape === null) {
                        shape.zrenderShape = shape.createZrenderShape();
                    }
                    else {
                        // 文本图形特殊处理
                        if (shape instanceof text_1.Text) {
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
                    shape.mountState = shape_1.mountState.MOUNTED;
                    // 设置图形可见性
                    shape.visible = true;
                    shape.updateZrenderShape('show', true);
                }
            }
        });
        // 处理需要移除的图形
        removeList.length && removeList.map(shape => {
            // 若图形状态为NEEDUNMOUNT)，即需卸载
            if (shape.mountState === shape_1.mountState.NEEDUNMOUNT) {
                // 修改挂载状态为已卸载
                shape.mountState = shape_1.mountState.UNMOUNTED;
                // 设置图形可见性
                shape.visible = false;
                shape.updateZrenderShape('hide', true, (shape => {
                    return () => {
                        this.globalContainer.remove(shape);
                        shape.zrenderShape = null;
                    };
                })(shape));
            }
        });
    }
    /**
     * 根据属性更新队列更新zrender图形
     */
    updateZrenderShapes(callback) {
        // 遍历属性列表，直接修改属性
        if (this.propsQueue.length) {
            this.propsQueue.map(item => {
                Object.keys(item.props).map(prop => {
                    if (prop !== 'callback') {
                        item.zrenderShape.attr(prop, item.props[prop]);
                    }
                });
                // 执行回调
                item.props['callback'] && item.props['callback']();
            });
            this.propsQueue.length = 0;
            if (this.option.enableAnimation === false) {
                callback && callback();
                ;
            }
        }
        setTimeout(() => {
            if (this.animatePropsQueue.length) {
                let queueLength = this.animatePropsQueue.length, counter = 0;
                // 遍历动画属性列表，执行动画
                this.animatePropsQueue.map(item => {
                    item.zrenderShape.animateTo(item.props, this.option.duration, this.option.timingFunction, () => {
                        counter++;
                        // 所有动画结束，触发afterUpadte回调事件
                        if (counter === queueLength && this.isLastUpdateInterrupt === false) {
                            callback && callback();
                            this.animatePropsQueue.length = 0;
                        }
                        item.props.callback && item.props.callback();
                    });
                });
            }
        }, 0);
    }
    /**
     * 跳过上一次更新的动画过程
     * @param callback
     */
    skipUpdateZrenderShapes(callback) {
        if (this.animatePropsQueue.length) {
            this.isLastUpdateInterrupt = true;
            // 遍历动画属性列表，执行动画
            this.animatePropsQueue.map(item => {
                item.zrenderShape.stopAnimation(true);
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
    adjustShapes(shapes) {
        if (shapes.length === 0)
            return;
        // 求视图上所有图形的包围盒并集
        let globalBound = boundingRect_1.Bound.union(...shapes.map(item => item.getBound())), cx = globalBound.x + globalBound.width / 2, cy = globalBound.y + globalBound.height / 2;
        this.globalContainer.translate(this.containerWidth / 2 - cx, this.containerHeight / 2 - cy, !this.init);
        if (this.init) {
            this.init = !this.init;
        }
    }
    /**
     * 获取容器宽度
     */
    getContainerWidth() {
        return this.containerWidth;
    }
    /**
     * 获取容器高度
     */
    getContainerHeight() {
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
Renderer.zrender = zrender;
exports.Renderer = Renderer;
