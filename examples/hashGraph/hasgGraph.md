如果你没有看过第一篇教程，强烈建议先阅读：[StructV教程（一）：实现二叉树可视化](https://github.com/phenomLi/Blog/issues/39)

<br />

今天来介绍一个复杂一点的例子：**哈希无向图可视化**，随便引出一点新东西。

我不知道到底有没有“哈希无向图”这种奇奇怪怪的数据结构，我只是想通过引入这种结构：
1. **展示StructV具有可视化任何结构的能力**
2. **利用该种结构，能覆盖到我想要介绍的新内容**

首先，先看看我们想要的目标效果：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200330200302.png)

看着不难吧。左边哈希表的每一个值都指向右边无向图的每一个结点，然后无向图里的结点又各有连接。为什么我偏要拿这个结构作为第二篇教程的例子呢，因为该结构有两个特点：
- **哈希表的每个元素的图形（就是两个格子那个），StructV中没有内置**
- **该结构有两种不同类型的结点（哈希表元素和无向图结点）**

So what should we do？我们要做的：还行老三样：**1.定义源数据**，**2.编写配置项**，**3.编写可视化实例类**。

<br />

## Step 1

##### Typescript:

首先，新建`sources.ts`，确定我们的Sources。注意，现在我们有两种类型的结点了，分别为**哈希表元素**和**无向图结点**，所以对应的SourcesElement也有两种。
对于哈希表元素的SourcesElement，我们观察最终效果图，不难看出，其只有两个关键的元素，分别是元素的id（左边格子）和指向图结点的指针（右边格子）。因此我们可以很容易地写出其SourcesElement结构：
```typescript
// ------------------------- sources.ts ------------------------- 

import { SourceElement } from './StructV/sources';

interface HashItemSourcesElement extends SourceElement {
    id: number;
    hashLink: { element: string, target: number }
}
```
在这里，我们用`hashLink`来命名指向图结点的指针的名称（命名真是一大难题）。观察到，这次我们指针域的值和上一篇的二叉树`BinaryTreeSourcesElement`有点不一样了，没有直接填结点的id，而是使用了一个`{ element: string, target: number }`的对象来描述，为什么要这样呢？

StructV是根据一定的规则来处理SourceElement的指针域的，如果一个指针域的值为一个id（或者id组成的数组），例如上一篇的`BinaryTreeSourcesElement`的`children`：
```typescript
// 一个二叉树结点
{ 
    id: 1, 
    children: [2, 3] 
}
```
那么StructV会在同类型的SourceElement寻找目标结点。但是现在我们想在不同类型的SourceElement中建立指针连线，那么我们就要用`{ element: string, target: number }`这样的形式进行声明。其中`element`为目标元素的类型名称，`target`为目标元素的id。至于具体应该怎么填，我们之后再做讲解。

<br />

对于无向图的结点，我们观察得到其SourceElement也不复杂，同样只含id，data（图中的结点的字符不可能为id）和其他结点的指针域，那么我们也可以很快写出其具体定义。对于指向图其他结点的指针，这次我们用`graphLink`来命名。
```typescript
// ------------------------- sources.ts ------------------------- 

import { SourceElement } from './StructV/sources';

interface GraphNodeSourcesElement extends SourceElement {
    id: number;
    data: string;
    graphLink: number | number[];
}
```
注意，因为所以图节点都只有指向其他图结点的指针，所以`graphLink`可以直接用id（number）表示。我们可以总结一下关于指针连线的指定规则：
- **对于不同类型的SourceElement间的指针，需要用包含`element`和`target`的对象来指定**
- **对于同类型SourceElement间的指针，则可以直接使用id表示**

<br />

既然现在我们确定了两个SourceElement，那么理应就可以定义Sources的结构了。记得第一篇教程我们曾提到过：
> 当有多种类型的SourcesElement时，Sources必须为对象，当只有一种类型的SourcesElement时，Sources便可简写为数组。

在二叉树的例子中，由于只有一种类型的SourceElement，因此Sources可以定义为一个数组，但是现在，我们必须把Sources定义为一个对象：
```typescript
// ------------------------- sources.ts ------------------------- 

export interface HashGraphSources {
    hashItem: HashItemSourcesElement[];
    graphNode: GraphNodeSourcesElement[];
}
```
我们得到我们的`HashGraphSources`，其中`hashItem`为哈希表元素，`graphNode`为无向图结点。命名可随意，只要保证到时候输入的数据命名对的上就行。

