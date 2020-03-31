# StructV
![](https://github.com/phenomLi/StructV/raw/master/images/微信截图_20200319160620.png)

<br />

### 简介
**StructV**是一个用于构建数据可视化实例的基础引擎，底层图形库基于[zrender](https://github.com/ecomfe/zrender)。 StructV本身不直接提供可视化功能，而是提供可视化的基础设施和核心功能。使用StructV定制一个数据结构可视化实例，你只需关心视图的布局即可，剩下的交给StructV即可。一旦可视化实例被构建好，当输入的源数据发生变化时，视图中的元素会以动画形式**动态响应**数据的变化。

<br />

### 使用教程

[可视化二叉树](https://github.com/phenomLi/Blog/issues/39)

<br />

### Feature
- **Canvas渲染**
- **编写组件语法，易于上手**
- **两种响应式动态更新方式：函数输入和代理**
- **自动处理连接线，指针**
- **自动居中布局**
- **多种内置图形（Rect, Circle, Isogon, Line, Curve, PolyLine, Arrow, Node...）**
- **自定义复合图形（Composite）**
- **丰富的配置项，可随意定制可视化视图**
- **多种锚点模式：内置锚点，自定义锚点，甚至动态锚点**
- **动画防抖算法**
- **图形复用算法**
- **标签避让算法**
- **连接线避让算法**
- **生命周期钩子**

<br />

### TODO
- 交互模块
