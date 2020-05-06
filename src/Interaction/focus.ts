import { Interaction } from "./interaction";
import { Element } from "../Model/element";
import { Util } from "../Common/util";


interface FocusElement {
    element: Element;
    originStyle: string;
}


export class Focus extends Interaction {
    private lastFocusElements: FocusElement[] = [];
    private curFocusElements: FocusElement[] = []; 

    init() {
        this.zr.on('mousedown', mouseEvent => this.emitTrigger(mouseEvent));
    }

    trigger(event) {
        let selectedElements = this.getData('selectedElements') as Element[];

        if(selectedElements) {
            this.emitHandler(selectedElements);
        }
        else {
            let targetShape = event.target,
                targetElement = targetShape? targetShape.svShape.element: null;

            // 点击空白
            if(targetShape === undefined) {
                if(this.curFocusElements.length === 0) {
                    return;
                }

                this.emitHandler(null);
                return;
            }

            // 点击非结点元素
            if(targetElement === null) {
                return;
            }

            // 若现在点击的 element 已经被选了
            if(this.lastFocusElements.length && this.lastFocusElements.find(item => item.element.elementId === targetElement.elementId)) {
                return;
            }

            this.emitHandler([targetElement]);
        }
    }

    handler(targetElements: Element[]): Element[] {
        let elements: FocusElement[] = [];

        // 失焦
        if(targetElements === null) {
            elements = this.curFocusElements;
            this.restoreLast(elements);

            this.curFocusElements = [];
            this.lastFocusElements = [];

            return elements.map(item => item.element);
        }
        // 聚焦
        else {
            let updateElements: FocusElement[] = [];

            if(this.lastFocusElements.length) {
                this.restoreLast(this.lastFocusElements);
                updateElements.push(...this.lastFocusElements);
            }

            this.curFocusElements = [];
            targetElements.forEach(item => {
                let targetStyle = this.optionValue;
                    
                this.curFocusElements.push({
                    element: item,
                    originStyle: JSON.stringify(item.style)
                });

                Util.merge(item.style, targetStyle);
            });

            this.lastFocusElements = this.curFocusElements;
            updateElements.push(...this.curFocusElements);

            return updateElements.map(item => item.element);
        }
    }

    triggerCondition() {
        return !this.getData('enableFrameSelect');
    }

    /**
     * 将 element 样式重置
     * @param restoreElements 
     */
    restoreLast(restoreElements: FocusElement[]) {
        restoreElements.forEach(item => {
            item.element.style = JSON.parse(item.originStyle);
        });
    }
}