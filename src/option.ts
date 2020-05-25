import { Style, BaseOption, Shape } from "./Shapes/shape";
import { anchorSet } from "./Model/linkModel";
import { Element } from "./Model/element";



// 图形配置项
export interface BaseShapeOption extends BaseOption {
    // 锚点
    anchors: anchorSet;
    // 图形样式
    style: Partial<Style>;
}



// 指针配置项
export interface PointerOption {
    length: number;
    offset: number;
    labelInterval: number;
    position: 'top' | 'left' | 'bottom' | 'right';
    markers: string | string[];
    labelStyle: Partial<Style>;
    style: Partial<Style>;
    showComma: boolean;
    show: string | [string, string];
}

// 连接配置项
export interface LinkOption {
    markers: string | string[];
    curveness: number;
    contact: [number, number][] | [number, number] | ((linkIndex: number) => [number, number]);   
    label: string;
    labelStyle: Partial<Style>;                  
    style: Partial<Style>;
    show: string | [string, string];
}


// 所有视图元素配置项
export type ElementOption = BaseShapeOption & { shape: { new(...arg): Shape } | string };


// 动画配置项
export interface AnimationOption {
    // 是否允许跳过动画
    enableSkip: boolean;
    // 是否开启动画
    enableAnimation: boolean;
    // 缓动函数
    timingFunction: string;
    // 动画时长
    duration: number;
}


// 结构配置项
export interface StructOption {
    element?: { new(...arg): Element } | {
        [key: string]: { new(...arg): Element };
    };
    link?: string[];
    pointer?: string[];
}

// 视图（外观）配置项
export interface ViewOption {
    element?: Partial<ElementOption> | { [key: string]: Partial<ElementOption> };
    link?: { [key: string]: Partial<LinkOption> };
    pointer?: { [key: string]: Partial<PointerOption> };
    layout?: { [key: string]: any };
    animation?: Partial<AnimationOption>;
    // 位置，默认[number, number]，当为'auto'时，默认居中于容器
    position?: [number, number] | 'auto' | false;
    // 缩放，默认[number, number]，当为'auto'时，默认适应容器
    scale?: [number, number] | 'auto' | false;
}

// 交互配置项
export interface InteractOption {
    // 允许鼠标滚轮缩放视图
    zoomView?: [number, number] | boolean;
    // 允许鼠标左键拖拽视图
    moveView?: boolean;
    // 允许鼠标拖拽元素
    drag?: boolean | string[];
    // 允许鼠标 点击元素
    focus?: Partial<Style> | false;
    // 框选功能
    frameSelect?: Partial<Style> | false;
}



// 总配置项
// 分布为：结构 - 外观 - 交互
export interface EngineOption {
    // 可视化元素结构配置项
    struct?: Partial<StructOption>;
    // 可视化外观配置项
    view?: Partial<ViewOption>;
    // 可视化交互配置项
    interact?: Partial<InteractOption>
};



/**
 * 默认连线配置项
 */
export class DefaultLinkOption implements LinkOption {
    markers: string | string[] = null;
    curveness: number = 0;
    contact: [number, number][] | [number, number] | ((linkIndex: number) => [number, number]) = null;   
    label: string = null;
    style: Partial<Style> = {
        fill: '#000',
        lineWidth: 2
    };
    labelStyle: Partial<Style> = {
        textBackgroundColor: 'rgba(0, 0, 0, 1)',
        textFill: '#fff'
    };                  
    show: string | [string, string] = 'scale';
}

/**
 * 默认指针配置项
 */
export class DefaultPointerOption implements PointerOption {
    length: number = 30;
    offset: number = 15;
    labelInterval: number = 10;
    position: 'top' | 'left' | 'bottom' | 'right' = 'top';
    markers = 'arrow';
    labelStyle: Partial<Style> = {
        textBackgroundColor: 'rgba(0, 0, 0, 1)',
        textFill: '#fff',
        textPadding: [4, 4, 4, 4]
    };
    style: Partial<Style> = {
        fill: '#666',
        lineWidth: 4
    };
    showComma = true;
    show: string | [string, string] = 'scale';
}