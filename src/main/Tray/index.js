import { screen, Tray } from 'electron';
import path from 'path';
import createWindow from '../utils/createWindow';
import { is } from '@electron-toolkit/utils';
import { loadRenderer } from '@util';

export default function () {

    const TrayMenuWin = createWindow('TrayMenu');

    loadRenderer(TrayMenuWin, { hash: 'TrayMenu' });
    console.log("process.resourcesPath:",process.resourcesPath);

    if (is.dev) {
        var tray = new Tray(path.resolve(__dirname, '../../resources/icon512.png'));
    } else {
        var tray = new Tray(path.resolve(process.resourcesPath, 'resources/icon512.png'));
    }

    tray.setToolTip("FastScreen Server");
    tray.setIgnoreDoubleClickEvents(true);//设置该选项忽略双击事件。 忽略这些事件，允许检测托盘图标的单击事件

    TrayMenuWin.on('blur', () => {
        const { x, y, width, height } = tray.getBounds();
        const { x: screenX, y: screenY } = screen.getCursorScreenPoint();
        if ((screenX < x || screenX > x + width) || (screenY < y || screenY > y + height)) {
            //console.log('失去焦点--就隐藏--');
            TrayMenuWin.hide();
        }

    })

    tray.on('click', () => {
        // console.log('点击托盘！', tray.getBounds());
        // console.log(screen.getCursorScreenPoint());
    }).on('right-click', () => {
        const { x, y } = screen.getCursorScreenPoint();
        const [w, h] = TrayMenuWin.getSize();
        TrayMenuWin.setBounds({ x, y: y - h, width: TrayMenuWin.options.width, height: TrayMenuWin.options.height });
        if (!TrayMenuWin.isVisible()) {
            //console.log('显示聚焦--');
            TrayMenuWin.show();
        } else {
            TrayMenuWin.moveTop();
            TrayMenuWin.focus();
        }

    }).on('mouse-leave', () => {
        if (TrayMenuWin.isVisible()) {
            // TrayMenuWin.hide();
        }
    })

}