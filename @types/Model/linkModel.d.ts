import { Engine } from "../engine";
import { ElementContainer, DataModel } from "./dataModel";
import { Element } from "./element";
import { LinkOption } from "../option";
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
    private engine;
    private dataModel;
    private viewModel;
    private linkPairs;
    private labelList;
    private labelAvoidLevel;
    constructor(engine: Engine, dataModel: DataModel, viewModel: ViewModel);
    /**
     * 构建连接模型
     * @param elements
     * @param elementList
     * @param linkOptions
     */
    constructLinks(elements: ElementContainer, elementList: Element[], linkOptions: {
        [key: string]: Partial<LinkOption>;
    }): void;
    /**
     * 根据配置项，更新连接图形
     * @param linkOptions
     * @param elementList
     */
    updateLinkShape(): void;
    /**
     * 根据源数据连接信息，将sourceElement替换为Element
     * @param elements
     * @param elementList
     */
    private buildLinkRelation;
    /**
     * 生成连接对
     * @param element
     * @param target
     * @param linkOption
     * @param linkName
     * @param index
     */
    private generateLinkPair;
    /**
     * 连接两结点
     * @param linkPair
     */
    private linkElement;
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
     * @param ele
     * @param targetEle
     * @param index
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
