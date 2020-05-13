import { Shape, Style, BaseOption } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";
import { BaseShapeOption } from "../option";




export class Text extends Shape {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);
    }

    defaultOption(baseOption: BaseOption) {
        return {
            ...baseOption,
            zIndex: 2
        };
    }

    defaultStyle(baseStyle: Style): Style {
        return {
            ...baseStyle,
            // 文字背景
            textBackgroundColor: '#fff',
            // 文字圆角
            textBorderRadius: 0
        };
    }

    /**
     * 更新文本尺寸
     * - 因为文本图形比较特殊，一开始便创建了zrender实例，所以需要在后期单独更新尺寸
     * @param zrenderShape 
     */
    updateTextSize(zrenderShape) {
        zrenderShape.attr('style', {
            ...this.style,
            textPadding: Math.sqrt(zrenderShape.style.fontSize) + 2
        });
        let bound = zrenderShape.getBoundingRect();
        this.width = bound.width;
        this.height = bound.height;
    }

    /**
     * 更新文本样式
     * - 因为文本图形比较特殊，一开始便创建了zrender实例，所以需要在后期单独更新样式
     * @param zrenderShape
     */
    updateText(zrenderShape) {
        zrenderShape.attr('position', [this.x, this.y]);
        zrenderShape.attr('origin', [this.width / 2, this.height / 2]);
        zrenderShape.attr('rotation', this.rotation);
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Text({
            style: this.style,
            z: this.option.zIndex
        });

        this.updateTextSize(zrenderShape);
        this.updateText(zrenderShape);

        return zrenderShape;
    }
}