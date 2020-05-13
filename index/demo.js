
let engines = [],
    curEngine = null,
    proxySources = null;

function createEngines(engines) {
    return engines.map((item, index) => {
        return {
            name: item[1],
            fn: ((item, index) => () => V.create(document.getElementById('c' + index), item[0]))(item, index),
            init: false,
            engine: null
        };
    });
}


let app = new Vue({
    el: '#app',
    data: {
        editor: null,
        codeType: 'options',
        curIndex: 0,
        engineList: [
            ['BinaryTree', '二叉树'],
            ['LinkList', '单链表'],
            ['Array', '数组'],
            ['Stack', '栈'],
            // ['NFTree', 'N叉树'],
            ['Graph', '无向图'],
            ['DirectedGraph', '有向图'],
            ['TwoWayLinkList', '双向链表'],
            ['GeneralizedList', '广义表'],
            // ['OrthogonalList', '十字链表'],
            // ['HashLinkList', '哈希链表'],
            // ['Blocks', '块'],
            // ['NeuralNetwork', '神经网络'],
            ['Star', '星形拓扑'],

            // ['BubbleSort', '冒泡排序'],
            // ['SelectSort', '选择排序']
        ]
    },
    methods: {
        navSelection(index) {
            let codeString = '';

            curEngine = engines[index];
            let engine = curEngine.engine;

            if(curEngine.init === false) {
                engine.source(data[engine.getName()]);
                curEngine.dataIndex = 0;
                curEngine.init = true;
            }
            
            this.curIndex = index;

            this.toggleCodeType('options');
        },
        initAce() {
            this.editor = ace.edit('inner-editor', {
                fontSize: 15,
                theme: 'ace/theme/xcode',
                mode: 'ace/mode/javascript',
                tabSize: 2,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                maxLines: 0,
                autoScrollEditorIntoView: true,
                highlightActiveLine: true,
                highlightGutterLine: true,
                readOnly: false,
                wrap: "free"
            });
        },
        initMouseValue() {
            let value = document.getElementById('value');
            document.getElementById('out-container').addEventListener('mousemove', e => {
                value.innerHTML = e.offsetX + ',' + e.offsetY;
            });
        },
        toggleCodeType(codeType) {
            this.codeType = codeType;

            let codeString = '';

            if(this.codeType === 'options') {
                codeString = JSON.stringify(curEngine.engine.getDefaultOption(), null, '\t');
            }
            else {
                codeString = JSON.stringify(data[curEngine.engine.getName()], null, '\t');
            }

            this.editor.setValue(codeString);
        },
        runCode() {
            let value = JSON.parse(this.editor.getValue());

            if(this.codeType === 'options') {
                curEngine.engine.applyOptions(value);
            }
            else {
                curEngine.engine.source(value);
            }
        }
    },
    mounted() {
        this.initAce();
        this.initMouseValue();

        engines = createEngines(this.engineList);
        engines.map(item => {
            item.engine = item.fn();
        });

        this.navSelection(this.curIndex);
    }
});



    



