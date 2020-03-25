export declare type LinkTarget = {
    element: string;
    target: number | string;
    [key: string]: any;
} | number | string;
export declare type LinkData = LinkTarget | LinkTarget[];
export declare type PointerData = string | string[];
export interface SourceElement {
    id: string | number;
    [key: string]: any | LinkData | PointerData;
}
export declare type Sources = SourceElement[] | {
    [key: string]: SourceElement[];
};
