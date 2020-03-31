import { EngineOption } from './StructV/option';
import { Style } from './StructV/Shapes/shape';

export interface HashGraphOptions extends EngineOption {
    // 元素配置项
    element: {
        hashItem: string;
        graphNode: string;
    };
    // 布局配置项
    layout: {
        // 结点布局外观
        hashItem: {
            // 结点尺寸
            size: [number, number] | number;
            // 结点文本
            content: string;
            // 结点样式
            style: Partial<Style>;
        };
        // 结点布局外观
        graphNode: {
            // 结点尺寸
            size: number;
            // 结点文本
            content: string;
            // 结点样式
            style: Partial<Style>;
        };
        // 指针连线声明
        link: {
            hashLink: {
                // 连线两端图案
                markers: [string, string] | string;
                // 连接锚点
                contact: [number, number];
                // 连线样式
                style: Partial<Style>;
            };
            graphLink: {
                // 连接锚点
                contact: [number, number];
                // 连线样式
                style: Partial<Style>;
            };
        };
        // 图布局的半径
        radius: number;
        // 哈希表与图的距离
        distance: number;
        // 自动居中布局
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
export const HGOptions: HashGraphOptions = {
    element: {
        hashItem: 'hashBlock',
        graphNode: 'circle'
    },
    layout: {
        hashItem: {
            size: [80, 40],
            content: '[id]',
            style: {
                stroke: '#000',
                fill: '#a29bfe'
            }
        },
        graphNode: {
            size: 50,
            content: '[data]',
            style: {
                stroke: '#000',
                fill: '#a29bfe'
            }
        },
        link: {
            graphLink: {
                contact: [4, 4],
                style: {
                    fill: '#000',
                    lineWidth: 2
                }
            },
            hashLink: {
                contact: [1, 3],
                markers: ['circle', 'arrow'],
                style: {
                    fill: '#000',
                    lineWidth: 2,
                    lineDash: [4, 4]
                }
            }
        },
        radius: 150,
        distance: 350,
        autoAdjust: true
    },
    animation: {
        enableSkip: true,
        duration: 1000,
        timingFunction: 'quinticOut',
        enableAnimation: true
    }
}
