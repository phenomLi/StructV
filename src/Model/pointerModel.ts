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
    labelShapes: Text[];
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

        // 初始化所有外部指针的开始/结束位置
        this.initRefersPos();
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
        let pointerOption = this.layoutOption.pointer[pointerName],
            pointerShape = null,
            labelShape = null,
            id = null;

        if(Array.isArray(label)) {
            id = pointerName + '#' + label[0];
            pointerShape = this.viewModel.createShape(id, 'line', this.pointerOptions[pointerName]) as Line;

            const branchPairs: PointerPair[] = label.map(item => {
                labelShape = this.viewModel.createShape(
                    pointerName + '-' + item + '-text', 
                    'text', 
                    { 
                        style: pointerOption.labelStyle,
                        content: item,
                        show: pointerOption.show 
                    }
                ) as Text;

                targetElement.onRefer(pointerShape.style, pointerName, item);

                return {
                    id: pointerName + '#' + item + '-' + targetElement.elementId,
                    pointerShape: null,
                    label: item,
                    labelShapes: [labelShape],
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
            branchPairs.forEach(item => {
                masterPair.labelShapes = masterPair.labelShapes.concat(item.labelShapes);
            });

            this.pointerPairs.push(masterPair, ...branchPairs);
            targetElement.effectRefer = masterPair;
        }
        else {
            id = pointerName + '#' + label;
            pointerShape = this.viewModel.createShape(id, 'line', this.pointerOptions[pointerName]) as Line;
            labelShape = this.viewModel.createShape(
                pointerName + '-' + label + '-text', 
                'text', 
                { 
                    style: pointerOption.labelStyle,
                    content: label,
                    show: pointerOption.show 
                }
            ) as Text;

            let pointerPair = {
                id,
                pointerShape,
                label,
                labelShapes: [labelShape],
                target: targetElement,
                pointerName,
                branchPairs: null,
                masterPair: null
            }

            this.pointerPairs.push(pointerPair);
            targetElement.effectRefer = pointerPair;

            targetElement.onRefer(pointerShape.style, pointerName, label);
        }
    }

    /**
     * 根据配置项，更新指针图形
     * @param elementList 
     */
    emitPointerShapes(elementList: Element[]) {
        // 遍历指针对队列，进行元素的指针绑定
        for(let i = 0; i < elementList.length; i++) {
            if(elementList[i].effectRefer) {
                let pointerPair = elementList[i].effectRefer;

                this.updateRefer(pointerPair);

                pointerPair.pointerShape.isDirty = true;
                pointerPair.labelShapes.forEach(item => {
                    item.isDirty = true;
                });
            }
        }
    }

    /**
     * 初始化外部指针的坐标
     */
    private initRefersPos() {
        // 由字符串方向（top，left，bottom，right）映射到锚点的表
        // 主要为外部指针所用
        const directionMapAnchor = {
            top: (w, h, o) => [0, -(h / 2) - o],
            right: (w, h, o) => [w / 2 + o, 0],
            bottom: (w, h, o) => [0, h / 2 + o],
            left: (w, h, o) => [-(w / 2) - o, 0]
        };

        for(let i = 0; i < this.pointerPairs.length; i++) {
            let pointerPair = this.pointerPairs[i];

            // 需要被合并的指针，跳过不处理
            if(pointerPair.masterPair) {
                continue;
            }

            let pointerName = pointerPair.pointerName,
                pointerOption = this.layoutOption.pointer[pointerName],
                target = pointerPair.target,
                pointerShape = pointerPair.pointerShape,
                labelShapes = pointerPair.labelShapes,
                labelInterval = pointerOption.labelInterval;
                
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
    }

    /**
     * 更新外部指针的位置
     * @param pointerPair 
     * @param dPos
     */
    private updateRefer(pointerPair: PointerPair) {
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