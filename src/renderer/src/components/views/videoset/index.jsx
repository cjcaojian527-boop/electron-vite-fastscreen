import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Flex, Button, Select, Checkbox, Col, Row, Image, Input } from 'antd';
import {
    CloseOutlined, PictureOutlined, VideoCameraAddOutlined, FontSizeOutlined,
    SyncOutlined, PictureFilled, VideoCameraFilled, FileTextFilled,
    FormOutlined, DeleteOutlined, FontColorsOutlined, BgColorsOutlined
} from '@ant-design/icons';
import "./index.scss";
import { ResolutionList } from '@/utils/const';
import { moveTo, pickColor, deepClone, generateUUID, textToImageBase64 } from '@/utils/utils';
import { grab } from '@/utils/const';
import MenuComp from '@/components/views/Menu';
import Crop from '@/components/pages/Cropping/crop';
import Loading from '@/components/views/Loading';
import { observer } from "mobx-react-lite";
import { WatermarkData } from '@/store/watermark';
import ModalComp from '@/components/views/Modal';
import API from '@/utils/ipcRenderer';
import loadError from '@/assets/images/load_error.png';

let cruuentResolution = ResolutionList[0];//当前分辨率
let RectTimeout = null;//
let TYPE = "";


const VideoSetComp = observer(forwardRef((props, ref) => {

    const videoRef = useRef(null);
    const [ModalProps, set_ModalProps] = useState({});
    const [loading, set_loading] = useState(false);
    const [waterText, set_waterText] = useState("");
    const pics = useRef([]);
    const videoBox = useRef(null);
    const [camera, set_camera] = useState({});

    const showMessage = (state = 'info', msg = '') => {
        props.messageApi[state] && props.messageApi[state](msg);
    };



    const setModalProps = (type) => {
        TYPE = type;
        const obj = {
            open: true,
            type,
            confirmFunc: ModalConfirmCallback,
        }

        if (type == 2) {
            //文字
            obj.title = "添加文字";

        } else if (type == 1) {
            //图片
            obj.title = "添加图片";
        } else if (type == 3) {
            obj.title = "摄像头";
        }
        // obj.children = getModalChildren();
        set_ModalProps(obj);
    }



    const CheckboxChange = ({ target }) => {
        const list = getListData().map(m => {
            if (target.value === m.key) {
                m.checked = target.checked;
            }
            return m;
        });
        if (ModalProps.type == 1) {
            //图片
            WatermarkData.setImageWater(list, true);
        } else if (ModalProps.type == 2) {
            //文字
            WatermarkData.setTextWater(list, true);
        }

    }

    const CheckboxChangeAll = ({ target }) => {
        const list = WatermarkData.AllData.map(m => {
            if (target.value === m.key) {
                m.checked = target.checked;
            }
            return m;
        });
        WatermarkData.setAllData(list, true);
    }
    //设置位置信息
    const setRectData = (Data,videoData) => {
        clearTimeout(RectTimeout);
        RectTimeout = setTimeout(() => {
            console.log(Data,videoData);
        }, 500);
    }


    const ContextMenuclick = (type, key) => {
        if (type != 3) {
            const list = WatermarkData.AllData.map(m => {
                if (key === m.key) {
                    m.zIndex = type == 1 ? (m.zIndex + 1) : (m.zIndex - 1);
                    if (m.zIndex == 0) {
                        m.zIndex = 1;
                    }
                }
                return m;
            });
            WatermarkData.setAllData(list, true);
        } else {
            removelistAllItem(WatermarkData.AllData.find(f => f.key === key));
        }
    }


    const openFileDialog = () => {
        const options = {
            title: '选取图片',
            //defaultPath: "pictures",//获取系统默认的图片路径
            properties: ['openFile'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] },
            ]
        };
        return API.Invoke('showOpenDialog', options);//
    }

    const addlistItem = async () => {
        if (ModalProps.type == 1) {
            //图片
            const result = await openFileDialog();
            // console.log(result);
            if (!result.canceled) {
                const imagePath = result.filePaths[0];
                const res = await API.Invoke('pathToBuffer', { path: imagePath }).catch(err => {
                    showMessage('error', '文件打开失败！');
                    return false;
                });
                console.log(res);
                if (res) {
                    const blob = new Blob([res.buffer], { type: res.mimeType });
                    // console.log(blob);
                    WatermarkData.setImageWater({
                        val: imagePath,
                        checked: true,
                        key: imagePath + '_' + Date.now(),
                        imageUrl: URL.createObjectURL(blob),
                        type: ModalProps.type,
                    });
                }
            }
        } else if (ModalProps.type == 2) {
            //文字
            WatermarkData.setTextWater({
                val: waterText,
                key: waterText + '_' + Date.now(),
                checked: true,
                type: ModalProps.type,
            });
        } else if (ModalProps.type == 3) {
            //摄像头 { label: m._label, value: m.deviceId }
            WatermarkData.setCameraWater({
                val: camera?._label,
                key: camera?.deviceId + '_' + Date.now(),
                deviceId: camera?.deviceId,
                checked: true,
                cruuentResolution: deepClone(cruuentResolution),
                type: ModalProps.type,
            });
        }


    }

    const removelistItem = (item) => {
        console.log({ ...item });
        if (ModalProps.type == 1) {
            //图片
            WatermarkData.setImageWater(WatermarkData.ImageWatermarkData.filter(f => f.key !== item.key), true);
        } else if (ModalProps.type == 2) {
            //文字
            WatermarkData.setTextWater(WatermarkData.TextWatermarkData.filter(f => f.key !== item.key), true);
        } else if (ModalProps.type == 3) {
            //文字
            WatermarkData.setCameraWater(WatermarkData.CameraWatermarkData.filter(f => f.key !== item.key), true);
        }
    }
    const removelistAllItem = (item) => {
        console.log({ ...item });
        WatermarkData.setAllData(WatermarkData.AllData.filter(f => f.key !== item.key), true);
    }


    const getListData = () => {
        let types = ModalProps.type || TYPE;
        // console.log('update-render!');
        if (types == 1) {
            //图片
            return WatermarkData.ImageWatermarkData;
        } else if (types == 2) {
            //文字
            return WatermarkData.TextWatermarkData;
        } else if (types == 3) {
            //摄像头
            return WatermarkData.CameraWatermarkData;
        }
        return [];
    }





    const PathClick = async (event, item) => {
        if (ModalProps.type !== 1) return;
        if (event.ctrlKey) {
            set_loading(true);
            await API.Invoke('openResource', { path: item.val });
            set_loading(false);
            return;
        }
        const text = await navigator.clipboard.readText();
        if (text === item.val) {
            showMessage('success', '复制成功！');
            return;
        }
        await navigator.clipboard.writeText(item.val);
        showMessage('success', '复制成功！');
    }
    //设置图标/颜色...
    const InputIconClick = (type) => {
        if (type == 1) {
            //font-size

        } else if (type == 2) {
            //color
            pickColor().then(color => {
                console.log(color);
            });
        }
    }



    const videoPlay = (stream) => {
        if (stream) {
            videoRef.current.srcObject = null;
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    }

    const ModalConfirmCallback = (isqueding) => {
        set_ModalProps({
            open: false,
        });
        if (isqueding) {
            const list = deepClone(getListData().filter(f => f.checked));
            console.log('选中的：', list);
            if (TYPE == 1 && list.length) {
                WatermarkData.setAllData(list.map(m => ({
                    ...m,
                    "zIndex": WatermarkData.setAllData.length + 1,
                    key: generateUUID(),
                    checked: true,
                    path: m.val,
                    val: m.val.substring(m.val.lastIndexOf('\\') + 1)
                })));
                WatermarkData.setImageWater(deepClone(getListData()).map(m => ({ ...m, checked: false })), true);

            } else if (TYPE == 2 && list.length) {
                WatermarkData.setAllData(list.map(m => ({ ...m, "zIndex": WatermarkData.setAllData.length + 1, key: generateUUID(), checked: true })));
                WatermarkData.setTextWater(deepClone(getListData()).map(m => ({ ...m, checked: false })), true);
            } else if (TYPE == 3 && list.length) {

                WatermarkData.setAllData(list.map(m => ({ ...m, "zIndex": WatermarkData.setAllData.length + 1, key: generateUUID(), checked: true })));
                WatermarkData.setCameraWater(deepClone(getListData()).map(m => ({ ...m, checked: false })), true);
            }

            console.log(deepClone(WatermarkData.AllData));
        }
    }

    const videoError = async ({ target }, item) => {
        console.log(target.src, { ...item });
        if (target.src.includes('#://')) {
            console.log(1111);
            const constraints = {
                //分辨率配置
                video: {
                    "width": +item.cruuentResolution.text.split('x')[0],
                    "height": +item.cruuentResolution.text.split('x')[1],
                    "aspectRatio": {
                        ideal: 16 / 9
                    },
                    "frameRate": {
                        ideal: 30
                    },
                    "deviceId": {
                        "exact": item.deviceId
                    }
                },
                //video:true,
                audio: false
            };
            target.src = null;
            try {
                const videostream = await navigator.mediaDevices.getUserMedia(constraints);
                target.srcObject = videostream;
                target.play();
            } catch (error) {
                console.info(error);
            }
        }
    }

    const getdevices = async () => {
        //摄像头录制
        set_loading(true);
        let devices = (await API.Invoke('getlistDshowDevices')).filter(d => d.type == 'video');
        // console.log('设备列表:', devices);
        let list = (await navigator.mediaDevices.enumerateDevices()).filter(f => f.kind === 'videoinput');
        set_loading(false);
        pics.current = list.map(m => {
            const matchingDevice = devices.find(d => m.label.includes(d.label));
            // 创建一个新对象，复制原始属性并覆盖 label
            if (matchingDevice) {
                m._label = matchingDevice.label;
            }
            return m;
        });
        if (pics.current.length) {
            set_camera(pics.current[0]);
        }

    }

    useEffect(() => {
        getdevices();
    }, []);

    //暴露方法给外部使用
    useImperativeHandle(ref, () => ({ videoPlay }));

    return (
        <div id='videoSet' style={{ display: props.show ? 'flex' : 'none' }}>
            {/* 添加的模态框 */}
            <ModalComp {...ModalProps}>
                <div className='ModalChildren'>
                    <Flex align='center' justify='space-between'>
                        {ModalProps.type == 1 && <span>图片列表</span>}
                        {ModalProps.type == 2 && <Input className='waterText' showCount maxLength={20}
                            value={waterText}
                            onChange={(e) => set_waterText(e.target.value)}
                            addonAfter={<Flex gap={5}>
                                <FontColorsOutlined onClick={() => InputIconClick(1)} title='设置字体' />
                                <BgColorsOutlined onClick={() => InputIconClick(2)} title='设置颜色' />
                            </Flex>}
                            addonBefore="水印内容" allowClear size="small" />}
                        {ModalProps.type == 3 && <>
                            <Flex align="start" justify='start' vertical>
                                <span>请选择摄像头：</span>
                                <Select
                                    style={{ margin: 0, width: 150 }}
                                    size='small'
                                    value={camera.deviceId}
                                    onChange={value => set_camera(pics.current.find(f => f.deviceId === value))}
                                    options={pics.current.map(m => ({ label: m._label, value: m.deviceId }))}
                                />
                            </Flex>
                            <Flex align="start" justify='start' vertical>
                                <span>请选择分辨率：</span>
                                <Select
                                    style={{ margin: 0, width: 150 }}
                                    size='small'
                                    onChange={value => cruuentResolution = ResolutionList.find(f => f.id === value)}
                                    defaultValue={ResolutionList[0].id}
                                    options={ResolutionList.map(m => ({ label: m.text, value: m.id }))}
                                />
                            </Flex>
                        </>}
                        {
                            ModalProps.type == 3 && <Button size='small' onClick={getdevices} icon={<SyncOutlined />}>刷新</Button>
                        }

                        <Button disabled={(ModalProps.type == 2 && !!!waterText) ||
                            (ModalProps.type == 3 && !pics.current.length) ||
                            (ModalProps.type == 3 && getListData().some(f => f.deviceId === camera?.deviceId))}
                            type="primary"
                            size='small' onClick={addlistItem}>添加</Button>
                    </Flex>
                    <Flex className='ModalChildren-list'>
                        {getListData().map((m, i) => (
                            <Row align="middle" justify="space-around" key={m.key}>
                                <Col span={1}>
                                    <Checkbox onChange={CheckboxChange} value={m.key} checked={m.checked}></Checkbox>
                                </Col>
                                <Col span={2}>
                                    {ModalProps.type == 1 && <Image width={30} src={m.imageUrl} fallback={loadError} />}
                                </Col>
                                <Col title={m.val} onClick={(e) => PathClick(e, m)} span={20}>{m.val}</Col>
                                <Col span={1}>
                                    <DeleteOutlined onClick={() => removelistItem(m)} />
                                </Col>
                            </Row>
                        ))}
                    </Flex>
                </div>
            </ModalComp>
            <Flex className='setup-title' align='center' justify="space-between">
                <span><FormOutlined />  场景编辑</span>
                <div className='title-bar'
                    onMouseDown={({ nativeEvent }) => moveTo({ nativeEvent })}
                    onMouseEnter={({ nativeEvent }) => document.body.style.cursor = `url(${grab}) 10 10, auto`}
                    onMouseLeave={({ nativeEvent }) => document.body.style.cursor = "auto"}
                ></div>
                <CloseOutlined onClick={() => props.setShow(false)} />
            </Flex>
            <Flex className='videoSet-context'>
                <div className='videoBox' ref={videoBox}>

                    {WatermarkData.AllData.map((m, i) => (
                        <Crop
                            key={m.key}
                            container={videoBox.current}
                            videoRef={videoRef}
                            ContextMenuclick={ContextMenuclick}
                            item={m}
                            setRectData={setRectData}
                        >
                            {m.type == 1 && <img src={m.imageUrl} />}
                            {m.type == 2 && <img src={textToImageBase64(m.val)} />}
                            {m.type == 3 && <video src="#://" onError={(e) => videoError(e, m)} preload="auto" x-webkit-airplay="allow" x5-video-player-type="h5"
                                x5-video-player-fullscreen="true" x5-video-orientation="portrait" webkit-playsinline="true" playsInline>
                            </video>}

                        </Crop>
                    ))}
                    <video ref={videoRef} preload="auto" x-webkit-airplay="allow" x5-video-player-type="h5"
                        x5-video-player-fullscreen="true" x5-video-orientation="portrait" webkit-playsinline="true" playsInline>
                    </video>
                </div>
                <Flex className='videoSet-context-list' vertical>
                    <div className='list-title'>水印添加（开发中~尚未实现）</div>
                    <Flex className='list-item' vertical>
                        {WatermarkData.AllData.map((m, i) => (
                            <Row align="middle" justify="space-around" key={m.key}>
                                <Col span={1}>
                                    <Checkbox onChange={CheckboxChangeAll} value={m.key} checked={m.checked}></Checkbox>
                                </Col>
                                <Col span={2}>
                                    {m.type == 1 && <PictureFilled />}
                                    {m.type == 2 && <FileTextFilled />}
                                    {m.type == 3 && <VideoCameraFilled />}
                                </Col>
                                <Col title={m.val} span={20}>{m.val}</Col>
                                <Col span={1}>
                                    <DeleteOutlined onClick={() => removelistAllItem(m)} />
                                </Col>
                            </Row>
                        ))}
                    </Flex>

                    <Flex className='bottom-icons' align='center' justify="space-around">
                        <div className='icons' onClick={() => setModalProps(1)}>
                            <PictureOutlined />
                            <h6>添加图片</h6>
                        </div>
                        <div className='icons' onClick={() => setModalProps(2)}>
                            <FontSizeOutlined />
                            <h6>添加文字</h6>
                        </div>
                        <div className='icons' onClick={() => setModalProps(3)}>
                            <VideoCameraAddOutlined />
                            <h6>添加摄像头</h6>
                        </div>
                    </Flex>
                </Flex>

            </Flex>
            <Loading loading={loading} />

        </div>
    );
})
);

export default VideoSetComp;
