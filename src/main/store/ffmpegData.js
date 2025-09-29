import { de_inputOptions, de_input, de_outputFormat, de_outputOptions } from './default';
import { app } from 'electron';
import path from 'path';


// 获取应用程序的安装路径
const appPath = app.getPath('exe');
console.log('Temp路径是:', path.resolve(appPath, '../', 'temp'));
export default {
    input: de_input,//输入源 

    inputOptions: de_inputOptions,

    output: path.resolve(appPath, '../', 'temp'),// process.env.TEMP,//文件输出完整路径

    outputFormat: de_outputFormat,//输出格式

    // videoCodec = videoCodecMap[de_outputFormat];//视频编码器

    outputOptions: de_outputOptions,
}