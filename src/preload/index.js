import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload';
// import store from '../main/store';


const api = {
  // 暴露 store 的 get 方法
  //storeGet: (key) => store.get(key),
  // 暴露 store 的 set 方法
  //storeSet: (key, value) => store.set(key, value),
  // 暴露 ipcRenderer 的 on 方法
  onGet: (eventStr, callback) => ipcRenderer.on(eventStr, (ev, res) => callback(res, ev)),
};


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('NODEAPI', { ...electronAPI, ...api });
  } catch (error) {
    console.error(error)
  }
} else {
  window.NODEAPI = { ...electronAPI, api };
}
