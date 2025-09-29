import React, { useEffect, useState } from 'react';
import "./index.scss";
import { TrayMenuIonsMap } from '@/assets/icons';
import API from '@/utils/ipcRenderer';
import { Menu } from 'antd';

const TrayMenu = () => {

    const [isShow, set_isshow] = useState(true);//悬浮球显示控制

    const items = [
        {
            key: 1,
            icon: <TrayMenuIonsMap.HomeFilled />,
            label: '打开主界面'
        },
        {
            key: 2,
            icon: <TrayMenuIonsMap.SettingFilled />,
            label: '设置'
        },
        {
            key: 3,
            icon: isShow ? <TrayMenuIonsMap.EyeInvisibleFilled /> : <TrayMenuIonsMap.EyeFilled />,
            label: isShow ? '隐藏悬浮球' : '显示悬浮球'
        },
        {
            key: 4,
            icon: <TrayMenuIonsMap.WarningFilled />,
            label: '退出'
        }
    ];



    const onClick = (e) => {
        // console.log(e);

        if (e.key == 1) {
            //打开主界面
            const data = { toName: 'main', type: 'show' };
            API.IpcPostMessage('render-message', data);
            API.IpcPostMessage('execute-hide');
        } else if (e.key == 3) {
            //隐藏-显示悬浮球
            set_isshow(flag => {
                const data = { toName: 'SuspendedBallpool', type: flag ? 'hide' : 'show' };
                API.IpcPostMessage('render-message', data);
                return !flag;
            });


        } else if (e.key == 4) {
            API.IpcSend('closeApp');
        }


    }
    useEffect(() => {
        // 监听鼠标离开页面事件
        document.body.addEventListener('mouseleave', () => {
            API.IpcSend('execute-hide');
        });

    }, []);


    //监听主进程消息
    useEffect(() => {
        // API.IpcHandelEvent('render-message', (event, res) => {
        //     console.log(event, res);
        // });
    }, []);

    return (
        <Menu
            style={{ height: '100%', paddingTop: 1, borderRight: 0 }}
            onClick={onClick}
            selectedKeys={[]}
            mode="inline"
            items={items}
        />
    )
}

export default TrayMenu;