`sources.ts`的完整代码如下：
```typescript
// ------------------------- sources.ts ------------------------- 

import { SourceElement } from './StructV/sources';

interface HashItemSourcesElement extends SourceElement {
    id: number;
    hashLink: { element: string, target: number }
}

interface GraphNodeSourcesElement extends SourceElement {
    id: number;
    data: string;
    graphLink: number | number[];
}


export interface HashGraphSources {
    hashItem: HashItemSourcesElement[];
    graphNode: GraphNodeSourcesElement[];
}
```

<br />

##### Javascript:
这一步跳过。

<br />




## Step 2

第二步编写默认配置项Options。

### Step 2.1

该步骤跟上一篇内容的方法大致相同，但是因为该例子有两种SourceElement，因此有一些地方更改和说明。

1. **首先，因为多类型SourceElement，因此元素配置项element需要从接受string改为接受接受一个对象，该对象与`HashGraphSources`格式相对应**
2. **其次，对应布局配置项layout也需要作一些变化，`element`的字段需改为元素配置项element中对应的字段**
3. **指针连线配置项link需添加两种指针连线**

具体应该怎么做？看下面代码：

<br />

##### Typescript:
新建`options.ts`文件，写下以下内容：
```typescript
// ------------------------- options.ts ------------------------- 

import { EngineOption } from './StructV/option';
import { Style } from './StructV/Shapes/shape';

export interface HashGraphOptions extends EngineOption {
    // 元素配置项
    element: {
        hashItem: string;
        graphNode: string;
    };
    // 布局配置项
    layout: {
        // 结点布局外观
        hashItem: {
            // 结点尺寸
            size: [number, number] | number;
            // 结点文本
            content: string;
            // 结点样式
            style: Partial<Style>;
        };
        // 结点布局外观
        graphNode: {
            // 结点尺寸
            size: number;
            // 结点文本
            content: string;
            // 结点样式
            style: Partial<Style>;
        };
        // 指针连线声明
        link: {
            hashLink: {
                // 连线两端图案
                markers: [string, string] | string;
                // 连接锚点
                contact: [number, number];
                // 连线样式
                style: Partial<Style>;
            };
            graphLink: {
                // 连接锚点
                contact: [number, number];
                // 连线样式
                style: Partial<Style>;
            };
        };
        // 图布局的半径
        radius: number;
        // 哈希表与图的距离
        distance: number;
        // 自动居中布局
        autoAdjust: boolean;
    };
    // 动画配置项
    animation: {
        // 是否允许跳过动画
        enableSkip: boolean;
        // 是否开启动画
        enableAnimation: boolean;
        // 缓动函数
        timingFunction: string;
        // 动画时长
        duration: number;
    };
}
```
`element`属性现在为一个对象，其中与`HashGraphSources`的属性（hashItem，graphNode）一致，分别表示每种SourceElement的可视化图形；`layout`中分别定义`hashItem`，`graphNode`的外观和样式；`link`中分别配置`HashItemSourcesElement`中的`hashLink`和`GraphNodeSourcesElement`中的`graphLink`。

之后，就是往里填充内容了。Emmmm。。。慢着，按照最终效果图，显然，无向图中的结点`graphNode`是圆形（circle），那么哈希元素项`hashItem`是什么图形呢？很遗憾，StructV中并没有内置这个图形，因此我们要使用它，必须利用StructV的自定义图形功能。如何做，我们先放一会再说，现在我们先给这个图形取个好听的名字，那就叫`hashBlock`吧。

下面是配置项具体内容：
```typescript
// ------------------------- options.ts ------------------------- 

export const HGOptions: HashGraphOptions = {
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
```



我们使用`dualNode`作为二叉树结点的可视化图形，`dualNode`是StructV的内置图形之一，它长这个样子：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200327160245.png)
`dualNode`还好地还原了二叉树结点的结构特点--左右两个孩子结点域和中间一个data域（我们用id代替data）。如果StructV中没有想要的图形，我们还可以自己组合创建新的图形。
`content`属性中的`[id]`表示取SourcesElement中`id`属性的值。`content`属性支持占位符，用`[attrName]`表示，其中`attrName`表示SourcesElement中的属性值。

