import API from '@/utils/ipcRenderer';
import { BasicState } from '@/store/base';
import { grab, grabbing, outputExtname } from './const';
import { ffmpegData as frontStore } from '@/store/ffmpegOptins';

let updateServeStore_timer = null;

//获取数据更新本地
export const updateLocalStore = () => {
    API.Invoke('store:all').then((res) => {
        console.log('updateLocalStore:', res);
        if (Object.keys(res).length == 0) {
            alert('程序配置为空！程序退出');
            API.IpcSend('closeApp');
            return;
        }
        const { ffmpegData, videoList, audioInputOptions, videoType, streamID } = res;
        if (ffmpegData && videoList) {
            //设置视频相关
            frontStore._setAll({ ...ffmpegData, videoList });
        }

        if (audioInputOptions) {
            //设置音频相关
            BasicState.audioInputOptions = audioInputOptions;
        }

        if (videoType) {
            BasicState.videoType = videoType;
        }
        if (streamID) {
            BasicState.streamID = streamID;
        }

    });
}


//更新主进程store数据
export const updateServeStore = (isTimeout) => {


    if (isTimeout) {
        clearTimeout(updateServeStore_timer);
        updateServeStore_timer = setTimeout(() => {
            const { videoList, ...ffmpegData } = frontStore._getAll();
            API.Invoke('store:setAll', { videoList, ffmpegData, "videoType": BasicState.videoType, "streamID": BasicState.streamID }).then((res) => {
                console.log('updateServeStore:', res);
            });
        }, 1000);
    } else {
        const { videoList, ...ffmpegData } = frontStore._getAll();
        API.Invoke('store:setAll', { videoList, ffmpegData, "videoType": BasicState.videoType, "streamID": BasicState.streamID }).then((res) => {
            console.log('updateServeStore:', res);
        });
    }

}


//更新主进程store数据-item
export const updateServeStoreItem = (key, value) => {
    API.Invoke('store:set', { key, value: deepClone(value) }).then(res => {
        console.log('updateServeStoreItem:', res);
    });
}
//获取数据item
export const GetServeStoreItem = (key) => {
    return API.Invoke('store:get', key);
}

//创建录像机
export class CreateMediaRecorder extends MediaRecorder {

    constructor(mediaStream, options) {

        super(mediaStream, options);

        this.options = options;

        this.mediaStream = mediaStream;

        this.videoBuffer = [];

        this.init();


    }


    init() {
        this.ondataavailable = function (e) {
            if (e.data.size > 0) {
                //console.info("视频数据可用", e);
                this.videoBuffer.push(e.data)
            }
        }


        this.onstart = function () {
            console.log('浏览器录屏start');
        }
        this.onstop = function () {
            console.log('浏览器录屏sotp');
        }

        //暂停
        this.onpause = function () {
            console.log('浏览器录屏pause');
        }
        //继续
        this.onresume = function () {
            console.log('浏览器录屏resume');
        }


        this.onerror = function () {
            console.error('浏览器录屏error');
        }
    }
    //start(timeslice?) → 开始录制，如果传了 timeslice（毫秒），会定期触发 ondataavailable。

    //stop() → 停止录制，并触发最后一块数据。

    //pause() / 
    // //resume() → 暂停和恢复录制。

    //开始
    startRecord() {
        this.start(1000) //每隔1s保存一下
    }


    //结束
    stopRecord() {
        if (this.state !== 'inactive') {
            this.stop();
        }
    }

    download() {
        if (this.videoBuffer == null || this.videoBuffer.length == 0) {
            return null;
        }
        let blob = new Blob(this.videoBuffer, {
            type: "video/webm"
        });

        // 创建一个 Promise 来读取 Blob 数据
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // reader.result 就是 ArrayBuffer
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }

    clear() {
        this.videoBuffer = null;
        if (this.mediaStream) {
            for (let track of this.mediaStream.getTracks()) {
                track.stop()
            }
            this.mediaStream = null;
        }
    }
}
//获取流
export const getMedia = (item) => {
    const constraints = {
        // 只捕获视频，不捕获音频
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: item.id,
            }
        }
    };

    return navigator.mediaDevices.getUserMedia(constraints);
}


