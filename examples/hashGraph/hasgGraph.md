如果你没有看过第一篇教程，强烈建议先阅读：[ StructV 教程（一）：实现二叉树可视化](https://github.com/phenomLi/Blog/issues/39)

<br />

今天来介绍一个复杂一点的例子：**哈希无向图可视化**，随便引出一点新东西。

我不知道到底有没有“哈希无向图”这种奇奇怪怪的数据结构，我只是想通过引入这种结构：
1. **展示 StructV 具有可视化任何结构的能力**
2. **利用该种结构，能覆盖到我想要介绍的新内容**

首先，先看看我们想要的目标效果：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200330200302.png)

看着不难吧。左边哈希表的每一个值都指向右边无向图的每一个结点，然后无向图里的结点又各有连接。为什么我偏要拿这个结构作为第二篇教程的例子呢，因为该结构有两个特点：
- **哈希表的每个元素的图形（就是两个格子那个），StructV 中没有内置**
- **该结构有两种不同类型的结点（哈希表元素和无向图结点）**

So what should we do ？我们要做的：还行老三样：**1.定义源数据**，**2.编写配置项**，**3.编写可视化实例类**。

<br />

## Step 1

首先，新建 `sources.ts` ，确定我们的 Sources 。注意，现在我们有两种类型的结点了，分别为**哈希表元素**和**无向图结点**，所以对应的 SourcesElement 也有两种。
对于哈希表元素的 SourcesElement ，我们观察最终效果图，不难看出，其只有两个关键的元素，分别是元素的 id（左边格子）和指向图结点的指针（右边格子）。因此我们可以很容易地写出其 SourcesElement 结构：
```typescript
// ------------------------- sources.ts ------------------------- 

import { SourceElement } from './StructV/sources';

interface HashItemSourcesElement extends SourceElement {
    id: number;
    hashLink: { element: string, target: number }
}
```
在这里，我们用 `hashLink` 来命名指向图结点的指针的名称（命名真是一大难题）。观察到，这次我们指针域的值和上一篇的二叉树 `BinaryTreeSourcesElement` 有点不一样了，没有直接填结点的 id ，而是使用了一个 `{ element: string, target: number }` 的对象来描述，为什么要这样呢？

 StructV 是根据一定的规则来处理 SourceElement 的指针域的，如果一个指针域的值为一个 id（或者id组成的数组），例如上一篇的 `BinaryTreeSourcesElement` 的 `children` ：
```typescript
// 一个二叉树结点
{ 
    id: 1, 
    children: [2, 3] 
}
```
那么 StructV 会在同类型的 SourceElement 寻找目标结点。但是现在我们想在不同类型的 SourceElement 中建立指针连线，那么我们就要用 `{ element: string, target: number }` 这样的形式进行声明。其中 `element` 为目标元素的类型名称，`target` 为目标元素的 id 。至于具体应该怎么填，我们之后再做讲解。

<br />

对于无向图的结点，我们观察得到其 SourceElement 也不复杂，同样只含  id ，data（图中的结点的字符不可能为 id ）和其他结点的指针域，那么我们也可以很快写出其具体定义。对于指向图其他结点的指针，这次我们用 `graphLink` 来命名。
```typescript
// ------------------------- sources.ts ------------------------- 

import { SourceElement } from './StructV/sources';

interface GraphNodeSourcesElement extends SourceElement {
    id: number;
    data: string;
    graphLink: number | number[];
}
```
注意，因为所以图节点都只有指向其他图结点的指针，所以 `graphLink` 可以直接用 id（number）表示。我们可以总结一下关于指针连线的指定规则：
- **对于不同类型的 SourceElement 间的指针，需要用包含 `element` 和 `target` 的对象来指定**
- **对于同类型 SourceElement 间的指针，则可以直接使用id表示**

<br />

既然现在我们确定了两个 SourceElement ，那么理应就可以定义 Sources 的结构了。记得第一篇教程我们曾提到过：
> 当有多种类型的 SourcesElement 时，Sources 必须为对象，当只有一种类型的 SourcesElement 时，Sources 便可简写为数组。

