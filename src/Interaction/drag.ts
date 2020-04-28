import { Interaction } from "./interaction";
import { zrenderShape } from "../View/renderer";
import { Element } from "../Model/element";
import { GlobalShape } from "../View/globalShape";


interface DraggableShapeInfo {
    ele: Element;
    zrenderShape: zrenderShape;
    lastX: number;
    lastY: number;
}


export class Drag extends Interaction {
    private draggableShapes: { [key: string]: DraggableShapeInfo } = {};
    private removeDraggableShapes: zrenderShape[] = [];

    private enableMove: boolean = false;
    private curDraggableShape: DraggableShapeInfo = null;
    private globalShape: GlobalShape;

    /**
     * 处理图形的 drag 事件
     * - 因为 zrender 的 drag 无法获取坐标，因此不能用内置的 drag，需要自己造
     * - 又因为 zrender 图形可以响应普通鼠标事件（click，onmousemove， onmousedown 等），因此可以对图形模拟 drag
     * @param shape 
     * @param draggable 
     * @param fn
     */
    apply(enableDrag: string[] | true) {
        let zrenderShapes = this.getDraggableZrenderShape(this.elementList, enableDrag);

        zrenderShapes.forEach(sub => {
            sub.on('mousedown', event => this.emitEvent('mouseDown', event));
        });
        
        this.container.addEventListener('mousemove', mouseEvent => this.emitEvent('mouseMove', mouseEvent));
        this.container.addEventListener('mouseup', mouseEvent => this.emitEvent('mouseUp', mouseEvent));
        this.globalShape = this.renderer.getGlobalShape();
    }

    update(enableDrag: string[] | true) { }
    
    response(param): Element[] {
        let dx = param.x - this.curDraggableShape.lastX,
            dy = param.y - this.curDraggableShape.lastY,
            ele = this.curDraggableShape.ele,
            scale = this.globalShape.getScale();

        ele.x += dx / scale[0];
        ele.y += dy / scale[1];
        this.curDraggableShape.lastX = param.x;
        this.curDraggableShape.lastY = param.y;

        return [ele];
    }

    /**
     * 鼠标点按事件
     * @param event 
     * @param ele
     */
    mouseDown(event: any, ele: Element) {
        let targetShape = event.target.parent || event.target,
            mouseEvent: MouseEvent = event.event;

        if(this.draggableShapes[targetShape.id] === undefined) {
            this.draggableShapes[targetShape.id] = {
                lastX: 0,
                lastY: 0,
                zrenderShape: null,
                ele: null
            };
        }

        this.curDraggableShape = this.draggableShapes[targetShape.id];

        this.enableMove = true;
        this.curDraggableShape.zrenderShape = targetShape;
        this.curDraggableShape.ele = targetShape.svShape.element;
        this.curDraggableShape.lastX = mouseEvent.clientX;
        this.curDraggableShape.lastY = mouseEvent.clientY;

        //this.interactionModel.setData('moving', true);
    }

    /**
     * 鼠标移动事件
     * @param event 
     */
    mouseMove(event: MouseEvent) {
        if(this.enableMove) {
            this.handle({
                x: event.clientX,
                y: event.clientY
            });
        }

        
    }

    /**
     * 鼠标松开事件
     * @param event 
     */
    mouseUp(event: MouseEvent) {
        this.enableMove = false;
        this.curDraggableShape = null;
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

    /**
     * 查看一个点是否落在可拖拽的图形内部
     * @param x
     * @param y
     */
    isPointInDraggableShape(x: number, y: number): boolean {
        return false;
    }
}