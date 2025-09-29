import React, { useState, useRef, useEffect } from 'react';
import { Select, Flex, Tooltip, Radio, message, Modal, Button } from 'antd';
import { ResolutionList } from '@/utils/const';
import API from '@/utils/ipcRenderer';
import { observer } from "mobx-react-lite";
import { BasicState } from '@/store/base';
import { stopMediaTracks, getMedia } from '@/utils/utils';
import { useActivate, useUnactivate } from "react-activation";
import VideoSetComp from '@/components/views/videoset';
// import { ffmpegData } from '@/store/ffmpegOptins';
import './index.scss';
import {
  MonitorOutlined,
  BorderOutlined,
  AppstoreOutlined,
  VideoCameraOutlined,
  // Antd 官方没有直接的“不录视频”图标，
  // 通常我们会使用一个通用的禁用图标，或者用 VideoCameraOutlined
  // 然后通过 CSS 添加一个斜线。这里我选择了通用的禁止图标。
  FormOutlined,
  VideoCameraFilled,
  SoundOutlined,
  AudioOutlined,     // 麦克风图标
  MinusCircleOutlined, // 或者 StopOutlined, CloseCircleOutlined
  CloseOutlined
} from '@ant-design/icons';






const videoOptions = [
  { value: '1', label: <div className='itmes'><MonitorOutlined />全屏录制</div> },
  { value: '2', label: <div><BorderOutlined />选取录制</div> },
  { value: '3', label: <div><AppstoreOutlined />窗口录制</div> },
  { value: '4', label: <div><VideoCameraOutlined />摄像头录制</div> },
];

const _audioOptions = [
  // { value: '1', label: <div className='itmes'><AudioOutlined />仅麦克风</div> },
  // { value: '2', label: <div><SoundOutlined />仅系统声音</div> },
  // { value: '3', label: <div><BarChartOutlined />麦和系统声音</div> },
  { value: '1', label: <div><MinusCircleOutlined />不录音频</div> },
];

let cruuentResolution = null;//当前分辨率
let currentpics = null;//当前摄像头
let isFirstActivation = null;


