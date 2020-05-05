import { Shape, Style } from "../Shapes/shape";
import { PolyLine } from "../Shapes/polyLine";
import { shapeContainer, ViewModel } from "./viewModel";


export enum patchType {
    ADD,
    REMOVE,
    POSITION,
    ROTATION,
    SIZE,
    STYLE
}


export interface patchInfo {
    type: number;
    newShape: Shape;
    oldShape: Shape;
}


export class Reconciler {
    private viewModel: ViewModel;

    constructor(viewModel: ViewModel) {
        this.viewModel = viewModel;
    }

    /**
     * 进行图形样式对象的比较
     * @param oldStyle 
     * @param newStyle 
     */
    reconcileStyle(oldStyle: Style, newStyle: Style): {name: string, old: any, new: any }[] {
        let styleName: {name: string, old: any, new: any }[] = [];
        
        Object.keys(newStyle).map(prop => {
            if(newStyle[prop] !== oldStyle[prop]) {
                styleName.push({
                    name: prop,
                    old: oldStyle[prop],
                    new: newStyle[prop]
                });
            }
        });

        return styleName;
    }

    /**
     * 图形间的 differ
     * @param oldShape 
     * @param newShape 
     */
    reconcileShape(oldShape: Shape, newShape: Shape) {
        let patchList: patchInfo[] = [];

        if(oldShape.isDirty === false && newShape.isDirty === false) return;

        // 比较图形坐标位置
        if(oldShape instanceof PolyLine && newShape instanceof PolyLine) {
            if(JSON.stringify(oldShape.prevPath) !== JSON.stringify(newShape.path)) {
                patchList.push({
                    type: patchType.POSITION,
                    newShape,
                    oldShape
                });
            }
        }
        else {
            if(oldShape.prevX !== newShape.x || oldShape.prevY !== newShape.y) {
                patchList.push({
                    type: patchType.POSITION,
                    newShape,
                    oldShape
                });
            }
        }

        // 比较旋转角度
        if(oldShape.prevRotation !== newShape.rotation) {
            patchList.push({
                type: patchType.ROTATION,
                newShape, 
                oldShape
            });
        }

        // 比较尺寸
        if(oldShape.prevWidth !== newShape.width || oldShape.prevHeight !== newShape.height) {
            patchList.push({
                type: patchType.SIZE,
                newShape,
                oldShape
            });
        }

        // 比较样式
        let style = this.reconcileStyle(oldShape.prevStyle, newShape.style);
        if(style.length) {
            patchList.push({
                type: patchType.STYLE,
                newShape,
                oldShape
            });
        }

        // 对变化进行更新
        this.patch(patchList);
    }

    /**
     * 
     * @param container 
     * @param shapeList 
     */
    reconcileShapeList(container: shapeContainer, shapeList: Shape[]) {
        let patchList: patchInfo[] = [];

        for(let i = 0; i < shapeList.length; i++) {
            let newShape = shapeList[i],
                name = newShape.name;

            // 若发现存在于新视图模型而不存在于旧视图模型的图形，则该图形都标记为 ADD
            if(container[name] === undefined) {
                patchList.push({
                    type: patchType.ADD,
                    newShape,
                    oldShape: null
                });
            }
            else {
                let oldShape = container[name].find(item => item.id === newShape.id);

                // 若旧图形列表存在对应的图形，进行 shape 间 differ
                if(oldShape) {
                    oldShape.visited = true;
                    this.reconcileShape(oldShape, newShape);
                }
                // 若发现存在于新视图模型而不存在于旧视图模型的图形，则该图形都标记为 ADD
                else {
                    patchList.push({
                        type: patchType.ADD,
                        newShape,
                        oldShape: null
                    });
                }
            }
        }

        // 在旧视图容器中寻找未访问过的图形，表明该图形该图形需要移除
        Object.keys(container).forEach(key => {
            container[key].forEach(shape => {
                if(shape.visited === false) {
                    patchList.push({
                        type: patchType.REMOVE,
                        newShape: null,
                        oldShape: shape
                    });
                }
            });
        });

        this.patch(patchList);
    }


    /**
     * 对修改的视图进行补丁更新
     * @param patchList 
     */
    patch(patchList: patchInfo[]) {
        let patch: patchInfo, 
            newShape,
            oldShape,
            i;

        for(i = 0; i < patchList.length; i++) {
            patch = patchList[i];
            newShape = patch.newShape;
            oldShape = patch.oldShape;

            switch(patch.type) {
                case patchType.ADD: {
                    this.viewModel.addShape(newShape);
                    break;
                }

                case patchType.REMOVE: {
                    this.viewModel.removeShape(oldShape);
                    break;
                }

                case patchType.POSITION: {
                    if(newShape instanceof PolyLine && oldShape instanceof PolyLine) {
                        oldShape.prevPath = newShape.path;
                        oldShape.updateZrenderShape('path');
                    } 
                    else {
                        oldShape.prevX = newShape.x;
                        oldShape.prevY = newShape.y;
                        oldShape.updateZrenderShape('position');
                    }
                    break;
                }

                case patchType.ROTATION: {
                    oldShape.prevRotation = newShape.rotation;
                    oldShape.updateZrenderShape('rotation');
                    break;
                }

                case patchType.SIZE: {
                    oldShape.prevWidth = newShape.width;
                    oldShape.prevHeight = newShape.height;
                    oldShape.updateZrenderShape('size');
                    break;
                }

                case patchType.STYLE: {
                    oldShape.prevStyle = JSON.parse(JSON.stringify(newShape.style));
                    oldShape.updateZrenderShape('style');
                    break;
                }

                default: {
                    break;
                }
            }

            if(oldShape && oldShape.element) {
                // 触发元素更新事件
                oldShape.element.onChange(patch.type);
            }
        }
    }
}