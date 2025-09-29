import createWindow from '../utils/createWindow';
import InitIPC from '../utils/handeIpcMain';
import InitTray from '../Tray';
import { loadRenderer } from '@util';


const renderApp = () => {

    const mainWin = createWindow('main');
    const SuspendedBallWin = createWindow('SuspendedBallpool');

    loadRenderer(mainWin, {});
    loadRenderer(SuspendedBallWin, { hash: 'SuspendedBall' });

    mainWin.on('ready-to-show', () => {
        mainWin.show();
    });
    SuspendedBallWin.on('ready-to-show', () => {
        SuspendedBallWin.show();
    });

    InitTray();
    InitIPC();
}




//render函数
export default renderApp;