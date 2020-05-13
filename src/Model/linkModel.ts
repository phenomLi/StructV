import { ElementContainer, DataModel } from "./dataModel";
import { Element } from "./element";
import { LinkData, LinkTarget } from "../sources";
import { LinkOption } from "../option";
import { Util } from "../Common/util";
import { ViewModel } from "../View/viewModel";
import { Text } from "../Shapes/text";
import { Bound } from "../View/boundingRect";
import { Line } from "../SpecificShapes/line";
import { Vector } from "../Common/vector";
import { Style } from "../Shapes/shape";


// 锚点类型
export type anchor = ((w: number, h: number, o?: number) => [number, number]) | [number, number];
export type anchorSet = { [key: number]: anchor };

// 连线信息对象
export interface LinkPair {
    // 连线 id
    id: string;
    // 连线起始 element
    element: Element;
    // 连线目标 element
    target: Element;
    // 连线类型名称
    linkName: string;
    // 连线图形实例
    linkShape: Line;
    // 保存连线图形实例的样式
    linkShapeStyle: Partial<Style>;
    // 连线两端锚点
    anchorPair: [anchor, anchor];
    // 连线两端锚点真实世界坐标
    anchorPosPair: [number, number][];
    // 连线序号
    index: number;
    
    // 连线标签
    label: string;
    // 连线标签图形实例
    labelShape: Text;
    // 连线在源数据的声明
    sourceLinkTarget: LinkTarget;
}



/**
 * 连接处理器
 */
export class LinkModel {
    private dataModel: DataModel;
    private viewModel: ViewModel;
    private linkOptions: { [key: string]: Partial<LinkOption>};

    private lastLinkPairs: LinkPair[] = [];
    private linkPairs: LinkPair[] = [];
    private labelList: Text[] = [];
    private labelAvoidLevel: number = 2;

    constructor(dataModel: DataModel, viewModel: ViewModel, linkOptions: { [key: string]: Partial<LinkOption>}) {
        this.dataModel = dataModel;
        this.viewModel = viewModel;
        this.linkOptions = linkOptions;
    }

    /**
     * 构建连接模型
     * - 添加linkPair到linkPairs队列
     * - 将element中的源数据linkName字段（linkData类型）替换为真实element
     * @param linkNames
     * @param elements
     * @param elementList 
     */
    constructLinks(linkNames: string[], elements: ElementContainer, elementList: Element[]) {
        // 没有连接信息，返回
        if(linkNames.length === 0) return;

        linkNames.forEach(linkName => {
            for(let i = 0; i < elementList.length; i++) {
                let ele = elementList[i],
                    linkData: LinkData = ele[linkName],
                    label = this.linkOptions[linkName].label,
                    target = null;

                if(linkData === undefined || linkData === null) continue;

                //  ---------------------------- 将连接声明字段从id变为Element ---------------------
                if(Array.isArray(linkData)) {
                    ele[linkName] = [...linkData].map((item, index) => {
                        target = this.fetchTargetElements(elements, ele, item);
                        this.addLinkPair({
                            element: ele,
                            target,
                            linkName,
                            anchorPair: null,
                            label,
                            index,
                            sourceLinkTarget: item
                        });
                        
                        return target;
                    });
                }
                else {
                    target = this.fetchTargetElements(elements, ele, linkData);
                    this.addLinkPair({
                        element: ele,
                        target,
                        linkName,
                        anchorPair: null,
                        label,
                        sourceLinkTarget: linkData
                    });
                    
                    ele[linkName] = target;
                }
            }
        });

        // 处理被取消的连线
        this.applyCanceledLink(elementList);
        // 将该批次连接对队列设为上一批连接对队列
        this.lastLinkPairs = this.linkPairs;
    }