在二叉树的例子中，由于只有一种类型的 SourceElement ，因此 Sources 可以定义为一个数组，但是现在，我们必须把 Sources 定义为一个对象：
```typescript
// ------------------------- sources.ts ------------------------- 

export interface HashGraphSources {
    hashItem: HashItemSourcesElement[];
    graphNode: GraphNodeSourcesElement[];
}
```
我们得到我们的 `HashGraphSources` ，其中 `hashItem` 为哈希表元素，`graphNode` 为无向图结点。命名可随意，只要保证到时候输入的数据命名对的上就行。

 `sources.ts` 的[完整代码](https://github.com/phenomLi/StructV/blob/master/examples/hashGraph/hashGraphTs/sources.ts)

<br />



## Step 2

第二步编写默认配置项 Options 。

### Step 2.1

该步骤跟上一篇内容的方法大致相同，但是因为该例子有两种        SourceElement ，因此有一些地方更改和说明。

1. **首先，因为多类型 SourceElement ，因此元素配置项 element 需要从接受 string 改为接受接受一个对象，该对象与 `HashGraphSources` 格式相对应**
2. **其次，对应布局配置项 layout 也需要作一些变化，`element` 的字段需改为元素配置项 element 中对应的字段**
3. **指针连线配置项 link 需添加两种指针连线**

具体应该怎么做？看下面代码：

<br />

新建 `options.ts` 文件，写下以下内容：
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
 `element` 属性现在为一个对象，其中与 `HashGraphSources` 的属性（hashItem，graphNode）一致，分别表示每种 SourceElement 的可视化图形； `layout` 中分别定义 `hashItem` ，`graphNode` 的外观和样式；`link`中分别配置 `HashItemSourcesElement` 中的 `hashLink` 和 `GraphNodeSourcesElement` 中的 `graphLink` 。

之后，就是往里填充内容了。Emmmm。。。慢着，按照最终效果图，显然，无向图中的结点 `graphNode` 是圆形（circle），那么哈希元素项 `hashItem` 是什么图形呢？很遗憾，StructV 中并没有内置这个图形，因此我们要使用它，必须利用 StructV 的自定义图形功能。如何做，我们先放一会再说，现在我们先给这个图形取个好听的名字，那就叫 `hashBlock` 吧。

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
`options.ts`的[完整代码](https://github.com/phenomLi/StructV/blob/master/examples/hashGraph/hashGraphTs/options.ts)

### Step 2.2

这一步我们将创建我们的自定义图形，在效果图里面，我们想要的图形是这样的：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200331151229.png)

看起来一点都不复杂是吧，就是简单的两个正方形拼起来的图形。我们同样希望这样的简单图形在使用 StructV 创建时也同样很容易，很好。创建自定义图形和创建可视化实例类一样，都是通过继承某个基类来完成。

还记得我们给这个图形起了个什么名字吗？新建一个 `hashBlock.ts` 文件，写下以下模板代码：
```typescript
// ------------------------- hashBlock.ts ------------------------- 

import { Composite } from "./StructV/Shapes/composite";
import { BaseShapeOption } from "./StructV/option";


export class HashBlock extends Composite {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);

    }
}
```
StructV 将每个图形都抽象为一个类，所有图形的类统称为 **Shape** 。可以看见父类往子类传递了 3 个参数，分别为图形的 id ，图形的名字和图形的配置项。我们可暂时不必深入了解 Shape  和这 3 个参数的详细作用，只要知道我们的 `hashBlock` 也是一个类，并继承于 **Composite** 。Composite 看字面意思是“组合，复合”的意思，这说明了我们的自定义图形 `hashBlock` 是复合而来的。由什么东西复合？答案是基础图形。在 StructV 中，内置的基础图形如下：
- **Rect 矩形**
- **Circle 圆形**
- **Isogon 正多边形**
- **PolyLine 折线**
- **Curve 曲线**
- **Arrow 箭头**
- **Text 文本**

也许你已经猜到了，我们的自定义图形只能由上述这些基础图形进行组合而成。也就是说，**我们不能创建一种新的基础图形，但是我们可以用这些基础图形组合出一种新图形**。我们称这些组成复合图形的基础图形为该图形的**子图形**。
那么，现在问题就清晰了，创建一个自定义图形，我们只需要知道：
1. 由哪些子图形组合
2. 子图形的外观和样式怎么设置
2. 子图形怎么组合（或者说怎么摆放）

在 Composite 类中，我们提供了 `addSubShape` 方法用作添加子图形。通过在构造函数中调用 `addSubShape` 方法进行子图形的配置：
```typescript
// ------------------------- hashBlock.ts ------------------------- 

import { Composite } from "./StructV/Shapes/composite";
import { BaseShapeOption } from "./StructV/option";


export class HashBlock extends Composite {
    constructor(id: string, name: string, opt: BaseShapeOption) {
        super(id, name, opt);

        // 添加子图形
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
}
```
突然来了这么一大串是不是有点懵。我们来从外到内一步一步剖析这段新加的代码。首先，能看到 `addSubShape` 函数接受了一个对象作为参数，通过观察我们可以抽象出这个参数的结构：
```typescript
interface SubShapes {
    // 子图形的别名
    [key: string]: {
        // 基础图形的名称
        shapeName: string;
        // 初始化子图形的外观和样式
        init: (parentOption: BaseShapeOption, parentStyle: Style) => BaseShapeOption;
        // 布局子图形
        draw: (parent: Shape, subShape: Shape) => void;
    }
}
```
首先这个对象的属性名，如 `cell1`, `cell2` 都是这个子图形的别名，别名可以任取，但是不能重复。其中 `cell1` 就是 `hashBlock` 左边的正方形，同理 `cell2` 就是右边的那个。
然后别名的值也是一个对象，这个对象里面配置了子图形的详细信息，分别是 `shapeName` ，`init` 和 `draw`。其中 `shapeName` 很明显啦就是基础图形的名字，决定了我们要选哪个基础图形作为子图形，例如上面 `cell1` 我们选了 `rect`，即矩形，那当然啦，因为 `hashBlock` 就是两个正方形组成的，因此同理`cell2` 。
重点要讲的是 `init` 和 `draw` ，这两个属性均为函数。 `init` 用作初始化子图形的外观和样式，返回一个 `BaseShapeOption` 类型的值。 `BaseShapeOption` 类型是什么类型？还记得我们的 Options 里面的布局配置项 layout 吗：
```typescript
graphNode: {
    size: number;
    content: string;
    style: Partial<Style>;
};
```
这样的一组配置在 StructV 中称为一个 `BaseShapeOption` 。
此外，`init` 还接受两个参数，分别为父图形的 `BaseShapeOption` 父图形的 `Style` ，子图形可根据这两个参数去配置自身的外观和样式。

> 这样设计的意义何在？StructV 将一个自定义图形（或者说复合图形）视为一个整体对待，因此在配置我们的自定义图形时，图形的配置和样式项即 `BaseShapeOption` 和 `Style` 需要由某一途径传递至子图形，因为子图形（基础图形）才是真正被渲染出来的元素， Composite 只是抽象意义的结构。拿上面的例子来说，我们设置 `hashBlock` 的颜色 `fill: 'red'`，那么可视化引擎怎么知道究竟是把全部矩形设置为红色还是把左边或者右边的矩形设置为红色呢？这时候只要接受父图形的颜色传递下来的颜色根据需要定制即可。这跟 React 单向数据流动的道理是一样的。

 `draw` 函数的作用清晰很多，就是设置子图形的布局。因为子图形的布局需要依赖父图形，因此与 `init` 一样，`draw` 接受两个参数，分别为 `parent` ：父图形实例，`subShape` ：子图形实例。具体布局的计算就不讲解了，相信大家都能看懂，就是简单地把长方形分割为两个正方形而已。

目前为止我们的 `hashBlock` 算是基本完成了，只要我们理解了 `addSubShape` 方法，就可以创建无数的自定义图形。但是慢着，观察我们的效果图，可以发现 `hashBlock` 有一个锚点是位于图形内部的（右边正方形的中心），因此最后我们还需要使用自定义锚点功能。

在自定义图形中通过重写 `defaultAnchors` 方法添加或修改锚点：
```typescript
// ------------------------- hashBlock.ts ------------------------- 

import { Composite } from "./StructV/Shapes/composite";
import { BaseShapeOption } from "./StructV/option";
import { anchorSet } from "./StructV/Model/linkModel";


export class HashBlock extends Composite {

    // ...省略代码

    /**
     * 修改默认锚点
     * @param baseAnchors 默认的5个锚点
     * @param width 图形的宽
     * @param height 图形的高
     */
    defaultAnchors(baseAnchors: anchorSet, width: number, height: number): anchorSet {
        return {
            ...baseAnchors,
            1: [width / 4, 0]
        };
    }
}
```
 `defaultAnchors` 方法接受 3 个参数：`baseAnchors` 默认的 5 个锚点，`width` 图形的宽， `height` 图形的高。并返回一个新的锚点集（anchorSet）。还记得默认的 5 个锚点是哪五个吗？回忆一下这张图：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200326200703.png)
