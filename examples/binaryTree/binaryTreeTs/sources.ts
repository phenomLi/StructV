import { SourceElement } from './StructV/sources';

interface BinaryTreeSourcesElement extends SourceElement {
    id: string | number;
    data: any;
    leftChild: string | number;
    rightChild: string | number;
}


export type BinaryTreeSources = Array<BinaryTreeSourcesElement>;