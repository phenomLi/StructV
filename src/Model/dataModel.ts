import { Element } from "./element";
import { Engine } from "../engine";
import { Shape, Style } from "../Shapes/shape";
import { ViewModel } from "../View/viewModel";
import { SourceElement, Sources } from "../sources";
import { Util } from "../Common/util";
import { LinkModel, anchor } from "./linkModel";
import { PointerModel } from "./pointerModel";
import { StructOption, BaseShapeOption } from "../option";



// 元素集类型
export type ElementContainer = { [key: string]: Element[] };


// 数据模型管理器
export class DataModel {
    // 视图模型管理器
    private viewModel: ViewModel;
    // 连接处理类
    private linkModel: LinkModel;
    // 指针处理类
    private pointerModel: PointerModel;
    // 元素队列
    private elementList: Element[] = [];
    // 元素容器，即源数据经element包装后的结构
    private elementContainer: ElementContainer = {};

    constructor(private engine: Engine, viewModel: ViewModel) {
        this.engine = engine;
        this.viewModel = viewModel;

        this.linkModel = new LinkModel(this, viewModel, this.engine.viewOption.link);
        this.pointerModel = new PointerModel(this, viewModel, this.engine.viewOption.pointer);
    }

    /**
     * 从源数据构建 element 集
     * 主要工作：
     * - 遍历源数据，将每个 SourceElement 转化为 Element
     * - 处理连接
     * - 处理指针
     * @param sources 
     */
    constructElements(sources: Sources) { 
        if(Array.isArray(sources)) {
            this.elementContainer['element'] = [];
            sources.map(item => {
                if(item) {
                    this.elementContainer['element'].push(this.createElement(item, 'element'));
                }
            });
        }
        else {
            Object.keys(sources).map(prop => {
                this.elementContainer[prop] = [];
                sources[prop].map(item => {
                    if(item) {
                        this.elementContainer[prop].push(this.createElement(item, prop));
                    }
                });
            });
        }

        // 构建连接模型
        this.linkModel.constructLinks(this.engine.structOption.link, this.elementContainer, this.elementList);
    
        // 构建指针模型
        this.pointerModel.constructPointers(this.engine.structOption.pointer, this.elementList);
        
        //console.log(this.elementContainer);
    }

    /**
     * 根据布局函数布局 element
     * @param layoutFn 
     * @param containerWidth 
     * @param containerHeight 
     */
    layoutElements(layoutFn: Function, containerWidth: number, containerHeight: number) {
        let elements: any = this.elementContainer;

        if(Object.keys(elements).length === 1 && elements['element']) {
            elements = elements['element'];
        }

        // 调用自定义布局函数对所有 element 进行布局
        layoutFn(elements, containerWidth, containerHeight);
    }

    /**
     * 构建连线和指针
     */
    drawComponents() {
        for(let i = 0; i < this.elementList.length; i++) {
            let element = this.elementList[i],
                shapeOption = this.engine.viewOption.element, 
                contents = null,
                shapeName = null, 
                shape: Shape = null;

            if(shapeOption.shape === undefined) {
                shapeOption = shapeOption[element.name];
            }

            contents = Array.isArray(shapeOption.content)? 
                shapeOption.content.map(item => this.parserElementContent(element, item)):
                this.parserElementContent(element, shapeOption.content as string);

            // 若没有为一个 element 指定图形，报错
            Util.assert(shapeName === undefined, `(${element.name}) 未指定 shape！`);

            shapeName = shapeOption.shape;
            shape = this.viewModel.createShape(element.elementId, shapeName, { ...shapeOption, content: contents });

            // 利用 shape 初始化某些数据
            Util.extends(shape.style, element.style);
            element.style = shape.style;
            element.shape = shape;
            shape.element = element;

            element.lastX = element.x;
            element.lastY = element.y;
        } 

        // 绘制连线
        this.linkModel.drawLinks();
        // 绘制指针
        this.pointerModel.drawPointers();
    }

    /**
     * 响应 element 的绑定（更新绑定的 shapes ）
     */
    updateShapes(updateElements: Element[] = []) {
        let elementList = updateElements.length? updateElements: this.elementList;

        // 更新与元素绑定的图形
        for(let i = 0; i < elementList.length; i++) {
            let element = elementList[i],
                shape = element.shape;

            // 跳过过时的 element
            if(element.isObsolete) {
                continue;
            }

            shape.x = element.x;
            shape.y = element.y;
            shape.width = element.width;
            shape.height = element.height;
            shape.rotation = element.rotation;
            shape.style = element.style as Style;
            shape.isDirty = true;

            for(let j = 0; j < element.effectLinks.length; j++) {
                let linkPair = element.effectLinks[j];

                // 避免重复更新
                if(linkPair.linkShape.isDirty) {
                    continue;
                }

                this.linkModel.updateLinkPos(linkPair, element);

                linkPair.linkShape.isDirty = true;
                if(linkPair.labelShape) {
                    linkPair.labelShape.isDirty = true;
                } 
            }

            if(element.effectRefer) {
                let pointerPair = element.effectRefer;

                this.pointerModel.updateReferPos(pointerPair);

                pointerPair.pointerShape.isDirty = true;
                pointerPair.labelShapes.forEach(item => {
                    item.isDirty = true;
                });
            }

            element.lastX = element.x;
            element.lastY = element.y;
        }
    }

    /**
     * 获取Elements
     */
    getElements(): ElementContainer {
        return this.elementContainer;
    }

    /**
     * 获取ElementLits
     */
    getElementList(): Element[] {
        return this.elementList;
    }

    /**
     * 元素工厂，创建Element
     * @param elementName
     * @param sourceElement
     */
    private createElement(sourceElement: SourceElement, elementName: string): Element {
        let elementStruct = this.engine.structOption.element,
            eleConstructor = null,
            elementId = elementName + '#' + sourceElement.id,
            element: Element = null,
            shapeOption = this.engine.viewOption.element;

        if(typeof elementStruct === 'object') {
            eleConstructor = elementStruct[elementName];
        } 
        else {
            eleConstructor = elementStruct;
        }

        // 若没有声明元素，退回至基类Element
        if(eleConstructor === undefined) {
            eleConstructor = Element;
        }
        
        element = new eleConstructor(sourceElement);
        element.elementId = elementId;
        element.name = elementName;
        element.layoutOption = this.engine.viewOption.layout;

        if(shapeOption.shape === undefined) {
            shapeOption = shapeOption[element.name];
        }

        if(Array.isArray(shapeOption.size)) {
            element.width = shapeOption.size[0];
            element.height = shapeOption.size[1];
        }
        else {
            element.width = element.height = shapeOption.size as number;
        }
        
        element.rotation = shapeOption.rotation || 0;
        element.anchors = shapeOption.anchors;
      
        this.elementList.push(element);

        return element;
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
            label: value? value.toString(): null,
            anchorPair,
            sourceLinkTarget: null
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
     * - linkModel 数据
     * - pointerModel 数据
     * @param shapeContainer 
     */
    resetData() {
        // 将所有 element 设置为过时
        this.elementList.forEach(item => {
            item.isObsolete = true;
        });

        this.elementList.length = 0;
        this.elementContainer = {};

        this.linkModel.clear();
        this.pointerModel.clear();
    }
};