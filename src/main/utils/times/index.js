import { BrowserWindow, app } from 'electron';
import path from 'path';
import createFfmpeg from '../ffmpeg';
import store from '../../store';
import { getRowData, VideoMerger } from '../utils';
import { outputExtname } from '../const';

const merger = new VideoMerger();


//计时逻辑放到主进程
let times = 0;
let timer = null;
let Ffmpeg = null;
let playStore = "stop";//用户操作行为状态

const getWin = (winName) => {
    return BrowserWindow.getAllWindows().find(f => f.props.name === winName) || null;
}

//执行定时器
const runTimer = (callback) => {
    clearInterval(timer);
    timer = setInterval(() => {
        times++;
        callback && callback(times);
    }, 1000);
}

//合并保存视频
const mergerVideos = () => {
    let createTime = Date.now();

    let fileType = store.get('ffmpegData')['outputFormat'] == 'matroska' ? '.mkv' : "." + store.get('ffmpegData')['outputFormat'];

    let fileName = outputExtname + createTime + fileType;//创建文件名

    let savePath = path.join(store.get('ffmpegData').output, fileName);
    getWin('main').webContents.send('render-message', { type: 'navigate', path: '/list', message: "录屏保存中，请勿操作..." });
    //开始合并多段视频；
    merger.mergeSegments(savePath).then(metadata => {
        getWin('main').webContents.send('render-message', { type: 'hideLoading' });
        const row = getRowData(metadata, { createTime, fileName, fileType });
        store.set('videoList', [...store.get('videoList'), row]);
        Ffmpeg = null;

        getWin('main').webContents.send('render-message-getvideoSrcList', { run: 'getvideoSrcList-callback', data: row });
        console.log('保存数据:', row);
        getWin('main').show();


    }).catch(err => {
        console.log("合并文件失败：", err);
    });
}


export default function ({ sender }, { toName, fromName, run, options }) {
    const targetWin = BrowserWindow.fromWebContents(sender);
    playStore = run;

    if (run == 'pause') {
        //暂停
        clearInterval(timer);
        Ffmpeg.stop();//终止
    } else if (run == 'start') {
        //继续
        Ffmpeg = new createFfmpeg(options, handleEvent);
        Ffmpeg.command.run({ stdio: ['pipe', 'ignore', 'pipe'] });
        runTimer(callback);

    } else if (run == 'stop') {
        //停止
        if (Ffmpeg.isRecording) {
            clearInterval(timer);
            Ffmpeg.stop();//终止
        } else {
            //已经暂停了
            mergerVideos();//直接合并
        }


    } else {
        playStore = "frist";//
        //首次开始
        times = 0;
        Ffmpeg = new createFfmpeg(options, handleEvent);
        Ffmpeg.command.run({ stdio: ['pipe', 'ignore', 'pipe'] });
        runTimer(callback);

    }

    function callback(nums) {
        targetWin.webContents.send('render-message', { nums, type: 'set-times' });
        getWin(toName).webContents.send('render-message', { nums, type: 'set-times' });
    }


    function handleEvent() {
        this.command.on('start', () => {
            //FFmpeg 进程成功启动时触发。
            console.log('开始录制---', this.currentoutPath);
            this.isRecording = true;

        }).on('progress', (v) => {
            //在 FFmpeg 处理过程中定期触发，报告进度。
            console.log('录制中：', v.timemark, '帧率：' + v.currentFps);

        }).on('end', (data) => {
            //FFmpeg 进程成功完成所有操作时触发。
            this.isRecording = false;
            console.log('录制完成---');
            if (playStore == 'pause') {
                merger.addSegment(this.currentoutPath);
            } else if (playStore == 'stop') {
                // 合并输出 
                merger.addSegment(this.currentoutPath);
                mergerVideos();

            }



        }).on('error', (err, stdout, stderr) => {
            //FFmpeg 进程执行过程中遇到任何错误时触发。
            this.isRecording = false;
            console.error('录制失败error:', err.message);
            console.error('FFmpeg stdout:', stdout);
            console.error('FFmpeg stderr:', stderr);
            clearInterval(timer);
            this.stop();//终止

            if (err.message.includes('Output format  is not available')) {
                //输出路径错误
                store.clear();
                app.quit();
            }

            //停止ui计时
            targetWin.webContents.send('render-message', { type: 'stop', error: '录制失败！' });
            getWin(toName).webContents.send('render-message', { type: 'stop', error: '录制失败！' });
            getWin('main').show();

        });
    }

}