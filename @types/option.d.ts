import { Style, BaseOption } from "./Shapes/shape";
import { anchorSet } from "./Model/linkModel";
export interface BaseShapeOption extends BaseOption {
    anchors: anchorSet;
    style: Partial<Style>;
}
export interface PointerOption {
    length: number;
    offset: number;
    labelInterval: number;
    position: 'top' | 'left' | 'bottom' | 'right';
    markers: string | string[];
    labelStyle: Partial<Style>;
    style: Partial<Style>;
    show: string | [string, string];
}
export interface LinkOption {
    markers: string | string[];
    curveness: number;
    contact: [number, number][] | [number, number] | ((linkIndex: number) => [number, number]);
    label: string;
    labelStyle: Partial<Style>;
    style: Partial<Style>;
    show: string | [string, string];
}
export interface ContainerOption extends BaseOption {
    style: Partial<Style>;
    padding: number | [number, number, number, number];
    anchors: (w: number, h: number, childrenLength: number) => anchorSet;
}
export declare type ElementsOption = {
    [p: string]: string;
} | string;
export interface LayoutOption {
    [key: string]: Partial<BaseShapeOption> | any;
    pointer: {
        [k: string]: Partial<PointerOption>;
    };
    link: {
        [k: string]: Partial<LinkOption>;
    };
    container: {
        [k: string]: Partial<ContainerOption>;
    };
    autoAdjust: boolean;
}
export interface AnimationOption {
    enableSkip: boolean;
    enableAnimation: boolean;
    timingFunction: string;
    duration: number;
}
export interface EngineOption {
    element?: Partial<ElementsOption>;
    layout?: Partial<LayoutOption>;
    animation?: Partial<AnimationOption>;
}
