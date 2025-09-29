export const outputList = [
    {
        label: '视频帧率 (fps)',
        name: '-r',
        hidden: false,
        //自定义属性
        customizeProps: {
            renderType: 'inputnumber',
            renderProps: {

            }
        }
    },
    // {
    //     label: '开始录制倒计时',
    //     name: 'timeout',
    //     hidden: false,
    //     //自定义属性
    //     customizeProps: {
    //         renderType: 'inputnumber',
    //         renderProps: {
    //             min: 1,
    //             max: 9,
    //             // defaultValue: 3,
    //         }
    //     }
    // },
    {
        label: '画质级别',
        name: '-crf',
        hidden: false,
        customizeProps: {
            renderType: 'select',
            renderProps: {
                // defaultValue: 18,
                options: [
                    //范围通常是 0-51。23是默认值，18接近视觉无损。屏幕录制文字等细节多，推荐 18-22
                    { value: 18, label: '1 原画' },
                    { value: 19, label: '2 超清' },
                    { value: 20, label: '3 高清' },
                    { value: 21, label: '4 清晰' },
                    { value: 22, label: '5 普清' },
                ]
            },

        }
    },
    // {
    //     label: '音频码率',
    //     name: '-b:a',
    //     hidden: false,
    //     customizeProps: {
    //         renderType: 'select',
    //         renderProps: {
    //             // defaultValue: '64k',
    //             options: [
    //                 { value: '64k', label: '64kbps (低质量)' },
    //                 { value: '128k', label: '128kbps (中等)' },
    //                 { value: '192k', label: '192kbps (高质量)' },

    //             ]
    //         },

    //     }
    // },
    // {
    //     label: '音频采样率',
    //     name: '-ar',
    //     hidden: false,
    //     customizeProps: {
    //         renderType: 'select',
    //         renderProps: {
    //             // defaultValue: 44100,
    //             options: [
    //                 { value: 8000, label: '8000Hz' },
    //                 { value: 11025, label: '11025Hz' },
    //                 { value: 22050, label: '22050Hz' },
    //                 { value: 44100, label: '44100Hz' },
    //                 { value: 48000, label: '48000Hz' },

    //             ]
    //         },

    //     }
    // },
    {
        label: '编码级别（速度）',
        name: '-preset',
        hidden: false,
        customizeProps: {
            renderType: 'select',
            renderProps: {
                // defaultValue: 'medium',
                options: [
                    { value: 'ultrafast', label: '极快 / 文件大小：最大 / 画质：最差' },
                    { value: 'superfast', label: '很快 / 文件大小：较大 / 画质：较差' },
                    { value: 'veryfast', label: '快 / 文件大小：稍大 / 画质：稍差' },
                    { value: 'faster', label: '较快 / 文件大小：中等偏大 / 画质：中等偏差' },
                    { value: 'fast', label: '中等偏快 / 文件大小：中等 / 画质：中等偏好' },
                    { value: 'medium', label: '中等 (默认) / 文件大小：中等 / 画质：中等' },
                    { value: 'slow', label: '慢 / 文件大小：较小 / 画质：较好' },
                    { value: 'slower', label: '很慢 / 文件大小：更小 / 画质：更好' },
                    { value: 'veryslow', label: '极慢 / 文件大小：最小 / 画质：最好' },
                    { value: 'placebo', label: '超慢 / 文件大小：几乎最小 / 画质：几乎无提升 (不推荐)' },
                ]
            },

        }
    },


];
export const fileSetList = [
    {
        label: '保存文件格式',
        name: 'outputFormat',
        hidden: false,
        customizeProps: {
            renderType: 'select',
            renderProps: {
                // defaultValue: 'mp4',  mp4 webm  mkv avi flv
                options: [
                    { value: 'mp4', label: 'MP4' },///（最常用，兼容性最好，支持H.264/H.265/AAC）
                    { value: 'matroska', label: 'MKV' },//（自由容器，支持多音轨/字幕，适合保存原始质量）
                    { value: 'avi', label: 'AVI' },//（老格式，兼容性好，但文件较大，功能有限）
                    // { value: 'mov', label: 'MOV（Apple QuickTime 格式，常用于Mac/iOS）' },
                    { value: 'flv', label: 'FLV' },//（流媒体格式，早期用于网页视频，现在较少用）
                    //{ value: 'ts', label: 'TS（Transport Stream，常用于电视/直播流）' },
                    { value: 'webm', label: 'WebM' },//（开源网页视频格式，常用VP8/VP9编码）
                    // { value: 'gif', label: 'GIF（动图，画质有限，文件通常较大）' },
                    // { value: 'mp3', label: 'MP3（仅音频格式，兼容性最好）' },
                    // { value: 'wav', label: 'WAV（无压缩音频，音质最好，体积大）' },
                    // { value: 'aac', label: 'AAC（常见压缩音频格式，广泛用于视频和流媒体）' },
                    // { value: 'ogg', label: 'OGG（开源音频/视频格式，支持Vorbis/Opus/Theora）' },
                ]
            },

        }
    },
    {
        label: '保存路径',
        name: 'output',
        hidden: false,
        customizeProps: {
            renderType: 'input',
            renderProps: {
                // addonAfter:<p>111</p>

            },

        }
    },
]