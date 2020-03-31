
// 连接目标信息
export type LinkTarget = {
    element: string;
    target: number | string;
    [key: string]: any;
} | number | string;

// 结点连接声明
export type LinkData = LinkTarget | LinkTarget[];

// 结点指针声明
export type PointerData = string | string[];

// 源数据单元
export interface SourceElement {
    id: string | number;
    [key: string]: any | LinkData | PointerData;
}

// 源数据格式
export type Sources = { } | SourceElement[];




