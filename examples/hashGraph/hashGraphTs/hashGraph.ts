import { Engine } from "./StructV/engine";
import { Element } from "./StructV/Model/element";
import { Group } from "./StructV/Model/group";
import { BoundingRect } from "./StructV/View/boundingRect";
import { Vector } from "./StructV/Common/vector";
import { HashGraphSources } from "./sources";
import { HashGraphOptions, HGOptions } from "./options";
import { ElementContainer } from "./StructV/Model/dataModel";
import { GraphNode } from "./graphNode";
import { HashBlock } from "./hashBlock";


/**
 * 哈希无向图可视化实例
 */
export class HashGraph extends Engine<HashGraphSources, HashGraphOptions> {

    constructor(container: HTMLElement) {
        super(container, {
            name: 'HashGraph',
            element: {
                graphNode: GraphNode
            },
            shape: {
                hashBlock: HashBlock
            },
            defaultOption: HGOptions
        });
    } 

    /**
     * 布局图
     * @param node 
     */
    layoutGraph(graphNodes: GraphNode[]) {
        let radius = this.layoutOption.radius,
            intervalAngle = 2 * Math.PI / graphNodes.length,
            group = this.group(),
            i;

        for (i = 0; i < graphNodes.length; i++) {
            let [x, y] = Vector.rotation(-intervalAngle * i, [0, -radius]);

            graphNodes[i].x = x + this.layoutOption.distance;
            graphNodes[i].y = y;

            group.add(graphNodes[i]);
        }

        return group;
    }   

    /**
     * 布局哈希表
     * @param hashItems 
     */
    layoutHashTable(hashItems: Element[]): Group {
        let group = this.group();

        for(let i = 0; i < hashItems.length; i++) {
            let height = hashItems[i].height;
            
            if(i > 0) {
                hashItems[i].y = hashItems[i - 1].y + height;
            }

            group.add(hashItems[i]);
        }

        return group;
    }


    render(elements: ElementContainer) {
        let hashGroup = this.layoutHashTable(elements.hashItem),
            graphGroup = this.layoutGraph(elements.graphNode);

        let hashBound: BoundingRect = hashGroup.getBound(),
            graphBound: BoundingRect = graphGroup.getBound(),
            hashMidHeight = hashBound.y + hashBound.height / 2,
            graphMidHeight = graphBound.y + graphBound.height / 2;

        graphGroup.translate(0, hashMidHeight - graphMidHeight);
    }
}
