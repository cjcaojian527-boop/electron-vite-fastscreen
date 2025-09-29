// import { BrowserWindow, screen } from 'electron';

//窗口预加载配置的窗口
export const PoolsData = [
    {
        name: 'main',
        options: {
            width: 860,
            height: 530,
            // minWidth: 860,
            // minHight: 530,
            resizable: false,//窗口大小是否可变
            skipTaskbar: false,//是不是不显示在任务栏上
        }
    },
    {
        name: 'setuppool',//设置窗口
        options: {
            width: 700,
            height: 400,
            skipTaskbar: false,//是不是不显示在任务栏上
            resizable: false,//窗口大小是否可变
        }
    },
    {
        name: 'timeoOutpool',//倒计时
        options: {
            transparent: true,
            focusable: true,//不能被聚焦
            skipTaskbar: true,//是不是不显示在任务栏上
            backgroundColor: '#00000000',
        }
    },
    {
        name: 'Croppingpool',//窗口截取
        options: {
            transparent: true,
            focusable: true,//不能被聚焦
            skipTaskbar: true,//是不是不显示在任务栏上
            backgroundColor: '#00000000',
            alwaysOnTop: true, // 保持在所有其他窗口之上
        }
    },
    {
        name: 'SuspendedBallpool',//悬浮球
        options: {
            transparent: true,
            skipTaskbar: true,//是不是不显示在任务栏上
            alwaysOnTop: true, // 保持在所有其他窗口之上
            hasShadow: false,  // 移除窗口阴影
            backgroundColor: '#00000000',
            resizable: false,//窗口大小是否可变
            width: 175,
            height: 60,
            titleBarStyle: "hidden",//踩坑electron在无边框透明的情况下，win标题栏表现异常
        }
    },
    {
        name: 'TrayMenu',//托盘菜单
        options: {
            transparent: true,
            skipTaskbar: true,//是不是不显示在任务栏上
            alwaysOnTop: true, // 保持在所有其他窗口之上
            hasShadow: false,  // 移除窗口阴影
            backgroundColor: '#00000000',
            resizable: false,
            width: 160,
            height: 240,
            titleBarStyle: "hidden",//踩坑electron在无边框透明的情况下，win标题栏表现异常
            //https://kuraa.cc/archives/electronzai-wu-bian-kuang-tou-ming-de-qing-kuang-xia-winbiao-ti-lan-biao-xian-yi-chang
            // x: screen.getPrimaryDisplay().size.width - 175,
            // y: screen.getPrimaryDisplay().size.height - 200,

        }
    }
];

export const getWinOptions = (name) => PoolsData.find(f=>f.name === name);
