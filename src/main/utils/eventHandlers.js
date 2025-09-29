//eventHandlers.js
import { app } from 'electron';


/**
 * 注册 Electron app 实例的事件监听器。
 * 这是一个集中管理 Electron 生命周期事件的地方。
 */
export function registerAppEventHandlers() {
    // app.on('ready') 事件处理器
    // 注意：在 electron-vite 模板中，通常由 `createWindow` 函数处理 `app.whenReady().then(...)`
    // 如果你在这里监听 `ready`，确保没有重复逻辑。
    // 一般，我们更倾向于在 `whenReady()` 之后才开始创建窗口和设置IPC。
    app.on('ready', () => {
        console.log('App is ready!');
        // 可以在这里执行一些依赖app ready状态的初始化操作
       
       // app.commandLine.appendSwitch('force-device-scale-factor', '1');
    });

    // app.on('window-all-closed') 事件处理器
    app.on('window-all-closed', () => {
        console.log('[App Event] All windows closed.');
        // 除了 macOS，在所有其他操作系统上，当所有窗口都关闭时，通常会退出应用程序。
        // macOS 上，应用及其菜单栏会保持激活状态，直到用户使用 Cmd + Q 显式退出。
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    // app.on('before-quit') 事件处理器
    app.on('before-quit', (event) => {
        console.log('[App Event] Before quit.');
        // 可以在这里执行清理操作，例如保存用户数据
        // 如果需要阻止退出，可以调用 event.preventDefault();
        // event.preventDefault();
    });

    // app.on('will-quit') 事件处理器
    app.on('will-quit', () => {
        console.log('[App Event] Will quit.');
        // 在所有窗口都已关闭，且应用程序即将退出时触发。
        // 这通常是执行最终清理的地方。
    });

    // app.on('activate') 事件处理器 (仅 macOS)
    // 在 macOS 上，当 dock 图标被点击且没有其他窗口打开时，
    // 通常会重新创建一个窗口。
    app.on('activate', () => {
        //console.log('[App Event] App activated (macOS).');
        // if (BrowserWindow.getAllWindows().length === 0) {
        //     // 如果主窗口不存在，这里可以重新创建一个
        //     // 你可能需要将 createWindow 函数传入或者直接在这里调用
        //     // 例如：if (!mainWindow || mainWindow.isDestroyed()) { createWindow(); }
        //     console.warn('[App Event] No windows open, consider re-creating one.');
        // }
    });

    // app.on('open-url') 事件处理器 (自定义协议处理，macOS/Windows)
    app.on('open-url', (event, url) => {
        // event.preventDefault(); // 阻止默认行为
        // console.log(`[App Event] Open URL: ${url}`);
        // dialog.showErrorBox('Open URL', `You tried to open: ${url}`);
        // 可以在这里处理自定义协议的逻辑，例如根据 URL 打开特定页面或执行操作
    });

    // app.on('second-instance') 事件处理器 (单实例应用)
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        //console.log('[App Event] Second instance detected.');
        // 当第二个实例尝试启动时，此事件在主实例中触发。
        // 通常你会让主实例的窗口聚焦。

    });

    // 禁用默认的安全警告 (如果你的项目需要，但请注意安全风险)
    // 尽管你已经在主进程文件中设置了环境变量，但在这里也可以再次强调或通过编程方式确认
    // if (is.dev) {

    // }

    // 监听 Electron-toolkit 的 ipcMain 事件
    // 如果你的 IPC 逻辑也想在这里集中管理，可以在此添加
    // ipcMain.on('some-event', (event, arg) => { console.log(arg); });
}