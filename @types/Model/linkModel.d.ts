import { ElementContainer, DataModel } from "./dataModel";
import { Element } from "./element";
import { LinkTarget } from "../sources";
import { LayoutOption } from "../option";
import { ViewModel } from "../View/viewModel";
import { Line } from "../SpecificShapes/line";
export declare type anchor = ((w: number, h: number, o?: number) => [number, number]) | [number, number];
export declare type anchorSet = {
    [key: number]: anchor;
};
export interface LinkPair {
    linkName: string;
    linkShape: Line;
    ele: Element;
    target: Element;
    anchorPair: [anchor, anchor];
    anchorPosPair: [number, number][];
    label: string;
    index: number;
    dynamic: boolean;
}
/**
 * 连接处理器
 */
export declare class LinkModel {
    private dataModel;
    private viewModel;
    private layoutOption;
    private linkOptions;
    private linkPairs;
    private labelList;
    private labelAvoidLevel;
    constructor(dataModel: DataModel, viewModel: ViewModel, layoutOption: LayoutOption);
    /**
     * 构建连接模型
     * - 添加linkPair到linkPairs队列
     * - 将element中的源数据linkName字段（linkData类型）替换为真实element
     * @param elements
     * @param elementList
     * @param linkOptions
     */
    constructLinks(elements: ElementContainer, elementList: Element[]): void;
    /**
     * 根据配置项，更新连接图形
     * @param linkOptions
     * @param elementList
     */
    emitLinkShapes(): void;
    /**
     * 生成连接对
     * @param linkInfo
     */
    addLinkPair(linkInfo: {
        element: Element;
        target: Element;
        linkName: string;
        sourceTarget: LinkTarget;
        label?: string;
        index?: number;
        anchorPair?: [anchor, anchor];
    }): void;
    /**
     * 由source中的连接字段获取真实的连接目标元素
     * @param elements
     * @param emitElement
     * @param linkIds
     */
    private fetchTargetElements;
    /**
     * 连接两结点
     * @param linkPair
     */
    private linkElement;
    /**
     * 获取锚点对（[源元素锚点， 目标元素锚点]）
     * @param element
     * @param index
     */
    private getAnchorPair;
    /**
     * 处理连接点
     * @param contacts
     * @param index
     */
    private contactSolver;
    /**
     * 处理锚点冲突
     *（即开始锚点和结束锚点都被占用）
     * @param start
     * @param end
     */
    private anchorAvoid;
    /**
     * 处理标签
     * @param sourceText
     * @param sourceTarget
     */
    private labelSolver;
    /**
     * 标签避让算法
     * @param label
     * @param line
     * @param percentRange
     * @param level
     */
    private labelAvoid;
    /**
     * 获取元素的某个锚点
     */
    private getElementAnchor;
    /**
     * 当用户没有指定连接点时，使用动态锚点
     * 原理：使用外接圆，取两个元素外接圆中心连线与各自外接圆的交点，但是该方法精度不高
     * @param ele
     * @param target
     */
    private getDynamicAnchorPos;
    /**
     * 将某个结点的所有锚点转化为世界坐标
     * @param ele
     * @param anchors
     */
    private getAnchorPos;
    clear(): void;
}
