import { SourceElement, Sources } from './StructV/sources';

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