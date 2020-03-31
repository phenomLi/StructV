import { Engine } from "../engine";
/**
 * 源数据代理器，当某个源数据发生更改时，触发可视化更新
 */
export declare class SourcesProxy {
    private engine;
    private revocableObject;
    private updateEngineRequest;
    private updateEngineDelayCount;
    constructor(engine: Engine);
    /**
     * 代理一个sources对象
     * @param targetObj
     */
    proxy<T extends object>(targetObj: T): T;
    /**
     * 取消代理一个sources对象，当访问或修改被取消后的对象会发生报错
     * @param targetObj
     */
    revoke<T extends object>(targetObj: T): void;
    /**
     * 更新可视化引擎
     */
    updateEngine(): void;
}
