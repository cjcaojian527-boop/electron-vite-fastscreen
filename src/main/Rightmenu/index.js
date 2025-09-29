import { Menu } from 'electron';

//-----------------右键-----------------//
// 菜单模板
const RightmenuTemplate = [
    {
        label: 'reload',
        click: (menuItem, browserWindow, event) => {
            browserWindow.reload();
            //browserWindow.webContents.session.clearCache().then(() => browserWindow.reload());

        }
    },
    {
        type: 'separator'
    },
    {
        label: 'open devTools',
        click: (menuItem, browserWindow, event) => {
            if (!browserWindow.webContents.isDevToolsOpened()) {
                browserWindow.webContents.openDevTools();
            }
        }
    },
    // {
    //     label: '关闭',
    //     click: (menuItem, browserWindow, event) => {
    //         browserWindow.close();
    //     }
    // }
];

// 构建右键菜单项
export default Menu.buildFromTemplate(RightmenuTemplate);