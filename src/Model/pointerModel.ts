import { DataModel } from "./dataModel";
import { Element } from "./element";
import { Util } from "../Common/util";
import { ViewModel } from "../View/viewModel";
import { Text } from "../Shapes/text";
import { PointerOption } from "../option";
import { anchor } from "./linkModel";
import { Line } from "../SpecificShapes/line";
import { Style } from "../Shapes/shape";


export interface PointerPair {
    // 指针 id
    id: string;
    // 指针图形实例
    pointerShape: Line;
    // 指针类型名称
    pointerName: string;
    // 指针图形实例样式
    pointerShapeStyle: Partial<Style>;
    // 被该指针合并的其他指针
    branchPairs: PointerPair[];
    // 若该指针是一个被合并的指针，保存合并这个指针的主指针
    masterPair: PointerPair;

    // 指针标签内容
    label: string;
    //  指针标签实例
    labelShapes: Text[];
    // 目标 element
    target: Element;
}


/**
 * 指针处理器
 */
export class PointerModel {
    private dataModel: DataModel;
    private viewModel: ViewModel;
    private pointerOptions: { [key: string]: Partial<PointerOption> };

    private lastPointerPairs: PointerPair[] = [];
    private pointerPairs: PointerPair[] = [];

    constructor(dataModel: DataModel, viewModel: ViewModel, pointerOptions: { [key: string]: Partial<PointerOption> }) {
        this.dataModel = dataModel;
        this.viewModel = viewModel;
        this.pointerOptions = pointerOptions;
    }

    /**
     * 构建指针模型
     * @param pointerNames
     * @param elementList 
     */
    constructPointers(pointerNames: string[], elementList: Element[]) {
        if(pointerNames.length === 0) return;

        pointerNames.forEach(pointerName => {
            for(let i = 0; i < elementList.length; i++) {
                let ele = elementList[i];
                
                // 若没有指针字段的结点则跳过
                if(!ele[pointerName]) continue;

                this.addPointerPair(ele, pointerName, ele[pointerName]);
            }
        });

        // 处理被取消指向的外部指针
        this.applyCanceledRefer(elementList);
        // 将该批次指针队列设为上一批指针队列
        this.lastPointerPairs = this.pointerPairs;
    }

    /**
     * 添加一个外部指针信息pointerPair
     * @param targetElement 
     * @param pointerName 
     * @param label
     */
    addPointerPair(targetElement: Element, pointerName: string, label: string | string[]) {
        if(Array.isArray(label)) {
            const branchPairs: PointerPair[] = label.map(item => {
                let pointerPair: PointerPair = {
                    id: pointerName + '#' + item,
                    pointerShape: null,
                    label: item,
                    labelShapes: [],
                    target: targetElement,
                    pointerName,
                    branchPairs: null,
                    masterPair: null,
                    pointerShapeStyle: {}
                };

                targetElement.onRefer(pointerPair.pointerShapeStyle as Style, pointerName, item);

                return pointerPair;
            });

            let masterPair = branchPairs.shift();
            branchPairs.map(item => (item.masterPair = masterPair));
            masterPair.branchPairs = branchPairs;
            masterPair.pointerShape = null;

            this.pointerPairs.push(masterPair, ...branchPairs);

            targetElement.effectRefer = masterPair;
        }
        else {
            let id = pointerName + '#' + label,
                pointerPair = {
                id,
                pointerShape: null,
                label,
                labelShapes: [],
                target: targetElement,
                pointerName,
                branchPairs: null,
                masterPair: null,
                pointerShapeStyle: {}
            }

            this.pointerPairs.push(pointerPair);

            targetElement.effectRefer = pointerPair;
            targetElement.onRefer(pointerPair.pointerShapeStyle as Style, pointerName, label);
        }
    }