`options.ts`文件的完整代码：
```typescript
// ------------------------- options.ts ------------------------- 

import { EngineOption } from './StructV/option';
import { Style } from './StructV/Shapes/shape';

export interface BinaryTreeOptions extends EngineOption {
    // 元素配置项
    element: string;
    // 布局配置项
    layout: {
        // 结点布局外观
        element: {
            // 结点尺寸
            size: [number, number] | number;
            // 结点文本
            content: string;
            // 结点样式
            style: Partial<Style>;
        };
        // 指针连线声明
        link: {
            children: {
                // 连线两端图案
                markers: [string, string] | string;
                // 连接锚点
                contact: [[number, number], [number, number]] | [number, number];
                // 连线样式
                style: Partial<Style>;
            }
        };
        // 结点水平间隔
        xInterval: number;
        // 结点垂直间隔
        yInterval: number;
        // 视图垂直居中
        autoAdjust: boolean;
    };
    // 动画配置项
    animation: {
        // 是否允许跳过动画
        enableSkip: boolean;
        // 是否开启动画
        enableAnimation: boolean;
        // 缓动函数
        timingFunction: string;
        // 动画时长
        duration: number;
    };
}

export const BTOptions: BinaryTreeOptions = {
    element: 'dualNode',
    layout: {
        element: {
            size: [80, 40],
            content: '[id]',
            style: {
                stroke: '#000',
                fill: '#9EB2A1'
            }
        },
        link: {
            children: {
                markers: ['circle', 'arrow'],
                contact: [[3, 0], [1, 0]],
                style: {
                    fill: '#000',
                    lineWidth: 2
                }
            }
        },
        xInterval: 60,
        yInterval: 40,
        autoAdjust: true
    },
    animation: {
        enableSkip: true,
        duration: 1000,
        timingFunction: 'quinticOut',
        enableAnimation: true
    }
}
```

<br />

##### Javascript:
对于js，我们当然也可以新建一个`options.js`文件保存你的配置项，然后用打包工具打包多个文件。但是本例中代码不多，使用打包工具有点小题大做，杀鸡用牛刀了，因此我们只新建一个`binaryTree.js`文件，把所有代码写到这一个文件即可，简单省事。
```javascript
// ------------------------- binaryTree.js ------------------------- 

const BTOptions = {
    // ...同上
}
```

现在我们可以进入第三步了。

<br />

## Step 3
这步是整个流程中最为重要的一步，直接决定了可视化视图的结果。在这一步我们将直接编写可视化实例的类，以完成二叉树可视化的构建。

##### Typescript:
首先，新建一个文件，命名为`binaryTree.ts`，写下以下模板代码：
```typescript
// ------------------------- binaryTree.ts ------------------------- 

import { Engine } from "./StructV/engine";
import { BTOptions, BinaryTreeOptions } from "./option";
import { BinaryTreeSources } from "./sources";
import { Element } from "./StructV/Model/element";

/**
 * 二叉树可视化实例
 */
export class BinaryTree extends Engine<BinaryTreeSources, BinaryTreeOptions> {
    constructor(container: HTMLElement) {
        super(container, {
            name: 'BinaryTree',
            defaultOption: BTOptions
        });
    }

    render(elements: Element[], containerWidth: number, containerHeight: number) {}
}
```
StructV以继承基类`Engine`以创建一个可视化实例的类，继承时`Engine`接受两个泛型，分别为源数据类型`BinaryTreeSources`和配置项类型`BinaryTreeOptions`，当然你想偷懒的话也可以不传。

在构造函数中，需要往父构造函数中传入两个参数。第一个是可视化容器，是一个HTML元素，该参数决定了你将会在哪一个HTML元素中呈现你的可视化结果。第二个参数是可视化实例的一些必要信息，其中包括可视化实例的名称`name`和刚才编写好的默认配置项`defaultOption`。

关键在于渲染函数`render`的内容，在这一步我们的主要工作就是在`render`函数中编写具体的可视化内容。`render`函数接受三个参数：
- **elements：该参数是一个Element组成的数组（在本例）。"Element"是什么？貌似之前从未出现过。StructV会对输入的每一个SourcesElement进行重新包装和扩展，这个包装扩展后的SourcesElement就称为Element。Element相比SourcesElement添加了许多用于布局的属性，同时也保留着SourcesElement中原有的属性。在`render`函数中可以任意修改每一个Element的`x`，`y`，`rotation`，`width`，`height`甚至是`style`。然而有一点要注意的是，SourcesElement中所有的指针连线属性中的id都会被替换成真实的Element元素。例如：**
```javascript
// sourceElement
{
    id: 1,
    children: [2, 3]
}
```
**会被替换成：**
```javascript
// Element
{
    id: 1,
    children: [Element, Element]
}
```
那么在`render`函数中就可以很方便地访问到一个Element的指针目标Element了。比如我们可以直接使用`node.children[0]`访问到二叉树的左子节点。
- **containerWidth：HTML容器的宽**
- **containerHeight：HTML容器的高**

