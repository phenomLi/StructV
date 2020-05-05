import { Interaction } from "./interaction";
import { Element } from "../Model/element";
import { Renderer } from "./../View/renderer";
import { GlobalShape } from "../View/globalShape";



export class Zone extends Interaction {
    private selectRect = null;
    private downX: number;
    private downY: number;

    private finishSizing: boolean = false;
    private frameSelecting: boolean = false;
    private globalShape: GlobalShape;

    private lastRectX: number;
    private lastRectY: number;
    private enableMoveRect: boolean = false;

    init() {
        let container = this.renderer.getContainer();

        container.addEventListener('mousedown', mouseEvent => this.emitTrigger(mouseEvent));
        container.addEventListener('mousemove', mouseEvent => this.emitHandler(mouseEvent));
        container.addEventListener('mouseup', () => this.emitFinish());

        this.globalShape = this.renderer.getGlobalShape();
        this.selectRect = new Renderer.zrender.Rect({
            position: [0, 0],
            shape: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            style: this.optionValue,
            z: 2
        });

        this.renderer.getZrender().add(this.selectRect);
        this.selectRect.hide();

        this.setData('enableFrameSelect', true);
    }

    update() {
        if(this.optionValue === false || this.optionValue === undefined) {
            this.setData('enableFrameSelect', false);
        }
    }

    trigger(event: MouseEvent) {
        let x = event.offsetX,
            y = event.offsetY;

        if(this.finishSizing) {
            if(this.selectRect.contain(x, y)) {
                this.lastRectX = x;
                this.lastRectY = y;
                this.enableMoveRect = true;
                this.interactionModel.trigger('drag', { offsetX: x, offsetY: y });
                return;
            }
            else {
                this.restoreSelect();
            }
        }

        this.selectRect.attr('shape', { x, y });
        this.selectRect.attr('style', this.optionValue);

        this.downX = x;
        this.downY = y;

        this.selectRect.show();
        this.frameSelecting = true;
    }

    handler(event: MouseEvent): Element[] | false {
        if(!this.frameSelecting) {
            return;
        }

        let x = event.offsetX,
            y = event.offsetY;

        if(this.finishSizing) {
            this.moveRect(x, y);
        }
        else {
            let width = x - this.downX,
                height = y - this.downY;

            this.selectRect.attr('shape', {
                width,
                height
            });
        }

        return false;
    }

    finish() {
        if(this.frameSelecting) {
            if(this.finishSizing === false) {
                let selectedElements = this.calcSelectedElements();

                this.finishSizing = true;
                this.setData('selectedElements', selectedElements);

                this.interactionModel.trigger('focus');
            }
        }
        else {
            this.finishSizing = false;
        }

        if(this.enableMoveRect) {
            this.enableMoveRect = false;
        }
    }   

    /**
     * 移动框选矩形
     * @param x 
     * @param y 
     */
    moveRect(x: number, y: number) {
        if(!this.enableMoveRect) {
            return;
        }

        let dx = x - this.lastRectX,
            dy = y - this.lastRectY,
            rx = this.selectRect.shape.x,
            ry = this.selectRect.shape.y;
        
        this.lastRectX = x;
        this.lastRectY = y;

        this.selectRect.attr('shape', {
            x: rx + dx,
            y: ry + dy
        });
        this.interactionModel.handler('drag', { x, y });
    }

    /**
     * 重置数据
     */
    restoreSelect() {
        this.selectRect.hide();
        this.selectRect.attr('shape', {
            width: 0,
            height: 0
        });

        this.finishSizing = false;
        this.frameSelecting = false;
        this.setData('selectedElements', null);
        this.interactionModel.finish('drag');
    }

    /**
     * 计算被选中的图形
     */
    calcSelectedElements(): Element[] {
        let { x, y, width, height } = this.selectRect.getBoundingRect();
        
        this.globalShape.zrenderGroup.updateTransform();

        return this.elementList.filter(item => {
            let zShape = item.shape.zrenderShape,
                bound = null;

            zShape.updateTransform();
            bound = zShape.getBoundingRect();
            bound.applyTransform(zShape.transform);
            
            return bound.x >= x && bound.y >= y && bound.x + bound.width <= x + width && bound.y + bound.height <= y + height;
        });
    }
}