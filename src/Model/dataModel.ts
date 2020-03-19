import { Element } from "./element";
import { Engine } from "../engine";
import { Shape } from "../Shapes/shape";
import { Composite } from "../Shapes/composite";
import { ViewModel } from "../View/viewModel";
import { SourceElement, Sources } from "../sources";
import { Util } from "../Common/util";
import { LinkHandler } from "./linkHandler";
import { PointerHandler } from "./pointerHandler";
import { Line } from "../SpecificShapes/line";
import { PolyLine } from "../Shapes/polyLine";
import { LinkOption, PointerOption } from "../option";
import { Curve } from "../Shapes/curve";



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
    // 连接处理器
    private linkHandler: LinkHandler;
    // 指针处理器
    private pointerHandler: PointerHandler;
    // 图形绑定队列
    private bindingInfos: bindingInfo[] = [];
    // 元素队列
    private elementList: Element[] = [];
    // 元素容器，即源数据经element包装后的结构
    private elementContainer: ElementContainer = {};

    constructor(private engine: Engine, viewModel: ViewModel) {
        this.engine = engine;
        this.viewModel = viewModel;

        this.linkHandler = new LinkHandler(engine, this, viewModel);
        this.pointerHandler = new PointerHandler(engine, this, viewModel);
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

        // 若存在连接，则处理结点间的连接
        if(this.engine.layoutOption.link) {
            this.linkHandler.buildLinkRelation(this.elementContainer, this.elementList);
        }
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
                        shape.rotation = ele.rotation;
                    }
                });
            });
        });

        
        // 若存在指针，则处理指针
        if(this.engine.layoutOption.pointer) {
            this.pointerHandler.bindPointerShape(this.engine.layoutOption.pointer, this.elementList);
        }

        // 若声明连接，则进行连接绑定
        if(this.engine.layoutOption.link) {
            this.linkHandler.bindLinkShape(this.engine.layoutOption.link, this.elementList);
        }
    }

    /**
     * 响应绑定（更新绑定的shapes）
     */
    emitShapes() {
        this.bindingInfos.map(bindingItem => {
            bindingItem.bindFn(
                bindingItem.element, 
                bindingItem.shape
            );
        });

        this.bindingInfos.map(bindingItem => {
            // 若绑定的是多个图形
            if(Array.isArray(bindingItem.shape)) {
                bindingItem.shape.map(item => {
                    // 若某个图形为复合图形，则更新其子图形
                    if(item instanceof Composite) {
                        item.updateSubShapes();
                    }
                });
            }
            else {
                // 若某个图形为复合图形，则更新其子图形
                if(bindingItem.shape instanceof Composite) {
                    bindingItem.shape.updateSubShapes();
                }
            }
        });
    }

    /**
     * 获取Elements
     */
    getElements(): ElementContainer {
        return this.elementContainer;
    }

    /**
     * 创建连接线Line
     * @param id 
     * @param linkOption 
     */
    createLineShape(id: string, option: LinkOption | PointerOption): Shape {
        let subShapesConfig = {},
            line: Line = null,
            curveness = option['curveness'] || 0,
            markers = option.markers,
            fromMarker = null, toMarker = null;

        // 若配置了曲率，则使用二次贝塞尔曲线
        subShapesConfig['line'] = {
            shapeName: curveness? 'curve': 'polyLine',
            init: parent => ({
                style: {
                    stroke: parent.style.fill,
                    fill: null
                }
            }),
            draw: (parent: Line, line: PolyLine) => {
                let start = parent.start,
                    end = parent.end;

                line.path = [ [start.x, start.y], [end.x, end.y] ];

                if(line instanceof Curve) {
                    line.controlPoint = line.calcControlPoint(start, end);
                }
            }
        }
      
        // 添加marker
        if(markers) {
            // 若只配置了结尾marker
            if(typeof markers === 'string') {
                toMarker = markers;
            }
            // 配置了两端marker
            else {
                fromMarker = markers[0];
                toMarker = markers[1];
            }
        }

        if(fromMarker) {
            subShapesConfig['fromMarker'] = {
                shapeName: fromMarker,
                init: parent => ({
                    zIndex: 2
                }),
                draw: (parent: Line, marker: Shape) => {
                    let start = parent.start;
                    
                    marker.x = start.x;
                    marker.y = start.y;
                    marker.rotation = parent.tangentAt(0) + Math.PI;

                    marker.width = parent.getSubShape('line').style.lineWidth + 5;
                    marker.height = marker.width;
                }
            }
        }
            
        if(toMarker) {
            subShapesConfig['toMarker'] = {
                shapeName: toMarker,
                init: parent => ({
                    zIndex: 2
                }),
                draw: (parent: Line, marker: Shape) => {
                    let end = parent.end;
                    
                    marker.x = end.x;
                    marker.y = end.y;
                    marker.rotation = parent.tangentAt(1);

                    marker.width = parent.getSubShape('line').style.lineWidth + 5;
                    marker.height = marker.width;
                }
            }
        }

        line = this.viewModel.createShape(id, 'line', option, subShapesConfig) as Line;
        return line;
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
        
        ele = new eleConstructor();
        
        let shapeOption = this.engine.layoutOption[elementName], 
            contents = null,
            shapeName = null, 
            shape = null;

        shapeName = typeof this.engine.elementsOption === 'object'?
            this.engine.elementsOption[elementName]:
            this.engine.elementsOption;
        
        ele.applySourceElement(sourceElement, this.engine.sourcesField? this.engine.sourcesField[elementName]: null);
        ele.elementId = elementId;
        ele.name = elementName;

        contents = Array.isArray(shapeOption.content)? 
            shapeOption.content.map(item => this.parserElementContent(ele, item)):
            this.parserElementContent(ele, shapeOption.content);

        shape = this.viewModel.createShape(ele.elementId, shapeName, { ...shapeOption, content: contents });
        shape.element = ele;

        // 初始化元素数据
        ele.shape = shape;
        ele.rotation = shape.rotation;
        ele.style = shape.style;
        ele.layoutOption = this.engine.layoutOption;
        ele.anchors = this.linkHandler.getAnchors(ele);
        // 初始化元素自定义数据
        ele.init && ele.init();
      
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

        this.linkHandler.clear();
    }

    /**
     * 清空数据
     */
    clear() {
        this.resetData();
    }
};