    /**
     * 生成连接对
     * @param linkInfo
     */
    addLinkPair(linkInfo: {
        element: Element;
        target: Element;
        linkName: string;
        label?: string;
        index?: number;
        anchorPair?: [anchor, anchor];
        sourceLinkTarget: LinkTarget;
    }) {
        if(linkInfo.target === null) return;

        let {
            element,
            target,
            linkName,
            label,
            index,
            anchorPair,
            sourceLinkTarget
        } = linkInfo;

        let id: string = `${element.elementId}-${target.elementId}`,
            linkPair = {
            id,
            linkName,
            linkShape: null,
            element,
            target,
            anchorPair,
            anchorPosPair: null,
            label,
            labelShape: null,
            index,
            linkShapeStyle: {},
            sourceLinkTarget
        };

        // 添加一个linkPair到linkPairs队列
        this.linkPairs.push(linkPair);

        // 将该连接对添加到 element 和 target 的 effectPairs 中
        element.effectLinks.push(linkPair);
        target.effectLinks.push(linkPair);

        // 响应onLink钩子函数
        element.onLinkTo(target, {
            style: linkPair.linkShapeStyle, 
            name: linkName, 
            index,
            label
        });
        target.onLinkFrom(element, {
            style: linkPair.linkShapeStyle, 
            name: linkName, 
            index,
            label
        });
    }

    /**
     * 绘制连线
     */
    drawLinks() {
        for(let i = 0; i < this.linkPairs.length; i++) {
            let linkPair = this.linkPairs[i],
                { id, element, target, linkName, anchorPair, index, linkShapeStyle } = linkPair,
                linkOption = this.linkOptions[linkName],
                linkShape = null,
                labelShape = null,
                start, end;

            // -------------------------------- 处理连线标签 -------------------------------------

            linkPair.label = this.labelSolver(linkPair.label, linkPair.sourceLinkTarget);

            // 对连线标签进行字符串解析，并创建标签图形实例
            if(linkPair.label) {
                labelShape = this.viewModel.createShape(
                    `${element.elementId}-${target.elementId}-label`,
                    'text',
                    {
                        show: linkOption.show,
                        content: linkPair.label,
                        style: linkOption.labelStyle
                    }
                );

                this.labelList.push(labelShape);

                linkPair.labelShape = labelShape;
            }

            // -------------------------------- 处理连线 -------------------------------------

            //  创建连线图形实例
            linkShape = this.viewModel.createShape(id, 'line', linkOption) as Line;
            Util.extends(linkShape.style, linkShapeStyle);

            if(anchorPair === null || anchorPair === undefined) {
                anchorPair = this.getAnchorPair(element, target, linkName, index);
            }

            // 若锚点越界（如只有3个锚点，contact却有大于3的值），退出
            if(anchorPair && (anchorPair[0] === undefined || anchorPair[1] === undefined)) {
                continue;
            }

            // 若使用动态锚点，获取动态锚点（没有在配置项中指定锚点）
            if(!anchorPair) {
                [start, end] = this.getDynamicAnchorPos(element, target);
            }
            // 若已配置有连接点，使用连接点
            else {
                start = this.getAnchorPos(element, anchorPair[0]),
                end = this.getAnchorPos(target, anchorPair[1]);
            }
            
            // 若发现该连接有冲突，则进行处理，重新计算start，end坐标
            [start, end] = this.anchorAvoid([start, end]);
            
            // 设定联系图形的起始和结束坐标
            linkShape.start.x = start[0];
            linkShape.start.y = start[1];
            linkShape.end.x = end[0];
            linkShape.end.y = end[1];

            linkPair.linkShape = linkShape;
            linkPair.anchorPosPair = [start, end];
            linkPair.anchorPair = anchorPair;
        }
    }

    /**
     * 更新连线位置
     * @param linkPair
     */
    updateLinkPos(linkPair: LinkPair, effectElement: Element) {
        let element = linkPair.element,
            target = linkPair.target,
            linkShape = linkPair.linkShape,
            labelShape = linkPair.labelShape,
            dx = 0,
            dy = 0;

        // 若是动态锚点（没有在配置项中指定锚点）
        if(!linkPair.anchorPair) {
            let [start, end] = this.getDynamicAnchorPos(element, target);

            linkShape.start.x = start[0];
            linkShape.start.y = start[1];
            linkShape.end.x = end[0];
            linkShape.end.y = end[1];
        }
        else {
            // 若连线受影响的是发出 element，更新连线起点
            if(linkPair.element === effectElement) {
                dx = element.x - element.lastX, 
                dy = element.y - element.lastY,
                linkShape.start.x += dx;
                linkShape.start.y += dy;
            }

            // 若连线受影响的是目标 element，更新连线终点
            if(linkPair.target === effectElement) {
                dx = target.x - target.lastX,
                dy = target.y - target.lastY,
                linkShape.end.x += dx;
                linkShape.end.y += dy;
            }
        }

        // 若有标签，标签避让检测
        if(labelShape) {
            this.labelAvoid(labelShape, linkShape, [0, 1], 0);
        }
    }

