import { Shape, Style } from '../Shapes/shape';
import { SourceElement } from '../sources';
import { BoundingRect, Bound } from '../View/boundingRect';
import { LinkPair, anchorSet } from './linkModel';
import { PointerPair } from './pointerModel';


export interface LinkInfo {
    style: Partial<Style>; 
    name: string;
    index: number;
    label: string;
}



export class Element<T extends SourceElement = SourceElement> {
    id: any;
    elementId: string;
    name: string = 'element';

    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    width: number = 0;
    height: number = 0;
    style: Partial<Style> = {  };
    anchors: anchorSet = null;

    lastX: number = 0;
    lastY: number = 0;
    shape: Shape = null;
    layoutOption: { [key: string]: any };
    // 连带影响的连线
    effectLinks: LinkPair[] = [];
    // 连带影响的外部指针
    effectRefer: PointerPair = null;
    // 该 element 是否已经被遗弃（一次更新完成后）
    isObsolete: boolean = false;

    [key: string]: any;

    /**
     * 应用源数据元素的属性
     * @param sourceElement 
     */
    constructor(sourceElement: T) {
        Object.keys(sourceElement).map(prop => {
            this[prop] = sourceElement[prop];
        });
    }

    /**
     * 获取元素包围盒
     */
    getBound(): BoundingRect {
        let w = this.width,
            h = this.height;

        let originBound = {
            x: this.x - w / 2,
            y: this.y - h / 2,
            width: w,
            height: h
        };

        if(this.rotation) {
            return Bound.rotation(originBound, this.rotation);
        }
        else {
            return originBound;
        }
    }

    // ------------------------钩子方法-------------------------

    /**
     * 当结点连接其他结点触发
     * @param targetEle 
     * @param linkInfo
     */
    onLinkTo(targetEle: Element, linkInfo: LinkInfo) {};

    /**
     * 当结点被其他结点连接时触发
     * @param emitEle 
     * @param linkInfo
     */
    onLinkFrom(emitEle: Element, linkInfo: LinkInfo) {};

    /**
     * 当结点断开与其他结点触发
     * @param linkName 
     */
    onUnlinkTo(linkName: string) {}

    /**
     * 当结点被其他结点断开连接时触发
     * @param linkName 
     */
    onUnlinkFrom(linkName: string) {}

    /**
     * 当指向结点时触发
     * @param pointerStyle
     * @param pointerName
     * @param pointerValue
     */
    onRefer(pointerStyle: Style, pointerName: string, pointerValue: string | string[]) {}

    /**
     * 当指针离开该结点触发
     * @param pointerName 
     */
    onUnrefer(pointerName: string) {}

    /**
     * 当元素发生变化
     * @param type
     */
    onChange(type: number) {}
}




















