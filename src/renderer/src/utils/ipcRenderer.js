//ipc通信模块


const ErrorFn = (EventString, params = "") => {
    console.warn('NODEAPI is not defined~', EventString);
};

export default {
    IpcSend: (EventString, params) => {
        // console.log(EventString)
        return NODEAPI?.ipcRenderer?.send(EventString, params) || ErrorFn(EventString, params);
    },
    IpcPostMessage: (EventString, params) => {
        return NODEAPI?.ipcRenderer?.postMessage(EventString, params) || ErrorFn(EventString, params);
    },
    IpcHandelEvent: (EventString, params) => {
        return NODEAPI?.ipcRenderer?.on(EventString, params) || ErrorFn(EventString, params);
    },
    IpcHandelEventOnce: (EventString, params) => {
        //不再使用on 而是once
        return NODEAPI?.ipcRenderer?.once(EventString, params) || ErrorFn(EventString, params);
    },
    RemoveListener: (EventString, func, params) => {
        NODEAPI?.ipcRenderer?.removeListener(EventString, func) || ErrorFn(EventString, params);
    },
    Invoke: (EventString, params) => {
        return NODEAPI?.ipcRenderer?.invoke(EventString, params) || ErrorFn(EventString, params);
    },
}


