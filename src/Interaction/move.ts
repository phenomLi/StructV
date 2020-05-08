import { Interaction } from "./interaction";
import { GlobalShape } from "../View/globalShape";



export class Move extends Interaction {
    private enableMove: boolean = false;

    private curX: number;
    private curY: number;
    private container: HTMLElement;
    private globalShape: GlobalShape;

    init() {
        this.container = this.renderer.getContainer();
        this.container.addEventListener('mousedown', mouseEvent => this.emitTrigger(mouseEvent));
        this.container.addEventListener('mousemove', mouseEvent => this.emitHandler(mouseEvent));
        this.container.addEventListener('mouseup', () => this.emitFinish());
        this.container.addEventListener('mouseleave', () => this.emitFinish());
    }

    trigger(event: MouseEvent) {
        this.globalShape = this.renderer.getGlobalShape();
        this.curX = event.clientX;
        this.curY = event.clientY;
     
        this.enableMove = true;
        this.setData('moving', true);
    }

    handler(event: MouseEvent): true {
        if(this.enableMove === false) {
            return;
        }

        let x = event.clientX,
            y = event.clientY,
            dx = x - this.curX,
            dy = y - this.curY;
        
        this.curX = x;
        this.curY = y;

        this.globalShape.translate(dx, dy);

        return true;
    }

    finish() {
        if(this.enableMove) {
            this.enableMove = false;
            this.setData('moving', false);
        }
    }

    triggerCondition() {
        // 若进入了结点拖拽或者选取模式，不进行视图拖拽
        return !this.getData('dragging') && !this.getData('enableFrameSelect');
    }
}
    