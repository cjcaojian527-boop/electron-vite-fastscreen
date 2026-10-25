# 基于 Electron-Vite + React 打造的现代化、高性能桌面录屏工具

An Electron application with React

## 下载安装

Windows 安装包（32 位）v1.0.0：

👉 **[点击下载 FastScreen Windows 版](https://dalanben.live/Preview/downloads/fastscreen-win-ia32-1.0.0.exe)**

> 下载后双击安装即可使用，当前仅提供 Windows 版本。

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

```

##  项目简介



本项目是一款利用 **Electron-Vite** 和 **React 18** 构建的跨平台桌面应用，核心功能是通过 **FFmpeg** 实现高效且灵活的屏幕录制。它旨在提供一个快速、稳定的解决方案，用于捕捉屏幕活动并生成高质量的视频文件。版本：**"electron": "^35.4.0"，node:18.19.0**

## 主要技术栈



- **前端框架:** **React 18** (使用 Vite 快速启动和构建)
- **桌面容器:** **Electron** (实现跨平台的桌面应用)
- **构建工具:** **Vite** (提供极速开发体验和优化构建性能)
- **核心功能:** **FFmpeg** (用于强大的音视频处理和屏幕录制)

## 功能特性



- **高效录制:** 利用 FFmpeg 强大的编码能力，实现低资源占用的屏幕录制。
- **跨平台支持:** 基于 Electron，可打包并运行在 Windows、macOS（音频不支持，需加安装引导程序）系统上。linux暂不考虑
- **现代化界面:** 采用 React 18 编写的用户界面，提供流畅、直观的操作体验。
- **可定制输出:** 支持配置录制区域、帧率（FPS）、编码器等 FFmpeg 参数。
- **录制格式选择:** 支持 MP4, WebM 等多种视频格式输出。

##  使用指南



1. **启动应用:** 双击运行打包好的程序或执行开发命令。
2. **选择区域:** 在应用界面上，选择您希望录制的屏幕区域或窗口。
3. **配置参数:** 根据需要调整视频输出格式、帧率、保存路径等设置。
4. **开始录制:** 点击界面上的 **`开始录制`** 按钮。
5. **停止录制:** 点击托盘图标或应用窗口中的 **`停止`** 按钮，视频文件将自动保存到指定路径。



## electron开发踩过的坑

1.自定义无边框窗口拖拽时在屏幕dpi缩放倍率不是100%的时候  拖拽 窗口 宽高会无限放大，

临时解决方案：如果强行设置app.commandLine.appendSwitch();的缩放指定为1的话 ，就可以不会无限放大，但是会引起不同分辨率的屏幕下的页面内容UI表现不一样 ，还要自己去计算倍率设置响应式的话就会很麻烦

```js
// 强制设置 DPI 缩放比例为 1（等于 Windows 100% 缩放）
app.commandLine.appendSwitch("force-device-scale-factor", "1");
app.commandLine.appendSwitch("high-dpi-support", "1");
```

**最终解决方案**：自定义窗口titlebar的场景，鼠标按住拖动窗口移动位置，进程通信设置BrowserWindow实例的位置的时候，最好要win.setBounds方法设置并且要指定宽高，宽高得是固定的宽高才行，如果说需要改变窗口宽高的话 ，在每次改变后去设置win的实例类的自定义宽高属性，在拖动时就去取这个宽高 这样算是处理了，版本建议： "electron": "^35.4.0",



```js
//无边框窗口拖拽
    ipcMain.on('moveWindow', ({ sender }, { left, top }) => {
        //win.setPosition
        const win = BrowserWindow.fromWebContents(sender);
        const { width, height } = win.options;
        if (win) {
            win.setBounds({ x: left, y: top, width, height });
        }
    });
```

2.全局静态资源引用区分生产和开发环境

例如创建托盘菜单时：

```js

    if (is.dev) {
        var tray = new Tray(path.resolve(__dirname, '../../resources/icon512.png'));
    } else {
        var tray = new Tray(path.resolve(process.resourcesPath, 'resources/icon512.png'));
    }
```

生产环境打包后取的资源路径都是从 app.asar（构建产物，可解压查看）这个源码资源汇总的一个文件里面取的，

![image-20250929111331038](C:\Users\10246\AppData\Roaming\Typora\typora-user-images\image-20250929111331038.png)



所以得process.resourcesPath去取这个路径 拼接完整路径才能获取到图片。