接下来是`render`函数的具体实现。我们要做的是：**通过修改每一个Element的`x`，`y`坐标，使其满足二叉树的一般布局**。注意，Element的`x`，`y`无论对于什么图形，都代表该图形的几何中心坐标。
```typescript
// ------------------------- binaryTree.ts ------------------------- 

import { Engine } from "./StructV/engine";
import { BTOptions, BinaryTreeOptions } from "./option";
import { Element } from "./StructV/Model/element";
import { BinaryTreeSources } from "./sources";

/**
 * 二叉树可视化实例
 */
export class BinaryTree extends Engine<BinaryTreeSources, BinaryTreeOptions> {

    constructor(container: HTMLElement) {
        super(container, {
            name: 'BinaryTree',
            defaultOption: BTOptions
        });
    } 

    /**
     * 对二叉树进行递归布局
     * @param node 当前结点
     * @param parent 父节点
     * @param childIndex 左右孩子结点序号（0/1）
     */
    layout(node: Element, parent: Element, childIndex?: 0 | 1) {}

    render(elements: Element[], containerWidth: number, containerHeight: number) {
        let nodes = elements,
            node: Element,
            root: Element,
            i;

        // 首先找出根节点
        for(i = 0; i < nodes.length; i++) {
            node = nodes[i];
            
            if(nodes[i].root) {
                root = nodes[i];
                break;
            }
        }
        
        this.layout(root, null);
    }
}
```
二叉树的规律性很明显，只要从根节点开始进行向下递归布局即可，所有我们首先要把根节点找出来。还记得我们的`BinaryTreeSourcesElement`是怎样定义的吗：
```typescript
interface BinaryTreeSourcesElement extends SourceElement {
    id: string | number;
    root?: boolean;
    children?: [string, string] | [number, number];
}
```
因此我们只需要找出`root`为`true`的结点即为根节点。另外，我们还定义了一个`layout`函数专门用于二叉树结点的布局。传入根节点，接下来便是`layout`函数的实现。二叉树结点的两孩子结点始终位于父节点下方两侧，因此很容易地就可以写出以下代码：
```typescript
// ------------------------- binaryTree.ts ------------------------- 

import { Engine } from "./StructV/engine";
import { BTOptions, BinaryTreeOptions } from "./option";
import { Element } from "./StructV/Model/element";
import { BinaryTreeSources } from "./sources";

/**
 * 二叉树可视化实例
 */
export class BinaryTree extends Engine<BinaryTreeSources, BinaryTreeOptions> {

    // ...省略代码 

    /**
     * 对二叉树进行递归布局
     * @param node 当前结点
     * @param parent 父节点
     * @param childIndex 左右孩子结点序号（0/1）
     */
    layout(node: Element, parent: Element, childIndex?: 0 | 1) {
        if(!node) {
            return null;
        }

        let width = node.width,
            height = node.height;

        // 若该结点存在父节点，则对自身进行布局
        if(parent) {
            node.y = parent.y + this.layoutOption.yInterval + height;

            // 左节点
            if(childIndex === 0) {
                node.x = parent.x - this.layoutOption.xInterval / 2 - width / 2;
            }

            // 右结点
            if(childIndex === 1) {
                node.x = parent.x + this.layoutOption.xInterval / 2 + width / 2;
            }
        }

        // 若该结点存在左右孩子结点，则递归布局
        if(node.children) {
            this.layout(node.children[0], node, 0);
            this.layout(node.children[1], node, 1);
        }
    }

    render(elements: Element[], containerWidth: number, containerHeight: number) {
        // ...省略代码
    }
}
```
这在里，我们的`xInterval`和`yInterval`派上用场了。StructV允许用户在`render`函数中通过`this.layoutOption`访问布局配置项layout中的任何值。我们用`xInterval`来设定左右孩子结点间的水平距离，用`yInterval`来设定孩子结点与父节点的垂直距离。
大功告成了吗？其实还没有，还有什么问题？我们可以在脑海中仔细想象一下用上面方法布局出来的二叉树是什么样子的：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200327154940.png)
这是有3个结点的情况。如果情况再复杂一点，会是什么样子呢：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200327155441.png)
没错，当左右子树边宽时，水平方向的结点很有可能会发生重叠。该怎么解决呢？有一种思路是利用包围盒。
> 包围盒（boundingRect）是计算机图形学的一个常见概念，指的是一个复杂图形的最小外接矩形，通常用于简化范围查找或相交问题。

