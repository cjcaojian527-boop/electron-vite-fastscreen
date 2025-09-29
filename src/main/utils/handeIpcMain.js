import { app, BrowserWindow, ipcMain, screen, desktopCapturer, dialog, shell } from 'electron';
import { is } from '@electron-toolkit/utils';
import Rightmenu from '../Rightmenu';
import executeTimes from './times';
import { outputExtname } from './const';
import executeWinTimes from './times/windowindex';
import store from '@store';
import { listDshowDevices, getvideoSrcList, openResource, getFfprobe, getRowData, loadRenderer, convertVideo } from '@util';
import createWindow from './createWindow';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';




export default function () {

    //无边框窗口拖拽
    ipcMain.on('moveWindow', ({ sender }, { left, top }) => {
        //win.setPosition
        const win = BrowserWindow.fromWebContents(sender);
        const { width, height } = win.options;
        if (win) {
            win.setBounds({ x: left, y: top, width, height });
        }
    });

    //进程间通信
    ipcMain.on('render-message', ({ sender }, data) => {
        const fromWin = BrowserWindow.fromWebContents(sender);
        const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === data.toName);
        // console.log(toWin);
        console.log('窗口信息:', data, '是否找到:', !!toWin, '窗口是否是销毁状态:', toWin?.webContents?.isDestroyed());
        if (fromWin && toWin && !toWin.webContents?.isDestroyed()) {
            toWin.webContents.send('render-message', data);
        }
    });

    //最小化
    ipcMain.on('MinusOutlined', ({ sender }) => {
        const win = BrowserWindow.fromWebContents(sender);
        if (win && !win.isMinimized()) {
            win.minimize()
        }
    });


    //失去或者响应鼠标事件
    ipcMain.on('setIgnore', ({ sender }, { isSetIgnore }) => {
        const win = BrowserWindow.fromWebContents(sender);
        if (win) {
            if (isSetIgnore) {
                //忽略鼠标事件
                // console.log('忽略鼠标事件,但是可以转发事件源--');
                win.setIgnoreMouseEvents(true, { forward: true });
            } else {
                // console.log('响应鼠标事件--');
                win.setIgnoreMouseEvents(false);
            }
        }
    });

    //隐藏自己
    ipcMain.on('execute-hide', ({ sender }, params = {}) => {
        //隐藏目标
        if (params.toName) {
            const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === params.toName);
            if (toWin && toWin.isVisible()) {
                toWin.hide()
            }
            return;
        }
        //默认隐藏自己
        const win = BrowserWindow.fromWebContents(sender);
        if (win && win.isVisible()) {
            win.hide()
        }
    });

    //聚焦自己
    ipcMain.on('execute-focus', ({ sender }, params = {}) => {
        //聚焦目标
        if (params.toName) {
            const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === params.toName);
            if (toWin && !toWin.isFocused()) {
                toWin.focus()
            }
            return;
        }
        //默认聚焦自己
        const win = BrowserWindow.fromWebContents(sender);
        if (win && !win.isFocused()) {
            win.focus()
        }
    });


    //临时隐藏关闭自己
    ipcMain.on('close', ({ sender }, params = {}) => {
        if (params.toName) {
            const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === params.toName);
            if (toWin && !toWin.isDestroyed()) {
                toWin.reset();
            }
            return;
        }

        const win = BrowserWindow.fromWebContents(sender);
        if (win && !win.isDestroyed()) {
            win.reset();
        }
    });

    //显示自己
    ipcMain.on('execute-show', ({ sender }, params) => {
        const { isFocus, toName } = params || { isFocus: true };
        if (toName) {
            const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === toName);
            if (toWin && !toWin.isVisible()) {
                toWin.show();
                toWin.moveTop();
                isFocus && toWin.focus();
            }
            return;
        }
        const win = BrowserWindow.fromWebContents(sender);
        if (win && !win.isVisible()) {
            win.show();
            win.moveTop();
            isFocus && win.focus();
        }
    });

    //退出应用
    ipcMain.on('closeApp', ({ sender }) => {
        app.quit();
    });

    // 监听重启应用事件
    ipcMain.on('relaunchApp', () => {
        // 调用 app.relaunch() 重新启动应用
        app.relaunch();
        // 调用 app.quit() 退出当前应用
        app.quit();
    });


    //获取屏幕流
    ipcMain.handle('get-sources', async ({ sender }, params) => {
        const optins = {
            types: ['screen', 'window'],
            // thumbnailSize: { width: 300, height: 200 },
            // fetchWindowIcons: true
        }
        const list = await desktopCapturer.getSources(params || optins);
        // console.log(list);

        return list;
    });

    // 构建右键菜单项
    ipcMain.on('right-click', (ev, data) => {
        //console.log('屏幕信息：', screen.getCursorScreenPoint());
        // console.log({
        //     x: data.x,
        //     y: data.y
        // });
        Rightmenu.popup();

        // Rightmenu.popup({
        //     x: data.x,
        //     y: data.y
        // });
    });
    //进入全屏
    ipcMain.on('enter-fullScreen', ({ sender }) => {
        const win = BrowserWindow.fromWebContents(sender);
        if (win && !win.isFullScreen()) {
            win.setFullScreen(true);//进入全屏
        }
    });

    //执行递增函数
    ipcMain.on('execute-times', (win, params) => {
        if (params.videoType == '3') {
            executeWinTimes(win, params);
        } else {
            executeTimes(win, params);
        }
    });


    // ipcMain.on('execute-times', executeTimes);

    //首次加载倒计时组件
    ipcMain.on('load-timeout', ({ sender }, { toName, fromName }) => {
        const win = BrowserWindow.fromWebContents(sender);
        if (fromName == 'main') {
            win.hide();
        }

        //如果有就直接展示
        const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === toName);
        if (toWin && toWin.webContents.getURL() != 'about:blank') {
            toWin.webContents.send('render-message', { run: 'init-timeout', fromName });
            return;
        }

        //获取当前窗口的边界
        const screenData = screen.getDisplayMatching(win.getBounds());
        const timeoutWin = createWindow(toName);
        loadRenderer(timeoutWin, { hash: 'timeout', query: { fromName } });

        timeoutWin.setSize(screenData.size.width, screenData.size.height);
        timeoutWin.center();
        timeoutWin.setFullScreen(true);//进入全屏
        timeoutWin.on('ready-to-show', () => {
            timeoutWin.show();
        });
    });

    //加载窗口截取组件
    ipcMain.on('load-Croppingpool', ({ sender }, { toName, fromName }) => {
        const win = BrowserWindow.fromWebContents(sender);
        //如果有就直接展示
        const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === toName);
        if (toWin && toWin.webContents.getURL() != 'about:blank') {
            toWin.show();
            return;
        }

        //获取当前窗口的边界
        const screenData = screen.getDisplayMatching(win.getBounds());
        const CropWin = createWindow(toName);
        loadRenderer(CropWin, { hash: 'Cropping' });
        CropWin.setSize(screenData.size.width, screenData.size.height);
        CropWin.center();
        CropWin.setFullScreen(true);//进入全屏
        // CropWin.setAlwaysOnTop(true, 'screen-saver');//设置窗口层级最高
    });



    //首次加载设置组件
    ipcMain.on('load-setuppool', ({ sender }, { toName, fromName, screenSetingData }) => {

        const toWin = BrowserWindow.getAllWindows().find(f => f.props.name === toName);
        if (toWin && toWin.webContents.getURL() != 'about:blank') {
            toWin.show();
            return;
        }

        const setupWin = createWindow(toName);
        loadRenderer(setupWin, { hash: 'setup' });
        setupWin.center();

    });
    //打开文件选择对话框
    ipcMain.handle('showOpenDialog', ({ sender }, params) => {
        const win = BrowserWindow.fromWebContents(sender);

        if (params.defaultPath === 'pictures') {
            params.defaultPath = app.getPath('pictures');
        }
        return dialog.showOpenDialog(win, params);
    });


    ipcMain.handle('pathToBuffer', async ({ sender }, options = {}) => {
        // const win = BrowserWindow.fromWebContents(sender);
        const { path, codeString, isBase64 } = options;
        if (!path) {
            throw new Error('not path!');
            return;
        }

        try {
            const buffer = await fs.promises.readFile(path, codeString);
            if (isBase64) {
                return buffer.toString('base64');
            }
            const mimeType = mime.lookup(path);
            return { buffer, mimeType };

        } catch (error) {
            throw new Error(error);
        }

    });

    //打开文件夹
    ipcMain.handle('openPath', ({ sender }, { path }) => {
        // const win = BrowserWindow.fromWebContents(sender);
        return shell.openPath(path);
    });
    //获取设备
    ipcMain.handle('getlistDshowDevices', async ({ sender }, params) => {
        const win = BrowserWindow.fromWebContents(sender);
        const devices = await listDshowDevices();
        return devices;
    });


    // 获取值
    ipcMain.handle('store:get', (event, key) => {
        return store.get(key);
    });

    // 设置值
    ipcMain.handle('store:set', (event, { key, value }) => {
        store.set(key, value);
        //广播通知更新
        BrowserWindow.getAllWindows().forEach(win => {
            win && !win.webContents?.isDestroyed() && win.webContents.send('updateLocalStore');
        });
        return true;
    });

    // 获取整个 store 对象（JSON）
    ipcMain.handle('store:all', () => {
        return store.store;
    });


    ipcMain.handle('store:setAll', (event, values) => {
        if (!values || Object.keys(values).length == 0) {
            return true;
        }
        store.set(values);
        //广播通知更新
        BrowserWindow.getAllWindows().forEach(win => {
            !win.webContents?.isDestroyed() && win.webContents.send('updateLocalStore');
        });
        return true;
    });


    //获取视频列表信息
    ipcMain.on('getvideoSrcList', ({ sender }, values) => {
        const win = BrowserWindow.fromWebContents(sender);
        getvideoSrcList(store.get('ffmpegData').output, (data) => {
            // console.log('给渲染进程发---',data.format.filename);
            win.webContents.send('render-message-getvideoSrcList', { run: 'getvideoSrcList-callback', data });
        }).then(videoList => {
            win.webContents.send('render-message-getvideoSrcList', { run: 'getvideoSrcList-callback-over', data: videoList });
        });
    });

    // 监听渲染进程发送的视频数据
    ipcMain.on('process-video', async ({ sender }, { ArrayBuffer }) => {
        const win = BrowserWindow.fromWebContents(sender);
        let createTime = Date.now();

        //强行指定格式--因为是浏览器完成的录屏
        let fileType = '.webm';
        let fileName = outputExtname + createTime + fileType;//创建文件名
        let savePath = path.join(store.get('ffmpegData').output, fileName);
        win.webContents.send('render-message', { type: 'navigate', path: '/list', message: "录屏保存中，请勿操作...", loading: true });
        await fs.promises.writeFile(savePath, Buffer.from(ArrayBuffer));

        fileType = store.get('ffmpegData')['outputFormat'] == 'matroska' ? '.mkv' : "." + store.get('ffmpegData')['outputFormat'];
        fileName = outputExtname + createTime + fileType;//创建文件名


        savePath = await convertVideo(savePath, fileType);

        win.webContents.send('render-message', { type: 'hideLoading' });

        const metadata = await getFfprobe(savePath).catch(err => false);
        if (metadata) {
            const row = getRowData(metadata, { fileName, fileType, createTime });
            store.set('videoList', [...store.get('videoList'), row]);
            win.webContents.send('render-message-getvideoSrcList', { run: 'getvideoSrcList-callback', data: row });
        }

    });

    ipcMain.handle('openResource', async ({ sender }, { path: pathname, isDir, options = {} }) => {
        // const win = BrowserWindow.fromWebContents(sender);
        try {
            if (isDir) {
                pathname = path.dirname(pathname);
            }
            await fs.promises.access(pathname, fs.constants.F_OK);
            await openResource(pathname, options);
            return true;
        } catch (error) {
            throw new Error(error);
        }
    });
    ipcMain.handle('fs-rename', async ({ sender }, { oldPath, newPathname }) => {
        // const win = BrowserWindow.fromWebContents(sender);
        try {
            let newPath = path.join(path.dirname(oldPath), newPathname);
            await fs.promises.rename(oldPath, newPath);
            return newPath;
        } catch (error) {
            throw new Error(error);
        }
    });

    ipcMain.handle('fs-unlink', async ({ sender }, { filePath }) => {
        // const win = BrowserWindow.fromWebContents(sender);
        try {
            await fs.promises.unlink(filePath);
            return true;
        } catch (error) {
            throw new Error(error);
        }
    });




}
/*
frameId: 1

含义： 发送此事件的 Web 帧的唯一 ID。

通常用于： 快速识别或定位特定的 Web 帧，尤其是在有多个帧或动态创建帧的情况下。

processId: 4

含义： 发送此事件的渲染器进程 (Renderer Process) 的 ID。这是操作系统级别的进程 ID。

重要性： Electron 应用中的每个 BrowserWindow 都运行在一个单独的渲染器进程中（或共享一个进程，但在上下文隔离下，逻辑上也是独立的）。这个 processId 指的是这个渲染器进程在操作系统中的唯一标识。

通常用于： 调试、监控进程资源使用，或者在极少数需要与操作系统进程直接交互的场景。注意：这个 processId 和 BrowserWindow.id 是不同的概念！ BrowserWindow.id 是 Electron 内部给每个窗口分配的唯一 ID，而 processId 是操作系统给进程分配的 ID。

frameTreeNodeId: 1

含义： 这是 Chromium 内部用于表示帧树结构的一个 ID。在 Web 页面中，iframe 会形成一个帧树。

通常用于： 比较底层或高级的 Chromium 内部调试和操作，对于日常应用开发不常用。

sender: WebContents {}

含义： 这是一个 WebContents 实例，代表了发送此事件的内容区域。每个 BrowserWindow 实例都有一个 webContents 属性，它负责渲染网页内容、处理用户输入等。

重要性： 这是在主进程中最常用的一个属性，因为通过 event.sender，你可以直接与发送消息的渲染进程进行通信，或者获取其所属的 BrowserWindow 实例。

WebContents 实例的常用方法和属性：

event.sender.id: 获取发送消息的 WebContents 的唯一 ID。

event.sender.send(channel, ...args): 向发送此消息的渲染器进程回复消息。

BrowserWindow.fromWebContents(event.sender): 这是最推荐和最安全的方式，用于从 WebContents 实例获取其对应的 BrowserWindow 实例。
*/