5 个锚点各自有对应的编号，而编号 1 的锚点为图形最右边的锚点。现在，我们在 `defaultAnchors` 中将编号为 1 的锚点重新设置为一个新的值，达到了修改默认锚点的目的。同理可以推断出，如果我们要添加锚点，只要在下面写除（0，1，2，3，4）外的值即可，如：
```typescript
return {
    ...baseAnchors,
    5: [width / 4, height / 4]
};
```
表示我们添加了一个编号为 5 的新锚点。

锚点的值`[width / 4, 0]`指定了锚点的相对位置，相对谁？**相对于图形的几何中心**，即（x，y）。因此，`[width / 4, 0]`表示该锚点的横坐标位于图形水平中心往右偏移`width / 4`，纵坐标位于图形垂直中心的位置，也就是 `hashBlock` 右边正方形的中心。
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200331174210.png)

<br />

大功告成。

`hashBlock.ts`的[完整代码](https://github.com/phenomLi/StructV/blob/master/examples/hashGraph/hashGraphTs/hashBlock.ts)

那么现在我们的 Options 也配置好了， `hashBlock` 也定义好了，顺理成章地，进入第三步。


<br />

## Step 3
到了这步就比较简单了。和之前一样，新建 `hashGraph.ts`文件，并写下我们的模板代码：
```typescript
// ------------------------- hashGraph.ts ------------------------- 

import { Engine } from "./StructV/engine";
import { HashGraphSources } from "./sources";
import { HashGraphOptions, HGOptions } from "./options";
import { ElementContainer } from "./StructV/Model/dataModel";
import { HashBlock } from "./hashBlock";


/**
 * 哈希无向图可视化实例
 */
export class HashGraph extends Engine<HashGraphSources, HashGraphOptions> {

    constructor(container: HTMLElement) {
        super(container, {
            name: 'HashGraph',
            shape: {
                hashBlock: HashBlock
            },
            defaultOption: HGOptions
        });
    } 

    render(elements: ElementContainer) { }
}
```
注意这次不一样的地方。

首先我们需要在构造函数中使用 `shape` 字段注册我们刚刚创建的自定义图形，属性的名称就是图形名称，属性的值为图形的类。使用 `shape` 我们可以一下子注册多个自定义图形。注册后的图形仅在该可视化实例中能使用。
> 假如我们创建了一个很棒的图形，想要在所有可视化实例都能使用，难道每个实例都要注册一遍吗，有什么更好的办法呢？ StructV提供了一个 `RegisterShape` 函数来给用户注册**全局图形**，使用方法为：`RegisterShape(图形类, 图形名称)`。

其次，`render` 函数中的参数 `elements` 的类型由 `Element[]` 改为 `ElementContainer` 。 为什么这次不是 `Element[]` 了？还是那个原因，因为现在我们有多种类型的 SourcesElement 了。 `ElementContainer` 的格式与 Sources 保持一致，比如我们想要访问无向图的结点，只要：
```typescript
let graphNodes = elements.graphNode;
```
即可。

<br />

之后便是编写关于布局的代码了，说实话貌似这次的布局比二叉树还要简单一点，稍微有点难度的便是无向图的那个环形布局，不过幸好StructV提供了向量相关操作的工具 `Vector` 对象，使得运算简化了许多。

关键布局代码如下：
```typescript
// ------------------------- hashGraph.ts ------------------------- 

/**
 * 布局无向图
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
```
这次的布局算法比较简单，我们就不像上次一样详细讲解了，毕竟“如何布局”跟我们本文核心有点偏离，因此我们的只挑一些有意思的来细说：
- `Vector` 是 StructV 内置的一个向量操作工具对象，`Vector.rotation` 功能是计算一个点围绕某个点旋转某个角度后的值。`Vector` 还提供了其他非常有用的方法，比如向量加减，点积叉积求模等
- 和上次一样，这次我们也使用了 Group ，这次使用 Group 的目的是使无向图整体与哈希表保持垂直居中对齐

到了这一步，我们的哈希图可视化实例就基本完成了，之后就是在 html 中检验我们的成果。

`hashGraph.ts`的[完整代码](https://github.com/phenomLi/StructV/blob/master/examples/hashGraph/hashGraphTs/hashGraph.ts)

<br />

## Step 4

打包编译我们的 ts 文件后，新建 `hashGraph.html` ，写下基础的 html代码，引入必须的文件，之后，初始化我们的可视化实例：
```html
// ------------------------- hashGraph.html ------------------------- 

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
<button id="btn">输入新数据</button>

<script src="./../dist/sv.js"></script>
<script src="./hashGraph.js"></script>
<script>

let hashGraph = SV.create(document.getElementById('container'), HashGraph);

</script>

</body>
</html>
```
按照 `HashGraphSources` 的格式，定制我们的 mock 数据。要记住，现在我们有两种 SourcesElement 了，因此 Sources 必须为一个对象：
```html
<script>
hashGraph.source({
    hashItem: [
        { id: 1, hashLink: { element: 'graphNode', target: 1 } }, 
        { id: 2, hashLink: { element: 'graphNode', target: 2 } }, 
        { id: 3, hashLink: { element: 'graphNode', target: 3 } }, 
        { id: 4, hashLink: { element: 'graphNode', target: 4 } },
        { id: 5, hashLink: { element: 'graphNode', target: 5 } }, 
        { id: 6, hashLink: { element: 'graphNode', target: 6 } }
    ],
    graphNode: [
        { id: 1, data: 'a', graphLink: 2 }, 
        { id: 2, data: 'b', graphLink: [3, 4, 5] }, 
        { id: 3, data: 'c', graphLink: 4 }, 
        { id: 4, data: 'd', graphLink: 5 },
        { id: 5, data: 'e', graphLink: 6 }, 
        { id: 6, data: 'f', graphLink: [1, 3] }
    ]
});
</script>
```
刷新浏览器。。。。如无意外的话：
![](https://github.com/phenomLi/StructV/raw/master/images/hash.gif)

之后模拟一下数据更新：
```html
// ------------------------- hashGraph.html ------------------------- 

<script>
document.getElementById('btn').addEventListener('click', () => {
    hashGraph.source({
        hashItem: [
            { id: 1, hashLink: { element: 'graphNode', target: 1 } }, 
            { id: 2, hashLink: { element: 'graphNode', target: 2 } }, 
            { id: 3, hashLink: { element: 'graphNode', target: 3 } }, 
            { id: 4, hashLink: { element: 'graphNode', target: 4 } },
            { id: 5, hashLink: { element: 'graphNode', target: 5 } }
        ],
        graphNode: [
            { id: 1, data: 'a', graphLink: 2 }, 
            { id: 2, data: 'b', graphLink: [3, 4, 5] }, 
            { id: 3, data: 'c', graphLink: 4 }, 
            { id: 4, data: 'd', graphLink: 5 },
            { id: 5, data: 'e', graphLink: 1 }
        ]
    });
});
</script>
```
![](https://github.com/phenomLi/StructV/raw/master/images/hashFirst.gif)

<br />

`hashGraph.html`的[完整代码](https://github.com/phenomLi/StructV/blob/master/examples/hashGraph/hashGraphTs/hashGraph.html)

<br />

## 我们来加点需求
有时候，我们使用可视化，为的只是关注某个或某项数据的情况或变化，并且希望可以用某种方法标注出该项数据，以便更好地进行对比或者观察。比如说，在数据可视化中，某项数据的离群值或者波动比较大，我们可以用一种对比色标注该数据。那么，在 StructV 中，实现这种需求，是可能的吗？

我们先给自己加一个需求。如下图，右边无向图的结点 b 在某种情况下，会失去左边对应哈希表元素 2 对其的指向：
![](https://github.com/phenomLi/StructV/raw/master/images/hahsSecond.gif)

其对应源数据输入如下：
```javascript
// ------------------------- hashGraph.html ------------------------- 

hashGraph.source({
    hashItem: [
        { id: 1, hashLink: { element: 'graphNode', target: 1 } }, 
        { id: 2 }, 
        { id: 3, hashLink: { element: 'graphNode', target: 3 } }, 
        { id: 4, hashLink: { element: 'graphNode', target: 4 } },
        { id: 5, hashLink: { element: 'graphNode', target: 5 } }
    ],
    graphNode: [
        { id: 1, data: 'a', graphLink: 2 }, 
        { id: 2, data: 'b', graphLink: [3, 4, 5] }, 
        { id: 3, data: 'c', graphLink: 4 }, 
        { id: 4, data: 'd', graphLink: 5 },
        { id: 5, data: 'e', graphLink: 1 }
    ]
});
```

现在我们希望**能将使其指向的无向图结点进行标注————变成红色**。

StructV 可以很方便地实现这种需求，具体方法是**扩展 Element** 。我们之前已经介绍过 Element 的概念：
> StructV 会对输入的每一个 SourcesElement 进行重新包装和扩展，这个包装扩展后的 SourcesElement 就称为 Element 。Element 相比 SourcesElement 添加了许多用于布局的属性，同时也保留着 SourcesElement 中原有的属性。

Element 相当于 SourcesElement 包了一层壳，它们的关系如下图所示：
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200331232311.png)

Element 是 StructV 的核心概念，可以说 StructV 的可视化本质就是在操作 Element。每一个 SourcesElement 在输入后都会被包装为一个**匿名 Element**，这意味着，我们可以对某一类 Element 进行进一步扩展。

现在我们要做的是给无向图结点加一点功能，无向图结点的 SourcesElement 叫 graphNode，因此我们就新建一个 `graphNode.ts` 文件，写下一下模板代码：
```typescript
// ------------------------- graphNode.ts ------------------------- 

import { Element } from "./StructV/Model/element";

export class GraphNode extends Element { }
```
和自定义图形一样，我们对 Element 进行扩展也是通过继承来实现，而且是继承 Element 基类。StructV 在 Element 基类上提供了许多事件钩子，如：
- **onLinkTo 当该 Element 通过指针连线连接其余某个图形时触发**
- **onLinkFrom 当该 Element 被其余某个 Element 通过指针连线连接时触发**
- **onUnlinkTo 当该 Element 断开与其余某个 Element 的指针连线连接时触发**
- **onUnlinkFrom 当该 Element 被其余某个 Element 断开指针连线连接时触发**
- **onRefer 当该 Element 被某个外部指针指向时触发**
- **onUnrefer 当该 Element 被某个外部指针取消指向时触发**
- **onChange 当该 Element 发生变化时触发**

按照需求，我们现在要捕捉无向图结点失去指向时的动作，显然应该使用 `onUnlinkFrom` 钩子函数，该函数接受一个 `linkName: string` 参数，该参数表示指针连线的类型。因此，我们解决我们的问题了：
```typescript
// ------------------------- graphNode.ts ------------------------- 

import { Element } from "./StructV/Model/element";

export class GraphNode extends Element { 
    onUnlinkFrom(linkName) {
        if(linkName === 'hashLink') {
            this.style.fill = '#f38181';
        }
    }
}
```
这样就 objk 了吗，看看效果就知道了：
![](https://github.com/phenomLi/StructV/raw/master/images/hashUpdate.gif)

`graphNode.ts` 的[完整代码](https://github.com/phenomLi/StructV/blob/master/examples/hashGraph/hashGraphTs/graphNode.ts)

对了，还有 js 版本的代码，我们把所有的 js 都写在了一个文件里面：`hashGraph.js` 的[完整代码](https://github.com/phenomLi/StructV/blob/master/examples/hashGraph/hashGraph.js)

<br />

## 总结
这是 StructV 教程系列的第二篇文章，也是最后一篇（因为太懒了），我的目标是希望通过这“仅仅”两篇教程，能教会大家如何使用 StructV 来实现自己的可视化（如果有人会看的话😂）。这两篇文章基本覆盖了 StructV 的大部分功能和知识，但是依然做不到面面俱到，有一些小 feature 我还是没有提到。

<br />

##### 最后：
> [StructV](https://github.com/phenomLi/StructV) 是一个用于构建数据可视化实例的基础引擎，底层图形库基于zrender。 StructV本身不直接提供可视化功能，而是提供可视化的基础设施和核心功能。使用StructV定制一个数据结构可视化实例，你只需关心视图的布局，剩下的交给StructV即可。一旦可视化实例被构建好，当输入的源数据发生变化时，视图中的元素会以动画形式动态响应数据的变化。

欢迎Star！


