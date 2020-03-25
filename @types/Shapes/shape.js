"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../Common/util");
const boundingRect_1 = require("../View/boundingRect");
/**
 * 图形挂载状态
 */
var mountState;
(function (mountState) {
    // 需挂载
    mountState[mountState["NEEDMOUNT"] = 0] = "NEEDMOUNT";
    // 已挂载
    mountState[mountState["MOUNTED"] = 1] = "MOUNTED";
    // 需卸载
    mountState[mountState["NEEDUNMOUNT"] = 2] = "NEEDUNMOUNT";
    // 已卸载
    mountState[mountState["UNMOUNTED"] = 3] = "UNMOUNTED";
})(mountState = exports.mountState || (exports.mountState = {}));
;
class Shape {
    constructor(id, name, opt) {
        // id
        this.id = '';
        // 类型为普通图形
        this.type = 'shape';
        // 名称
        this.name = null;
        // zrender图形
        this.zrenderShape = null;
        // ---------------- 可变属性 -----------
        // 横坐标
        this.x = 0;
        // 纵坐标
        this.y = 0;
        // 可见性
        this.visible = false;
        // 旋转
        this.rotation = 0;
        // 宽高
        this.width = 0;
        this.height = 0;
        // 样式
        this.style = null;
        this.prevX = 0;
        this.prevY = 0;
        this.prevVisible = false;
        this.prevRotation = 0;
        this.prevWidth = 0;
        this.prevHeight = 0;
        this.prevStyle = null;
        // ------------------------------------
        // 基础样式
        this.baseStyle = {
            fill: '#000',
            text: '',
            textFill: '#000',
            fontSize: 15,
            fontWeight: null,
            stroke: null,
            opacity: 1,
            lineWidth: 1
        };
        // 图形配置项
        this.option = {
            content: null,
            size: [0, 0],
            zIndex: 1,
            show: 'scale'
        };
        // 渲染器实例
        this.renderer = null;
        // 父图形（通常指代复合图形Composite）
        this.parentShape = null;
        // 是否访问过（用于differ）
        this.visited = false;
        // 挂载状态（默认为需挂载NEEDMOINT）
        this.mountState = mountState.NEEDMOUNT;
        // 动画表
        this.animationsTable = {
            position: 'translate',
            rotation: 'rotation',
            show: 'scale',
            hide: 'scale',
            size: 'size',
            style: 'style'
        };
        this.id = id;
        this.name = name;
        this.option = this.defaultOption(this.option);
        this.style = this.defaultStyle(this.baseStyle);
        this.applyShapeOption(opt);
    }
    ;
    /**
     * 定义默认配置项
     */
    defaultOption(baseOption) {
        return baseOption;
    }
    /**
     * 定义默认样式
     */
    defaultStyle(baseStyle) {
        return Object.assign({}, baseStyle);
    }
    /**
     * 设置图形的基础锚点
     * - 对于没有默认锚点基础图形，比如圆形，多边形和矩形，模式锚点设置为：上，下，左，右，中5个，按顺时针方向对5个锚点进行编号，分别为0，1，2，3. 4：
     *          0
     *      \---*---\
     *    3 *   4   * 1
     *      \---*---\
     *          2
     * - 自定义的锚点，格式为 [number]：anchor，若number为0或1或2或3或4，则覆盖之前的锚点
     */
    getBaseAnchors() {
        let hw = this.width / 2, hh = this.height / 2;
        return {
            0: [0, -hh],
            1: [hw, 0],
            2: [0, hh],
            3: [-hw, 0],
            4: [0, 0]
        };
    }
    /**
     * 获取图形的默认锚点
     * @param baseAnchors
     * @param width
     * @param height
     */
    defaultAnchors(baseAnchors, width, height) {
        return baseAnchors;
    }
    /**
     * 重置所有可变属性
     */
    restoreData() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.prevRotation = this.rotation;
        this.prevVisible = this.visible;
        this.prevWidth = this.width;
        this.prevHeight = this.height;
        this.prevStyle = this.style;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.width = 0;
        this.height = 0;
        this.visible = false;
        this.style = this.defaultStyle(this.baseStyle);
    }
    /**
     * 应用元素配置项（尺寸，样式等）
     * @param style
     */
    applyShapeOption(opt) {
        util_1.Util.merge(this.option, opt);
        util_1.Util.merge(this.style, opt.style);
        if (opt.size) {
            if (Array.isArray(opt.size)) {
                this.width = opt.size[0];
                this.height = opt.size[1];
            }
            else {
                this.width = this.height = opt.size;
            }
        }
        if (this.name === 'circle' || this.name === 'isogon') {
            this.width = this.height;
        }
        if (opt.show) {
            // 若show字段是个数组，则将第一个值设为show动画，第二个值设为hide动画
            if (Array.isArray(opt.show)) {
                this.animationsTable['show'] = opt.show[0];
                this.animationsTable['hide'] = opt.show[1];
            }
            // 若只是一个字符串，则show，hide用同样的动画
            else {
                this.animationsTable['show'] = opt.show;
                this.animationsTable['hide'] = opt.show;
            }
        }
        this.style.text = this.option.content;
    }
    /**
     * 获取图形包围盒
     */
    getBound() {
        // 若已经有zrender图形，直接返回zrender图形的包围盒
        if (this.zrenderShape) {
            let { width, height } = this.zrenderShape.getBoundingRect();
            return {
                x: this.x - width / 2,
                y: this.y - height / 2,
                width,
                height
            };
        }
        let originBound = {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
        if (this.rotation) {
            return boundingRect_1.Bound.rotation(originBound, this.rotation);
        }
        else {
            return originBound;
        }
    }
    /**
     * 更新zrender图形
     * @param name
     * @param animation
     */
    updateZrenderShape(name, animation = false, fn) {
        if (this.zrenderShape === null)
            return;
        let props = this.renderer.getAnimationProps(this, this.animationsTable[name]);
        // 保存回调函数
        if (fn)
            props['callback'] = fn;
        // 复合图形修改属性/进行动画前要先修正origin
        if (this.type === 'composite' || this.name === 'polyLine') {
            let bound = this.getBound();
            this.zrenderShape.attr('origin', [bound.x + bound.width / 2, bound.y + bound.height / 2]);
        }
        this.renderer.setAttribute(this.zrenderShape, props, animation);
    }
    /**
     * 创建zrender图形
     */
    createZrenderShape() { }
    ;
}
exports.Shape = Shape;
;