export const moveTo = ({ nativeEvent, width: w, height: h }) => {

    const { target: { nodeName } } = nativeEvent;
    if (nodeName !== 'DIV') return;
    // console.log({ nativeEvent, w, h, nodeName });
    window.isDragging = true;
    // console.log(nativeEvent);
    document.body.style.cursor = `url(${grabbing}) 10 10, auto`;
    //document.body.style.cursor = "grabbing";//all-scroll  grab grabbing

    // 1. 记录鼠标按下时的屏幕坐标
    let initialMouseX = nativeEvent.screenX;
    let initialMouseY = nativeEvent.screenY;


    // 2. 记录窗口当前的屏幕坐标
    let initialWindowX = window.screenLeft; // 或者 window.screenX
    let initialWindowY = window.screenTop;  // 或者 window.screenY



    const onMousemove = e => {
        //按住移动
        if (window.isDragging) {

            let width = w || parseInt(window.outerWidth);
            let height = h || parseInt(window.outerHeight);

            // 3. 计算鼠标在X轴和Y轴上移动的距离
            // delta = 鼠标当前位置 - 鼠标初始位置
            const deltaX = e.screenX - initialMouseX;
            const deltaY = e.screenY - initialMouseY;

            // 4. 计算窗口的新位置
            // 新的窗口X = 窗口初始X + 鼠标移动的X距离
            // 新的窗口Y = 窗口初始Y + 鼠标移动的Y距离
            const newWinX = initialWindowX + deltaX;
            const newWinY = initialWindowY + deltaY;
            // console.log(newWinX, newWinY);
            API.IpcPostMessage('moveWindow', { left: newWinX, top: newWinY, width, height });
        }
    }
    //鼠标抬起
    const onMouseup = () => {
        window.isDragging = undefined;
        document.body.style.cursor = `url(${grab}) 10 10, auto`;
        // document.body.style.cursor = "grab";
        document.removeEventListener('mousemove', onMousemove);
        document.removeEventListener('mouseup', onMouseup);
    }

    // 将mousemove和mouseup事件监听器添加到document上
    document.addEventListener('mousemove', onMousemove);
    document.addEventListener('mouseup', onMouseup);


}
/**
 * 将秒数转换为 00:00 格式的字符串
 * @param {number} seconds - 要转换的秒数
 * @returns {string} - 格式化后的时间字符串，例如 "05:30"
 */
