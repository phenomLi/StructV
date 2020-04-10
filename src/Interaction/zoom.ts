import { Interaction } from "./interaction";
import { Util } from "../Common/util";





export class Zoom extends Interaction {
    // 一次滚轮缩放值
    zoomDelta: number = 0.25;
    // 最大缩放值
    maxZoomValue: number = 4;
    // 最小缩放值
    minZoomValue: number = 0.25;

    init(zoomRange: [number, number] | boolean) {
        if(!zoomRange) return;

        let container = this.renderer.getContainer();

        // 自定义缩放限制值
        if(Array.isArray(zoomRange)) {
            this.minZoomValue = zoomRange[0];
            this.maxZoomValue = zoomRange[1];
            this.minZoomValue = Util.clamp(this.minZoomValue, 0, Infinity);
            this.maxZoomValue = Util.clamp(this.maxZoomValue, 0, Infinity);
        }
        
        container.addEventListener('wheel', (event: WheelEvent) => {
            this.handle(event['wheelDelta'] > 0? 1: -1);
        });
    }

    response(wheelDelta: 1 | -1) {
        if(this.interactionModel.getData('moving')) return;

        let globalShape = this.renderer.getGlobalShape(),
            [ scaleX, scaleY ] = globalShape.getScale();

        scaleX += wheelDelta * this.zoomDelta;
        scaleY += wheelDelta * this.zoomDelta;

        // 限制缩放大小在 [0.25, 4]
        scaleX = Util.clamp(scaleX, this.maxZoomValue, this.minZoomValue);
        scaleY = Util.clamp(scaleY, this.maxZoomValue, this.minZoomValue);

        globalShape.scale(scaleX, scaleY);
    }
}