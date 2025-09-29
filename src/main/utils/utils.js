import { desktopCapturer, app } from 'electron';
// import { v4 as uuidv4 } from 'uuid';
import { is } from '@electron-toolkit/utils';

import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';

import store from '../store';
import fs from 'fs';
import path from 'path';
import open from 'open';

console.log('配置文件的存储路径是:', store.path);


// 告诉 fluent-ffmpeg 具体路径
initFFmpeg();



export function initFFmpeg() {
    let _ffmpegPath = pathToFfmpeg;
    let _ffprobePath = ffprobePath.path;

    if (!is.dev) {
        _ffmpegPath = fixPath(_ffmpegPath);
        _ffprobePath = fixPath(_ffprobePath);
    }

    ffmpeg.setFfmpegPath(_ffmpegPath)
    ffmpeg.setFfprobePath(_ffprobePath)

    // console.log('FFmpeg 路径:', _ffmpegPath)
    // console.log('FFprobe 路径:', _ffprobePath)


    function fixPath(p) {
        return p.replace('app.asar', 'app.asar.unpacked');
    }
}


export const getSources = () => {
    return desktopCapturer.getSources({
        types: ['screen', 'window'],
        // thumbnailSize: { width: 300, height: 200 },
        // fetchWindowIcons: true
    });
}

export const openResource = (path, options = {}) => {
    //{ url: true } 强制用浏览器打开
    //{ wait: true } 当设置为 true 时，open 方法的 Promise 会一直等待，直到被打开的应用程序进程退出后才 resolve。默认值为 false
    if (!path) return false;
    return open.default(path, options);
}

//获取存储目录的视频文件列表
export const getvideoSrcList = (dirName, callback) => {
    return new Promise(async (resolve, reject) => {

        await ensureDirectoryExists(dirName);

        const files = await fs.promises.readdir(dirName, { withFileTypes: true });

        const list = files.filter(f => f.isFile());

        const videoList = store.get('videoList');

        const metadataList = [];


        if (list.length) {
            for (let i = 0; i < list.length; i++) {
                let outputFile = path.join(list[i].path, list[i].name);

                let fileType = path.extname(outputFile);


                const videoItem = videoList.find(v => v.key === outputFile);//比较文件名
                if (videoItem) {
                    //已经存过了
                    metadataList.push(videoItem);
                    callback && callback(videoItem);
                    continue;

                }

                const metadata = await getFfprobe(outputFile).catch(err => {
                    return false;
                });
                if (metadata) {
                    // metadata.uuid = uuidv4();
                    const stats = await fs.promises.stat(outputFile).catch(err => false);

                    const row = getRowData(metadata, { fileName: list[i].name, fileType, createTime: stats?.birthtime.getTime() });
                    metadataList.push(row);
                    callback && callback(row);
                }

            }
        }
        resolve(metadataList);
    });
}

export const getTTFpath = () => {
    if (is.dev) {
        var ttfPath = path.resolve(__dirname, '../../resources/font/1.ttf');
    } else {
        var ttfPath = path.resolve(process.resourcesPath, 'resources/font/1.ttf');
    }

    return ttfPath;
}



export const getRowData = ({ format, streams }, { createTime, fileName, fileType }) => {

    return {
        videoName: fileName,
        time: format.duration,//视频时长 s为单位
        size: format.size,
        date: createTime || Date.now(),//创建时间
        key: format.filename,
        Basicoperations: 1,//表示这行有基本操作的一列
        filename: format.filename,
        fileType,
    }
}

/**
* 确保文件夹存在，如果不存在则创建。
* @param {string} dirPath 要检查和创建的目录路径。
*/
export async function ensureDirectoryExists(dirPath) {
    try {
        // 尝试访问路径，看它是否存在
        await fs.promises.access(dirPath);
        // console.log(`文件夹 ${dirPath} 已存在。`);
    } catch (error) {
        // 如果路径不存在（ENOENT），则创建它
        if (error.code === 'ENOENT') {
            console.log(`文件夹 ${dirPath} 不存在，开始创建...`);
            // { recursive: true } 选项可以创建路径中的所有中间目录
            await fs.promises.mkdir(dirPath, { recursive: true });
            // console.log(`文件夹 ${dirPath} 创建成功。`);
        } else {
            // 如果是其他错误，比如权限问题，则抛出
            throw error;
        }
    }
}



//获取视频元数据
export const getFfprobe = (outputFile) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(outputFile, (err, metadata) => {
            if (err) {
                reject(new Error('获取元数据失败:' + err.message));
            } else {
                resolve(metadata);
            }
        });
    });
}

export class VideoMerger {
    constructor() {
        this.segments = []; // 存放分段文件路径
    }

    /**
     * 添加分段视频
     * @param {string} filePath 分段文件路径
     */
    addSegment(filePath) {
        this.segments.push(filePath);
    }