export function formatTime(seconds) {
    // 确保输入是数字且非负
    if (typeof seconds !== 'number' || seconds < 0) {
        return '00:00';
    }

    // 计算分钟数和秒数
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // 使用 padStart() 方法确保数字始终是两位数
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

export const formatTimestamp = timestamp => {
    // 确保时间戳是数字类型
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

    // 检查时间戳长度，判断是秒还是毫秒
    // 如果时间戳小于 13 位，通常是秒，需要乘以 1000
    const date = new Date(ts < 10000000000 ? ts * 1000 : ts);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 唤醒浏览器颜色选取器并以 Promise 方式返回颜色值。
 * 如果用户取消，Promise 将被 reject。
 * @returns {Promise<string>} 一个 Promise，当用户选择颜色后，该 Promise 被 resolve，并返回一个表示十六进制颜色的字符串。
 */
export function pickColor() {
    return new Promise((resolve, reject) => {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.style.display = 'none';

        // 监听颜色变化事件
        const handleChange = (event) => {
            resolve(event.target.value);
            // 清理 DOM 和事件监听器
            cleanUp();
        };

        // 监听 blur 事件来处理用户取消操作
        const handleBlur = () => {
            // 检查是否是因为点击了颜色选择器而失去焦点，如果不是，则视为取消
            // 这里可以根据实际情况添加更复杂的逻辑来判断是否是取消操作
            // 简单起见，这里假设失去焦点就是取消
            reject(new Error('用户取消了颜色选择。'));
            cleanUp();
        };

        // 清理函数，移除 DOM 元素和所有监听器
        const cleanUp = () => {
            colorInput.removeEventListener('change', handleChange);
            colorInput.removeEventListener('blur', handleBlur);
            if (document.body.contains(colorInput)) {
                document.body.removeChild(colorInput);
            }
        };

        // 将 input 元素添加到 DOM
        document.body.appendChild(colorInput);

        // 触发点击事件
        colorInput.click();


    });
}


/**
 * 唤醒浏览器取色器，返回 Promise。
 * 只能从当前浏览器窗口内取色。
 * @returns {Promise<string>} 一个 Promise，当用户选择颜色后 resolve，并返回一个十六进制颜色字符串。
 */
export function pickColorWithEyeDropper() {
    // 检查浏览器是否支持 EyeDropper API
    if (!('EyeDropper' in window)) {
        return Promise.reject(new Error('你的浏览器不支持 EyeDropper API。'));
    }
    const eyeDropper = new EyeDropper();
    // open() 方法返回一个 Promise
    return eyeDropper.open();
}
/**
 * 获取URL中的查询参数，并返回一个对象。
 * 对于多次出现的同名参数，值会以数组形式返回。
 * @param {string} url - 可选，要解析的URL字符串，默认为当前页面URL。
 * @returns {object} - 包含所有URL参数的对象。
 */
export function getUrlParams(url = window.location.href) {
    // 1. 找到查询字符串部分
    const urlParts = url.split('?');
    if (urlParts.length < 2) {
        return {}; // 没有查询参数
    }

    // 处理可能存在的哈希（#）
    const queryString = urlParts[1].split('#')[0];

    // 2. 使用 URLSearchParams API（现代浏览器）
    try {
        const searchParams = new URLSearchParams(queryString);
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            // 检查是否已经存在该参数
            if (params.hasOwnProperty(key)) {
                // 如果已存在，且不是数组，则转换为数组
                if (!Array.isArray(params[key])) {
                    params[key] = [params[key]];
                }
                params[key].push(value);
            } else {
                params[key] = value;
            }
        }
        return params;
    } catch (e) {
        console.error('URLSearchParams解析失败，尝试备用方法。', e);
    }

    // 3. 备用方法：如果不支持URLSearchParams，则手动解析
    const params = {};
    const pairs = queryString.split('&');
    for (const pair of pairs) {
        const [key, value] = pair.split('=').map(decodeURIComponent);
        if (key) {
            if (params.hasOwnProperty(key)) {
                if (!Array.isArray(params[key])) {
                    params[key] = [params[key]];
                }
                params[key].push(value);
            } else {
                params[key] = value;
            }
        }
    }
    return params;
}
//关闭流
export const stopMediaTracks = (stream) => {
    if (!stream || !stream.getTracks) return;
    stream.getTracks().forEach(track => {
        track.stop();
    });
    stream = null;
    window.videostream = null;
}

/**
 * 使用 Web Crypto API 生成一个 UUID (v4)。
 * @returns {string} 格式为 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' 的 UUID 字符串。
 */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // 如果浏览器不支持，则回退到其他方法
    console.warn('crypto.randomUUID() 不可用，正在使用回退方案。');
    return fallbackUUID();
}

/**
 * 深拷贝函数
 * @param {any} obj - 要进行深拷贝的对象或值
 * @returns {any} 深拷贝后的新对象或值
 */
export function deepClone(obj) {
    // 1. 处理基本类型和 null / undefined
    // 如果是 null 或 undefined，直接返回
    // 如果是基本类型（string, number, boolean, symbol, bigint），直接返回
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // 2. 处理日期对象
    if (obj instanceof Date) {
        return new Date(obj);
    }

    // 3. 处理正则表达式对象
    if (obj instanceof RegExp) {
        return new RegExp(obj);
    }

    // 4. 处理数组和普通对象
    // 创建一个新对象或新数组来存储拷贝后的内容
    const clone = Array.isArray(obj) ? [] : {};

    // 遍历源对象的属性
    for (let key in obj) {
        // 确保只处理对象自身的属性，而不是原型链上的属性
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // 递归调用 deepClone 处理嵌套的属性
            clone[key] = deepClone(obj[key]);
        }
    }

    return clone;
}