    /**
     * 由source中的连接字段获取真实的连接目标元素
     * @param elements
     * @param emitElement
     * @param linkIds 
     */
    private fetchTargetElements(elements: ElementContainer, emitElement: Element, linkTarget: LinkTarget): Element | Element[] {
        let elementList = elements[emitElement.name],
            target = null;

        if(linkTarget === null || linkTarget === undefined) {
            return null;
        }

        // 为linkData对象
        if(typeof linkTarget === 'object' && !Array.isArray(linkTarget)) {
            elementList = elements[linkTarget.element || emitElement.name];
            
             // 若目标element不存在，返回null
            if(elementList === undefined) {
                return Array.isArray(linkTarget)? Array.from(new Array(linkTarget.length)).map(item => null): null;
            }

            target = elementList.find(e => e.id === linkTarget.target);
            return target || null;
        }
        // 为单个id值
        else {
            target = elementList.find(e => e.id === linkTarget);
            return target || null;
        }
    }

    

    /**
     * 获取锚点对（[源元素锚点， 目标元素锚点]）
     * @param element
     * @param index 
     */
    private getAnchorPair(element: Element, target: Element, linkName: string, index?: number): [anchor, anchor] {
        let contact = this.contactSolver(this.linkOptions[linkName].contact, index);
        return contact? [
            this.getElementAnchor(element, contact[0]), this.getElementAnchor(target, contact[1])
        ]: null;
    }

    /**
     * 处理连接点
     * @param contacts 
     * @param index 
     */
    private contactSolver(
        contacts: Array<[number, number]> | [number, number] | ((linkIndex: number) => [number, number]), 
        index?: number
    ) {
        if(contacts) {
            if(Array.isArray(contacts[0])) {
                return index === undefined? contacts[0]: contacts[index];
            }
            else if(typeof contacts === 'function' && index !== undefined) {
                return contacts(index);
            }
            else {
                return contacts;
            }
        }
        // 若没有配置连接点，返回null（退回至动态锚点）
        else {
            return null;
        }
    }

    /**
     * 处理锚点冲突
     *（即开始锚点和结束锚点都被占用）
     * @param start 
     * @param end 
     */
    private anchorAvoid(anchorPosPair: [number, number][]): Array<[number, number]> {
        // 查看是否碰撞
        let collisionPair = this.linkPairs.find(item => {
            if(item.anchorPosPair) {
                return item.anchorPosPair[0].toString() === anchorPosPair[1].toString() &&
                    item.anchorPosPair[1].toString() === anchorPosPair[0].toString();
            }
            else {
                return false;
            }
        });

        if(collisionPair) {
            let tangent1 = Vector.tangent(Vector.subtract(anchorPosPair[1], anchorPosPair[0])),
                tangent2 = Vector.tangent(Vector.subtract(collisionPair.anchorPosPair[1], collisionPair.anchorPosPair[0])),
                offset = -6;
            
            let newAnchorPosPair1 = [Vector.location(anchorPosPair[0], tangent1, offset), Vector.location(anchorPosPair[1], tangent1, offset)],
                newAnchorPosPair2 = [Vector.location(collisionPair.anchorPosPair[0], tangent2, offset), Vector.location(collisionPair.anchorPosPair[1], tangent2, offset)];

            collisionPair.linkShape.start.x = newAnchorPosPair2[0][0];
            collisionPair.linkShape.start.y = newAnchorPosPair2[0][1];
            collisionPair.linkShape.end.x = newAnchorPosPair2[1][0];
            collisionPair.linkShape.end.y = newAnchorPosPair2[1][1];
            collisionPair.anchorPosPair = newAnchorPosPair2;

            return newAnchorPosPair1;
        }
        else {
            return anchorPosPair;
        }
    }

    /**
     * 处理标签
     * @param sourceText 
     * @param sourceTarget
     */
    private labelSolver(sourceText: string, sourceTarget: LinkTarget) {
        if(!sourceText) return null;

        if(sourceText && sourceTarget === null) {
            return sourceText;
        }

        let resultText = sourceText,
            props = Util.textParser(sourceText);

        if(Array.isArray(props)) {
            let values = props.map(item => {
                let value = sourceTarget[item];

                if(value === undefined) return null;
                else return value;
            });

            for(let i = 0; i < values.length; i++) {
                if(values[i] === null) return null;
                resultText = resultText.replace('[' + props[i] + ']', values[i]);
            }

            return resultText;
        }
        else {
            return props;
        }
    }

