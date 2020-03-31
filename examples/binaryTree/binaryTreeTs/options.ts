import { EngineOption } from './StructV/option';
import { Style } from './StructV/Shapes/shape';

export interface BinaryTreeOptions extends EngineOption {
    // 元素配置项
    element: string;
    // 布局配置项
    layout: {
        // 结点布局外观
        element: {
            // 结点尺寸
            size: [number, number] | number;
            // 结点文本
            content: string;
            // 结点样式
            style: Partial<Style>;
        };
        // 指针连线声明
        link: {
            children: {
                // 连线两端图案
                markers: [string, string] | string;
                // 连接锚点
                contact: [[number, number], [number, number]];
                // 连线样式
                style: Partial<Style>;
            }
        };
        // 结点水平间隔
        xInterval: number;
        // 结点垂直间隔
        yInterval: number;
        // 视图垂直居中
        autoAdjust: boolean;
    };
    // 动画配置项
    animation: {
        // 是否允许跳过动画
        enableSkip: boolean;
        // 是否开启动画
        enableAnimation: boolean;
        // 缓动函数
        timingFunction: string;
        // 动画时长
        duration: number;
    };
}




// 默认配置项
export const BTOptions: BinaryTreeOptions = {
    element: 'dualNode',
    layout: {
        element: {
            size: [80, 40],
            content: '[id]',
            style: {
                stroke: '#000',
                fill: '#9EB2A1'
            }
        },
        link: {
            children: {
                markers: ['circle', 'arrow'],
                contact: [[3, 0], [1, 0]],
                style: {
                    fill: '#000',
                    lineWidth: 2
                }
            }
        },
        xInterval: 60,
        yInterval: 80,
        autoAdjust: true
    },
    animation: {
        enableSkip: true,
        duration: 1000,
        timingFunction: 'quinticOut',
        enableAnimation: true
    }
}
