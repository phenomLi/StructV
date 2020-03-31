"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const viewModel_1 = require("./View/viewModel");
const util_1 = require("./Common/util");
const dataModel_1 = require("./Model/dataModel");
const group_1 = require("./Model/group");
const sourcesProxy_1 = require("./Model/sourcesProxy");
class Engine {
    // 交互插件（TODO）
    // interactions: Interaction[] = null;
    constructor(container, engineInfo) {
        // 引擎名称
        this.name = 'framework';
        // 序列化的源数据
        this.stringifySources = null;
        // 数据模型控制器
        this.dataModel = null;
        // 视图模型控制器
        this.viewModel = null;
        // 源数据代理器
        this.sourcesProxy = null;
        // Element构造函数容器，用作存放该引擎扩展的Element
        this.ElementsTable = {};
        // 动画配置项
        this.animationOption = {
            enableSkip: true,
            enableAnimation: true,
            timingFunction: 'quinticOut',
            duration: 1000
        };
        // 是否正在执行视图更新
        this.isViewUpdatingFlag = false;
        // 代理过的源数据
        this.proxySources = null;
        // 使用Engine的构造函数注册的图形将被存放在此处，只有注册该图形的Engine可访问到这些图形（私有）
        this.scopedShapesTable = {};
        util_1.Util.assert(!container, 'HTML元素不存在');
        this.id = util_1.Util.generateId();
        this.name = engineInfo.name;
        this.elementsOption = engineInfo.defaultOption.element;
        this.layoutOption = engineInfo.defaultOption.layout;
        util_1.Util.merge(this.animationOption, engineInfo.defaultOption.animation);
        // 若有自定义Element，注册
        if (engineInfo.element) {
            // 只有一种元素
            if (typeof engineInfo.element === 'function') {
                engineInfo.element = {
                    element: engineInfo.element
                };
            }
            this.ElementsTable = engineInfo.element;
        }
        // 若有私有自定义图形，注册
        if (engineInfo.shape) {
            Object.keys(engineInfo.shape).map(name => {
                this.scopedShapesTable[name] = engineInfo.shape[name];
            });
        }
        this.viewModel = new viewModel_1.ViewModel(this, container);
        this.dataModel = new dataModel_1.DataModel(this, this.viewModel);
        this.sourcesProxy = new sourcesProxy_1.SourcesProxy(this);
    }
    /**
     * 输入源数据
     * （可视化主流程）
     * @param sources
     * @param proxySources
     */
    source(sources, proxySources = false) {
        // 如果正在执行视图更新，则取消该次动作（避免用户频繁点击）
        if (!this.animationOption.enableSkip && this.isViewUpdatingFlag) {
            return;
        }
        // 若不输入源数据而且之前也没有输入过源数据，则什么也不干
        if (sources === undefined) {
            return;
        }
        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        let stringifySources = JSON.stringify(sources);
        if (stringifySources === this.stringifySources)
            return;
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
        if (proxySources === false && this.proxySources) {
            this.sourcesProxy.revoke(this.proxySources);
        }
        // 若开启源数据代理，进行源数据代理
        if (proxySources && sources !== this.proxySources) {
            this.proxySources = this.sourcesProxy.proxy(sources);
            return this.proxySources;
        }
    }
    /**
     * 应用配置项
     * @param opt
     */
    applyOption(opt) {
        if (!opt || Object.keys(opt).length === 0)
            return;
        util_1.Util.merge(this.animationOption, opt['animation']);
        util_1.Util.merge(this.elementsOption, opt['element']);
        util_1.Util.extends(this.layoutOption, opt['layout']);
    }
    /**
     * 清空引擎
     */
    clear() {
        this.dataModel.resetData();
        this.viewModel.resetData();
        this.viewModel.clearShape();
        this.stringifySources = null;
        if (this.proxySources) {
            this.sourcesProxy.revoke(this.proxySources);
            this.proxySources = null;
        }
    }
    /**
     * 获取引擎id
     */
    getId() {
        return this.id;
    }
    /**
     * 获取引擎名称
     */
    getName() {
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
    link(emitElement, targetElement, linkName, anchorPair = null) {
        this.dataModel.addLink(emitElement, targetElement, linkName, anchorPair);
    }
    /**
     * 动态添加一个外部指针
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的外部指针
     * @param targetElement
     * @param referName
     * @param referValue
     */
    refer(targetElement, referName, referValue) {
        this.dataModel.addPointer(targetElement, referName, referValue);
    }
    /**
     * 创建一个静态文本
     * @param content
     * @param style
     */
    text(content, style) {
        return this.viewModel.createShape('staticText#' + this.viewModel.staticTextId++, 'text', {
            content,
            style,
        });
    }
    /**
     * 创建一个元素组
     */
    group(...arg) {
        return new group_1.Group(...arg);
    }
    isViewUpdating(isViewUpdatingFlag) {
        if (isViewUpdatingFlag !== undefined && typeof isViewUpdatingFlag === 'boolean') {
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
    reset(stringifySources) {
        this.dataModel.resetData();
        this.viewModel.resetData();
        this.stringifySources = stringifySources;
    }
    // ------------------------------------需继承重写的方法------------------------------------ //
    /**
     * 渲染数据结构方法
     */
    render(elements, containerWidth, containerHeight) { }
    /**
     * 视图更新前
     */
    beforeUpdate() { }
    /**
     * 视图更新后
     * @param patchList
     */
    afterUpdate() { }
}
// Shape构造函数容器，用作存放扩展的Shape（基本上为Composite）
// 使用registerShape函数注册的图形将被存放在此处，任何子Engine都可访问到这些图形（全局）
Engine.ShapesTable = {};
exports.Engine = Engine;
/**
 * 注册一个或多个图形
 */
function RegisterShape(target, shapeName) {
    Engine.ShapesTable[shapeName] = target;
    target.prototype.name = shapeName;
}
exports.RegisterShape = RegisterShape;
