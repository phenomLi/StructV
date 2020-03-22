import { Engine } from "../engine";
import { ElementContainer, DataModel } from "./dataModel";
import { Element } from "./element";
import { LinkType } from "../sources";
import { LinkOption } from "../option";
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
export class LinkHelper {
    private dataModel: DataModel;
    private viewModel: ViewModel;

    private linkPairs: LinkPair[] = [];
    private labelList: Text[] = [];
    private labelAvoidLevel: number = 2;

    constructor(private engine: Engine, dataModel: DataModel, viewModel: ViewModel) {
        this.dataModel = dataModel;
        this.viewModel = viewModel;
    }

    /**
     * 根据源数据连接信息，将sourceElement替换为Element
     * @param elements 
     * @param elementList 
     */
    buildLinkRelation(elements: ElementContainer, elementList: Element[]) {
        Object.keys(this.engine.layoutOption.link).map(linkName => {
            for(let i = 0; i < elementList.length; i++) {
                let ele = elementList[i],
                    linkData: LinkType = ele[linkName],
                    targetElement = null;

                if(linkData === undefined || linkData === null) continue;

                //  ---------------------------- 将连接声明字段从id变为Element ---------------------

                // 若连接声明是一个对象
                if(typeof linkData === 'object' && !Array.isArray(linkData)) {
                    // 目标结点类型
                    let eleType = linkData.element;

                    if(Array.isArray(linkData.target)) {
                        ele[linkName] = (<any[]>linkData.target).map(item => {
                            if(item) {
                                targetElement = (<Element[]>elements[eleType]).find(e => e.id === item);
                                return targetElement? targetElement: null;
                            }
                            else {
                                return null;
                            }
                        });
                    }
                    else {
                        targetElement = (<Element[]>elements[eleType]).find(e => e.id === (<{ target: number }>linkData).target);
                        ele[linkName] = targetElement? targetElement: null;
                    }
                }
                // 是一个数组
                else if(Array.isArray(linkData)) {
                    ele[linkName] = (<any[]>linkData).map(item => {
                        if(item) {
                            targetElement = elements[ele.name].find(e => e.id === item);
                            return targetElement? targetElement: null;
                        }
                        else {
                            return null;
                        }
                    });
                }
                // 是一个id
                else {
                    targetElement = elements[ele.name].find(e => e.id === ele[linkName]);
                    ele[linkName] = targetElement? targetElement: null;
                }
            }
        });
    }

    /**
     * 根据配置项，绑定连接图形
     * @param linkOptions 
     * @param linkName
     * @param elementList 
     */
    bindLinkShape(linkOptions: { [key: string]: Partial<LinkOption>}, elementList: Element[]) {
        Object.keys(linkOptions).map(linkName => {
            let linkOption = linkOptions[linkName];

            // 遍历所有元素，创建连接对信息到linkPairs队列
            for(let i = 0; i < elementList.length; i++) {
                let ele = elementList[i],
                    contact = null;

                // 若没有连接字段的结点则跳过
                if(!ele[linkName]) continue;

                if(Array.isArray(ele[linkName])) {
                    ele[linkName].map((item, index) => {
                        if(!item) return;

                        contact = this.contactSolver(linkOption.contact, index);
                        this.linkPairs.push({
                            linkName,
                            linkShape: null,
                            ele: ele,
                            target: item,
                            anchorPair: contact? [this.getElementAnchor(ele, contact[0]), this.getElementAnchor(item, contact[1])]: contact,
                            anchorPosPair: null,
                            label: this.labelSolver(linkOption.label, ele, item, index),
                            index,
                            dynamic: contact? false: true
                        });
                    });
                }
                else {
                    let targetEle = ele[linkName];
                    contact = this.contactSolver(linkOption.contact);
                    this.linkPairs.push({
                        linkName,
                        linkShape: null,
                        ele: ele,
                        target: targetEle,
                        anchorPair: contact? 
                            [
                                this.getElementAnchor(ele, contact[0]), 
                                this.getElementAnchor(targetEle, contact[1])
                            ]: contact,
                        anchorPosPair: null,
                        label: this.labelSolver(linkOption.label, ele, targetEle),
                        index: null,
                        dynamic: contact? false: true
                    });
                }
            }
        });

        // 遍历连接对队列，进行元素间的连接绑定
        for(let i = 0; i < this.linkPairs.length; i++) {
            this.linkElement(this.linkPairs[i]);
        }
    }

    /**
     * 连接两结点
     * @param linkPair
     */
    private linkElement(linkPair: LinkPair) {
        let linkOption = this.engine.layoutOption.link[linkPair.linkName],
            element = linkPair.ele,
            target = linkPair.target,
            label = linkPair.label,
            linkShape = null,
            labelShape = null;

        // 若锚点越界（如只有3个锚点，contact却有大于3的值），退出
        if(linkPair.anchorPair && (linkPair.anchorPair[0] === undefined || linkPair.anchorPair[1] === undefined)) {
            return;
        }

        linkShape = this.viewModel.createShape(`${element.elementId}-${target.elementId}`, 'line', linkOption);
        linkPair.linkShape = linkShape;
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

        // 该结点绑定该连线图形
        this.dataModel.bind([element, target], [linkShape, labelShape], (eles, shapes) => {
            let ele = eles[0],
                targetEle = eles[1],
                linkShape = shapes[0],
                labelShape = shapes[1],
                start, end;

            // 若使用动态锚点，获取动态锚点
            if(linkPair.dynamic) {
                [start, end] = this.getDynamicAnchorPos(ele, targetEle);
            }
            // 若已配置有连接点，使用连接点
            else {
                start = this.getAnchorPos(ele, linkPair.anchorPair[0]),
                end = this.getAnchorPos(targetEle, linkPair.anchorPair[1]);
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
        });

        element.onLink(target, linkShape.style as LinkStyle, linkPair.linkName);
        target.onLink(null, linkShape.style as LinkStyle, linkPair.linkName);
    }

    /**
     * 处理连接点
     * @param contacts 
     * @param index 
     */
    private contactSolver(contacts: Array<[number, number]> | [number, number], index?: number) {
        if(contacts) {
            if(Array.isArray(contacts[0])) {
                return index === undefined? contacts[0]: contacts[index];
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
     * @param ele 
     * @param targetEle 
     * @param index 
     */
    private labelSolver(sourceText: string, ele: Element, targetEle: Element, index?: number) {
        if(!sourceText) return null;

        let resultText = sourceText,
            props = Util.textParser(sourceText);

        if(Array.isArray(props)) {
            let values = props.map(item => {
                let value = /target/g.test(item)?
                    targetEle[item.replace(/target\./g, '')]:
                    ele[item];

                if(value === undefined) return null;
 
                if(Array.isArray(value) && index >= 0) {
                    return value[index];
                }
                else {
                    return value;
                }
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
        let customAnchors = this.engine.layoutOption[ele.name].anchors,
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
            cir1r = (ele.getWidth() > ele.getHeight()? ele.getWidth(): ele.getHeight()) / 2,
            cir2Pos: [number, number] = [target.x, target.y],
            cir2r = (target.getWidth() > target.getHeight()? target.getWidth(): target.getHeight()) / 2;

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