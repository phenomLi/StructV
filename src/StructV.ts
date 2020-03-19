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
import { TwoCellBlock } from "./SpecificShapes/twoCellBlock";




// 注册图形
RegisterShape([
    Composite, 
    Circle, 
    Isogon, 
    PolyLine, 
    Rect, 
    Text, 
    Arrow, 
    Curve,
    
    Line, 
    Node,
    DualNode,
    TwoCellBlock
]);





export const SV = {
    Engine: Engine,
    Util: Util,
    Bound: Bound,

    // Element
    Element: Element,

    // Shape
    Composite: Composite,

    // decorator
    registerShape: RegisterShape,


    /**
     * 创建一个可视化引擎
     * @param engineConstruct 
     * @param container 
     * @param opt 
     */
    create(engineConstruct: { new(container: HTMLElement): Engine }, container: HTMLElement, opt: EngineOption): Engine {
        engineConstruct['id'] = Util.generateId();

        let engine = new engineConstruct(container);
        engine.applyOption(opt);

        return engine;
    }
};



