//注入页面的脚本代码1
export const SCRIPTCODE1 = `
    try {
	top.myAPI = myAPI || {};
    } catch (e) {
    try {
        top.myAPI = {}
    } catch (e) {}
    }
    window.addEventListener('contextmenu', ev => {
        ev.preventDefault();
        if(myAPI){
            myAPI.rightCilck({ x: ev.clientX, y: ev.clientY });
        }
    });
`;

export const outputExtname = 'merger_';//视频文件名

// 设计时基准分辨率（例如 1920x1280）
export const BASEscale = 1;//1.75;