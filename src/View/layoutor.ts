import { LayoutOption } from "../option";
import { Bound, BoundingRect } from "./boundingRect";
import { Shape } from "../Shapes/shape";
import { ElementContainer } from "../Model/dataModel";
import { Engine } from "../engine";
import { Container } from "./container";







export class Layoutor {
    // 容器
    private container: HTMLElement;
    // 容器宽度
    private width: number;
    // 容器高度
    private height: number;
    // 容器几何中心横坐标
    private centerX: number;
    // 容器几何中心纵坐标
    private centerY: number;
    // 是否为首次加载状态
    private init: boolean;
    // 布局配置项
    private layoutOption: LayoutOption;

    constructor(private engine: Engine, container: HTMLElement, layoutOption: LayoutOption) {
        this.container = container;
        this.width = container.offsetWidth;
        this.height = container.offsetHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.init = true;

        this.layoutOption = layoutOption;
    }

    /**
     * 调整视图至容器中央
     * @param shapes
     * @param globalContainer
     */
    adjustShapes(shapes: Shape[], globalContainer: Container) {
        // 求视图上所有图形的包围盒并集
        let globalBound = this.getGlobalBound(shapes),
        cx = globalBound.x + globalBound.width / 2,
        cy = globalBound.y + globalBound.height / 2;

        globalContainer.translate(this.centerX - cx, this.centerY - cy, !this.init);

        if(this.init) {
            this.init = !this.init;
        }
    }

    /**
     * 主布局函数
     * @param elements 
     * @param renderFn 
     */
    layoutElements(elements: ElementContainer, renderFn: Function) {
        // 调用自定义布局函数
        renderFn(elements, this.width, this.height);
    }

    /**
     * 求视图上所有图形的包围盒并集
     * @param shapes 
     */
    getGlobalBound(shapes: Shape[]): BoundingRect {
        return Bound.union(...shapes.map(item => item.getBound()));
    }

    /**
     * 获取容器宽度
     */
    getContainerWidth(): number {
        return this.width;
    }

    /**
     * 获取容器高度
     */
    getContainerHeight(): number {
        return this.height;
    }

    /**
     * 清空数据
     */
    clear() {
        this.init = true;
    }
}