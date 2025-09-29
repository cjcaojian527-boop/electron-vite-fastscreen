import Store from 'electron-store';
import ffmpegData from './ffmpegData';

// console.log(Store);

const schema = {
    //视频录入选项
    videoType: {
        type: 'string',
        default: "1"
    },
    //音频录入选项
    audioType: {
        type: 'string',
        default: "1"
    },
    //视频相关配置
    ffmpegData: {
        type: 'object',
        default: ffmpegData
    },
    //文件列表
    videoList: {
        type: 'array',
        default: [],
    },
    //音频相关配置
    audioInputOptions: {
        type: 'object',
        default: {}
    },
    //媒体流配置对象
    streamID: {
        type: 'string',
        default: ""
    }

};


const store = new Store.default({ schema });

export default store;