const BaseComp = () => {

  const [messageApi, contextHolder] = message.useMessage();
  const [cameraModal, set_cameraModal] = useState(false);
  const [audioOptions, set_audioOptions] = useState(_audioOptions);
  const [BaseCompLoading, set_BaseCompLoading] = useState(false);
  const [VideoSetComp_show, set_VideoSetComp_show] = useState(false);
  const video = useRef(null);
  const winList = useRef([]);
  const VideoSetCompRef = useRef(null);
  const pics = useRef([]);
  const videostream = useRef(null);




  //音频select下拉框change事件处理func
  const AudiohandleChange = (value) => {
    console.log(audioOptions[value - 1]);
    console.log(value, audioOptions[value - 1]);
    BasicState.setAudioType(value, audioOptions[value - 1]);
  }


  const onAudioOpenChange = async (ev) => {
    // console.log(ev);
    if (!ev) return;

    let devices = (await API.Invoke('getlistDshowDevices')).filter(d => d.type == 'audio');

    devices = devices.map((m, i) => {
      return { value: i + 2 + "", label: <div className='itmes' title={m.label}><AudioOutlined />{m.label}</div> };
    });
    const defaule = { value: devices.length + 2 + "", label: <div className='itmes' title="default"><SoundOutlined />系统扬声器</div> };
    set_audioOptions([..._audioOptions, ...devices, defaule]);
  }





  const Init = async () => {
    if (BasicState.videoType == '3' && BasicState.MediaRecorderObeject && BasicState.MediaRecorderObeject.state !== 'inactive') {
      //还在窗口录制中不准操作
      set_BaseCompLoading(true);
      return;
    }
    console.log('Init---')
    set_BaseCompLoading(false);
    BasicState.setVideoType('1');

    const sources = await API.Invoke('get-sources', { types: ['screen'] });

    openVideoStream(sources[0]);

    let devices = (await API.Invoke('getlistDshowDevices')).filter(d => d.type == 'audio');
    devices = devices.map((m, i) => {
      return { value: i + 2 + "", label: <div className='itmes' title={m.label}><AudioOutlined />{m.label}</div> };
    });
    const defaule = { value: devices.length + 2 + "", label: <div className='itmes' title="default"><SoundOutlined />系统扬声器</div> };
    set_audioOptions([..._audioOptions, ...devices, defaule]);


  }


  //设置video
  const openVideoStream = (sources) => {
    videostream.current && stopMediaTracks(videostream.current);
    return new Promise(async (r1, r2) => {
      try {
        videostream.current = await getMedia(sources);
        if (video.current) {
          video.current.srcObject = videostream.current;
          video.current.play();
        }
        r1(videostream.current);
      } catch (error) {
        console.info(error);
        messageApi.open({
          type: 'error',
          content: `打开窗口【${sources.name}】失败，请重试！`,
        });
        r2(error);
      }
    });

  }


  //展开video下拉框
  const VideoOpenChange = (ev) => {
    if (!ev) return;
    API.Invoke('get-sources', { types: ['window'], fetchWindowIcons: true }).then(list => {
      // console.log("windows:", list);
      winList.current = list;
    });
  }


  //点击某个窗口的回调
  const WinListChange = async ({ target }) => {
    const item = winList.current.find(f => f.id === target.value);
    // console.log(item);
    if (item) {
      openVideoStream(item).then(() => {
        BasicState.setVideoType('3', item, videostream.current);
      });

    }

  }

  //选择摄像头回调
  const CameraHandleOk = async () => {
    set_cameraModal(false);
    currentpics = currentpics || pics.current[0];
    cruuentResolution = cruuentResolution || ResolutionList[0];

    const constraints = {
      //分辨率配置
      video: {
        "width": +cruuentResolution.text.split('x')[0],
        "height": +cruuentResolution.text.split('x')[1],
        "aspectRatio": {
          ideal: 16 / 9
        },
        "frameRate": {
          ideal: 30
        },
        "deviceId": {
          "exact": currentpics.deviceId
        }
      },
      //video:true,
      audio: false
    };
    stopMediaTracks(videostream.current);
    video.current.srcObject = null;
    try {
      window.videostream = await navigator.mediaDevices.getUserMedia(constraints);
      if (video.current) {
        video.current.srcObject = window.videostream;
        video.current.play();
      }


      BasicState.setVideoType('4', {
        "width": +cruuentResolution.text.split('x')[0],
        "height": +cruuentResolution.text.split('x')[1],
        "name": currentpics._label,
      });
    } catch (error) {
      console.info(error);
      messageApi.open({
        type: 'error',
        content: `打开设备：【${currentpics._label}】失败，请重试！`,
      });
    }

  }

  //选取录制窗口的回调
  const getWinInfoCallback = (res) => {
    console.log('getWinInfoCallback:', res);
    if (res.flag) {
      //成功的
      BasicState.setVideoType('2', res.rect);
    }
  }



  //视频下选择
  const VideoHandelSelect = async (value) => {

    if (value == 1) {
      //全屏录制
      Init();
    } else if (value == 2) {
      //选取录制
      API.IpcPostMessage('load-Croppingpool', { toName: 'Croppingpool', fromName: 'main' });
    } else if (value == 4) {
      //摄像头录制
      let devices = (await API.Invoke('getlistDshowDevices')).filter(d => d.type == 'video');
      // console.log('设备列表:', devices);
      let list = (await navigator.mediaDevices.enumerateDevices()).filter(f => f.kind === 'videoinput');
      pics.current = list.map(m => {
        const matchingDevice = devices.find(d => m.label.includes(d.label));
        // 创建一个新对象，复制原始属性并覆盖 label
        if (matchingDevice) {
          m._label = matchingDevice.label;
        }
        return m;
      });
      set_cameraModal(true);
    }
  }

  const openVideoset = () => {
    set_VideoSetComp_show(true);
    VideoSetCompRef.current.videoPlay(videostream.current);
  }





  useUnactivate(() => {
    isFirstActivation = null;
    set_VideoSetComp_show(false);
    if (BasicState.videoType !== '3') {
      stopMediaTracks(videostream.current);
    }
  });

  useActivate(() => {
    // 只在第一次激活时运行 Init
    if (!isFirstActivation) {
      isFirstActivation = true;
      Init();
    }
  });

  useEffect(() => {
    Init();


    const handler = (event, res) => {
      if (res.run === 'getWinInfoCallback') {
        //获取窗口截取回调
        API.IpcSend('execute-show');
        getWinInfoCallback(res)

      }
    };
    API.IpcHandelEvent('render-message', handler);
    return () => {
      API.RemoveListener('render-message', handler);
    }
  }, []);



  return (
    <Flex className='BaseComp'>
      {contextHolder}
      {BaseCompLoading && <div className='BaseComp-loading'>正在录屏中，禁止操作！</div>}
      <div className='BaseComp-left'>
        <div className='BaseComp-left-titleBar'>
          <VideoCameraFilled />
          <span>本地录制</span>
        </div>
        <Flex justify="space-around" style={{ width: '100%' }}>
          <div>
            <p className='title-p'>选择录制区域</p>
            <Select

              value={BasicState.videoType}
              onOpenChange={VideoOpenChange}
              onSelect={VideoHandelSelect}
              options={videoOptions}
              optionRender={option => (
                <>{option.data.value == 3 ? <Tooltip placement="right" color="#fff"
                  title={<Radio.Group optionType="button" id='Tooltips' onChange={WinListChange}
                    options={winList.current.map(m => ({ className: 'winList-item', value: m.id, label: m.name, title: m.name }))} />}>
                  {option.data.label}</Tooltip> : option.data.label}</>
              )}
            />
          </div>
          <div>
            <p className='title-p'>选择录制音频</p>
            <Select
              defaultValue={BasicState.audioType}
              onOpenChange={onAudioOpenChange}
              onChange={AudiohandleChange}
              options={audioOptions}
            />
          </div>
        </Flex>
      </div>

      <div className='videoBox'>
        <div className='video-conner'>
          <video ref={video} preload="auto" x-webkit-airplay="allow" x5-video-player-type="h5"
            x5-video-player-fullscreen="true" x5-video-orientation="portrait" webkit-playsinline="true" playsInline>
          </video>
        </div>
        <Button icon={<FormOutlined />} onClick={openVideoset}>场景编辑</Button>
      </div>
      <VideoSetComp show={VideoSetComp_show} setShow={set_VideoSetComp_show} ref={VideoSetCompRef} messageApi={messageApi} />

      {/* 摄像头选择框 */}
      <Modal
        title={<><span>摄像头</span><CloseOutlined onClick={() => set_cameraModal(false)} /></>}
        closable={false}
        mask={false}
        className="cameraModal"
        open={cameraModal}
        maskClosable={false}
        footer={<div className='footer'>
          <a onClick={CameraHandleOk} href="#" className='a1'>确定</a>
          <a onClick={() => set_cameraModal(false)} href="#" className='a2'>取消</a>
        </div>}
      >
        <Flex align="center" justify='space-around'>
          <span>请选择摄像头：</span>
          <Select
            size='small'
            onChange={value => currentpics = pics.current.find(f => f.deviceId === value)}
            options={pics.current.map(m => ({ label: m._label, value: m.deviceId }))}
          />
        </Flex>
        <Flex align="center" justify='space-around'>
          <span>请选择分辨率：</span>
          <Select
            size='small'
            onChange={value => cruuentResolution = ResolutionList.find(f => f.id === value)}
            defaultValue={ResolutionList[0].id}
            options={ResolutionList.map(m => ({ label: m.text, value: m.id }))}
          />
        </Flex>
      </Modal>
    </Flex>
  )
}

export default observer(BaseComp);
