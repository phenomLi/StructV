import { ElementContainer, DataModel } from "./dataModel";
import { Element } from "./element";
import { LinkData, LinkTarget } from "../sources";
import { LinkOption, LayoutOption } from "../option";
import { Util } from "../Common/util";
import { ViewModel } from "../View/viewModel";
import { Text } from "../Shapes/text";
import { Bound } from "../View/boundingRect";
import { Line } from "../SpecificShapes/line";
import { Vector } from "../Common/vector";



// 锚点类型
export type anchor = ((w: number, h: number, o?: number) => [number, number]) | [number, number];
export type anchorSet = { [key: number]: anchor };


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
export class LinkModel {
    private dataModel: DataModel;
    private viewModel: ViewModel;
    private layoutOption: LayoutOption;
    private linkOptions: { [key: string]: Partial<LinkOption>};

    private linkPairs: LinkPair[] = [];
    private labelList: Text[] = [];
    private labelAvoidLevel: number = 2;

    constructor(dataModel: DataModel, viewModel: ViewModel, layoutOption: LayoutOption) {
        this.dataModel = dataModel;
        this.viewModel = viewModel;
        this.layoutOption = layoutOption;
        this.linkOptions = this.layoutOption.link;
    }

    /**
     * 构建连接模型
     * - 添加linkPair到linkPairs队列
     * - 将element中的源数据linkName字段（linkData类型）替换为真实element
     * @param elements
     * @param elementList 
     * @param linkOptions 
     */
    constructLinks(elements: ElementContainer, elementList: Element[]) {
        // 没有连接信息，返回
        if(!this.linkOptions) return;

        Object.keys(this.layoutOption.link).map(linkName => {
            for(let i = 0; i < elementList.length; i++) {
                let ele = elementList[i],
                    linkData: LinkData = ele[linkName],
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
                            sourceTarget: item,
                            index
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
                        sourceTarget: linkData
                    });
                    
                    ele[linkName] = target;
                }
            }
        });
    }

    /**
     * 根据配置项，更新连接图形
     * @param linkOptions 
     * @param elementList 
     */
    emitLinkShapes() {
        // 遍历连接对队列，进行元素间的连接绑定
        for(let i = 0; i < this.linkPairs.length; i++) {
            this.linkElement(this.linkPairs[i]);
        }
    }


    /**
     * 生成连接对
     * @param linkInfo
     */
    addLinkPair(linkInfo: {
        element: Element;
        target: Element;
        linkName: string;
        sourceTarget: LinkTarget,
        label?: string;
        index?: number;
        anchorPair?: [anchor, anchor];
    }) {
        if(linkInfo.target === null) return;

        let element: Element = linkInfo.element, 
            target: Element = linkInfo.target, 
            linkName: string = linkInfo.linkName, 
            label = linkInfo.label || this.linkOptions[linkName].label,
            sourceTarget = linkInfo.sourceTarget,
            anchorPair: [anchor, anchor] = linkInfo.anchorPair, 
            index: number = linkInfo.index,
            linkOption = this.linkOptions[linkName],
            linkShape = this.viewModel.createShape(`${element.elementId}-${target.elementId}`, 'line', linkOption) as Line;

        if(anchorPair === null || anchorPair === undefined) {
            anchorPair = this.getAnchorPair(element, target, linkName, index);
        }

        // 添加一个linkPair到linkPairs队列
        this.linkPairs.push({
            linkName,
            linkShape,
            ele: element,
            target,
            anchorPair,
            anchorPosPair: null,
            label: this.labelSolver(label, sourceTarget),
            index,
            dynamic: anchorPair? false: true
        });

        // 响应onLink钩子函数
        element.onLink(target, linkShape.style, linkName, sourceTarget);
        target.onLink(null, linkShape.style, linkName, sourceTarget);
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
     * 连接两结点
     * @param linkPair
     */
    private linkElement(linkPair: LinkPair) {
        let linkOption = this.layoutOption.link[linkPair.linkName],
            element = linkPair.ele,
            target = linkPair.target,
            label = linkPair.label,
            linkShape = linkPair.linkShape,
            labelShape = null,
            start, end;

        // 若锚点越界（如只有3个锚点，contact却有大于3的值），退出
        if(linkPair.anchorPair && (linkPair.anchorPair[0] === undefined || linkPair.anchorPair[1] === undefined)) {
            return;
        }

        if(label) {
            labelShape = this.viewModel.createShape(
                `${element.elementId}-${target.elementId}-label`,
                'text',
                {
                    show: linkOption.show,
                    content: label,
                    style: linkOption.labelStyle
                }
            );
            this.labelList.push(labelShape);
        }

        // 若使用动态锚点，获取动态锚点
        if(linkPair.dynamic) {
            [start, end] = this.getDynamicAnchorPos(element, target);
        }
        // 若已配置有连接点，使用连接点
        else {
            start = this.getAnchorPos(element, linkPair.anchorPair[0]),
            end = this.getAnchorPos(target, linkPair.anchorPair[1]);
        }
        
        // 若发现该连接有冲突，则进行处理，重新计算start，end坐标
        [start, end] = this.anchorAvoid([start, end]);
        linkPair.anchorPosPair = [start, end];
        
        linkShape.start.x = start[0];
        linkShape.start.y = start[1];
        linkShape.end.x = end[0];
        linkShape.end.y = end[1];

        // 若有标签，标签避让检测
        if(labelShape) {
            this.labelAvoid(labelShape, linkShape, [0, 1], 0);
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
        label.x = center[0] - label.width / 2;
        label.y = center[1] - label.height / 2;

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
        let customAnchors = this.layoutOption[ele.name].anchors,
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

    public clear() {
        this.linkPairs.length = 0;
        this.labelList.length = 0;
    }
}