我们为二叉树的每一个子树建立一个包围盒，图示如下：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200327163736.png)
在包围盒的帮助下，我们很容易看出子树2的包围盒（橙色）和子树3的包围盒（紫色）相交。图中包围盒为了便于观看留了一些间隙，现实中包围盒是紧凑的。
我们要做的就是**计算包围盒2和包围盒3交集部分的水平宽度，记作`moveDistance`，然后把包围盒2和包围盒3中的所有结点分别移动`-moveDistance / 2`和`moveDistance / 2`距离**。

<br />

听起来好像有点麻烦，又要定义包围盒又要计算交集什么的（我只是想可视化一个二叉树有这么难吗，哭）。不急，你能想的Struct都已经帮你想到了。StructV允许用户在`render`函数中创建Group元素。什么是Group，有什么用？Group可以看作是一个承载Element的容器：
```typescript
// 创建一个Group，同时添加element1到这个Group
let group = this.group(element1);
// 添加多个Element到Group
group.add(element2, element3, ...., elementN);
```
当然Group中允许嵌套Group，我们可以操作通过Group来批量操作Group中的所有Element和Group：
- **`group.getWidth(): number，groupHeight(): number`：获取group的宽高**
- **`group.translate(dx: number, dy: number)`：位移 Group dx/dy的距离**
- **`group.rotate(rotation: number, center?: [number, number])`：旋转 Group rotation角度，第二个参数是旋转中心，若省略则默认以Group中心旋转**
- **`group.getBound(): BoundingRect`；获取Group的包围盒**

我们现在可以为每一个子树创建一个Group，然后把该子树的每一个结点加入这个Group，例如Group的特性，我们可以很容易判断哪些子树发生了重叠（相交）。至于如何计算包围盒交集，StructV也为我们内置了一系列包围盒的相关操作，只要引入`Bound`对象即可：
```typescript
import { Bound } from "./StructV/View/boundingRect";
```
- `Bound.fromPoints(points: Array<[number, number]>): BoundingRect`：从点集构造包围盒
- `Bound.toPoints(bound: BoundingRect): Array<[number, number]>`：包围盒转换为点集
- `Bound.union(...arg: BoundingRect[]): BoundingRect`：包围盒求并集
- `Bound.intersect(b1: BoundingRect, b2: BoundingRect): BoundingRect`：包围盒求交集
- `Bound.rotation(bound: BoundingRect, rot: number): BoundingRect`：包围盒旋转
- `Bound.isOverlap(b1: BoundingRect, b2: BoundingRect): boolean`：判断包围盒是否相交

<br />

现在我们可以回到我们的代码了，我们修改一下我们的`layout`函数：
```typescript
// ------------------------- binaryTree.ts ------------------------- 

// ...省略代码

layout(node: Element, parent: Element, childIndex?: 0 | 1): Group {
    if(!node) {
        return null;
    }

    // 创建一个Group，并且把该结点加入到这个Group
    let group = this.group(node),
        width = node.width,
        height = node.height;

    // 若该结点存在父节点，则对自身进行布局
    if(parent) {
        node.y = parent.y + this.layoutOption.yInterval + height;

        // 左节点
        if(childIndex === 0) {
            node.x = parent.x - this.layoutOption.xInterval / 2 - width / 2;
        }

        // 右结点
        if(childIndex === 1) {
            node.x = parent.x + this.layoutOption.xInterval / 2 + width / 2;
        }
    }

    // 若该结点存在左右孩子结点，则递归布局
    if(node.children && (node.children[0] || node.children[1])) {
        let leftChild = node.children[0],
            rightChild = node.children[1],
            // 布局左子树，且返回左子树的Group
            leftGroup = this.layout(leftChild, node, 0),
            // 布局右子树，且返回右子树的Group
            rightGroup = this.layout(rightChild, node, 1);
        
        // 处理左右子树相交问题
        if(leftGroup && rightGroup) {
            // 计算包围盒的交集
            let intersection = Bound.intersect(leftGroup.getBound(), rightGroup.getBound());

            // 若左右子树相交，则处理相交
            if(intersection && intersection.width > 0) {
                // 计算移动距离
                let moveDistance = (intersection.width + this.layoutOption.xInterval) / 2;
                // 位移左子树Group
                leftGroup.translate(-moveDistance, 0);
                // 位移右子树Group
                rightGroup.translate(moveDistance, 0);
            }
        }

        // 若存在左子树，将左子树的Group加入到当前Group
        if(leftGroup) {
            group.add(leftGroup);
        }

        // 若存在右子树，将右子树的Group加入到当前Group
        if(rightGroup) {
            group.add(rightGroup)
        }
    }

    // 返回当前Group
    return group;
}

// ...省略代码

```

