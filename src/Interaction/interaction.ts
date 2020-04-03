import { Element } from "../Model/element";
import { GlobalShape } from "../View/globalShape";




/**
 * 交互模块基类
 */
export class Interaction {
    private name: string;
    private elementList: Element[] = [];
    private globalShape: GlobalShape = null;

    // constructor(elementList: Element[], globalContainer: ViewContainer) {
    //     this.elementList = elementList;
    //     this.globalContainer = globalContainer;
    // }


    trigger() {

    }

    feedback() {

    }
}