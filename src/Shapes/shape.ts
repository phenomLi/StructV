import { Renderer, zrenderShape } from "../View/renderer";
import { Util } from "../Common/util";
import { BoundingRect, Bound } from "../View/boundingRect";
import { anchorSet } from "../Model/linkModel";
import { BaseShapeOption } from "../option";
import { Element } from "../Model/element";
import { OffScreen } from "../View/offscreen";

 
export interface BaseOption {
    // 文本内容（字段名）
    content: string | string[];
    // 图形尺寸
    size: [number, number] | number;
    // 绘制层级
    zIndex: number;
    // 出场动画
    show: string | [string, string];
    // 其余属性（免得每次新增属性都要声明一个新的子interface）
    [key: string]: any;
}


export interface Style {
    // 填充颜色
    fill: string;
    // 图形文本
    text: string;
    // 文本颜色
    textFill: string;
    // 字体大小
    fontSize: number;
    // 字重
    fontWeight: number;
    // 描边样式
    stroke: string;
    // 透明度
    opacity: number;
    // 线宽
    lineWidth: number;
    // 其余属性（免得每次新增属性都要声明一个新的子interface）
    [key: string]: any;
}



/**
 * 图形挂载状态
 */
export enum mountState {
    // 需挂载
    NEEDMOUNT,
    // 已挂载
    MOUNTED,
    // 需卸载
    NEEDUNMOUNT,
    // 已卸载
    UNMOUNTED,
};


export class Shape {
    // id
    id: string = '';
    // 类型为普通图形
    type = 'shape';
    // 名称
    name: string = null;
    // zrender图形
    zrenderShape = null;

    // ---------------- 可变属性 -----------

    // 横坐标
    x: number = 0;
    // 纵坐标
    y: number = 0;
    // 可见性
    visible: boolean = false;
    // 旋转
    rotation: number = 0;
    // 宽高
    width: number = 0;
    height: number = 0;
    // 样式
    style: Style = null;
    // 是否可拖拽
    draggable: boolean = false;

    prevX: number = 0;
    prevY: number = 0;
    prevVisible: boolean = false;
    prevRotation: number = 0;
    prevWidth: number = 0;
    prevHeight: number = 0;
    prevStyle: Style = null;

    // ------------------------------------
    // 基础样式
    baseStyle: Style = {
        fill: '#000',
        text: '',
        textFill: '#000',
        fontSize: 15,
        fontWeight: null,
        stroke: null,
        opacity: 1,
        lineWidth: 1,
        transformText: true
    };
    // 图形配置项
    option: BaseOption = {
        content: null,
        size: [0, 0],
        zIndex: 1,
        show: 'scale'
    };
    // 渲染器实例
    renderer: Renderer = null;
    // 父图形（通常指代复合图形Composite）
    parentShape: Shape = null;
    // 是否访问过（用于differ）
    visited: boolean = false;
    // 是否为脏（即被修改过，需要更新）
    isDirty: boolean = false;
    // 挂载状态（默认为需挂载NEEDMOINT）
    mountState: number = mountState.NEEDMOUNT;
    // 关联的 element
    element: Element = null;
    
    // 动画表
    animationsTable: { [key: string]: string } = {
        position: 'position',
        translate: 'translate',
        rotation: 'rotation',
        show: 'scale',
        hide: 'scale',
        size: 'size',
        style: 'style'
    };

    constructor(id: string, name: string, opt: BaseShapeOption) {
        this.id = id;
        this.name = name;
        this.option = this.defaultOption(this.option);
        this.style = this.defaultStyle(this.baseStyle);
        this.prevStyle = this.defaultStyle(this.baseStyle);

        this.applyShapeOption(opt);
    };

    /**
     * 定义默认配置项
     */
    defaultOption(baseOption: BaseOption): BaseOption {
        return baseOption;
    }

    /**
     * 定义默认样式
     */
    defaultStyle(baseStyle: Style): Style {
        return { ...baseStyle };
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
    getBaseAnchors(): anchorSet {
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
    defaultAnchors(baseAnchors: anchorSet, width: number, height: number): anchorSet {
        return baseAnchors;
    }

    /**
     * 重置所有可变属性
     */
    restoreData() {
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
    applyShapeOption(opt: Partial<BaseShapeOption>) {
        Util.merge(this.option, opt);
        Util.merge(this.style, opt.style);

        if(opt.size) {
            if(Array.isArray(opt.size)) {
                this.width = opt.size[0];
                this.height = opt.size[1];
            }
            else {
                this.width = this.height = opt.size;
            }
        }

        if(this.name === 'circle' || this.name === 'isogon') {
            this.height = this.width;
        }

        if(opt.show) {
            // 若show字段是个数组，则将第一个值设为show动画，第二个值设为hide动画
            if(Array.isArray(opt.show)) {
                this.animationsTable['show'] = opt.show[0];
                this.animationsTable['hide'] = opt.show[1];
            }
            // 若只是一个字符串，则show，hide用同样的动画
            else {
                this.animationsTable['show'] = opt.show;
                this.animationsTable['hide'] = opt.show;
            }
        }

        this.style.text = this.option.content as string;
    }

    /**
     * 获取图形包围盒
     * @param transformed
     */
    getBound(transformed: boolean = true): BoundingRect {
        return this.renderer.getOffScreen().getShapeBound(this.id, transformed);
    }

    /**
     * 当修改图形尺寸后需要对图形坐标进行修正
     * @param type
     */
    updateSize(type?: number) { }

    /**
     * 更新zrender图形
     * @param name 
     * @param opt
     */
    updateZrenderShape(name: string, opt?: { type?: number, fn?: Function }) {
        if(this.zrenderShape === null) return;

        let props = this.renderer.getAnimationProps(this, this.animationsTable[name]);

        if(opt === undefined) {
            opt = {
                type: undefined,
                fn: () => {}
            };
        }
 
        // 保存回调函数
        if(opt.fn) props['callback'] = opt.fn;

        // 对 composite 和 polyline 修正origin
        if(this.type === 'composite' || this.name === 'polyLine') {
            let bound = this.zrenderShape.getBoundingRect(),
                origin = [bound.x + bound.width / 2, bound.y + bound.height / 2];

            this.zrenderShape.attr('origin', origin);
            this.renderer.getOffScreen().update(this.id, 'origin', origin);
        }

        this.renderer.setAttribute(this, props, opt.type);
    }

    /**
     * 创建zrender图形
     */
    createZrenderShape(): zrenderShape {};
};