这样看起来比较保险了。`binaryTree.ts`文件完整代码如下：
```typescript
// ------------------------- binaryTree.ts ------------------------- 

import { Engine } from "./StructV/engine";
import { BTOptions, BinaryTreeOptions } from "./options";
import { Element } from "./StructV/Model/element";
import { Group } from "./StructV/Model/group";
import { Bound } from "./StructV/View/boundingRect";
import { BinaryTreeSources } from "./sources";

/**
 * 二叉树可视化实例
 */
export class BinaryTree extends Engine<BinaryTreeSources, BinaryTreeOptions> {

    constructor(container: HTMLElement) {
        super(container, {
            name: 'BinaryTree',
            defaultOption: BTOptions
        });
    } 

    /**
     * 对二叉树进行递归布局
     * @param node 当前结点
     * @param parent 父节点
     * @param childIndex 左右孩子结点序号（0/1）
     */
    layout(node: Element, parent: Element, childIndex?: 0 | 1): Group {
        if(!node) {
            return null;
        }

        // 创建一个Group，并且把该结点加入到这个Group
        let group = this.group(node),
            width = node.width,
            height = node.height;

        // 若该结点存在父节点，则对自身进行布局
        if(parent) {
            node.y = parent.y + this.layoutOption.yInterval + height;

            // 左节点
            if(childIndex === 0) {
                node.x = parent.x - this.layoutOption.xInterval / 2 - width / 2;
            }

            // 右结点
            if(childIndex === 1) {
                node.x = parent.x + this.layoutOption.xInterval / 2 + width / 2;
            }
        }

        // 若该结点存在左右孩子结点，则递归布局
        if(node.children && (node.children[0] || node.children[1])) {
            let leftChild = node.children[0],
                rightChild = node.children[1],
                // 布局左子树，且返回左子树的Group
                leftGroup = this.layout(leftChild, node, 0),
                // 布局右子树，且返回右子树的Group
                rightGroup = this.layout(rightChild, node, 1);
            
            // 处理左右子树相交问题
            if(leftGroup && rightGroup) {
                // 计算包围盒的交集
                let intersection = Bound.intersect(leftGroup.getBound(), rightGroup.getBound());

                // 若左右子树相交，则处理相交
                if(intersection && intersection.width > 0) {
                    // 计算移动距离
                    let moveDistance = (intersection.width + this.layoutOption.xInterval) / 2;
                    // 位移左子树Group
                    leftGroup.translate(-moveDistance, 0);
                    // 位移右子树Group
                    rightGroup.translate(moveDistance, 0);
                }
            }

            // 若存在左子树，将左子树的Group加入到当前Group
            if(leftGroup) {
                group.add(leftGroup);
            }

            // 若存在右子树，将右子树的Group加入到当前Group
            if(rightGroup) {
                group.add(rightGroup)
            }
        }

        // 返回当前Group
        return group;
    }

    render(elements: Element[], containerWidth: number, containerHeight: number) {
        let nodes = elements,
            node: Element,
            root: Element,
            i;

        // 首先找出根节点
        for(i = 0; i < nodes.length; i++) {
            node = nodes[i];
            
            if(nodes[i].root) {
                root = nodes[i];
                break;
            }
        }
        
        this.layout(root, null);
    }
}
```

<br />

