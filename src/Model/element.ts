import { Shape, Style } from '../Shapes/shape';
import { SourceElement, LinkData } from '../sources';
import { LayoutOption } from '../option';
import { BoundingRect, Bound } from '../View/boundingRect';




export class Element<T extends SourceElement = SourceElement> {
    id: any;
    elementId: string;
    name: string = 'element';

    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    width: number = 0;
    height: number = 0;
    style: Style = null;

    shape: Shape = null;
    layoutOption: LayoutOption;

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
     * 定义如何更新元素自身对应的图形
     */
    updateShape(shape: Shape): boolean | void {
        return false;
    }

    /**
     * 当结点连接其他结点触发
     * @param targetEle 
     * @param linkStyle
     * @param linkName
     * @param sourceTarget
     */
    onLink(targetEle: Element, linkStyle: Style, linkName: string, sourceTarget: LinkData) {};

    /**
     * 当指向结点时触发
     * @param pointerStyle
     * @param pointerName
     * @param pointerValue
     */
    onRefer(pointerStyle: Style, pointerName: string, pointerValue: string | string[]) {}

    /**
     * 当元素发生变化
     * @param type
     */
    onChange(type: number) {}
}




















