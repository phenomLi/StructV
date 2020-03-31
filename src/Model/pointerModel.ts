import { DataModel } from "./dataModel";
import { Element } from "./element";
import { Util } from "../Common/util";
import { ViewModel } from "../View/viewModel";
import { Text } from "../Shapes/text";
import { PointerOption, LayoutOption } from "../option";
import { anchor } from "./linkModel";
import { Line } from "../SpecificShapes/line";


export interface PointerPair {
    id: string;
    pointerShape: Line;
    label: string;
    target: Element;
    pointerName: string;
    branchPairs: PointerPair[];
    masterPair: PointerPair;
}


/**
 * 指针处理器
 */
export class PointerModel {
    private dataModel: DataModel;
    private viewModel: ViewModel;
    private layoutOption: LayoutOption;
    private pointerOptions: { [key: string]: Partial<PointerOption> };

    private lastPointerPairs: PointerPair[] = [];
    private pointerPairs: PointerPair[] = [];

    constructor(dataModel: DataModel, viewModel: ViewModel, layoutOption: LayoutOption) {
        this.dataModel = dataModel;
        this.viewModel = viewModel;
        this.layoutOption = layoutOption;
        this.pointerOptions = this.layoutOption.pointer;
    }

    /**
     * 构建指针模型
     * @param elementList 
     * @param pointerOptions 
     */
    constructPointers(elementList: Element[]) {
        if(!this.pointerOptions) return;

        Object.keys(this.pointerOptions).map(pointerName => {
            for(let i = 0; i < elementList.length; i++) {
                let ele = elementList[i];
                
                // 若没有指针字段的结点则跳过
                if(!ele[pointerName]) continue;

                this.addPointerPair(ele, pointerName, ele[pointerName]);
            }
        });
    }

    /**
     * 添加一个外部指针信息pointerPair
     * @param targetElement 
     * @param pointerName 
     * @param label
     */
    addPointerPair(targetElement: Element, pointerName: string, label: string | string[]) {
        let id, pointerShape;

        if(Array.isArray(label)) {
            id = pointerName + '#' + label[0];
            pointerShape = this.viewModel.createShape(id, 'line', this.pointerOptions[pointerName]) as Line;

            let branchPairs: PointerPair[] = label.map(item => {
                targetElement.onRefer(pointerShape.style, pointerName, item);

                return {
                    id: pointerName + '#' + item + '-' + targetElement.elementId,
                    pointerShape: null,
                    label: item,
                    target: targetElement,
                    pointerName,
                    branchPairs: null,
                    masterPair: null
                };
            });

            let masterPair = branchPairs.shift();
            branchPairs.map(item => (item.masterPair = masterPair));
            masterPair.branchPairs = branchPairs;
            masterPair.pointerShape = pointerShape;

            this.pointerPairs.push(masterPair, ...branchPairs);
        }
        else {
            id = pointerName + '#' + label + '-' + targetElement.elementId;
            pointerShape = this.viewModel.createShape(id, 'line', this.pointerOptions[pointerName]) as Line;

            this.pointerPairs.push({
                id,
                pointerShape,
                label,
                target: targetElement,
                pointerName,
                branchPairs: null,
                masterPair: null
            });

            targetElement.onRefer(pointerShape.style, pointerName, label);
        }
    }

    /**
     * 根据配置项，更新指针图形
     * @param elementList 
     */
    emitPointerShapes(elementList: Element[]) {
        this.applyCanceledRefer(elementList);

        // 遍历指针对队列，进行元素的指针绑定
        for(let i = 0; i < this.pointerPairs.length; i++) {
            this.referElement(this.pointerPairs[i]);
        }

        this.lastPointerPairs = this.pointerPairs;
    }

    /**
     * 外部指针指向某结点
     * @param pointerPair
     */
    private referElement(pointerPair: PointerPair) {
        // 需要被合并的指针，跳过不处理
        if(pointerPair.masterPair) {
            return;
        }

        let pointerName = pointerPair.pointerName,
            pointerOption = this.layoutOption.pointer[pointerName],
            pointerLabel = pointerPair.label,
            target = pointerPair.target,
            labelStyle = pointerOption.labelStyle,
            pointerShape = pointerPair.pointerShape,
            branchPairs = pointerPair.branchPairs,

            labelShapes = [],
            labelInterval = pointerOption.labelInterval,
            // 由字符串方向（top，left，bottom，right）映射到锚点的表
            // 主要为外部指针所用
            directionMapAnchor = {
                top: (w, h, o) => [0, -(h / 2) - o],
                right: (w, h, o) => [w / 2 + o, 0],
                bottom: (w, h, o) => [0, h / 2 + o],
                left: (w, h, o) => [-(w / 2) - o, 0]
            };

        if(branchPairs) {
            let labels = [pointerLabel, ...branchPairs.map(item => item.label)];

            labelShapes = labels.map(label => {
                return this.viewModel.createShape(
                    pointerName + '-' + label + '-text', 
                    'text', 
                    { 
                        style: labelStyle, 
                        content: label,
                        show: pointerOption.show 
                    }
                );
            });
        }
        else {
            let shape = this.viewModel.createShape(
                pointerName + '-' + pointerLabel + '-text', 
                'text', 
                { 
                    style: labelStyle, 
                    content: pointerLabel,
                    show: pointerOption.show 
                }
            );
            labelShapes.push(shape);
        }

        
        let x = target.x, 
            y = target.y, 
            w = target.width, 
            h = target.height, 
            r = target.rotation,
            anchor = directionMapAnchor[pointerOption.position || 'top'] as anchor,
            start = Util.anchor2position(x, y, w, h, r, anchor, pointerOption.offset + pointerOption.length),
            end = Util.anchor2position(x, y, w, h, r, anchor, pointerOption.offset);

        pointerShape.start.x = start[0];
        pointerShape.start.y = start[1];
        pointerShape.end.x = end[0];
        pointerShape.end.y = end[1];

        let curX = 0;

        labelShapes.map((label: Text, index) => {
            let dirSign = pointerOption.position === 'left'? -1: 1,
                offset = index === 0? 2: 0 

            label.y = start[1];
            label.x = start[0] + dirSign * (curX + labelInterval + offset);

            curX = curX + label.width + labelInterval + offset;
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