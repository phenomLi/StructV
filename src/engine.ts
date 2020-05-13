import { ViewModel } from "./View/viewModel";
import { Util } from "./Common/util";
import { DataModel, ElementContainer } from "./Model/dataModel";
import { ViewOption, EngineOption, InteractOption, StructOption, DefaultLinkOption, DefaultPointerOption } from "./option";
import { Sources, SourceElement } from "./sources";
import { Shape, Style } from "./Shapes/shape";
import { Element } from "./Model/element";
import { Group } from "./Model/group";
import { anchor } from "./Model/linkModel";
import { SourcesProxy } from "./Model/sourcesProxy";
import { InteractionModel } from "./Interaction/interactionModel";
import { Renderer } from "./View/renderer";



// 注册一个可视化引擎所需的信息
export interface EngineInfo {
    // 引擎名称
    name: string;
    // 默认配置项
    defaultOption: EngineOption;
}

// 进行容器尺寸调整时的配置项
export interface ResizeOption {
    width?: number | 'auto';
    height?: number | 'auto';
}


export class Engine {
    // 引擎id
    private id: string;
    // 引擎名称
    public name: string = 'engine';
    // 当前保存的源数据
    private sources: Sources = null;
    // 序列化的源数据
    private stringifySources: string = null;
    // 数据模型控制器
    private dataModel: DataModel = null;
    // 视图模型控制器
    private viewModel: ViewModel = null;
    // 交互模型
    private interactionModel: InteractionModel = null;
    // 源数据代理器
    private sourcesProxy: SourcesProxy = null;
    // 上一次输入的序列化之后的配置项
    private lastStringifyOptions: string = null;
    // 用户的默认配置项
    private defaultOption: EngineOption = null;

    // 结构配置项
    structOption: StructOption = {
        element: Element,
        link: [],
        pointer: []
    };

    // 外观配置项
    viewOption: ViewOption = {
        element: { },
        link: { },
        pointer: { },
        layout: { },
        // 动画配置项
        animation: {
            enableSkip: true,
            enableAnimation: true,
            timingFunction: 'quinticOut',
            duration: 1000
        },
        position: 'auto',
        scale: 'auto'
    };

    // 交互配置项
    interactOption: InteractOption = {
        zoomView: true,
        moveView: false,
        drag: false,
        focus: false,
        frameSelect: false,
    };

    // 代理过的源数据
    proxySources: Sources = null;

    // Shape构造函数容器，用作存放扩展的Shape（基本上为Composite）
    // 使用registerShape函数注册的图形将被存放在此处，任何子Engine都可访问到这些图形（全局）
    static ShapesTable: {[key: string]: { new(id: string, name: string, opt: any): Shape }} = {};

    constructor(container: HTMLElement, engineInfo: EngineInfo) {
        Util.assert(!container, 'HTML元素不存在');

        this.id = Util.generateId();
        this.name = engineInfo.name;

        this.viewModel = new ViewModel(this, container);
        this.dataModel = new DataModel(this, this.viewModel);
        this.interactionModel = new InteractionModel(this);
        this.sourcesProxy = new SourcesProxy(this);
        this.defaultOption = engineInfo.defaultOption;

        // 根据结构配置项初始化视图配置项的结构
        this.initViewOption(engineInfo.defaultOption.struct);
        // 应用默认配置
        this.applyOptions(engineInfo.defaultOption, false);
    }

    /**
     * 重置数据
     */
    private reset() {
        this.dataModel.resetData();
        this.viewModel.resetData();
    }

    /**
     * 初始化视图配置项
     * @param structOption 
     */
    private initViewOption(structOption: StructOption) {
        if(structOption.element && typeof structOption.element === 'object') {
            this.viewOption.element = {};
            Object.keys(structOption.element).forEach(key => {
                this.viewOption.element[key] = {};
            })
        }

        // 初始化 struct 配置项声明的连线字段的默认配置项
        if(structOption.link && Array.isArray(structOption.link)) {
            structOption.link.forEach(key => {
                this.viewOption.link[key] = new DefaultLinkOption();
            });
        }

        // 初始化 struct 配置项声明的指针字段的默认配置项
        if(structOption.pointer && Array.isArray(structOption.pointer)) {
            structOption.pointer.forEach(key => {
                this.viewOption.pointer[key] = new DefaultPointerOption();
            });
        }
    }

