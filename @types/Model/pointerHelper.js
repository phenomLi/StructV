"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../Common/util");
/**
 * 指针处理器
 */
class PointerHelper {
    constructor(engine, dataModel, viewModel) {
        this.engine = engine;
        this.dataModel = dataModel;
        this.viewModel = viewModel;
    }
    /**
     * 根据配置项，绑定指针图形
     * @param pointerOptions
     * @param elementList
     */
    bindPointerShape(pointerOptions, elementList) {
        Object.keys(pointerOptions).map(pointerName => {
            for (let i = 0; i < elementList.length; i++) {
                let ele = elementList[i];
                // 若没有指针字段的结点则跳过
                if (!ele[pointerName])
                    continue;
                this.referELement(ele, ele[pointerName], pointerName);
            }
        });
    }
    /**
     * 外部指针指向某结点
     * @param pointer
     * @param targetElement
     */
    referELement(targetElement, pointerLabels, pointerName) {
        let pointerOption = this.engine.layoutOption.pointer[pointerName], labelStyle = pointerOption.labelStyle, id = pointerName + '#' + (Array.isArray(pointerLabels) ? pointerLabels[0] : pointerLabels), pointerShape = null, labelShapes = [], labelInterval = pointerOption.labelInterval, 
        // 由字符串方向（top，left，bottom，right）映射到锚点的表
        // 主要为外部指针所用
        directionMapAnchor = {
            top: (w, h, o) => [0, -(h / 2) - o],
            right: (w, h, o) => [w / 2 + o, 0],
            bottom: (w, h, o) => [0, h / 2 + o],
            left: (w, h, o) => [-(w / 2) - o, 0]
        };
        pointerShape = this.viewModel.createShape(id, 'line', pointerOption);
        if (Array.isArray(pointerLabels)) {
            pointerLabels.map(label => {
                let shape = this.viewModel.createShape(pointerName + '-' + label + '-text', 'text', {
                    style: labelStyle,
                    content: label,
                    show: pointerOption.show
                });
                labelShapes.push(shape);
            });
        }
        else {
            let shape = this.viewModel.createShape(pointerName + '-' + pointerLabels + '-text', 'text', {
                style: labelStyle,
                content: pointerLabels,
                show: pointerOption.show
            });
            labelShapes.push(shape);
        }
        // 寻找那些没有被遗弃的外部指针，与绑定目标结点进行绑定
        this.dataModel.bind(targetElement, [pointerShape, ...labelShapes], (ele, shapes) => {
            let x = ele.x, y = ele.y, w = ele.shape.width, h = ele.shape.height, r = ele.rotation, anchor = directionMapAnchor[pointerOption.position || 'top'], start = util_1.Util.anchor2position(x, y, w, h, r, anchor, pointerOption.offset + pointerOption.length), end = util_1.Util.anchor2position(x, y, w, h, r, anchor, pointerOption.offset), pointerShape = shapes[0], labelShapes = shapes.slice(1);
            pointerShape.start.x = start[0];
            pointerShape.start.y = start[1];
            pointerShape.end.x = end[0];
            pointerShape.end.y = end[1];
            let curX = 0;
            labelShapes.map((label, index) => {
                let dirSign = pointerOption.position === 'left' ? -1 : 1, offset = index === 0 ? 2 : 0;
                label.y = start[1];
                label.x = start[0] + dirSign * (curX + labelInterval + offset);
                curX = curX + label.width + labelInterval + offset;
            });
        });
        targetElement.onRefer(pointerShape.style, pointerName, pointerLabels);
    }
}
exports.PointerHelper = PointerHelper;
