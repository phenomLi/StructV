import { Renderer, zrenderShape } from "../View/renderer";
import { Util } from "../Common/util";
import { BoundingRect, Bound } from "../View/boundingRect";
 


export class Style {
    fill?: string = '#000';
    text?: string = '';
    textFill?: string = '#000';
    fontSize?: number = 15;
    fontWeight?: number = null;
    stroke?: string = null;
    opacity?: number = 1;
    lineWidth?: number = 1;
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
    // 样式
    style: Style = new Style();

    prevX: number = 0;
    prevY: number = 0;
    prevVisible: boolean = false;
    prevRotation: number = 0;
    prevStyle: Style = null;

    // ------------------------------------
    // 图形配置项
    option = {
        // 文本内容（字段名）
        content: null,
        // 图形尺寸
        size: [0, 0],
        // 绘制层级
        zIndex: 1,
        // 出场动画
        show: 'scale'
    };

    // 宽高
    width: number = 0;
    height: number = 0;
    // 元素
    element: Element = null;
    // 渲染器实例
    renderer: Renderer = null;
    // 父图形（通常指代复合图形Composite）
    parentShape: Shape = null;
    // 是否访问过（用于differ）
    visited: boolean = false;
    // 挂载状态（默认为需挂载NEEDMOINT）
    mountState: number = mountState.NEEDMOUNT;
    

    // 动画表
    animationsTable: { [key: string]: string } = {
        position: 'translate',
        rotation: 'rotation',
        show: 'scale',
        hide: 'scale',
        style: 'style'
    };

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    };

    /**
     * 重置所有可变属性
     */
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
        this.style = new Style();
    }

    /**
     * 应用元素配置项（尺寸，样式等）
     * @param style 
     */
    applyShapeOption(opt) {
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
            this.width = this.height;
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

        this.style.text = this.option.content;
    }

    /**
     * 获取图形包围盒
     */
    getBound(): BoundingRect {
        // 若已经有zrender图形，直接返回zrender图形的包围盒
        if(this.zrenderShape) {
            let {width, height} = this.zrenderShape.getBoundingRect();

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

        if(this.rotation) {
            return Bound.rotation(originBound, this.rotation);
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
    updateZrenderShape(name: string, animation: boolean = false, fn?: Function) {
        if(this.zrenderShape === null) return;

        let prop =  this.renderer.animations[this.animationsTable[name]](this);

        // 保存回调函数
        if(fn) prop['callback'] = fn;

        // 复合图形修改属性/进行动画前要先修正origin
        if(this.type === 'composite' || this.name === 'polyLine') {
            let bound = this.getBound();
            this.zrenderShape.attr('origin', [bound.x + bound.width / 2, bound.y + bound.height / 2]);
        }

        this.renderer.setAttribute(this.zrenderShape, prop, animation);
    }

    /**
     * 创建zrender图形
     */
    createZrenderShape(): zrenderShape {};
};