    /**
     * 标签避让算法
     * @param label 
     * @param line
     * @param percentRange
     * @param level
     */
    private labelAvoid(label: Text, line: Line, percentRange: number[], level: number): boolean {
        let collisionFlag = false,
            middlePercent,
            center,
            j;

        middlePercent = (percentRange[1] + percentRange[0]) / 2;
        center = line.pointAt(middlePercent);

        // 设置标签位置为线段中点
        label.x = center[0] - label.width;
        label.y = center[1] - label.height;

        for(j = 0; j < this.labelList.length; j++) {
            if(label !== this.labelList[j] && Bound.isOverlap(label.getBound(), this.labelList[j].getBound())) {
                collisionFlag = true;
                break;
            }
        }

        // 若发生重叠且递归层级比规定的层级上限小，则继续二分检测
        if(collisionFlag && level <= this.labelAvoidLevel) {
            let range1 = [percentRange[0], middlePercent],
                range2 = [middlePercent, percentRange[1]];

            let flag = this.labelAvoid(label, line, range1, level + 1);

            if(!flag) {
                flag = this.labelAvoid(label, line, range2, level + 1);
            }

            return flag;
        }
        // 如果没有重叠，则就用这个位置
        else {
            return true;
        }
    }

    /**
     * 获取元素的某个锚点
     */
    private getElementAnchor(ele: Element, anchorIndex: number): anchor  {
        let customAnchors = ele.anchors,
            defaultAnchors = ele.shape.defaultAnchors(ele.shape.getBaseAnchors(), ele.shape.width, ele.shape.height);

        if(customAnchors) {
            Object.keys(customAnchors).map(key => {
                defaultAnchors[key] = customAnchors[key];
            });
        }

        return defaultAnchors[anchorIndex];
    }

    /**
     * 当用户没有指定连接点时，使用动态锚点
     * 原理：使用外接圆，取两个元素外接圆中心连线与各自外接圆的交点，但是该方法精度不高
     * @param ele 
     * @param target
     */
    private getDynamicAnchorPos(ele: Element, target: Element): [anchor, anchor] {
        let cir1Pos: [number, number] = [ele.x, ele.y],
            cir1r = (ele.width > ele.height? ele.width: ele.height) / 2,
            cir2Pos: [number, number] = [target.x, target.y],
            cir2r = (target.width > target.height? target.width: target.height) / 2;

        let direction = Vector.subtract(cir1Pos, cir2Pos),
            anchor1 = Vector.location(cir1Pos, Vector.negative(direction), cir1r),
            anchor2 = Vector.location(cir2Pos, direction, cir2r);

        return [anchor1, anchor2];
    }

    /**
     * 将某个结点的所有锚点转化为世界坐标
     * @param ele 
     * @param anchors 
     */
    private getAnchorPos(ele: Element, anchor: anchor): [number, number] {
        let x = ele.x, y = ele.y, 
            hw = ele.shape.width / 2, hh = ele.shape.height / 2;

        return Util.anchor2position(x, y, hw * 2, hh * 2, ele.rotation, anchor);
    }

    /**
     * 找出对比上一次被取消的连线
     * @param elementList
     */
    private applyCanceledLink(elementList: Element[]) {
        // 若没有上一批连线对，不执行
        if(this.lastLinkPairs.length === 0) {
            return;
        }

        let length = this.lastLinkPairs.length,
            lastLinkPair: LinkPair;

        for(let i = 0; i < length; i++) {
            lastLinkPair = this.lastLinkPairs[i];

            if(this.linkPairs.find(item => item.id === lastLinkPair.id) === undefined) {
                let element = elementList.find(item => item.elementId === lastLinkPair.element.elementId),
                    target = elementList.find(item => item.elementId === lastLinkPair.target.elementId);

                if(element) {
                    element.onUnlinkTo(lastLinkPair.linkName);
                }

                if(target) {
                    target.onUnlinkFrom(lastLinkPair.linkName);
                }
            }
        }
    }

    public clear() {
        this.linkPairs = [];
        this.labelList.length = 0;
    }
}