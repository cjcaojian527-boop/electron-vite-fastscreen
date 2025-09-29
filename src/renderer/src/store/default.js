
//屏幕捕获
const screenInput = {
    '-f': 'gdigrab',          // Windows: gdigrab
    // '-f': 'x11grab',       // Linux: x11grab
    // '-f': 'avfoundation',  // macOS: avfoundation
    '-framerate': '30',       // 输入帧率
    '-video_size': '1920x1080', // 捕获区域大小
    '-offset_x': '100',       // 左上角 X 偏移
    '-offset_y': '200',       // 左上角 Y 偏移
    '-thread_queue_size': '1024', // 队列大小（防止丢帧）
};
//音频输入

export const audioInput = {
    //'-f': 'dshow',                                   // Windows: DirectShow
    // '-f': 'alsa',                                 // Linux: ALSA
    // '-f': 'pulse',                                // Linux: PulseAudio
    // '-f': 'avfoundation',                         // macOS 音频
    //'-i': 'audio=Microphone (Realtek High Def... )', // 输入设备
    '-ar': '44100',                                  // 输入采样率
    '-ac': '2',                                      // 输入声道
    '-guess_layout_max': '0'                         // 避免声道布局猜测错误
};



export const de_inputOptions = {
    '-f': 'gdigrab',//指定输入格式Windows: gdigrab, dshow  macOS: avfoundation
    //视频输入参数
    '-framerate': '30',       // 输入帧率
    '-thread_queue_size': '1024', // 队列大小（防止丢帧）
    // '-t': '5',
}


export let de_input = 'desktop';//输入源 等同于 -i


//输出相关

export let de_outputFormat = 'mp4';// 输出格式 mp4 webm  mkv avi flv

export const videoCodecMap = {
    mp4: 'libx264',// libx264 h264_nvenc (NVIDIA硬编) h264_qsv (Intel硬编)
    webm: 'libvpx-vp9',//libvpx-vp9 (软件编码) libaom-av1 (软件编码)
    matroska: 'libx264',//简称mkv libx264, libvpx-vp9, libx265
    avi: 'libxvid',//libxvid, mpeg4
    flv: 'libx264'
}

export const de_outputOptions = {
    '-preset': 'medium',//编码级别（速度）
    '-crf': 22,//画质级别
    '-r': 60,//输出帧率
    '-pix_fmt': 'yuv420p',//像素格式。确保最终文件的兼容性。
    //'-movflags':'+frag_keyframe+empty_moov+faststart',//mp4要加这 暂停录制不会坏
}




// 3. 网络流输入
const netInput = {
    '-f': 'rtsp',                  // RTSP 流
    '-rtsp_transport': 'tcp',      // 强制 TCP
    '-reconnect': '1',             // 自动重连
    '-reconnect_streamed': '1',
    '-reconnect_delay_max': '2',   // 最大重连间隔
    '-timeout': '5000000',         // 网络超时 (us)
    '-rw_timeout': '5000000',      // 读写超时 (us)
    '-user_agent': 'MyApp/1.0',    // 自定义 UA
    '-headers': 'Authorization: Basic xxx', // HTTP/RTSP header
    '-i': 'rtsp://example.com/stream'
};

// 4. 时间控制
const timeInput = {
    '-ss': '00:00:10',    // 从10秒开始
    '-t': '00:00:30',     // 录制30秒
    '-itsoffset': '5'     // 输入流延迟5秒
};

// 5. 通用优化
const commonInput = {
    '-probesize': '50M',       // 分析流大小 (加快打开速度)
    '-analyzeduration': '10M', // 分析时长
    '-safe': '0',              // concat 模式允许特殊字符
    '-re': '',                 // 按实时速率读取输入（推流常用）
};