##### Javascript:
代码基本一致，但有几个地方还是要说明一下。像`Engine`，`Bound`等一些模块变量在js版本中被挂载在StructV暴露的全局变量`SV`上，如`SV.Engine`，其余的只需把ts版本的类型删去即可。`binaryTree.js`文件完整代码：
```javascript
// ------------------------- binaryTree.js ------------------------- 

let BTOptions = {
    element: 'dualNode',
    layout: {
        element: {
            size: [80, 40],
            content: '[id]',
            style: {
                stroke: '#000',
                fill: '#9EB2A1'
            }
        },
        link: {
            children: {
                markers: ['circle', 'arrow'],
                contact: [[3, 0], [1, 0]],
                style: {
                    fill: '#000',
                    lineWidth: 2
                }
            }
        },
        xInterval: 60,
        yInterval: 80,
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
 * 二叉树可视化实例
 */
class BinaryTree extends SV.Engine {

    constructor(container) {
        super(container, {
            name: 'BinaryTree',
            defaultOption: BTOptions
        });
    } 

    /**
     * 对二叉树进行递归布局
     * @param node 当前结点
     * @param parent 父节点
     * @param childIndex 左右孩子结点序号（0/1）
     */
    layout(node, parent, childIndex) {
        if(!node) {
            return null;
        }

        // 创建一个Group，并且把该结点加入到这个Group
        let group = this.group(node),
            width = node.width,
            height = node.height;

        // 若该结点存在父节点，则对自身进行布局
        if(parent) {
            node.y = parent.y + this.layoutOption.yInterval + height;

            // 左节点
            if(childIndex === 0) {
                node.x = parent.x - this.layoutOption.xInterval / 2 - width / 2;
            }

            // 右结点
            if(childIndex === 1) {
                node.x = parent.x + this.layoutOption.xInterval / 2 + width / 2;
            }
        }

        // 若该结点存在左右孩子结点，则递归布局
        if(node.children && (node.children[0] || node.children[1])) {
            let leftChild = node.children[0],
                rightChild = node.children[1],
                // 布局左子树，且返回左子树的Group
                leftGroup = this.layout(leftChild, node, 0),
                // 布局右子树，且返回右子树的Group
                rightGroup = this.layout(rightChild, node, 1);
            
            // 处理左右子树相交问题
            if(leftGroup && rightGroup) {
                // 计算包围盒的交集
                let intersection = SV.Bound.intersect(leftGroup.getBound(), rightGroup.getBound());

                // 若左右子树相交，则处理相交
                if(intersection && intersection.width > 0) {
                    // 计算移动距离
                    let moveDistance = (intersection.width + this.layoutOption.xInterval) / 2;
                    // 位移左子树Group
                    leftGroup.translate(-moveDistance, 0);
                    // 位移右子树Group
                    rightGroup.translate(moveDistance, 0);
                }
            }

            // 若存在左子树，将左子树的Group加入到当前Group
            if(leftGroup) {
                group.add(leftGroup);
            }

            // 若存在右子树，将右子树的Group加入到当前Group
            if(rightGroup) {
                group.add(rightGroup)
            }
        }

        // 返回当前Group
        return group;
    }

    render(elements, containerWidth, containerHeight) {
        let nodes = elements,
            node,
            root,
            i;

        // 首先找出根节点
        for(i = 0; i < nodes.length; i++) {
            node = nodes[i];
            
            if(nodes[i].root) {
                root = nodes[i];
                break;
            }
        }
        
        this.layout(root, null);
    }
}
```

<br />

## Step 4
什么？？！！还有Step4？

别慌，主要工作已经完成了，剩下的就是要把我们的成果呈现到浏览器上。
把刚刚编写好的`sources.ts`，`options.ts`，`binaryTree.ts`编译打包为`binaryTree.js`（js版本可以跳过这一步）。

新建一个`binaryTree.html`，写好必要的内容，然后引入StructV核心文件`sv.js`和我们的`binaryTree.js`：
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Document</title>
<style>

* {
    margin: 0;
    padding: 0;
}

#container {
    width: 100vw; height: 600px;
    background-color: #fff;
}

</style>
</head>
<body>

<div id="container"></div>

<script src="./../dist/sv.js"></script>
<script src="./binaryTree.js"></script>

</body>
</html>
```

然后，初始化我们的二叉树实例：
```html
<script>
    let binaryTree = SV.create(document.getElementById('container'), BinaryTree);
