import { ViewModel } from "./View/viewModel";
import { Util } from "./Common/util";
import { DataModel, ElementContainer } from "./Model/dataModel";
import { LayoutOption, AnimationOption, EngineOption, ElementsOption } from "./option";
import { Sources } from "./sources";
import { Shape, Style } from "./Shapes/shape";
import { Element } from "./Model/element";
import { Group } from "./Model/group";



/**
 * 注册一个可视化引擎所需的信息
 */
export interface EngineInfo {
    // 引擎名称
    name: string;
    // 元素构造器
    element?: { new(...arg): Element } | { [key: string]: { new(...arg): Element } };
    // 默认配置项
    defaultOption: EngineOption;
}



export class Engine<S extends Sources = Sources, P extends EngineOption = EngineOption> {
    // 引擎id
    private id: string;
    // 引擎名称
    public name: string = 'framework';
    // 源数据集
    private sources: S = null;
    // 序列化的源数据
    private stringifySources: string = null;
    // 数据模型控制器
    private dataModel: DataModel = null;
    // 视图模型控制器
    private viewModel: ViewModel = null;

    // Element构造函数容器，用作存放该引擎扩展的Element
    ElementsTable: { [key: string]: { new(): Element } } = {};
    // 源数据字段
    sourcesField: { [key: string]: string[] } = null;
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
    public isViewUpdatingFlag: boolean = false;

    // Shape构造函数容器，用作存放扩展的Shape（基本上为Composite）
    static ShapesTable: {[key: string]: {
        constructor: { new(id: string, name: string, opt: any): Shape },
        scope: string
    } } = {};

    // 交互插件（TODO）
    // interactions: Interaction[] = null;

    constructor(container: HTMLElement, engineInfo: EngineInfo) {
        Util.assert(!container, 'HTML元素不存在');

        this.id = Util.generateId();
        this.name = engineInfo.name;
        
        this.elementsOption = engineInfo.defaultOption.element;
        this.layoutOption = engineInfo.defaultOption.layout as LayoutOption;
        Util.merge(this.animationOption, engineInfo.defaultOption.animation);

        if(engineInfo.element) {   
            // 只有一种元素
            if(typeof engineInfo.element === 'function') {
                engineInfo.element = {
                    element: engineInfo.element
                };
            }

            this.ElementsTable = engineInfo.element;
        }

        this.viewModel = new ViewModel(this, container);
        this.dataModel = new DataModel(this, this.viewModel);
    }

    /**
     * 输入源数据
     * （可视化主流程）
     * @param sources 
     * @param callback
     */
    public source(sources: S, callback?: ((elements: ElementContainer) => void)) {
        // 如果正在执行视图更新，则取消该次动作（避免用户频繁点击）
        if(!this.animationOption.enableSkip && this.isViewUpdatingFlag) {
            return;
        }
        // 若不输入源数据而且之前也没有输入过源数据，则什么也不干
        if(sources === undefined && this.sources === null) {
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
        this.reset(sources, stringifySources);

        // 执行回调
        callback && typeof callback === 'function' && callback(this.dataModel.getElements());
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

        this.sources = null;
        this.stringifySources = null;
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


    public isViewUpdating(isViewUpdatingFlag?: boolean): boolean {
        if(isViewUpdatingFlag !== undefined && typeof isViewUpdatingFlag === 'boolean') {
            this.isViewUpdatingFlag = isViewUpdatingFlag;
        }
        else {
            return this.isViewUpdatingFlag;
        }   
    }

    /**
     * 重置数据
     * @param sources
     * @param stringifySources
     */
    private reset(sources: S, stringifySources: string) {
        this.dataModel.resetData();
        this.viewModel.resetData();

        this.sources = sources;
        this.stringifySources = stringifySources;
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
export function RegisterShape(target: { new(...arg): Shape } | { new(...arg): Shape }[], scope: string = null) {
    if(Array.isArray(target)) {
        target.map(item => RegisterShape(item));
    }
    else {
        let className = Util.getClassName(target),
        shapeName = className[0].toLocaleLowerCase() + className.substring(1);

        Engine.ShapesTable[shapeName] = {
            constructor: target,
            scope
        };
        target.prototype.name = shapeName;
    }
}











