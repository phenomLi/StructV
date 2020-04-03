import { Interaction } from "./interaction";
export declare class Zoom extends Interaction {
    zoomValue: number;
    maxZoomValue: number;
    minZoomValue: number;
    constructor();
    zoom(): void;
}
