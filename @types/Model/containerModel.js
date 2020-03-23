"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const boundingRect_1 = require("../View/boundingRect");
class ContainerModel {
    constructor(engine, dataModel, viewModel) {
        this.engine = engine;
        this.containerTable = [];
        this.dataModel = dataModel;
        this.viewModel = viewModel;
    }
    /**
     * 构建容器模型
     * @param elements
     * @param containerOptions
     */
    constructContainers(elements, containerOptions) {
        Object.keys(containerOptions).map(containerName => {
            let containerOption = containerOptions[containerName];
            if (!elements[containerName])
                return;
            Object.keys(elements).map(key => {
                let elementList = elements[key];
                // 遍历所有元素，创建连接对信息到linkPairs队列
                for (let i = 0; i < elementList.length; i++) {
                    let ele = elementList[i];
                    ele.elements = this.fetchChildren(elements, ele.elements);
                    this.containerTable.push({
                        containerName,
                        children: ele.elements,
                        padding: containerOption.padding || 0,
                        shape: ele.shape
                    });
                }
            });
        });
    }
    /**
     * 获取容器的真实子元素
     * @param elements
     * @param children
     */
    fetchChildren(elements, children) {
        return children.map(item => {
            let elementList = elements[item.element];
            return elementList ? elementList.find(ele => ele.id === item.target) : null;
        });
    }
    /**
     * 根据配置项，更新容器图形
     * @param containerOptions
     * @param elementList
     */
    updateContainerShape() {
        this.containerTable.map(container => {
            let padding = container.padding, paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0, boundingRect = boundingRect_1.Bound.union(...container.children.map(item => item.getBound())), x = boundingRect.x, y = boundingRect.y, width = boundingRect.width, height = boundingRect.height;
            if (Array.isArray(padding)) {
                paddingTop = padding[0] || 0;
                paddingRight = padding[1] || 0;
                paddingBottom = padding[2] || 0;
                paddingLeft = padding[3] || 0;
            }
            else {
                paddingTop = paddingBottom = paddingLeft = paddingRight = padding;
            }
            x -= paddingLeft;
            y -= paddingTop;
            width = width + paddingLeft + paddingRight;
            height = height + paddingTop + paddingBottom;
            container.shape.x = x + width / 2;
            container.shape.y = y + height / 2;
            container.shape.width = width;
            container.shape.height = height;
        });
    }
    clear() {
        this.containerTable = [];
    }
}
exports.ContainerModel = ContainerModel;