    /**
     * 绘制指针
     */
    drawPointers() {
        // 由字符串方向（top，left，bottom，right）映射到锚点的表
        // 主要为外部指针所用
        const directionMapAnchor = {
            top: (w, h, o) => [0, -(h / 2) - o],
            right: (w, h, o) => [w / 2 + o, 0],
            bottom: (w, h, o) => [0, h / 2 + o],
            left: (w, h, o) => [-(w / 2) - o, 0]
        };

        for(let i = 0; i < this.pointerPairs.length; i++) {
            let pointerPair = this.pointerPairs[i],
                { 
                    id,
                    target, 
                    pointerName,
                    label 
                } = pointerPair,
                pointerOption = this.pointerOptions[pointerName],
                { 
                    labelInterval, 
                    offset, 
                    length, 
                    position,
                    labelStyle,
                    show 
                } = pointerOption,
                pointerShape = null,
                labelShapes = [];

            // 需要被合并的指针，跳过不处理
            if(pointerPair.masterPair) {
                continue;
            }

            
            // ------------------------------------- 处理指针箭头 ---------------------------------
                
            let x = target.x, 
                y = target.y, 
                w = target.width, 
                h = target.height, 
                r = target.rotation,
                anchor = directionMapAnchor[position] as anchor,
                start = Util.anchor2position(x, y, w, h, r, anchor, offset + length),
                end = Util.anchor2position(x, y, w, h, r, anchor, offset);

            pointerShape = this.viewModel.createShape(id, 'line', this.pointerOptions[pointerName]) as Line;
            pointerShape.start.x = start[0];
            pointerShape.start.y = start[1];
            pointerShape.end.x = end[0];
            pointerShape.end.y = end[1];

            Util.extends(pointerShape.style, pointerPair.pointerShapeStyle);
            pointerPair.pointerShape = pointerShape;

            // ------------------------------------ 处理指针标签 --------------------------------------

            labelShapes.push(this.viewModel.createShape(
                pointerName + '-' + label + '-text', 
                'text', 
                { 
                    style: labelStyle,
                    content: label,
                    show: show 
                }
            ) as Text);

            if(pointerPair.branchPairs) {
                labelShapes.push(...pointerPair.branchPairs.map(pair => {
                    return this.viewModel.createShape(
                        pointerName + '-' + pair.label + '-text', 
                        'text', 
                        { 
                            style: labelStyle,
                            content: pair.label,
                            show: show 
                        }
                    ) as Text;
                }));
            }

            let curX = 0;
    
            labelShapes.map((label: Text, index) => {
                let dirSign = position === 'left'? -1: 1,
                    offset = index === 0? 2: 0 
    
                label.y = start[1];
                label.x = start[0] + dirSign * (curX + labelInterval + offset);
    
                curX = curX + label.width + labelInterval + offset;
            });

            pointerPair.labelShapes = labelShapes;
        }
    }

    /**
     * 更新外部指针的位置
     * @param pointerPair 
     * @param dPos
     */
    updateReferPos(pointerPair: PointerPair) {
        // 需要被合并的指针，跳过不处理
        if(pointerPair.masterPair) {
            return;
        }

        let pointerShape = pointerPair.pointerShape,
            labelShapes = pointerPair.labelShapes,
            targetElement = pointerPair.target,
            dx = targetElement.x - targetElement.lastX,
            dy = targetElement.y - targetElement.lastY;

        pointerShape.start.x += dx;
        pointerShape.start.y += dy;
        pointerShape.end.x += dx;
        pointerShape.end.y += dy;

        labelShapes.map((label: Text) => {
            label.x += dx;
            label.y += dy;
        });
    }

    /**
     * 找出对比上一次被取消的外部指针指向
     * @param elementList 
     */
    private applyCanceledRefer(elementList: Element[]) {
        // 若没有上一批连线对，不执行
        if(this.lastPointerPairs.length === 0) {
            return;
        }

        let length = this.lastPointerPairs.length,
            lastPointerPair: PointerPair;

        for(let i = 0; i < length; i++) {
            lastPointerPair = this.lastPointerPairs[i];

            if(this.pointerPairs.find(item => item.id === lastPointerPair.id) === undefined) {
                let targetElement = elementList.find(item => item.elementId === lastPointerPair.target.elementId);

                if(targetElement) {
                    targetElement.onUnrefer(lastPointerPair.pointerName);
                }
            }
        }
    }

    clear() {
        this.pointerPairs = [];
    }
}