



export const EventEmitter = {
    // 以引擎为单位区分事件（引擎id作为标识）
    eventTable: {},

    /**
     * 监听事件
     * @param id 
     * @param eventName 
     * @param event 
     */
    listen(id: number, eventName: string, event: (param: any) => void) {
        if(typeof event !== 'function') return;

        if(EventEmitter.eventTable[id] === undefined) {
            EventEmitter.eventTable[id] = {};
        }
        
        EventEmitter.eventTable[id][eventName] = event;
    },  

    /**
     * 触发事件
     * @param id 
     * @param eventName 
     * @param param 
     */
    emit(id: number, eventName: string, param?: any) {
        if(EventEmitter.eventTable[id] && EventEmitter.eventTable[id][eventName]) {
            EventEmitter.eventTable[id][eventName](param);
        } 
    }
}