    /**
     * 整个可视化引擎的更新（发生结构改变，更新整个引擎）
     * @param sources 
     */
    private updateEngine(sources: Sources) {
        // 重置数据
        this.reset();

        // 建立元素间逻辑关系
        this.dataModel.constructElements(sources);
        // 根据逻辑关系布局元素
        this.dataModel.layoutElements(
            this.render.bind(this), 
            this.viewModel.renderer.getContainerWidth(),
            this.viewModel.renderer.getContainerHeight()
        );
        // 绘制元素，连线和指针
        this.dataModel.drawComponents();
        // 根据绑定更新图形
        this.dataModel.updateShapes();
        // 对图形进行调和
        this.viewModel.reconciliation();
        // 根据图形渲染视图
        this.viewModel.renderShapes();
    }

    /**
     * 可视化布局的更新（不发生结构改变，仅更新布局）
     */
    public updateLayout() {
        // 根据逻辑关系布局元素
        this.dataModel.layoutElements(
            this.render.bind(this), 
            this.viewModel.renderer.getContainerWidth(),
            this.viewModel.renderer.getContainerHeight()
        );
        // 绘制元素，连线和指针
        this.dataModel.drawComponents();
        // 根据绑定更新图形
        this.dataModel.updateShapes();
        // 对图形进行调和
        this.viewModel.reconciliation(true);
        // 根据图形渲染视图
        this.viewModel.renderShapes();
    }

    /**
     * 可视化视图的更新（不发生结构改变，不重新布局，仅更新连线，指针和 element）
     */
    public updateView() {
        // 绘制元素，连线和指针
        this.dataModel.drawComponents();
        // 根据绑定更新图形
        this.dataModel.updateShapes();
        // 对图形进行调和
        this.viewModel.reconciliation(true);
        // 根据图形渲染视图
        this.viewModel.renderShapes();
    }

    /**
     * 若干个 element 的更新（不发生结构改变，不重新布局，不改变连线和指针，仅更新某些 element）
     * @param elements 
     * @param enableAnimation 
     */
    public updateElement(elements?: Element[], enableAnimation?: boolean) {
        if(enableAnimation === undefined) {
            enableAnimation = this.viewOption.animation.enableAnimation;
        }

        if(elements === undefined) {
            elements = this.dataModel.getElementList();
        }

        let defaultAnimation: boolean = this.viewOption.animation.enableAnimation;

        this.viewOption.animation.enableAnimation = enableAnimation;

        // 根据绑定更新图形
        this.dataModel.updateShapes(elements);
        // 对被修改的 shape 进行 differ 和 patch
        this.viewModel.reconciliation(true);
        // 更新 zrender 图形实例
        this.viewModel.renderShapes(true);

        this.viewOption.animation.enableAnimation = defaultAnimation;
    }

    /**
     * 输入源数据
     * （可视化主流程）
     * @param sources 
     * @param proxySources
     */
    public source(sources?: Sources, proxySources: boolean = false): void | Sources {
        // 如果正在执行视图更新，则取消该次动作（避免用户频繁点击）
        if(!this.viewOption.animation.enableSkip && this.viewModel.isViewUpdating) {
            return;
        }
        // 若不输入源数据而且之前也没有输入过源数据，则什么也不干
        if(sources === undefined) {
            return;
        }

        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        let stringifySources = JSON.stringify(sources);
        if(stringifySources === this.stringifySources) return;
        this.sources = sources;
        this.stringifySources = stringifySources;

        // ------------------- 可视化主流程 ---------------------

        this.updateEngine(sources);

        // ---------------------------------------------------

        // 若关闭源数据代理且之前代理过的，则取消上次代理
        if(proxySources === false && this.proxySources) {
            this.sourcesProxy.revoke(this.proxySources);
        }

        // 若开启源数据代理，进行源数据代理
        if(proxySources && sources !== this.proxySources) {
            this.proxySources = this.sourcesProxy.proxy(sources);
            return this.proxySources;
        }
    }

