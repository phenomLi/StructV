export declare type LinkType = {
    element: string;
    target: number | number[] | string | string[];
} | number | number[] | string | string[];
export declare type PointerType = string | string[];
export interface SourceElement {
    id: string | number;
    [key: string]: any | LinkType | PointerType;
}
export declare type Sources = SourceElement[] | {
    [key: string]: SourceElement[];
};
