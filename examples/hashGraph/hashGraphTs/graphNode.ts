import { Element } from "./StructV/Model/element";


export class GraphNode extends Element {
    onUnlinkFrom(linkName) {
        if(linkName === 'hashLink') {
            this.style.fill = '#f38181';
        }
    }
}