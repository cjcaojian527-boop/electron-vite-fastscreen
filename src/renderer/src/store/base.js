import { makeAutoObservable } from "mobx";
import { ffmpegData } from '@/store/ffmpegOptins';
import { de_inputOptions } from './default';
import { updateServeStore, updateServeStoreItem, CreateMediaRecorder, getMedia, deepClone } from '@/utils/utils';

class BasicSettings {
    videoType = "1";//录制区域
    audioType = "1";//音频区域

    MediaRecorderObeject = null;//录像机
    streamID = "";


    audioInputOptions = {};//音频输入项

    constructor() {
        makeAutoObservable(this);
    }

    setVideoType(val, params, mediaStream) {

        this.videoType = val;
        if (val == 1) {
            //全屏录制
            ffmpegData._set('input', 'desktop');
            ffmpegData._set('inputOptions', de_inputOptions, true);
        } else if (val == 2) {
            //选区录制
            const inputOptions = {
                ...de_inputOptions,
                "-offset_x": parseInt(params.x),
                "-offset_y": parseInt(params.y),
                "-video_size": `${parseInt(params.width) + 'x' + parseInt(params.height)}`,
            }

            ffmpegData._set('input', 'desktop');
            ffmpegData._set('inputOptions', inputOptions, true);

        } else if (val == 3) {
            //窗口录制
            this.streamID = params.id;
            ffmpegData._set('input', `title=${params.name}`);
            ffmpegData._set('inputOptions', de_inputOptions, true);
            this.setMediaRecorder().then(() => { });

        } else if (val == 4) {
            //摄像头录制

            const inputOptions = {
                ...de_inputOptions,
                "-f": 'dshow',
                "-video_size": `${parseInt(params.width) + 'x' + parseInt(params.height)}`,
            }

            ffmpegData._set('input', `video=${params.name}`);
            ffmpegData._set('inputOptions', inputOptions, true);
        }
        updateServeStore();
    }
    //设置流
    setMediaRecorder() {
        return new Promise(async (r1, r2) => {
            if (this.streamID) {
                const mediaStream = await getMedia({ id: this.streamID }).catch(err => {
                    r2("获取媒体流失败！-1");
                    return;
                });
                this.MediaRecorderObeject = null;
                const options = {
                    mimeType: 'video/webm;codecs=vp9',
                    audioBitsPerSecond: 128000, //音频码率
                    videoBitsPerSecond: 250000000, //视频码率
                }
                this.MediaRecorderObeject = new CreateMediaRecorder(mediaStream, options);
                r1(true);
            } else {
                r2("获取媒体流失败！-2");
            }
        });
    }



    setAudioType(val, audioItem) {
        this.audioType = val;
        if (val != 1) {
            this.audioInputOptions = {
                addInput: "audio=" + audioItem.label.props.title,
                inputFormat: audioItem.label.props.title == "default" ? "wasapi" : "dshow",
            }
        } else {
            this.audioInputOptions = {};
        }
        updateServeStoreItem("audioInputOptions", this.audioInputOptions);

    }


}

export const BasicState = new BasicSettings();