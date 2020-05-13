import { Engine, RegisterShape } from "./engine";
import { Util } from "./Common/util";
import { Composite } from "./Shapes/composite";
import { EngineOption } from "./option";
import { Element } from "./Model/element";
import { Circle } from "./Shapes/circle";
import { Isogon } from "./Shapes/isogon";
import { PolyLine } from "./Shapes/polyLine";
import { Rect } from "./Shapes/rect";
import { Text } from "./Shapes/text";
import { Bound } from "./View/boundingRect";
import { Arrow } from "./Shapes/arrow";
import { Line } from "./SpecificShapes/line";
import { Node } from "./SpecificShapes/node";
import { DualNode } from "./SpecificShapes/dualNode";
import { Curve } from "./Shapes/curve";
import { Vector } from "./Common/vector";






// 注册图形
RegisterShape(Composite, 'composite');
RegisterShape(Circle, 'circle');
RegisterShape(Isogon, 'isogon');
RegisterShape(PolyLine, 'polyLine');
RegisterShape(Rect, 'rect');
RegisterShape(Text, 'text');
RegisterShape(Arrow, 'arrow');
RegisterShape(Curve, 'curve');

RegisterShape(Line, 'line');
RegisterShape(Node, 'node');
RegisterShape(DualNode, 'dualNode');




export const SV = {
    Engine: Engine,
    Util: Util,
    Bound: Bound,
    Vector: Vector,
    // Element
    Element: Element,
    // Shape
    Composite: Composite,
    // register
    registerShape: RegisterShape,


    /**
     * 创建一个可视化引擎
     * @param container 
     * @param engineConstruct 
     * @param opt 
     */
    create(container: HTMLElement, engineConstruct: { new(container: HTMLElement): Engine }, opt?: Partial<EngineOption>): Engine {
        engineConstruct['id'] = Util.generateId();

        let engine = new engineConstruct(container);

        if(opt) {
            engine.applyOptions(opt, false);
        }

        return engine;
    }
};



