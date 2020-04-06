import { ViewModel } from "./View/viewModel";
import { Util } from "./Common/util";
import { DataModel, ElementContainer } from "./Model/dataModel";
import { LayoutOption, AnimationOption, EngineOption, ElementsOption } from "./option";
import { Sources, SourceElement } from "./sources";
import { Shape, Style } from "./Shapes/shape";
import { Element } from "./Model/element";
import { Group } from "./Model/group";
import { anchor } from "./Model/linkModel";
import { SourcesProxy } from "./Model/sourcesProxy";



/**
 * 注册一个可视化引擎所需的信息
 */
export interface EngineInfo {
    // 引擎名称
    name: string;
    // 元素构造器
    element?: { new(...arg): Element } | { [key: string]: { new(...arg): Element } };
    // 私有图形构造器
    shape?: { [key: string]: { new(...arg): Shape } };
    // 默认配置项
    defaultOption: EngineOption;
}



export class Engine<S extends Sources = Sources, P extends EngineOption = EngineOption> {
    // 引擎id
    private id: string;
    // 引擎名称
    public name: string = 'framework';
    // 序列化的源数据
    private stringifySources: string = null;
    // 数据模型控制器
    private dataModel: DataModel = null;
    // 视图模型控制器
    private viewModel: ViewModel = null;
    // 源数据代理器
    private sourcesProxy: SourcesProxy = null;

    // Element构造函数容器，用作存放该引擎扩展的Element
    ElementsTable: { [key: string]: { new(sourceElement: SourceElement): Element } } = {};
    // 图形配置项
    elementsOption: ElementsOption;
    // 布局配置项
    layoutOption: LayoutOption;
    // 动画配置项
    animationOption: AnimationOption = {
        enableSkip: true,
        enableAnimation: true,
        timingFunction: 'quinticOut',
        duration: 1000
    };

    // 是否正在执行视图更新
    isViewUpdatingFlag: boolean = false;
    // 代理过的源数据
    proxySources: S = null;

    // Shape构造函数容器，用作存放扩展的Shape（基本上为Composite）

    // 使用registerShape函数注册的图形将被存放在此处，任何子Engine都可访问到这些图形（全局）
    static ShapesTable: {[key: string]: { new(id: string, name: string, opt: any): Shape }} = {};
    // 使用Engine的构造函数注册的图形将被存放在此处，只有注册该图形的Engine可访问到这些图形（私有）
    scopedShapesTable: {[key: string]: { new(id: string, name: string, opt: any): Shape }} = {};

    // 交互插件（TODO）
    // interactions: Interaction[] = null;

    constructor(container: HTMLElement, engineInfo: EngineInfo) {
        Util.assert(!container, 'HTML元素不存在');

        this.id = Util.generateId();
        this.name = engineInfo.name;
        
        this.elementsOption = engineInfo.defaultOption.element;
        this.layoutOption = engineInfo.defaultOption.layout as LayoutOption;
        Util.merge(this.animationOption, engineInfo.defaultOption.animation);

        // 若有自定义Element，注册
        if(engineInfo.element) {   
            // 只有一种元素
            if(typeof engineInfo.element === 'function') {
                engineInfo.element = {
                    element: engineInfo.element
                };
            }

            this.ElementsTable = engineInfo.element;
        }

        // 若有私有自定义图形，注册
        if(engineInfo.shape) {
            Object.keys(engineInfo.shape).map(name => {
                this.scopedShapesTable[name] = engineInfo.shape[name];
            });
        }

        this.viewModel = new ViewModel(this, container);
        this.dataModel = new DataModel(this, this.viewModel);
        this.sourcesProxy = new SourcesProxy(this);
    }

    /**
     * 重置数据
     * @param sources
     * @param stringifySources
     */
    private reset(stringifySources: string) {
        this.dataModel.resetData();
        this.viewModel.resetData();

        this.stringifySources = stringifySources;
    }

    /**
     * 输入源数据
     * （可视化主流程）
     * @param sources 
     * @param proxySources
     */
    public source(sources: S, proxySources: boolean = false): void | S {
        // 如果正在执行视图更新，则取消该次动作（避免用户频繁点击）
        if(!this.animationOption.enableSkip && this.isViewUpdatingFlag) {
            return;
        }
        // 若不输入源数据而且之前也没有输入过源数据，则什么也不干
        if(sources === undefined) {
            return;
        }

        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        let stringifySources = JSON.stringify(sources);
        if(stringifySources === this.stringifySources) return;

        // ------------------- 可视化主流程 ---------------------

        // 建立元素间逻辑关系
        this.dataModel.constructElements(sources);
        // 根据逻辑关系将元素绑定图形
        this.dataModel.bindShapes();
        // 根据逻辑关系布局元素
        this.viewModel.layoutElements(this.dataModel.getElements(), this.render.bind(this));
        // 根据绑定更新图形
        this.dataModel.emitShapes();
        // 根据图形渲染视图
        this.viewModel.renderShapes();

        // ---------------------------------------------------

        // 重置数据
        this.reset(stringifySources);

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
     */
    public applyOption(opt: P) {
        if(!opt || Object.keys(opt).length === 0) return;

        Util.merge(this.animationOption, opt['animation']);
        Util.merge(this.elementsOption, opt['element']);
        Util.extends(this.layoutOption, opt['layout']);
    }

    /**
     * 清空引擎
     */
    public clear() {
        this.dataModel.resetData();
        this.viewModel.resetData();
        this.viewModel.clearShape();

        this.stringifySources = null;
        if(this.proxySources) {
            this.sourcesProxy.revoke(this.proxySources);
            this.proxySources = null;
        }
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
    public resize() {
        this.viewModel.renderer.resizeGlobalShape(this.layoutOption.translate, this.layoutOption.scale);
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