</script>
```
使用`SV`上的`create`函数来初始化我们的可视化实例，第一个参数是HTML容器，第二个参数是我们刚刚写好的二叉树可视化实例的类。

<br />

刷新浏览器，噔噔！什么都没有。当然啦，我们还没有输入源数据呢。还记得我们的`BinaryTreeSources`的格式吗，我们随便造几个结点，调用可视化实例上`source`函数输入源数据：
```html
<script>
let binaryTree = SV.create(document.getElementById('container'), BinaryTree);

binaryTree.source([
    { id: 1, children: [2, 3], root: true}, 
    { id: 2, children: [4, 5]}, 
    { id: 3, children: [12, 13] }, 
    { id: 4, children: [6, 9] },
    { id: 5 }, { id: 6 },
    { id: 9, children: [10, 11]},
    { id: 10 },
    { id: 11 },
    { id: 12 },
    { id: 13 }
]);
</script>
```

再次刷新浏览器。。。。如无意外的话：
![](https://github.com/phenomLi/StructV/raw/master/images/GIF.gif)

HERE SHE IS!!

<br />

## 就这样吗？
现在我们把二叉树完整地可视化出来了，然后。。。就这样没了吗？当然不是。

现在我们尝试一下，添加一个按钮，点击按钮，输入一个新的数据：
```html
<button id="btn">输入新数据</button>

<script>
let binaryTree = SV.create(document.getElementById('container'), BinaryTree);

binaryTree.source([
    { id: 1, children: [2, 3], root: true}, 
    { id: 2, children: [4, 5]}, 
    { id: 3, children: [10, 11] }, 
    { id: 4, children: [6, 7] },
    { id: 5 }, 
    { id: 6 },
    { id: 7, children: [8, 9]},
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 }
]);

// 点击按钮输入新数据
document.getElementById('btn').addEventListener('click', () => {
    binaryTree.source([
        { id: 1, children: [2, 3], root: true}, 
        { id: 2, children: [4, 5]}, 
        { id: 3, children: [10, 11] }, 
        { id: 4 },
        { id: 5 }, 
        { id: 7, children: [8, 9]},
        { id: 8 },
        { id: 9 },
        { id: 10, children: [7, null] },
        { id: 11 }
    ]);
});

</script>
```
我们把结点6删去，并且把子树7变为为结点10的左孩子结点。刷新浏览器，点击按钮：
![](https://github.com/phenomLi/StructV/raw/master/images/update.gif)

发生了什么？StructV最大的一个核心功能是可以识别前后两次输入数据的差异，并且动态更新可视化视图。git录制观感较差，实际中动画效果会更平缓优雅。

还有更牛逼更新方式吗？有！现在我们不在点击按钮后重新输入新的数据，我们换一种方式：
```html
<script>

// ...省略代码

let data = binaryTree.source([
    { id: 1, children: [2, 3], root: true}, 
    { id: 2, children: [4, 5]}, 
    { id: 3, children: [10, 11] }, 
    { id: 4, children: [6, 7] },
    { id: 5 }, 
    { id: 6 },
    { id: 7, children: [8, 9]},
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 }
], true); 

document.getElementById('btn').addEventListener('click', () => {
    data[3].children = [null, null];
    data[5] = null;
    data[9].children = [7, null];
});

</script>
```
这次，我们的`source`函数返回了一个`data`变量，然后我们在点击事件中修改`data`的值。再次刷新浏览器，看看效果是不是跟刚刚一样。

`source`函数还可以接受第二个参数，该参数为一个布尔值。若为`true`，则开启源数据代理，返回一个新的被代理后的源数据。只要修改该源数据，StructV便会更新可视化视图。

<br />

## 总结
目前位置，我们已经了解到如何用StructV创建属于自己的数据可视化实例，很简单，只需要3步：
1. **确定源数据格式：定义Sources**
2. **编写默认配置项：定义Options**
3. **为可视化实例编写渲染函数：定义V**

我们可以从这3步中，创建各种各样的可视化例子，链表，数组，广义表，哈希表，图...只要你能想到的，StructV都可以做到，同时还能可视化数据前后的变化过程。

<br />

##### 最后：
> [StructV](https://github.com/phenomLi/StructV) 是一个用于构建数据可视化实例的基础引擎，底层图形库基于zrender。 StructV本身不直接提供可视化功能，而是提供可视化的基础设施和核心功能。使用StructV定制一个数据结构可视化实例，你只需关心视图的布局，剩下的交给StructV即可。一旦可视化实例被构建好，当输入的源数据发生变化时，视图中的元素会以动画形式动态响应数据的变化。

欢迎Star！


