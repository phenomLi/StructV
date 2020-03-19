import { Shape, Style } from '../Shapes/shape';
import { SourceElement } from '../sources';
import { LayoutOption } from '../option';
import { BoundingRect, Bound } from '../View/boundingRect';
import { anchor } from './linkHandler';




export class Element<T extends SourceElement = SourceElement> {
    id: any;
    elementId: string;
    name: string = 'element';

    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    style: Style = null;

    shape: Shape = null;
    layoutOption: LayoutOption;

    [key: string]: any;

    anchors: anchor[];

    /**
     * 应用源数据元素的属性
     * @param sourceElement 
     */
    applySourceElement(sourceElement: T, field: string[]) {
        // 若有已声明的默认字段，则按照字段复制
        if(field) {
            field.map(prop => {
                // 复制sourceElement中存在的字段到element
                if(sourceElement[prop] !== undefined) {
                    this[prop] = sourceElement[prop];
                }
    
                // element中存在sourceElement中不存在的字段，则element删除该字段
                if(sourceElement[prop] === undefined && this[prop] !== undefined) {
                    delete this[prop];
                }
            });
        }
        // 若没有，则全部复制
        else {
            Object.keys(sourceElement).map(prop => {
                this[prop] = sourceElement[prop];
            });
        }
    }


    getWidth(): number {
        return this.shape.width;
    }

    getHeight(): number {
        return this.shape.height;
    }

    /**
     * 获取元素包围盒
     */
    getBound(): BoundingRect {
        let w = this.getWidth(),
            h = this.getHeight();

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
     */
    onLink(targetEle: Element, linkStyle: LinkStyle, linkName: string) {};

    /**
     * 当指向结点时触发
     * @param pointerStyle
     * @param pointerName
     * @param pointerValue
     */
    onRefer(pointerStyle: LinkStyle, pointerName: string, pointerValue: string | string[]) {}

    /**
     * 当元素发生变化
     * @param type
     */
    onChange(type: number) {}
}




















