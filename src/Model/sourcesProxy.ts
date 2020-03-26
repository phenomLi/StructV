import { Engine } from "../engine";




/**
 * 源数据代理器，当某个源数据发生更改时，触发可视化更新
 */
export class SourcesProxy {
    private engine: Engine;
    private revocableObject = null;
    private updateEngineRequest: number = 0;
    private updateEngineDelayCount: number = 0;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    /**
     * 代理一个sources对象
     * @param targetObj 
     */
    proxy<T extends object>(targetObj: T): T {
        Object.keys(targetObj).map(key => {
            if(typeof targetObj[key] === 'object' && targetObj[key] !== null) {
                targetObj[key] = this.proxy(targetObj[key]);
            }
        });
    
        this.revocableObject = Proxy.revocable(targetObj, {
            set: (target: T, key: PropertyKey, value: any) => {
                this.updateEngineRequest++;
                this.updateEngine();
                return Reflect.set(target, key, value);;
            },
            deleteProperty: (target: T, propertyKey: PropertyKey) => {
                this.updateEngineRequest++;
                this.updateEngine();
                return Reflect.deleteProperty(target, propertyKey);
            },
            defineProperty: (target: T, propertyKey: PropertyKey, value: any) => {
                this.updateEngineRequest++;
                this.updateEngine();
                return Reflect.defineProperty(target, propertyKey, value);
            }
        });

        return this.revocableObject.proxy;
    }

    /**
     * 取消代理一个sources对象，当访问或修改被取消后的对象会发生报错
     * @param targetObj 
     */
    revoke<T extends object>(targetObj: T) {
        this.revocableObject.revoke(targetObj);
    }

    /**
     * 更新可视化引擎
     */
    updateEngine() {
        requestAnimationFrame(() => {
            this.updateEngineDelayCount++;

            if(this.updateEngineDelayCount === this.updateEngineRequest) {
                this.engine.source(this.engine.proxySources, true);
                this.updateEngineRequest = this.updateEngineDelayCount = 0;
            }
        });
    }
}







