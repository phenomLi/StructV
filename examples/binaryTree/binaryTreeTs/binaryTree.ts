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
