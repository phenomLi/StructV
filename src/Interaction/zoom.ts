import { Interaction } from "./interaction";
import { Util } from "../Common/util";
import { zrenderUpdateType } from "../View/renderer";





export class Zoom extends Interaction {
    // 一次滚轮缩放值
    private zoomDelta: number = 0.25;
    // 最大缩放值
    private maxZoomValue: number = 4;
    // 最小缩放值
    private minZoomValue: number = 0.25;

    init() {
        let zoomRange = this.optionValue as [number, number] | true,
            container = this.renderer.getContainer();

        // 自定义缩放限制值
        if(Array.isArray(zoomRange)) {
            this.clampZoomRange(zoomRange);
        }
        
        container.addEventListener('mousewheel', wheelEvent => this.emitTrigger(wheelEvent));
    }

    update() {
        let zoomRange = this.optionValue as [number, number] | true;

        // 自定义缩放限制值
        if(Array.isArray(zoomRange)) {
            this.clampZoomRange(zoomRange);
        }
    }

    handler(wheelDelta: 1 | -1): true {
        if(this.getData('moving')) return;

        let globalShape = this.renderer.getGlobalShape(),
            [ scaleX, scaleY ] = globalShape.getScale();

        scaleX += wheelDelta * this.zoomDelta;
        scaleY += wheelDelta * this.zoomDelta;

        // 限制缩放大小在 [0.25, 4]
        scaleX = Util.clamp(scaleX, this.maxZoomValue, this.minZoomValue);
        scaleY = Util.clamp(scaleY, this.maxZoomValue, this.minZoomValue);

        if(scaleX === this.minZoomValue || scaleX === this.maxZoomValue || scaleY === this.minZoomValue || scaleY === this.maxZoomValue) {
            return;
        }

        globalShape.scale(scaleX, scaleY, zrenderUpdateType.TICK);
        this.renderer.toggleAutoScale(false);

        return true;
    }

    trigger(event: WheelEvent) {
        this.emitHandler(event['wheelDelta'] > 0? 1: -1);
    }

    triggerCondition() {
        return !this.getData('enableFrameSelect');
    }

    /**
     * 限制缩放值
     * @param zoomRange 
     */
    clampZoomRange(zoomRange: [number, number]) {
        this.minZoomValue = zoomRange[0];
        this.maxZoomValue = zoomRange[1];
        this.minZoomValue = Util.clamp(this.minZoomValue, 0, Infinity);
        this.maxZoomValue = Util.clamp(this.maxZoomValue, 0, Infinity);
    }
}