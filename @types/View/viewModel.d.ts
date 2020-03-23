import { Engine } from "../engine";
import { Shape } from "../Shapes/shape";
import { Composite } from "../Shapes/composite";
import { ElementContainer } from "../Model/dataModel";
export declare type shapeContainer = {
    [key: string]: Shape[];
};
export declare class ViewModel {
    private engine;
    private differ;
    private mainShapeContainer;
    private curShapeContainer;
    private shapeList;
    private removeList;
    private renderer;
    private layoutOption;
    staticTextId: number;
    constructor(engine: Engine, container: HTMLElement);
    /**
     * 图形工厂,创建Shape
     * @param id
     * @param shapeName
     * @param opt
     * @param subShapeConfig
     */
    createShape(id: string, shapeName: string, opt: any): Shape;
    createCompositeSubShapes(shape: Composite): void;
    /**
     * 将图形加入到view
     * @param shape
     * @param listName
     */
    addShape(shape: Shape, listName: string): void;
    /**
     * 将图形从view中移除
     * @param shape
     * @param listName
     */
    removeShape(shape: Shape): void;
    /**
     * 更新复合图形
     */
    private updateComposite;
    /**
     * 寻找可复用的Shape
     * @param id
     * @param shapeName
     */
    private reuseShape;
    /**
     * 布局view
     * @param elements
     * @param layoutFn
     */
    layoutElements(elements: ElementContainer | Element[], layoutFn: Function): void;
    /**
     * 渲染view
     */
    renderShapes(): void;
    /**
     * 重置上一次的数据，包括：
     * - shape的visited状态
     * - tempShapeContainer保存的内容
     */
    resetData(): void;
    /**
     * 清空所有图形
     */
    clearShape(): void;
    /**
     * 视图更新前
     */
    beforeUpdate(): void;
    /**
     * 视图更新后
     */
    afterUpdate(): void;
}
