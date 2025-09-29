# nodejs中使用ffmpeg



#### 背景：`Electron`实现了一个自己的录屏软件

#### 介绍：`FFmpeg` 是一个非常强大的 **开源音视频处理工具库**

是一个可以 **录制、转换、编辑、流式传输音视频** 的工具和库集合。它包括命令行工具（`ffmpeg`）和多个底层开发库（如 `libavcodec`、`libavformat` 等）。

#### 环境：node: 'v18.19.0'   npm: '10.2.3' 

#### npm地址包：https://www.npmjs.com/package/zyjj-ffmpeg-static



#### FFmpeg 包含哪些主要库？

| 库名            | 作用                                     |
| --------------- | ---------------------------------------- |
| `libavcodec`    | 处理编解码（比如 H.264、AAC）            |
| `libavformat`   | 处理多媒体封装格式（如 MP4、FLV、MKV）   |
| `libavfilter`   | 音视频滤镜处理（如加水印、转灰度、裁剪） |
| `libswscale`    | 视频图像缩放与格式转换                   |
| `libswresample` | 音频采样率/格式转换                      |
| `libavutil`     | 提供通用工具函数（如时间戳、数学运算等） |

#### FFmpeg 的优势：

- 免费开源，支持平台多（Windows、Linux、macOS）
- 支持的格式和编解码器非常全面
- 社区活跃，文档丰富
- 可用于后端媒体服务器、桌面软件、命令行工具、移动端和浏览器 WASM 实现



## ffmpeg各插件简介

**ffmpeg插件**：这是真正的录屏插件，windows系统中以exe可执行文件形式存在，其它所有插件都是围绕它开发。

**@ffmpeg-installer/ffmpeg插件**：一个维护下载ffmpeg的插件，可以帮助我们便捷地下载更新对应版本的ffmpeg，并且在下载后，可以暴露出exe可执行文件的地址，方便我们操作ffmpeg。一般情况下，我们只需要使用@ffmpeg-installer/ffmpeg插件，就可以不用直接下载ffmpeg插件了。

**ffmpeg-static插件**：功能类似于上面的插件，但是实现原理不同，在ffmpeg-static插件中，自带某个版本的ffmpeg，ffmpeg-static插件并不提供下载维护ffmpeg的功能，但是下载ffmpeg-static，就会顺带下载ffmpeg，并帮助我们完成一些基础工作，引入ffmpeg-static插件也可以直接获取ffmpeg插件的地址，方便我们操作。

**fluent-ffmpeg插件**：正常操作ffmpeg是通过命令行的方式，ffmpeg-static插件把命令行的方式做了一层封装，让我们可以通过api的形式调用ffmpeg，写代码更简单方便一些。

## 安装

## `fluent-ffmpeg` 和 `ffmpeg-static` 的关系

### ✅ `fluent-ffmpeg`

- 是一个 **Node.js 封装库**，用于构造并运行 FFmpeg 命令（比如转码、加水印、裁剪等）。
- 但它 **本身不包含 FFmpeg 可执行程序**，它 **依赖本地安装好的 FFmpeg**（或手动指定路径）。
- 默认行为是查找 `ffmpeg` 命令（依赖系统环境变量 `PATH`）。

### ✅ `ffmpeg-static`

- 是一个 **提供平台对应 FFmpeg 可执行文件的 npm 包**，也就是说：
  - 安装后，你就有了 Windows/Mac/Linux 下的 `ffmpeg.exe` 等二进制文件。
  - 你可以用 `require('ffmpeg-static')` 获取这个可执行文件的绝对路径。

####  二者结合使用 = ✅ 不再依赖用户手动安装 FFmpeg！

```js
//所以安装时fluent-ffmpeg和ffmpeg-static搭配使用可以跨平台
1.  npm i ffmpeg-static
2.  npm i fluent-ffmpeg

```

## 安装时出现的问题

1. ### `ffmpeg-static` 下载二进制文件超时的问题

​    解决方案：通过设置 `FFMPEG_BINARIES_URL` 环境变量来使用自定义的二进制文件下载 URL

```js
//在CMD 窗口中去设置
//临时设置环境变量 (推荐，因为只影响当前会话)
//这种方法只在当前命令行窗口会话中生效，当你关闭命令行窗口后，环境变量就会失效。
set FFMPEG_BINARIES_URL=https://cdn.npmmirror.com/binaries/ffmpeg-static
npm install ffmpeg-static


//安装成功后我这里安装的是："ffmpeg-static": "^5.2.0"  "fluent-ffmpeg": "^2.1.3"
```

