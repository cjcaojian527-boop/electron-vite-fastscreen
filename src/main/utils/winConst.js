import { resolve } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '@resources/icon512.png?asset';

export const getWebPreferences = () => {
    if (is.dev) {
        //开发
        return {
            nodeIntegration: true, // 启用 Node.js 集成
            webSecurity: false,
            devTools: true,// 启用开发者工具
            preload: resolve(__dirname, '../preload'),

        }

    } else {
        // 创建安全窗口的配置模板

        return {
            nodeIntegration: true, // 启用 Node.js 集成
            webSecurity: false,
            devTools: true,// 启用开发者工具
            preload: resolve(__dirname, '../preload'),

        }
        return {
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false
        }
    }
}

export const BaseWindowOptions = {
    // width: 860,
    // height: 530,
    show: false, // 默认不显示，直到准备好
    autoHideMenuBar: true, // 自动隐藏菜单栏
    icon: icon, // **这里设置了任务栏/Dock图标**
    center: false,//窗口是否在屏幕居中显示。 默认值为：false。
    movable: true,//macOS Windows - 窗口是否能被移动。 在 Linux 上未实现。 默认值为： true。
    minimizable: true,// boolean (可选) macOS Windows - 窗口是否能被最小化。 在 Linux 上未实现。 默认值为： true。
    maximizable: true,// boolean (可选) macOS Windows - 窗口是否能被最大化。 在 Linux 上未实现。 默认值为： true。
    closable: true,// boolean (可选) macOS Windows - 窗口能否被关闭。 在 Linux 上未实现。 默认值为： true。
    frame: false,// boolean (可选) - 指定 false 来创建一个 无边框窗口。 默认值为： true。
    // opacity:0,
    backgroundColor: '#f0f0f0',
    // transparent: true,// boolean (可选) - 使得窗口 透明。 默认值为：false。 在Windows上，仅在无边框窗口下起作用。
    //titleBarStyle: 'hidden',
}