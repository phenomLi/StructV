import { Interaction } from "./interaction";
import { zrenderShape } from "../View/renderer";
import { Element } from "../Model/element";
import { GlobalShape } from "../View/globalShape";


interface DraggableShapeInfo {
    element: Element;
    lastX: number;
    lastY: number;
}


export class Drag extends Interaction {
    private draggableShapes: { [key: string]: DraggableShapeInfo } = {};
    private curDraggableShapes: DraggableShapeInfo[] = [];
    private globalShape: GlobalShape;

    /**
     * 处理图形的 drag 事件
     * - 因为 zrender 的 drag 无法获取坐标，因此不能用内置的 drag，需要自己造
     * - 又因为 zrender 图形可以响应普通鼠标事件（click，onmousemove， onmousedown 等），因此可以 contain 函数对图形模拟 drag
     * @param draggableList
     */
    init() {
        let container = this.renderer.getContainer();

        this.zr.on('mousedown', mouseEvent => this.emitTrigger(mouseEvent));
        container.addEventListener('mousemove', mouseEvent => {
            let x = mouseEvent.offsetX,
                y = mouseEvent.offsetY;

            this.emitHandler({ x, y });
        });
        this.zr.on('mouseup', () => this.emitFinish());
        this.globalShape = this.renderer.getGlobalShape();
    }


    trigger(event) {
        let x = event.offsetX,
            y = event.offsetY,
            draggableList = this.optionValue,
            selectedElements = this.getData('selectedElements') as Element[],
            targetElements: Element[] = [];

        if(selectedElements) {
            targetElements = Array.isArray(draggableList)? selectedElements.filter(item => {
                return draggableList.find(name => name === item.name)
            }): selectedElements;
        }
        else {
            let targetShape = event.topTarget,
                element: Element = targetShape? targetShape.svShape.element: null;
                
            // 没有选中任何图形，退出
            if(targetShape === null || targetShape === undefined || element === null) {
                return;
            }

            // 若选中的图形的 element 不是设定的可拖拽 element，退出
            if(Array.isArray(draggableList) && draggableList.find(name => name === element.name) === undefined) {
                return;
            }
            
            targetElements = [element];
        }

        targetElements.forEach(item => {
            if(this.draggableShapes[item.elementId] === undefined) {
                this.draggableShapes[item.elementId] = {
                    lastX: 0,
                    lastY: 0,
                    element: null
                };
            }

            this.draggableShapes[item.elementId].lastX = x;
            this.draggableShapes[item.elementId].lastY = y;
            this.draggableShapes[item.elementId].element = item;
            this.curDraggableShapes.push(this.draggableShapes[item.elementId]);
        });

        this.setData('dragging', true);
    }
    
    handler(event): Element[] {
        if(!this.getData('dragging')) {
            return;
        }

        let x = event.x,
            y = event.y,
            scale = this.globalShape.getScale();

        for(let i = 0; i < this.curDraggableShapes.length; i++) {
            let cur = this.curDraggableShapes[i],
                dx = x - cur.lastX,
                dy = y - cur.lastY,
                ele = cur.element;

            ele.x += dx / scale[0];
            ele.y += dy / scale[1];
            cur.lastX = x;
            cur.lastY = y;
        }

        return this.curDraggableShapes.map(item => item.element);
    }


    finish() {
        this.curDraggableShapes.length = 0;
        this.setData('dragging', false);
    }

    triggerCondition() {
        return !this.getData('enableFrameSelect');
    }

    /**
     * 获取可以拖拽的 zrender 图形
     * @param elementList
     */
    getDraggableZrenderShape(elementList: Element[], optionValue: string[] | true): zrenderShape {
        let elements: Element[] = [];

        if(optionValue === true) {
            elements = elementList;
        }
        else {
            elementList.forEach(item => {
                if(optionValue.find(name => name === item.name)) {
                    elements.push(item);
                }
            });
        }

        return elements.map(item => item.shape.zrenderShape);
    }
}