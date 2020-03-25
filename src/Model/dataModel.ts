import { Element } from "./element";
import { Engine } from "../engine";
import { Shape } from "../Shapes/shape";
import { ViewModel } from "../View/viewModel";
import { SourceElement, Sources } from "../sources";
import { Util } from "../Common/util";
import { LinkModel, anchor } from "./linkModel";
import { PointerModel } from "./pointerModel";



// 元素集类型
export type ElementContainer = { [key: string]: Element[] };


type bindingInfo = {
    element: Element | Element[],
    shape: Shape | Shape[],
    param?: any,
    bindFn: (element: Element | Element[], shapes: Shape | Shape[], param?: any) => void
};

// 数据模型管理器
export class DataModel {
    // 视图模型管理器
    private viewModel: ViewModel;
    // 连接处理类
    private linkModel: LinkModel;
    // 指针处理类
    private pointerModel: PointerModel;
    // 图形绑定队列
    private bindingInfos: bindingInfo[] = [];
    // 元素队列
    private elementList: Element[] = [];
    // 元素容器，即源数据经element包装后的结构
    private elementContainer: ElementContainer = {};

    constructor(private engine: Engine, viewModel: ViewModel) {
        this.engine = engine;
        this.viewModel = viewModel;

        this.linkModel = new LinkModel(this, viewModel, this.engine.layoutOption);
        this.pointerModel = new PointerModel(this, viewModel, this.engine.layoutOption);
    }

    /**
     * 从源数据构建element集
     * 主要工作：
     * - 遍历源数据，将每个SourceElement转化为Element
     * - 处理连接
     * - 处理指针
     * @param sources 
     */
    constructElements(sources: Sources) { 
        if(Array.isArray(sources)) {
            this.elementContainer['element'] = sources.map(item => {
                return this.createElement(item, 'element');
            });
        }
        else {
            Object.keys(sources).map(prop => {
                this.elementContainer[prop] = sources[prop].map(item => {
                    return this.createElement(item, prop);
                });
            });
        }

        // 构建连接模型
        this.linkModel.constructLinks(this.elementContainer, this.elementList);
    
        // 构建指针模型
        this.pointerModel.constructPointers(this.elementList);
        
        //console.log(this.elementContainer);
    }

    /**
     * 根据sources结构，将element绑定shape
     */
    bindShapes() {
        Object.keys(this.elementContainer).map(prop => {
            this.elementContainer[prop].map(ele => {
                // 元素绑定对应图形
                this.bind(ele, ele.shape, (ele, shape) => {
                    if(!ele.updateShape(shape)) {
                        shape.x = ele.x;
                        shape.y = ele.y;
                        shape.width = ele.width;
                        shape.height = ele.height;
                        shape.rotation = ele.rotation;
                    }
                });
            });
        });
    }

    /**
     * 响应绑定（更新绑定的shapes）
     */
    emitShapes() {
        // 更新与元素绑定的图形
        this.bindingInfos.map(bindingItem => {
            bindingItem.bindFn(
                bindingItem.element, 
                bindingItem.shape
            );
        });

        // 若声明连接，则进行连接绑定
        this.linkModel.emitLinkShapes();
        
        // 若存在指针，则处理指针
        this.pointerModel.emitPointerShapes();
    }

    /**
     * 获取Elements
     */
    getElements(): ElementContainer {
        return this.elementContainer;
    }

    /**
     * 元素工厂，创建Element
     * @param elementName
     * @param sourceElement
     */
    private createElement(sourceElement: SourceElement, elementName: string): Element {
        let elementId = elementName + '#' + sourceElement.id,
            ele: Element = null;

        let eleConstructor = this.engine.ElementsTable[elementName];

        // 若没有声明元素，退回至基类Element
        if(eleConstructor === undefined) {
            eleConstructor = Element;
        }
        
        ele = new eleConstructor(sourceElement);
        ele.elementId = elementId;
        ele.name = elementName;
        
        let shapeOption = null, 
            contents = null,
            shapeName = null, 
            shape = null;

        shapeOption = this.engine.layoutOption[elementName];
        shapeName = typeof this.engine.elementsOption === 'object'?
            this.engine.elementsOption[elementName]:
            this.engine.elementsOption;

        contents = Array.isArray(shapeOption.content)? 
            shapeOption.content.map(item => this.parserElementContent(ele, item)):
            this.parserElementContent(ele, shapeOption.content);

        shape = this.viewModel.createShape(ele.elementId, shapeName, { ...shapeOption, content: contents });
        
        // 初始化元素数据
        ele.shape = shape;
        ele.width = shape.width;
        ele.height = shape.height;
        ele.rotation = shape.rotation;
        ele.style = shape.style;
        ele.layoutOption = this.engine.layoutOption;
      
        this.elementList.push(ele);

        return ele;
    }

    /**
     * 解析元素文本内容
     * @param ele 
     * @param content 
     */
    parserElementContent(ele: Element, content: string): string {
        // 若存在文本声明，解析文本
        if(content) {
            let contents = Util.textParser(content);
            
            if(Array.isArray(contents)) {
                let values = contents.map(item => ele[item]);

                values.map((item, index) => {
                    content = content.replace('[' + contents[index] + ']', item);
                });
            }

            return content;
        }
        else {
            content = null;
        }
    }


    /**
     * 绑定shape
     * @param bindingInfo
     */
    bind<T extends Element | Element[] = Element, U extends Shape | Shape[] = Shape>(
        ele: T, 
        shape: U, 
        bindFn: (element: T, shape: U, param?: any) => void,
        param?: any
    ) {
        this.bindingInfos.push({
            element: ele,
            shape,
            param,
            bindFn
        });
    }

    
    /**
     * 动态添加一个连接
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的连接
     * @param emitElement
     * @param targetElement 
     * @param linkName 
     * @param anchorPair 
     */
    addLink(emitElement: Element, targetElement: Element, linkName: string, value: any = null, anchorPair: [anchor, anchor] = null) {
        // 若emitElement中的linkName字段有且仅有一个元素
        if(emitElement[linkName] && !Array.isArray(emitElement[linkName])) {
            emitElement[linkName] = [emitElement[linkName], targetElement];
        }
        // 若emitElement中的linkName字段有多个元素
        else if(emitElement[linkName] && Array.isArray(emitElement[linkName])) {
            emitElement[linkName].push(targetElement);
        }
        // 若emitElement中的linkName字段为空
        else {
            emitElement[linkName] = targetElement;
        }

        this.linkModel.addLinkPair({
            element: emitElement,
            target: targetElement,
            linkName,
            sourceTarget: null,
            label: value? value.toString(): null,
            anchorPair
        });
    }
    
    /**
     * 动态添加一个外部指针
     * - 该方法用于让用户在render方法中动态生成一个非预先在source中声明的外部指针
     * @param targetElement 
     * @param pointerName 
     * @param value 
     */
    addPointer(targetElement: Element, pointerName: string, value: string) {
        this.pointerModel.addPointerPair(targetElement, pointerName, value);
    }

    /**
     * 重置上一次的数据，包括：
     * - elementList
     * - elementContainer
     * - bindingInfo绑定信息
     * @param shapeContainer 
     */
    resetData() {
        this.elementList.length = 0;
        this.bindingInfos.length = 0;
        this.elementContainer = {};

        this.linkModel.clear();
        this.pointerModel.clear();
    }

    /**
     * 清空数据
     */
    clear() {
        this.resetData();
    }
};