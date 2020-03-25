import { AnimationOption } from "../option";
import { Shape } from "../Shapes/shape";
import { PolyLine } from "../Shapes/polyLine";
import { Curve } from "../Shapes/curve";
import { Rect } from "../Shapes/rect";
import { Isogon } from "../Shapes/isogon";
import { Circle } from "../Shapes/circle";



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
     * 尺寸动画
     * @param shape 
     */
    size(shape: Shape) {
        if(shape instanceof Rect) {
            return {
                shape: {
                    width: shape.width,
                    height: shape.height
                }
            };
        }
        else if(shape instanceof Isogon || shape instanceof Circle) {
            return {
                shape: {
                    r: shape.width / 2
                }
            };
        }
        else {
            return {};
        }
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