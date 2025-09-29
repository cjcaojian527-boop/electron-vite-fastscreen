import React, { useEffect, useState, useRef, useCallback } from 'react';
import { formatTime, moveTo } from '@/utils/utils';
import { grab } from '@/utils/const';
// import { ffmpegData } from '@/store/ffmpegOptins';
// import { BasicState } from '@/store/base';
import API from '@/utils/ipcRenderer';
import './index.scss';
import {
    PauseOutlined,
    CaretRightFilled,
    XFilled,
    HighlightFilled
} from '@ant-design/icons';


const SuspendedBall = () => {
    const [toops, set_toops] = useState(false);
    const [times, set_times] = useState(0);
    // const timer = useRef(null);
    const [isplay, set_play] = useState(false);//是否开始/暂停
    const [videoState, set_videoState] = useState(false);//是否录制中
    const videoStateRef = useRef(videoState);



    //启动视频录制
    const handleStartRecord = (event) => {
        if (!event) {
            //通知的
            set_videoState(true);
            set_play(true);
            sendMsg('start', event);//开始
        } else {
            set_videoState(true);
            berfosendMsg(1, event).then(() => {
                set_play(true);
                sendMsg('start', event);//开始
            }).catch(() => {
                set_videoState(false);
                API.IpcSend('execute-show');
            });
        }

    }

    //暂停/继续
    const handleTogglePlay = (event) => {
        set_play((flag) => {
            if (flag) {
                //暂停
                berfosendMsg('pause', event);
                sendMsg('pause', event);
            } else {
                //继续
                berfosendMsg('start', event);
                sendMsg('start', event);
            }
            return !flag;
        });
    }


    //控制倒计时窗口
    const berfosendMsg = useCallback((type, event) => {
        if (!event) {
            return Promise.resolve(true);
        }

        if (type == 1) {
            API.IpcSend('load-timeout', { toName: 'timeoOutpool', fromName: 'SuspendedBallpool' });
        } else {
            API.IpcPostMessage('render-message', { toName: 'timeoOutpool', run: 'show-timeout', type, fromName: 'SuspendedBallpool' });
        }
        return new Promise((r1, r2) => {
            API.IpcHandelEvent('render-message', (ev, res) => {
                if (res.run == 'hide-timeout') {
                    //隐藏好了
                    API.IpcSend('execute-show');
                    if (res.isError) {
                        r2('Ctrl+F2 ~ Error!');
                        return;
                    }
                    r1(true);
                }
            });
        });
    }, []);

    //事件点击  闭包问题-------------
    const handlerClick = (event) => {
        if (event) {
            //隐藏自己
            API.IpcSend('execute-hide');
        }
        if (!videoStateRef.current) {
            //首次开始
            handleStartRecord(event);
        } else {
            //暂停/继续
            handleTogglePlay(event);
        }
    }



    const stop = (event) => {
        if (!videoStateRef.current) return;
        sendMsg('stop', event);//结束
        set_videoState(false);
        set_play(false);
        set_times(0);
    }



    //通知对方
    const sendMsg = (type, event) => {
        if (!event) return;
        const data = { toName: 'main', type };
        API.IpcPostMessage('render-message', data);
    }

    const onMouseEnter = ({ nativeEvent }) => {
        if (window.isDragging) return;
        document.body.style.cursor = `url(${grab}) 10 10, auto`;
        set_toops(true);
        //让窗口响应鼠标事件
        API.IpcSend('setIgnore', { isSetIgnore: false });
    }

    const onMouseLeave = ({ nativeEvent }) => {
        if (window.isDragging) return;
        document.body.style.cursor = "auto";
        set_toops(false);
        //让窗口忽略鼠标事件
        API.IpcSend('setIgnore', { isSetIgnore: true });
    }


    useEffect(() => {
        videoStateRef.current = videoState;
    }, [videoState]);


    useEffect(() => {
        const handler = (event, res) => {
            if (res.type == 'show') {
                //显示自己
                API.IpcSend('execute-show', { isFocus: false });
            } else if (res.type == 'hide') {
                //隐藏自己
                API.IpcSend('execute-hide');
            } else if (res.type == 'start') {
                handlerClick();
            } else if (res.type == 'pause') {
                handlerClick();
            } else if (res.type == 'stop') {
                stop();
            } else if (res.type === 'set-times') {
                set_times(res.nums);
            }
        }

        API.IpcHandelEvent('render-message', handler);

        //添加右键原生菜单
        window.addEventListener('contextmenu', ev => {
            ev.preventDefault();
            API.IpcSend('right-click', {});
        });

        return () => {
            API.RemoveListener('render-message', handler);
        }

    }, []);

    return (
        <div className='SuspendedBall' onMouseLeave={onMouseLeave}>
            <div className='Ball' onMouseEnter={onMouseEnter} onMouseDown={({ nativeEvent }) => moveTo({ nativeEvent })}>
                {times ? formatTime(times) : '-- : --'}
            </div>
            <div className='toops' style={{ display: toops ? 'flex' : 'none' }}>
                {/* 播放/停止/编辑 */}
                {isplay ? <PauseOutlined onClick={handlerClick} /> : <CaretRightFilled onClick={handlerClick} />}
                <XFilled onClick={stop} style={{ color: videoState ? '#cc2b2b' : '#d8d8d8', cursor: videoState ? 'auto' : 'not-allowed' }} />
                <HighlightFilled style={{}} />
            </div>
        </div>
    )
}

export default SuspendedBall;
