import { BrowserWindow } from 'electron';
import { getWebPreferences, BaseWindowOptions } from './winConst';
import { getWinOptions } from './pools';
// import path from 'path';
// import { is } from '@electron-toolkit/utils';

/**
 * 创建一个 BrowserWindow 实例，并应用默认配置和事件监听。
 * @param {{ options: object, url: string, name: string }} props - 窗口属性，包含选项、URL 和名称。
 * @returns {BrowserWindow} 返回一个 BrowserWindow 实例。
 */
export default function createWindow(name) {
    let { options = {}, ...props } = getWinOptions(name);
    // 准备 webPreferences 配置
    if (options?.webPreferences) {
        options.webPreferences = { ...getWebPreferences(), ...options.webPreferences };
    } else {
        options.webPreferences = getWebPreferences();
    }
    options = { ...BaseWindowOptions, ...options };

    // 创建 BrowserWindow 实例
    const win = new BrowserWindow(options);


    // 为实例添加自定义属性
    win.props = props;
    win.options = options;
    win.destroyTimeout = null;
    let resizeTimer = null;

    // 绑定事件监听器
    const EventLister = () => {
        win.webContents.on('context-menu', (e) => {
            e.preventDefault();
        });
        // 这里可以继续添加其他事件监听器...
        win.on('ready-to-show', () => {
            // console.log('Window is ready to show');
        }).on('restore', () => {
            //当窗口从最小化状态恢复时触发
            //    if(options.resizable)
        }).on('show', () => {
            if (win.destroyTimeout) {
                clearTimeout(win.destroyTimeout);
            }

        }).on('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // console.log(win.getSize());
                const [w, h] = win.getSize();
                if (win.isResizable() && win.isMovable()) {
                    //是否可以手动调整窗口大小
                    win.options.width = w;
                    win.options.height = h;
                }
            }, 500);
        });
    };
    EventLister();
    //win.webContents.on('dom-ready', () => {
    // 在渲染进程中执行 JavaScript 脚本
    //win.webContents.executeJavaScript(SCRIPTCODE1)
    //});


    win.reset = () => {
        if (win.isVisible()) {
            win.hide();
        }
        if (win.destroyTimeout) {
            clearTimeout(win.destroyTimeout);
        }
        win.destroyTimeout = setTimeout(() => {
            if (!win.isDestroyed()) {
                win.destroy();
            }
        }, 60000);
    }

    return win;
}

//实例方法
//https://www.electronjs.org/zh/docs/latest/api/browser-window#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95