    /**
     * 合并所有分段视频为一个完整视频
     * @param {string} outputFile 最终输出文件路径
     * @returns {Promise<string>} 输出文件路径
     */
    mergeSegments(outputFile) {
        if (this.segments.length === 0) {
            return Promise.reject(new Error('没有分段文件可以合并'));
        }
        // 生成 file_list.txt
        const listFile = path.join(path.dirname(outputFile), 'file_list.txt');
        const fileContent = this.segments.map(file => `file '${path.resolve(file)}'`).join('\n');
        fs.writeFileSync(listFile, fileContent);

        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(listFile)
                .inputOptions(['-f', 'concat', '-safe', '0'])
                .outputOptions(['-c', 'copy'])
                .output(outputFile)
                .on('start', cmd => console.log('合并开始，执行命令:', cmd))
                .on('error', err => {
                    console.error('合并失败:', err.message);
                    reject(err);
                })
                .on('end', async () => {
                    // 合并完成后，使用 ffprobe 获取元数据

                    ffmpeg.ffprobe(outputFile, (err, metadata) => {
                        // 先进行清理操作
                        this.segments.forEach(file => {
                            try { fs.unlinkSync(file); } catch (e) { }
                        });
                        try { fs.unlinkSync(listFile); } catch (e) { }
                        this.segments = [];

                        if (err) {
                            console.error('获取元数据失败:', err.message);
                            reject(new Error('合并成功，但元数据获取失败。'));
                        } else {
                            resolve(metadata);
                        }
                    });
                })
                .run();
        });
    }
}

/**
 * 转换视频文件到指定后缀格式
 * @param {string} inputPath - 输入文件完整路径
 * @param {"mp4"|"mkv"|"flv"|"webm"} targetExt - 输出文件后缀
 * @returns {Promise<string>} - 输出文件完整路径
 */
export function convertVideo(inputPath, targetExt = ".mp4") {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(inputPath);
        const base = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(dir, `${base}${targetExt}`);

        const command = ffmpeg(inputPath);
        console.log("outputPath:", outputPath);
        console.log("targetExt:", targetExt);

        // 针对不同目标格式设置参数
        if (targetExt === ".mp4") {
            command.outputOptions(["-c:v libx264", "-c:a aac", "-movflags +faststart"]);
        } else if (targetExt === ".mkv") {
            command.outputOptions(["-c:v libx264", "-c:a aac"]);
        } else if (targetExt === ".flv") {
            command.outputOptions(["-c:v libx264", "-c:a aac"]);
        } else if (targetExt === ".webm") {
            command.outputOptions(["-c:v libvpx-vp9", "-c:a libopus"]);
        }

        command
            .on("end", () => {
                fs.promises.unlink(inputPath).then(() => resolve(outputPath));
            })
            .on("error", (err) => {
                console.error("❌ 转换失败:", err.message);
                // 返回原始文件
                resolve(inputPath);
            })
            .save(outputPath);
    });
}




/**
 * 获取 dshow 设备列表
 * 返回数组：[{ label, id }]
 * -f dshow → 拿到 DirectShow 驱动层设备，既有视频也有音频。
-f wasapi → 拿到 Windows 系统音频设备（专门用于声音，能区分扬声器和麦克风）。
 */
export async function listDshowDevices() {
    return new Promise((resolve) => {
        let output = '';

        ffmpeg()
            .input('dummy') // 必须加
            .inputOptions(['-f', 'dshow', '-list_devices', 'true'])
            .on('stderr', line => {
                output += line + '\n'; // 设备信息输出在 stderr
            })
            .on('end', () => {
                resolve(parseDevices(output));
            })
            .on('error', () => {
                // ffmpeg -list_devices 执行完返回 code 1，也是正常
                resolve(parseDevices(output));
            })
            .saveToFile('NUL'); // Windows 空文件
    });
}

/**
 * 解析 ffmpeg 输出
 */
function parseDevices(ffmpegOutput) {
    const devices = [];
    const lines = ffmpegOutput.split('\n');
    let currentType = null; // 'video' 或 'audio'
    for (let line of lines) {
        line = line.trim();

        // 匹配视频或音频行
        const match = line.match(/"(.+)" \((video|audio)\)/);
        if (match) {
            const label = match[1];
            const type = match[2];
            currentType = type;

            // 返回的 id 暂时用显示名称，也可以用 alternative name
            devices.push({
                label,
                id: label,
                type,
                line,
            });
        }
    }

    return devices;
}



/**
 * 加载渲染进程页面（支持开发/生产，支持 hash + query）
 * @param {BrowserWindow} win - 目标窗口
 * @param {Object} options
 * @param {string} [options.hash] - URL hash 路径 (默认 '')
 * @param {Object} [options.query] - 查询参数对象 (默认 {})
 */
export function loadRenderer(win, { hash = '', query = {} } = {}) {
    // 处理 query => 字符串
    const searchParams = new URLSearchParams(query).toString()
    const search = searchParams ? `?${searchParams}` : ''

    if (is.dev) {
        const baseUrl = process.env['ELECTRON_RENDERER_URL']
        const url = `${baseUrl}/#/${hash}${search}`
        win.loadURL(url);
    } else {
        const filePath = path.join(app.getAppPath(), 'out/renderer/index.html')
        win.loadFile(filePath, {
            hash,
            query,
        });
    }
}

