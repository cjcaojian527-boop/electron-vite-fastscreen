import { app } from 'electron';
import log from 'electron-log';
import path from 'path';

// 获取应用程序的安装路径
const appPath = app.getPath('exe');

//是一个用于 Electron 应用程序的环境变量。当你将这个环境变量设置为 "true" 时，它会禁用 Electron 中的安全警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
// 修改 Chromium 命令行参数--ssl证书错误
app.commandLine.appendSwitch('ignore-certificate-errors');
// 设置解决跨域
app.commandLine.appendSwitch('disable-web-security');

//使用`win.hide()`后再`win.show()`会引发窗口闪烁的问题，并提供了通过`app.commandLine.appendSwitch(wm-window-animations-disabled)`
// 来禁用窗口动画以防止闪烁的解决方案。
app.commandLine.appendSwitch('wm-window-animations-disabled');
// app.commandLine.appendSwitch('remote-debugging-port', '9222');


app.commandLine.appendSwitch('disable-bluetooth');       // 禁用蓝牙
app.commandLine.appendSwitch('disable-print-preview');   // 禁用打印预览
app.commandLine.appendSwitch('disable-pdf-extension');   // 禁用 PDF  
app.commandLine.appendSwitch('disable-component-update'); // 禁止自动更新组件  
app.commandLine.appendSwitch('disable-crash-reporter');   // 禁用崩溃报告
app.commandLine.appendSwitch('disable-extensions');       // 禁用 Chromium 扩展




// 指定日志文件路径（默认是用户目录下的 AppData/logs）
log.transports.file.resolvePathFn = () => {
  // 打印路径到控制台，以便你可以看到它
  return path.resolve(appPath, '../', 'log.txt');  // 你想保存的路径
}

log.transports.file.level = 'debug';
// 打印路径到控制台，以便你可以看到它


// 重写 console 方法，让所有 console.* 都写入 electron-log
console.log = (...args) => log.info(...args);
console.info = (...args) => log.info(...args);
console.warn = (...args) => log.warn(...args);
console.error = (...args) => log.error(...args);
console.debug = (...args) => log.debug(...args);






(() => {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    // 已经有一个实例在运行，退出当前实例
    app.quit();
  } else {

    import('./utils/eventHandlers').then(({ registerAppEventHandlers }) => registerAppEventHandlers());

    //app启动后
    app.whenReady().then(async () => {
      const { default: renderApp } = await import('./home/initApp');
      renderApp();
    });

  }

})();




