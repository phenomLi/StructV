import { DataModel } from "./dataModel";
import { Element } from "./element";
import { Util } from "../Common/util";
import { ViewModel } from "../View/viewModel";
import { Text } from "../Shapes/text";
import { PointerOption, LayoutOption } from "../option";
import { anchor } from "./linkModel";
import { Line } from "../SpecificShapes/line";


export interface PointerPair {
    pointerShape: Line;
    labels: string[] | string;
    target: Element;
    pointerName: string;
}


/**
 * 指针处理器
 */
export class PointerModel {
    private dataModel: DataModel;
    private viewModel: ViewModel;
    private layoutOption: LayoutOption;
    private pointerOptions: { [key: string]: Partial<PointerOption> };

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
     * @param labels 
     */
    addPointerPair(targetElement: Element, pointerName: string, labels: string | string[]) {
        let id = pointerName + '#' + (Array.isArray(labels)? labels[0]: labels),
            pointerShape = this.viewModel.createShape(id, 'line', this.pointerOptions[pointerName]) as Line;

        this.pointerPairs.push({
            pointerShape,
            labels,
            target: targetElement,
            pointerName
        });

        targetElement.onRefer(pointerShape.style, pointerName, labels);
    }

    /**
     * 根据配置项，更新指针图形
     * @param pointerOptions
     * @param elementList 
     */
    emitPointerShapes() {
        // 遍历指针对队列，进行元素的指针绑定
        for(let i = 0; i < this.pointerPairs.length; i++) {
            this.referElement(this.pointerPairs[i]);
        }
    }

    /**
     * 外部指针指向某结点
     * @param pointerPair
     */
    private referElement(pointerPair: PointerPair) {
        let pointerName = pointerPair.pointerName,
            pointerLabels = pointerPair.labels,
            target = pointerPair.target,
            pointerOption = this.layoutOption.pointer[pointerName],
            labelStyle = pointerOption.labelStyle,
            pointerShape = pointerPair.pointerShape,
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

        if(Array.isArray(pointerLabels)) {
            labelShapes = pointerLabels.map(label => {
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
                    pointerName + '-' + pointerLabels + '-text', 
                    'text', 
                    { 
                        style: labelStyle, 
                        content: pointerLabels,
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

    clear() {
        this.pointerPairs = [];
    }
}