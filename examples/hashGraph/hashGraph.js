

class HashBlock extends SV.Composite {
    constructor(id, name, opt) {
        super(id, name, opt);

        this.addSubShape({
            cell1: {
                shapeName: 'rect',
                init: option => ({
                    content: option.content[0],
                }),
                draw: (parent, block) => {
                    let widthPart = parent.width / 2;
    
                    block.y = parent.y;
                    block.x = parent.x - widthPart / 2;
                    block.height = parent.height;
                    block.width = widthPart;
                }
            }, 
            cell2: {
                shapeName: 'rect',
                init: option => ({
                    content: option.content[1],
                    zIndex: -1,
                    style: {
                        fill: '#eee'
                    }
                }),
                draw: (parent, block) => {
                    let widthPart = parent.width / 2;
    
                    block.y = parent.y;
                    block.x = parent.x + widthPart / 2;
                    block.height = parent.height - block.style.lineWidth;
                    block.width = widthPart;
                }
            }
        });
    }

    defaultAnchors(baseAnchors, width, height) {
        return {
            ...baseAnchors,
            1: [width / 4, 0]
        };
    }
}



class GraphNode extends SV.Element {
    // onUnlinkFrom(linkName) {
    //     if(linkName === 'hashLink') {
    //         this.style.fill = '#f38181';
    //     }
    // }
}



let HGOptions = {
    element: {
        hashItem: 'hashBlock',
        graphNode: 'circle'
    },
    layout: {
        hashItem: {
            size: [80, 40],
            content: '[id]',
            style: {
                stroke: '#000',
                fill: '#a29bfe'
            }
        },
        graphNode: {
            size: 50,
            content: '[data]',
            style: {
                stroke: '#000',
                fill: '#a29bfe'
            }
        },
        link: {
            graphLink: {
                contact: [4, 4],
                style: {
                    fill: '#000',
                    lineWidth: 2
                }
            },
            hashLink: {
                contact: [1, 3],
                markers: ['circle', 'arrow'],
                style: {
                    fill: '#000',
                    lineWidth: 2,
                    lineDash: [4, 4]
                }
            }
        },
        radius: 150,
        distance: 350,
        autoAdjust: true
    },
    animation: {
        enableSkip: true,
        duration: 1000,
        timingFunction: 'quinticOut',
        enableAnimation: true
    }
}



/**
 * 哈希图可视化实例
 */
class HashGraph extends SV.Engine {

    constructor(container) {
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
    layoutGraph(graphNodes) {
        let radius = this.layoutOption.radius,
            intervalAngle = 2 * Math.PI / graphNodes.length,
            group = this.group(),
            i;

        for (i = 0; i < graphNodes.length; i++) {
            let [x, y] = SV.Vector.rotation(-intervalAngle * i, [0, -radius]);

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
    layoutHashTable(hashItems) {
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


    render(elements) {
        let hashGroup = this.layoutHashTable(elements.hashItem),
            graphGroup = this.layoutGraph(elements.graphNode);

        let hashBound = hashGroup.getBound(),
            graphBound = graphGroup.getBound(),
            hashMidHeight = hashBound.y + hashBound.height / 2,
            graphMidHeight = graphBound.y + graphBound.height / 2;

        graphGroup.translate(0, hashMidHeight - graphMidHeight);
    }
}








