import { Shape, Style } from "./shape";
import { zrenderShape, Renderer } from "../View/renderer";





export class TextStyle extends Style {
    // 文字背景
    textBackgroundColor?: string = '#fff';
    // 文字圆角
    textBorderRadius?: number = 0;
}



export class Text extends Shape {
    style: Style = new TextStyle();
    option = {
        ...this.option,
        zIndex: 2
    };

    constructor(id: string, name: string) {
        super(id, name);
    }

    restoreData() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.prevRotation = this.rotation;
        this.prevVisible = this.visible;
        this.prevStyle = this.style;
        
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.visible = false;
        this.style = new TextStyle();
    }

    /**
     * 更新文本样式
     * - 因为文本图形比较特殊，一开始便创建了zrender实例，所以需要在后期单独更新样式
     */
    updateText(zrenderShape) {
        zrenderShape.attr('position', [this.x, this.y]);
        zrenderShape.attr('origin', [this.width / 2, this.height / 2]);
        zrenderShape.attr('rotation', this.rotation);
        zrenderShape.attr('style', {
            ...this.style,
            textPadding: Math.sqrt(zrenderShape.style.fontSize) + 2
        });
    }

    createZrenderShape(): zrenderShape {
        let zrenderShape = new Renderer.zrender.Text({
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