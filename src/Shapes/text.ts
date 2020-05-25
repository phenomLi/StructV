import { Shape, Style, BaseOption } from "./shape";
import { zrenderShape, Renderer, zrenderUpdateType } from "../View/renderer";
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
            textBorderRadius: 0,
            // 文字边距
            textPadding: [4, 4, 4, 4]
        };
    }

    /**
     * 更新文本尺寸
     * - 因为文本图形比较特殊，一开始便创建了zrender实例，所以需要在后期单独更新尺寸
     */
    updateTextSize() {
        let bound = this.getBound(false);
        this.width = bound.width;
        this.height = bound.height;
    }

    /**
     * 更新文本样式
     * - 因为文本图形比较特殊，一开始便创建了zrender实例，所以需要在后期单独更新样式
     */
    updateText() {
        let props = {
            position: [this.x, this.y],
            origin: [this.width / 2, this.height / 2],
            rotation: this.rotation
        };

        this.renderer.setAttribute(this, props, zrenderUpdateType.IMMED);
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Text({
            style: this.style,
            z: this.option.zIndex
        }),
            offScreenZrenderShape = new Renderer.zrender.Text({
            style: this.style,
            z: this.option.zIndex
        });

        this.renderer.getOffScreen().add(offScreenZrenderShape, this.id);

        this.updateTextSize();
        this.updateText();

        return zrenderShape;
    }
}