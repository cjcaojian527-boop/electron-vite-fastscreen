import './index.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flex } from 'antd';
import { moveTo, formatTime, jsonToffmpegData, stopMediaTracks } from '@/utils/utils';
import { grab } from '@/utils/const';
import API from '@/utils/ipcRenderer';
import { BasicState } from '@/store/base';
import { ffmpegData } from '@/store/ffmpegOptins';

import {
  PlayCircleOutlined,  // 对应图片中的“播放”图标 (带圆圈)
  PauseCircleOutlined,
  StopOutlined,         // 对应图片中的“停止”图标 (通常用作方形)
  XFilled
} from '@ant-design/icons';

let isHide = false;

const FooterComp = ({ setItem, showMessage }) => {
  const [times, set_times] = useState(0);
  // const timer = useRef(null);
  const [videoState, set_videoState] = useState(false);//是否录制中
  const videoStateRef = useRef(videoState);
  const [isplay, set_isPlay] = useState(false);//是否暂停

  //启动视频录制
  const handleStartRecord = (event) => {

    if (!event) {
      //通知的
      set_videoState(true);
      set_isPlay(true);
      sendMsg('start', event);//开始
      runTimer(undefined, event);//通知服务器录屏
    } else {
      //手动点击的
      set_videoState(true);
      berfosendMsg(1, event).then(() => {
        set_isPlay(true);
        sendMsg('start', event);//开始
        runTimer(undefined, event);
      }).catch(() => {
        set_videoState(false);
        API.IpcSend('execute-show');//显示自己
        API.IpcSend('execute-focus');//一定得聚焦自己
      });
    }

  }

  //暂停/继续
  const handleTogglePlay = (event) => {
    set_isPlay(flag => {
      if (flag) {
        //暂停
        berfosendMsg('pause', event);
        sendMsg('pause', event);
        runTimer('pause', event);

      } else {
        //继续
        berfosendMsg('start', event);
        sendMsg('start', event);
        runTimer('start', event);
      }
      return !flag;
    });
  }

  //事件点击
  const handlerClick = (event) => {
    if (!videoStateRef.current) {
      //首次开始
      handleStartRecord(event);
    } else {
      if (event) {
        isHide = true;
        API.IpcSend('execute-hide');
      }
      //暂停/继续
      handleTogglePlay(event);
    }
  }


  //通知对方
  const sendMsg = (type, event) => {
    if (!event) return;
    const data = { toName: 'SuspendedBallpool', type };
    API.IpcPostMessage('render-message', data);
  }

  //控制倒计时窗口
  const berfosendMsg = useCallback((type, event) => {
    if (!event) {
      return Promise.resolve(true);
    }
    if (type == 1) {
      API.IpcSend('load-timeout', { toName: 'timeoOutpool', fromName: 'main' });
    } else {
      API.IpcPostMessage('render-message', { toName: 'timeoOutpool', fromName: 'main', run: 'show-timeout', type });
    }
    return new Promise((r1, r2) => {
      API.IpcHandelEvent('render-message', (event, res) => {
        if (res.run == 'hide-timeout') {
          //隐藏好了
          if (isHide) {
            isHide = false;
            API.IpcSend('execute-show');//显示自己
          } else {
            API.IpcSend('execute-focus');//一定得聚焦自己
          }
          if (res.isError) {
            r2('Ctrl+F2 ~ Error!');
            return;
          }
          r1(true);
        }
      });
    });
  }, []);





  //启动定时器
  const runTimer = useCallback(async (run, event) => {
    // if (!event) {
    //   return;
    // }
    //摄像头录制的话 先关闭防止占用
    window.videostream && stopMediaTracks(window.videostream);

    const options = jsonToffmpegData(ffmpegData._getAll());
    console.log('main录屏参数:', options);

    API.IpcPostMessage('execute-times', { toName: 'SuspendedBallpool', run, fromName: 'main', options, videoType: BasicState.videoType });

    if (BasicState.videoType == '3') {
      // console.log(run, BasicState.MediaRecorderObeject);
      if (run != undefined) {
         if(!isStreamActive(BasicState.MediaRecorderObeject.mediaStream)){
          alert('媒体流已经关闭！');
          API.IpcPostMessage('execute-times', { toName: 'SuspendedBallpool', run: 'stop', fromName: 'main', videoType: BasicState.videoType });
          return;
         }
      }
      if (run == undefined) {
        if (!BasicState.MediaRecorderObeject.mediaStream) {
          const result = await BasicState.setMediaRecorder().catch(err => false);
          if (!result) {
            console.log('创建流error');
            API.IpcPostMessage('execute-times', { toName: 'SuspendedBallpool', run: 'stop', fromName: 'main', videoType: BasicState.videoType });
            return;
          }
          console.log('重新创建流：', BasicState.MediaRecorderObeject);
        }

        BasicState.MediaRecorderObeject.startRecord();
        setItem({ key: '2' });
      } else if (run == 'pause') {
        BasicState.MediaRecorderObeject.pause();
      } else if (run == 'start') {
        BasicState.MediaRecorderObeject.resume();
      } else if (run == 'stop') {
        BasicState.MediaRecorderObeject.stopRecord();
        BasicState.MediaRecorderObeject.download().then(ArrayBuffer => {
          // console.log(ArrayBuffer);
          API.IpcPostMessage('process-video', { ArrayBuffer });
          BasicState.MediaRecorderObeject.clear();
        });

      }
    }

  }, []);

  function isStreamActive(stream) {
    return stream && stream.getTracks().some(t => t.readyState === "live");
  }

  useEffect(() => {
    videoStateRef.current = videoState;
  }, [videoState]);


  const stop = (event) => {
    if (!videoStateRef.current) return;
    sendMsg('stop', event);//结束
    set_videoState(false);
    set_isPlay(false);
    set_times(0);
    runTimer('stop', event);
  }

  useEffect(() => {
    const handler = (event, res) => {
      if (res.type === 'start') {
        handlerClick();
      } else if (res.type === 'pause') {
        handlerClick();
      } else if (res.type === 'stop') {
        if (res.error) {
          showMessage("error", res.error);
        }
        stop();
      } else if (res.type === 'set-times') {
        set_times(res.nums);
      }
    };


    const Unload = () => {
      if (BasicState.videoType == '3' && BasicState.MediaRecorderObeject?.state !== 'inactive') {
        //还在录制的话就停止掉--不管视频了
        API.IpcPostMessage('execute-times', { toName: 'SuspendedBallpool', run: 'stop', fromName: 'main', videoType: BasicState.videoType });
      }
    }

    window.addEventListener('unload', Unload);
    API.IpcHandelEvent('render-message', handler);

    return () => {
      window.removeEventListener('unload', Unload);
      API.RemoveListener('render-message', handler);
    }
  }, []);



  return (
    <Flex className='footer_box' align="center" gap={20}>
      <Flex align="center" gap={10}>
        <div onClick={handlerClick}>{isplay ? <PauseCircleOutlined /> : <PlayCircleOutlined />}</div>
        {videoState ? <XFilled onClick={stop} /> : <StopOutlined />}
      </Flex>
      <Flex align="center" gap={10}>
        <span>时长：</span>
        <h2>{times ? formatTime(times) : '00 : 00 : 00'}</h2>
      </Flex>
      <div
        style={{ flex: 1, height: '100%', }}
        onMouseDown={({ nativeEvent }) => moveTo({ nativeEvent })}
        onMouseEnter={({ nativeEvent }) => document.body.style.cursor = `url(${grab}) 10 10, auto`}
        onMouseLeave={({ nativeEvent }) => document.body.style.cursor = 'auto'}
      ></div>
    </Flex>
  )
}

export default FooterComp;
