
// 结点连接声明
export type LinkType = { 
    element: string;
    target: number | number[] | string | string[];
} | number | number[] | string | string[];

// 结点指针声明
export type PointerType = string | string[];

// 源数据单元
export interface SourceElement {
    id: string | number;
    [key: string]: any | LinkType | PointerType;
}

// 源数据格式
export type Sources = SourceElement[] | {
    [key: string]: SourceElement[];
};
