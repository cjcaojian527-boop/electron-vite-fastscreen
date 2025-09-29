import { makeAutoObservable, computed } from "mobx";
import { videoCodecMap } from './default';
import { deepClone } from '@/utils/utils';


class setffmpegData {

    input = "";// de_input;//输入源 

    inputOptions = {};//  de_inputOptions;

    output = "";//文件输出完整路径

    outputFormat = "";//输出格式

    // videoCodec = videoCodecMap[de_outputFormat];//视频编码器

    outputOptions = {};// de_outputOptions;

    videoList = [];//文件列表


    constructor() {
        makeAutoObservable(this, {
            videoCodec: computed,//声明为计算属性
            // output:computed,
        });
    }

    get videoCodec() {
        return videoCodecMap[this.outputFormat]
    }

    _get(key) {
        return deepClone(this[key]) || null;
    }
    _getAll() {
        return {
            input: this.input,
            inputOptions: deepClone(this.inputOptions),
            output: this.output,
            outputFormat: this.outputFormat,
            videoCodec: this.videoCodec,
            outputOptions: deepClone(this.outputOptions),
            videoList: deepClone(this.videoList),
        }
    }

    _set(key, val, flag) {
        if (this[key] !== undefined) {
            if (Object.prototype.toString.call(val) == '[object String]') {
                if (key !== 'videoCodec') {
                    //计算属性不能赋值
                    this[key] = val;
                }


            } else if (Object.prototype.toString.call(val) == '[object Object]') {
                if (flag) {
                    //替换
                    this[key] = val;
                } else {
                    //覆盖
                    this[key] = { ...this[key], ...val };
                }

            } else if (Object.prototype.toString.call(val) == '[object Array]') {
                if (flag) {
                    //替换
                    this[key] = val;
                } else {
                    //覆盖
                    this[key] = [...this[key], ...val];
                }
            }
        }

    }
    _setAll(obj) {
        Object.keys(obj).forEach(key => {
            let flag = key == 'videoList' ? true : undefined;
            this._set(key, obj[key], flag);
        });

    }


}

export const ffmpegData = new setffmpegData();