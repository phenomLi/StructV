"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const renderer_1 = require("../View/renderer");
class Text extends shape_1.Shape {
    constructor(id, name, opt) {
        super(id, name, opt);
    }
    defaultOption(baseOption) {
        return Object.assign({}, baseOption, { zIndex: 2 });
    }
    defaultStyle(baseStyle) {
        return Object.assign({}, baseStyle, { 
            // 文字背景
            textBackgroundColor: '#fff', 
            // 文字圆角
            textBorderRadius: 0 });
    }
    /**
     * 更新文本样式
     * - 因为文本图形比较特殊，一开始便创建了zrender实例，所以需要在后期单独更新样式
     */
    updateText(zrenderShape) {
        zrenderShape.attr('position', [this.x, this.y]);
        zrenderShape.attr('origin', [this.width / 2, this.height / 2]);
        zrenderShape.attr('rotation', this.rotation);
        zrenderShape.attr('style', Object.assign({}, this.style, { textPadding: Math.sqrt(zrenderShape.style.fontSize) + 2 }));
    }
    createZrenderShape() {
        let zrenderShape = new renderer_1.Renderer.zrender.Text({
            style: this.style,
            z: this.option.zIndex
        });
        this.updateText(zrenderShape);
        let bound = zrenderShape.getBoundingRect();
        this.width = bound.width;
        this.height = bound.height;
        return zrenderShape;
    }
}
exports.Text = Text;
