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
// 注册图形
engine_1.RegisterShape([
    composite_1.Composite,
    circle_1.Circle,
    isogon_1.Isogon,
    polyLine_1.PolyLine,
    rect_1.Rect,
    text_1.Text,
    arrow_1.Arrow,
    curve_1.Curve,
    line_1.Line,
    node_1.Node,
    dualNode_1.DualNode,
    twoCellBlock_1.TwoCellBlock
]);
exports.SV = {
    Engine: engine_1.Engine,
    Util: util_1.Util,
    Bound: boundingRect_1.Bound,
    // Element
    Element: element_1.Element,
    // Shape
    Composite: composite_1.Composite,
    // decorator
    registerShape: engine_1.RegisterShape,
    /**
     * 创建一个可视化引擎
     * @param engineConstruct
     * @param container
     * @param opt
     */
    create(engineConstruct, container, opt) {
        engineConstruct['id'] = util_1.Util.generateId();
        let engine = new engineConstruct(container);
        engine.applyOption(opt);
        return engine;
    }
};
