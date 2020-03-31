import { Shape, Style } from "./../Shapes/shape";
import { shapeContainer, ViewModel } from "./viewModel";
export declare enum patchType {
    ADD = 0,
    REMOVE = 1,
    POSITION = 2,
    ROTATION = 3,
    SIZE = 4,
    STYLE = 5
}
export interface patchInfo {
    type: number;
    newShape: Shape;
    oldShape: Shape;
    data?: any;
}
export declare class Differ {
    /**
     * 进行图形样式对象的比较
     * @param oldStyle
     * @param newStyle
     */
    differStyle(oldStyle: Style, newStyle: Style): {
        name: string;
        old: any;
        new: any;
    }[];
    /**
     * 图形间的differ
     * @param oldShape
     * @param newShape
     */
    differShape(oldShape: Shape, newShape: Shape): patchInfo[];
    /**
     * 进行视图模型中图形列表的differ
     * @param oldShapeList
     * @param newShapeList
     * @param shapeListName
     */
    differShapeList(oldShapeList: Shape[], newShapeList: Shape[], shapeListName: string): patchInfo[];
    /**
     * 进行视图模型differ
     * @param oldView
     * @param newView
     */
    differShapeContainer(oldShapeContainer: shapeContainer, newShapeContainer: shapeContainer): patchInfo[];
    /**
     * 对修改的视图进行补丁更新
     * @param viewModel
     * @param patchList
     */
    patch(viewModel: ViewModel, patchList: patchInfo[]): void;
}
