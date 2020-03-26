"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 源数据代理器，当某个源数据发生更改时，触发可视化更新
 */
class SourcesProxy {
    constructor(engine) {
        this.revocableObject = null;
        this.updateEngineRequest = 0;
        this.updateEngineDelayCount = 0;
        this.engine = engine;
    }
    /**
     * 代理一个sources对象
     * @param targetObj
     */
    proxy(targetObj) {
        Object.keys(targetObj).map(key => {
            if (typeof targetObj[key] === 'object' && targetObj[key] !== null) {
                targetObj[key] = this.proxy(targetObj[key]);
            }
        });
        this.revocableObject = Proxy.revocable(targetObj, {
            set: (target, key, value) => {
                this.updateEngineRequest++;
                this.updateEngine();
                return Reflect.set(target, key, value);
                ;
            },
            deleteProperty: (target, propertyKey) => {
                this.updateEngineRequest++;
                this.updateEngine();
                return Reflect.deleteProperty(target, propertyKey);
            },
            defineProperty: (target, propertyKey, value) => {
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
    revoke(targetObj) {
        this.revocableObject.revoke(targetObj);
    }
    /**
     * 更新可视化引擎
     */
    updateEngine() {
        requestAnimationFrame(() => {
            this.updateEngineDelayCount++;
            if (this.updateEngineDelayCount === this.updateEngineRequest) {
                this.engine.source(this.engine.proxySources, true);
                this.updateEngineRequest = this.updateEngineDelayCount = 0;
            }
        });
    }
}
exports.SourcesProxy = SourcesProxy;
