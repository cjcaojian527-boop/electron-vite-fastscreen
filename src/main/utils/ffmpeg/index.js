import ffmpeg from 'fluent-ffmpeg';
import { getTTFpath } from '../utils';

class createFfmpeg {

    command = null;
    currentoutPath = "";
    options = [];
    isRecording = false;//是否录制运行中
    outputStream = null;
    constructor(options, handleEvent) {
        this.command = ffmpeg();
        this.init(options);
        handleEvent && handleEvent.call(this);
    }

    init(options) {
        this.options = options;
        this.executeFfmpeg(options);
    }

    //批量执行配置命令
    executeFfmpeg(List) {
        List.forEach(f => {
            if (f.key == 'output') {
                this.currentoutPath = f.value;
                // this.outputStream = fs.createWriteStream(this.currentoutPath);
            }
            this.command[f.key] && this.command[f.key](f.value);
            console.log('执行：' + f.key, f.value);
        });
        // this.command.videoFilters([
        //     {
        //         filter: 'drawtext',
        //         options: {
        //             fontfile: getTTFpath(),
        //             text: '水印文字',
        //             fontsize: 24,
        //             fontcolor: 'white@0.8',
        //             x: '(w-tw)-20',
        //             y: '(h-th)-20',
        //             box: 1,
        //             boxcolor: 'black@0.5',
        //             boxborderw: 5
        //         }
        //     }
        // ]);
    }
    //优雅停止
    stop() {
        if (this.command && this.command.ffmpegProc && this.command.ffmpegProc.stdin) {
            try {
                this.command.ffmpegProc.stdin.write('q');
            } catch (e) {
                console.error('发送 q 停止失败，尝试 SIGINT', e);
                this.command.kill('SIGINT');
            }
        } else {
            console.log("stop-error!!!");
        }
    }

}


export default createFfmpeg;


