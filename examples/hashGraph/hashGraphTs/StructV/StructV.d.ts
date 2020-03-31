import { Engine, RegisterShape } from "./engine";
import { Composite } from "./Shapes/composite";
import { EngineOption } from "./option";
import { Element } from "./Model/element";
export declare const SV: {
    Engine: typeof Engine;
    Util: {
        generateId(): string;
        extends(origin: any, ext: any, excludeProps?: string[]): void;
        merge(origin: any, dest: any): void;
        removeFromList<T>(list: T[], fn: (item: T) => boolean): void;
        findInList<T>(list: T[], fn: (item: T) => boolean): T;
        sign(number: number): number;
        getPathCenter(path: [number, number][]): [number, number];
        assert(condition: boolean, errorText: string): void;
        anchor2position(x: number, y: number, width: number, height: number, rotation: number, anchor: import("./Model/linkModel").anchor, offset?: number): [number, number];
        getClassName(classConstructor: any): string;
        textParser(text: string): string | string[];
    };
    Bound: {
        fromPoints(points: [number, number][]): import("./View/boundingRect").BoundingRect;
        toPoints(bound: import("./View/boundingRect").BoundingRect): [number, number][];
        union(...arg: import("./View/boundingRect").BoundingRect[]): import("./View/boundingRect").BoundingRect;
        intersect(b1: import("./View/boundingRect").BoundingRect, b2: import("./View/boundingRect").BoundingRect): import("./View/boundingRect").BoundingRect;
        rotation(bound: import("./View/boundingRect").BoundingRect, rot: number): import("./View/boundingRect").BoundingRect;
        isOverlap(b1: import("./View/boundingRect").BoundingRect, b2: import("./View/boundingRect").BoundingRect): boolean;
    };
    Vector: {
        add(v1: [number, number], v2: [number, number]): [number, number];
        subtract(v1: [number, number], v2: [number, number]): [number, number];
        dot(v1: [number, number], v2: [number, number]): number;
        scale(v: [number, number], n: number): [number, number];
        length(v: [number, number]): number;
        rotation(radian: number, point: [number, number], center?: [number, number]): [number, number];
        tangent(v: [number, number]): [number, number];
        normalize(v: [number, number]): [number, number];
        location(v: [number, number], direction: [number, number], len: number): [number, number];
        negative(v: [number, number]): [number, number];
    };
    Element: typeof Element;
    Composite: typeof Composite;
    registerShape: typeof RegisterShape;
    /**
     * 创建一个可视化引擎
     * @param container
     * @param engineConstruct
     * @param opt
     */
    create(container: HTMLElement, engineConstruct: new (container: HTMLElement) => Engine<import("./sources").Sources, EngineOption>, opt: EngineOption): Engine<import("./sources").Sources, EngineOption>;
};
