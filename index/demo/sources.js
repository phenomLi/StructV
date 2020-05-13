


function random(range = 100) {
    return Math.floor(Math.random() * range);
}


function generateNeuralNetworkData(layers) {
    let neurons = [];

    for(let i = layers.length - 1; i >= 0; i--) {
        neurons.push(...Array.from(new Array(layers[i])).map((item, index) => {
            let lastLayerIds = neurons.map(item => {
                if(item.layer === i + 1) return item.id;
                else return null;
            });

            return {
                id: i * 10 + index + 1,
                data: Math.random().toFixed(1),
                layer: i,
                to: lastLayerIds
            };
        }));
    }

    return neurons;
}






const data = {
    BinaryTree: [
        { id: 1, child: [2, 3], root: true, external: 'treeA', data: 1 }, 
        { id: 2, data: 2 }, 
        { id: 3, child: [null, 4], data: 3 },
        { id: 4, child: [null, 5], external: 'foo', data: 4 },
        { id: 5, data: 5 },
        { id: 6, external: 'bar', child: [7, null], root: true, data: 6 },
        { id: 7, data: 7 }
    ], 
        
    LinkList: [
        { id: 1, root: true, next: 2 },
        { id: 2, next: 3 },
        { id: 3, next: 4 },
        { id: 4, next: 5 },
        { id: 5 },
        { id: 6, root: true, next: 7 },
        { id: 7, next: 8 }, 
        { id: 8, next: 4 }, 
        { id: 9, root: true, next: 10 },
        { id: 10 }
    ],
    
    Array: [
        { id: 0 },
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
    ],

    Stack: [
        { id: 7, current: 'top' },
        { id: 6 },
        { id: 5 },
        { id: 4 },
        { id: 3 },
        { id: 2 },
        { id: 1 },
        { id: 0 },
    ],

    NForkTree: [
        { id: 1, children: [2, 3, 4, 5, 6], root: true }, 
        { id: 2, children: [12, 13] },{ id: 3 },{ id: 4 },{ id: 5, children: [7, 8, 9] },{ id: 6 },
        { id: 7, children: [10, 11] }, { id: 8 },{ id: 9 },
        { id: 10, children: [14] }, { id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }
    ],


    Graph: [
        { id: 1, links: 2 }, 
        { id: 2, links: [
            { target: 3, weight: random() },
            { target: 4, weight: random() },
            { target: 5, weight: random() }
        ] }, 
        { id: 3, links: [4, { target: 6, weight: 20 }] }, 
        { id: 4, links: 5 }, { id: 5, links: 6 },
        { id: 6, links: 1 }
    ],

    DirectedGraph: [
        { id: 1, links: 2 }, 
        { id: 2, links: 3, clinks: 4 }, 
        { id: 3, links: 4 }, 
        { id: 4, links: 1, clinks: 2 }
    ],

    TwoWayLinkList: [
        { id: 1, root: true, next: 2 },
        { id: 2, next: 3, prev: 1 },
        { id: 3, next: 4, prev: 2 },
        { id: 4, next: 5, prev: 3 },
        { id: 5, prev: 4, external: 'end5' },
        { id: 6, root: true, next: 7 },
        { id: 7, next: 8, prev: 6 },
        { id: 8, next: 9, prev: 7 },
        { id: 9, next: 10, prev: 8 },
        { id: 10, prev: 9, next: 11 },
        { id: 11, prev: 10, next: 12 },
        { id: 12, next: 13, prev: 11 },
        { id: 13, prev: 12, external: 'end13' }
    ],

    GeneralizedList: {
        tableNode: [
            { id: 1, root: true, next: 2, tag: 1, sub: { element: 'atomNode', target: 1 } },
            { id: 2, sub: 3, tag: 1 },
            { id: 3, next: 4, tag: 1, sub: { element: 'atomNode', target: 2 } },
            { id: 4, next: 5, tag: 1, sub: { element: 'atomNode', target: 3 } },
            { id: 5, tag: 1, sub: { element: 'atomNode', target: 4 } }
        ],
        atomNode: [
            { id: 1, tag: 0, data: 'a' },
            { id: 2, tag: 0, data: 'b' },
            { id: 3, tag: 0, data: 'c' },
            { id: 4, tag: 0, data: 'd' },
        ]
    },

    OrthogonalList: {
        rowHead: [
            { id: 1, root: true, rowHeadNext: { element: 'node', target: '1-1' } },
            { id: 2, rowHeadNext: { element: 'node', target: '2-2' } },
            { id: 3, rowHeadNext: { element: 'node', target: '3-3' } }
        ],
        colHead: [
            { id: 1, root: true, colHeadNext: { element: 'node', target: '1-1' } },
            { id: 2, colHeadNext: { element: 'node', target: '2-2' } },
            { id: 3, colHeadNext: { element: 'node', target: '1-3' } }
        ],
        node: [
            { id: '1-1', data: random(), rowNext: '1-3' },
            { id: '2-2', data: random() },
            { id: '1-3', data: random(), colNext: '3-3' },
            { id: '3-3', data: random() },
        ]
    },


    HashLinkList: {
        headNode: [
            { id: 1, headLink: { element: 'node', target: 1 } },
            { id: 2, headLink: { element: 'node', target: 6 } },
            { id: 3, headLink: { element: 'node', target: 9 } },
            { id: 4, headLink: { element: 'node', target: 11 } },
            { id: 5 },
            { id: 6, headLink: { element: 'node', target: 15 } },
        ],
        node: [
            { id: 1, root: true, next: 2 },
            { id: 2, next: 3 },
            { id: 3, next: 4 },
            { id: 4, next: 5 },
            { id: 5 },
            { id: 6, root: true, next: 7 },
            { id: 7, next: 8 }, 
            { id: 8 }, 
            { id: 9, root: true, next: 10 },
            { id: 10 },
            { id: 11, root: true, next: 12 },
            { id: 12, next: 13 },
            { id: 13, next: 14 },
            { id: 14 },
            { id: 15 }
        ]
    },


    Blocks: Array.from(new Array(33)).map((item, index) => {
        let data = Math.random().toFixed(2);

        return { 
            id: index + 1, 
            data,
            positive: data >= 0.5
        };
    }),

    Star: {
        center: [
            { 
                id: 1, 
                radiate: [
                    { element: 'node', target: 1 }, 
                    { element: 'node', target: 2 }, 
                    { element: 'node', target: 3 }, 
                    { element: 'node', target: 4 }
                ]
            }
        ],
        node: [
            { id: 1, contract: { element: 'center', target: 1 } },
            { id: 2, contract: { element: 'center', target: 1 } },
            { id: 3, contract: { element: 'center', target: 1 } },
            { id: 4, contract: { element: 'center', target: 1 } }
        ]
    },

    Matrix: Array.from(new Array(25)).map((item, index) => ({
        id: index,
        data: Math.random() >= 0.5? random(40): 0
    })), 

    NeuralNetwork: generateNeuralNetworkData([8, 8, 1]),

    BubbleSort: bubbleSort(Array.from(new Array(10)).map(item => random())),
    SelectSort: selectSort(Array.from(new Array(10)).map(item => random())),
};