    /**
     * 应用配置项
     * @param opt 
     * @param updateView
     */
    public applyOptions(opt: EngineOption, updateView: boolean = true) {
        // 配置项为 null 或为空对象不执行更新
        if(!opt || Object.keys(opt).length === 0) return;

        let lastStringifyOptions = JSON.stringify(opt);
        // 若这次的配置项和上一次的配置项一样，不执行更新
        if(this.lastStringifyOptions && this.lastStringifyOptions === lastStringifyOptions) {
            return;
        }

        this.lastStringifyOptions = lastStringifyOptions;

        // 覆盖结构配置
        if(opt.struct) {
            Util.extends(this.structOption, opt.struct);
        }

        // 覆盖视图配置
        if(opt.view) {
            Object.keys(opt.view).forEach(key => {
                if(Array.isArray(this.viewOption[key]) || typeof this.viewOption[key] !== 'object') {
                    this.viewOption[key] = opt.view[key];
                }
                else {
                    Util.extends(this.viewOption[key], opt.view[key]);
                }
            });
        }

        // 覆盖交互配置
        if(opt.interact) {
            Object.keys(opt.interact).forEach(key => {
                this.interactOption[key] = opt.interact[key];
            });

            // 根据配置应用交互模块
            this.interactionModel.applyInteractions(this.interactOption);
        }

        // 第一次初始化时( updateView 为 false )不更新视图
        if(updateView === false) {
            return;
        }

        // 修改配置后，更新一次视图
        // 若新配置项更新了可视化结构，则更新整个引擎
        if(opt.struct) {
            this.updateEngine(this.sources);
            return;
        }

        // 否则进行视图更新
        if(opt.view) {
            if(opt.view.layout) {
                this.updateLayout();
                return;
            }

            if(opt.view.element || opt.view.link || opt.view.pointer) {
                this.updateView();
                return;
            }
            
            return;
        }
    }

    /**
     * 清空引擎
     */
    public clear() {
        this.dataModel.resetData();
        this.viewModel.resetData();
        this.viewModel.clearShapes();

        this.stringifySources = null;
        if(this.proxySources) {
            this.sourcesProxy.revoke(this.proxySources);
            this.proxySources = null;
        }
    }

    /**
     * 获取渲染器
     */
    public getRenderer(): Renderer {
        return this.viewModel.renderer;
    }

    /**
     * 获取 dataModel 的 element 队列
     */
    public getElementList(): Element[] {
        return this.dataModel.getElementList();
    }

    /**
     * 获取引擎id
     */
    public getId(): string {
        return this.id;
    }   

    /**
     * 获取引擎名称
     */
    public getName(): string {
        return this.name;
    }

    /**
     * 获取默认配置项
     */
    public getDefaultOption(): EngineOption {
        return this.defaultOption;
    }

    /**
     * 是否正在进行视图更新
     */
    public isViewUpdating(): boolean {
        return this.viewModel.isViewUpdating;
    }

    /**
     * 动态添加一个连接信息
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的连接
     * @param emitElement
     * @param targetElement 
     * @param linkName 
     * @param anchorPair 
     */
    public link(emitElement: Element, targetElement: Element, linkName: string, anchorPair: [anchor, anchor] = null) {
        this.dataModel.addLink(emitElement, targetElement, linkName, anchorPair);
    }

    /**
     * 动态添加一个外部指针
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的外部指针
     * @param targetElement 
     * @param referName 
     * @param referValue 
     */
    public refer(targetElement: Element, referName: string, referValue: string) {
        this.dataModel.addPointer(targetElement, referName, referValue);
    }

    /**
     * 创建一个静态文本
     * @param content 
     * @param style 
     */
    public text(content: string, style?: Style): Shape {
        return this.viewModel.createShape(
            'staticText#' + this.viewModel.staticTextId++,
            'text',
            {   
                content,
                style,
            }
        );
    }

    /**
     * 创建一个元素组
     */
    public group(...arg: Element[]): Group {
        return new Group(...arg);
    }
    
    /**
     * 自动适应视图
     */
    public resize(option?: ResizeOption) {
        if(option === undefined) {
            option = { width: 'auto', height: 'auto' };
        }
        else {
            option.width = option.width || 'auto';
            option.height = option.height || 'auto';
        }

        this.viewModel.renderer.resizeGlobalShape(option, this.viewOption.position, this.viewOption.scale);
    }


    // ------------------------------------需继承重写的方法------------------------------------ //

    /**
     * 渲染数据结构方法
     */
    protected render(elements: ElementContainer | Element[], containerWidth: number, containerHeight: number) {}

    /**
     * 视图更新前
     */
    beforeUpdate() {}

    /**
     * 视图更新后
     * @param patchList 
     */
    afterUpdate() {}
}




/**
 * 注册一个或多个图形
 */
export function RegisterShape(target: { new(...arg): Shape }, shapeName: string) {
    Engine.ShapesTable[shapeName] = target;
    target.prototype.name = shapeName;
}











