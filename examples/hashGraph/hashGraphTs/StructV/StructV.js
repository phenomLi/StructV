"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const util_1 = require("./Common/util");
const composite_1 = require("./Shapes/composite");
const element_1 = require("./Model/element");
const circle_1 = require("./Shapes/circle");
const isogon_1 = require("./Shapes/isogon");
const polyLine_1 = require("./Shapes/polyLine");
const rect_1 = require("./Shapes/rect");
const text_1 = require("./Shapes/text");
const boundingRect_1 = require("./View/boundingRect");
const arrow_1 = require("./Shapes/arrow");
const line_1 = require("./SpecificShapes/line");
const node_1 = require("./SpecificShapes/node");
const dualNode_1 = require("./SpecificShapes/dualNode");
const curve_1 = require("./Shapes/curve");
const twoCellBlock_1 = require("./SpecificShapes/twoCellBlock");
const vector_1 = require("./Common/vector");
// 注册图形
engine_1.RegisterShape(composite_1.Composite, 'composite');
engine_1.RegisterShape(circle_1.Circle, 'circle');
engine_1.RegisterShape(isogon_1.Isogon, 'isogon');
engine_1.RegisterShape(polyLine_1.PolyLine, 'polyLine');
engine_1.RegisterShape(rect_1.Rect, 'rect');
engine_1.RegisterShape(text_1.Text, 'text');
engine_1.RegisterShape(arrow_1.Arrow, 'arrow');
engine_1.RegisterShape(curve_1.Curve, 'curve');
engine_1.RegisterShape(line_1.Line, 'line');
engine_1.RegisterShape(node_1.Node, 'node');
engine_1.RegisterShape(dualNode_1.DualNode, 'dualNode');
engine_1.RegisterShape(twoCellBlock_1.TwoCellBlock, 'twoCellBlock');
exports.SV = {
    Engine: engine_1.Engine,
    Util: util_1.Util,
    Bound: boundingRect_1.Bound,
    Vector: vector_1.Vector,
    // Element
    Element: element_1.Element,
    // Shape
    Composite: composite_1.Composite,
    // register
    registerShape: engine_1.RegisterShape,
    /**
     * 创建一个可视化引擎
     * @param container
     * @param engineConstruct
     * @param opt
     */
    create(container, engineConstruct, opt) {
        engineConstruct['id'] = util_1.Util.generateId();
        let engine = new engineConstruct(container);
        engine.applyOption(opt);
        return engine;
    }
};
