import { PoolsData } from './pools';
import createWindow from './createWindow';

//窗口池管理
class WindowPoolManager {

    constructor() {
        this.activePool = []; // 存储随时可用的 n 个窗口
        this.dormantPool = new Map(); // 存储待销毁的窗口，key: window.poolId, value: { window: PooledWindow, timer: setTimeoutId }
        this.maxActivePoolSize = PoolsData.length; // 示例：始终保持 3 个可用窗口
        this.maxDormantPoolSize = 6; // 示例：休眠池最大允许 5 个窗口
        this.dormantWindowTimeoutMs = 60 * 1000; // 示例：休眠窗口在 60 秒后销毁
        this.nextPoolId = 0;
    }


    //初始化窗口池
    initPool() {
        for (let i = 0; i < this.maxActivePoolSize; i++) {
            let poolId = this.nextPoolId++;
            const win = createWindow(PoolsData[i]);
            win.poolId = poolId;
            this.activePool.push(win);
        }

    }
    //抓取一个窗口
    acquireWindow(name) {
        //如果有空闲的窗口
        if (this.activePool.length > 0) {
            let i = this.activePool.findIndex(f => f.props.name === name);
            if (i > -1) {
                const win = this.activePool.splice(i, 1)[0];
                // this._replenishActivePool(name);//立即补上  不要立即补上 创建相同的createWindow实例对象会导致ipc进程接收不到消息
                return win;
            }

        }

        //但是考虑到极端环境下
        //极短的时间内（在旧窗口被取出和新窗口被创建之间）出现临时性的减少。
        if (this.dormantPool.size > 0) {
            const [poolId, { window: dormantWin, timer }] = this.dormantPool.entries().next().value;
            if (dormantWin.props.name === name) {
                clearTimeout(timer); // 清除销毁定时器
                this.dormantPool.delete(poolId);
                dormantWin.isAvailable = false; // 标记为可用
                // 立即创建一个新的窗口补充到 activePool，保持 n 个窗口数量
                // this._replenishActivePool(name);
                // console.log('休眠池里面取的！', dormantWin);
                return dormantWin;
            } else {

                //现创建一个
                return this._replenishActivePool(name);
            }

        }


        return this._replenishActivePool(name);
    }

    //释放某一个窗口
    releaseWindow(window) {
        if (!window || window.isDestroyed()) {
            return;
        }

        window.reset(); // 关键：清理渲染进程内容

        // 如果休眠池已满，主动销毁最旧的那个
        if (this.dormantPool.size >= this.maxDormantPoolSize) {
            //最开始存的那个窗口
            const [oldestPoolId, { window: oldestWin, timer: oldestTimer }] = this.dormantPool.entries().next().value;
            clearTimeout(oldestTimer);
            this.dormantPool.delete(oldestPoolId);
            if (!oldestWin.isDestroyed()) {
                oldestWin.destroy();
            }

        }

        //一分钟后自动销毁这个被清理缓存的窗口
        const timer = setTimeout(() => {
            if (this.dormantPool.has(window.poolId)) {
                this.dormantPool.delete(window.poolId);
                if (!window.isDestroyed()) {
                    window.destroy();
                }
            }
        }, this.dormantWindowTimeoutMs);

        this.dormantPool.set(window.poolId, { window, timer });
    }

    //立即创建新的空白窗口
    _replenishActivePool(name = 'base') {
        if (this.activePool.length < this.maxActivePoolSize) {
            const win = createWindow(PoolsData.find(f => f.name == name));
            win.poolId = this.nextPoolId++;//记录id
            this.activePool.push(win);
            return win;
        }
    }

    cleanup() {
        // 清理 activePool
        this.activePool.forEach(win => {
            if (!win.isDestroyed()) {
                win.destroy();
                console.log(`Destroyed active pooled window ${win.poolId}`);
            }
        });
        this.activePool = [];

        // 清理 dormantPool
        this.dormantPool.forEach(({ window: win, timer }) => {
            clearTimeout(timer);
            if (!win.isDestroyed()) {
                win.destroy();
                console.log(`Destroyed dormant pooled window ${win.poolId}`);
            }
        });
        this.dormantPool.clear();
        console.log('Window pools have been cleaned up.');
    }


}
global.Pool = new WindowPoolManager();
export default global.Pool;