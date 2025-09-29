import { BrowserWindow } from 'electron';
// import path from 'path';

//计时逻辑放到主进程
let times = 0;
let timer = null;
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


export default function ({ sender }, { toName, fromName, run, options }) {

    const targetWin = BrowserWindow.fromWebContents(sender);

    playStore = run;

    if (run == 'pause') {
        //暂停
        clearInterval(timer);

    } else if (run == 'start') {
        //继续

        runTimer(callback);

    } else if (run == 'stop') {
        //停止
        clearInterval(timer);
        targetWin.webContents.send('render-message', { type: 'stop' });
        getWin(toName) && getWin(toName).webContents.send('render-message', { type: 'stop' });


    } else {
        times = 0;
        playStore = "frist";//
        runTimer(callback);

    }

    function callback(nums) {
        targetWin.webContents.send('render-message', { nums, type: 'set-times' });
        getWin(toName) && getWin(toName).webContents.send('render-message', { nums, type: 'set-times' });
    }

}