function buildOptionsArray(options) {
    const args = [];
    if (!options) return args;

    for (const [key, value] of Object.entries(options)) {
        args.push(key, String(value));
    }

    return args;
}
/**
 * 将文本内容和颜色转换为背景透明的 Base64 格式 PNG 图片。
 * 图片尺寸由文本内容自动决定。
 * * @param {string} text 要绘制的文本。
 * @param {string} [color='red'] 字体颜色，默认为 'red'。
 * @returns {string} Base64 格式的 PNG 图片数据（data:image/png;base64,...）。
 */
export function textToImageBase64(text, color = 'red') {
    // 1. 创建一个临时的 Canvas 元素和 2D 上下文
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置字体样式，这将影响 measureText 的结果
    const fontSize = 30; // 设定一个合适的基础字体大小
    const fontName = 'Microsoft YaHei, sans-serif'; // 设定字体
    ctx.font = `${fontSize}px ${fontName}`;
    ctx.fillStyle = color; // 设置字体颜色

    // 2. 测量文本尺寸
    const metrics = ctx.measureText(text);

    // 获取文本的宽度
    const textWidth = metrics.width;

    // 获取文本的高度（基于字体大小，通常使用 font-size 或实际的 ascent/descent）
    // 为了确保文字完全显示，我们稍微增加一些内边距（例如 4 像素）
    const padding = 4;
    const textHeight = fontSize + padding * 2;

    // 3. 设置 Canvas 的最终尺寸（内容框决定）
    canvas.width = Math.ceil(textWidth + padding * 2);
    canvas.height = Math.ceil(textHeight);

    // 重新应用字体设置和颜色（因为改变 canvas.width/height 会重置上下文）
    ctx.font = `${fontSize}px ${fontName}`;
    ctx.fillStyle = color;

    // 确保背景是透明的 (默认就是透明的，但显式设置更保险)
    // ctx.clearRect(0, 0, canvas.width, canvas.height); // 也可以使用这个

    // 4. 绘制文本
    // 将文本绘制在 Canvas 中央
    // 'alphabetic' 是默认的 textBaseline，y 坐标通常是基线位置。
    // 为了垂直居中，y 坐标需要是 (canvas.height - fontSize) / 2 + fontSize
    const x = padding;
    const y = padding + fontSize * 0.75; // 0.75 是一个常用的系数来补偿基线位置

    ctx.fillText(text, x, y);

    // 5. 导出为 Base64 图片
    // 使用 'image/png' 格式以保留透明背景
    return canvas.toDataURL('image/png');
}


export const jsonToffmpegData = (target) => {
    let json = deepClone(target);
    const Data = [];
    Object.keys(json).forEach(key => {
        if (Object.prototype.toString.call(json[key]) == '[object String]') {
            if (key == 'output') {
                let fileType = json['outputFormat'] == 'matroska' ? 'mkv' : json['outputFormat'];
                //每次录制的临时指定文件名
                json[key] = json[key] + '\\' + outputExtname + Date.now() + '.' + fileType;
            }

        } else if (Object.prototype.toString.call(json[key]) == '[object Object]') {
            json[key] = buildOptionsArray(deepClone(json[key]));
        }
        Data.push({ key, value: json[key] })
    });
    if (BasicState.videoType == 2 || BasicState.videoType == 4) {
        //加一个 scale 滤镜
        //摄像头/选取录制要处理 分辨率经常会遇到奇数宽度
        Data.push({ key: 'videoFilters', value: 'scale=trunc(iw/2)*2:trunc(ih/2)*2' });
    }

    if (Object.keys(BasicState.audioInputOptions).length) {
        //有音频的话就录入音频
        Object.keys(BasicState.audioInputOptions).forEach(key => {
            Data.push({ key, value: BasicState.audioInputOptions[key] });
        });

    }


    return Data.filter(f => f.key !== 'videoList');
}
