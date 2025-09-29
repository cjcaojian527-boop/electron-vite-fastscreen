import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getUrlParams } from '@/utils/utils';
import API from '@/utils/ipcRenderer';
import './index.scss';


const TimeOutComp = (props) => {

  const { TimeNum = 4, } = props;
  const [num, setNum] = useState(TimeNum);
  const [str, setStr] = useState('');
  let _t = useRef(null);

  const init = useCallback((fromName) => {
    clearInterval(_t.current);
    _t.current = setInterval(() => {
      setNum((n) => {
        if (n <= 0) {
          clearInterval(_t.current);
          hide(fromName);
          return 0;
        }
        return n - 1;
      })
    }, 1000);
  }, []);

  const hide = useCallback((fromName, isError) => {
    fromName = fromName || getUrlParams().fromName;
    API.IpcSend('close');
    const data = { toName: fromName, run: 'hide-timeout', isError };
    API.IpcPostMessage('render-message', data);
    setStr('');
  }, []);


  useEffect(() => {
    init();

    window.addEventListener('contextmenu', ev => {
      ev.preventDefault();
      API.IpcSend('right-click', {});
    });

    document.addEventListener("keydown", function (e) {
      // e.ctrlKey 代表是否按下 Ctrl
      // e.key === "F2" 表示 F2 键
      if (e.ctrlKey && e.key === "F2") {
        e.preventDefault(); // 阻止浏览器默认行为（可选）
        if (num) {
          setNum((n) => {
            clearInterval(_t.current);
            hide("SuspendedBallpool", true);
            hide("main", true);
            return 0;
          });
        }
      }
    });


    const handler = (event, res) => {
      if (res.run == 'show-timeout') {
        //显示自己
        setStr(() => {
          setTimeout(() => hide(res.fromName), 1000);
          return res.type == 'pause' ? '暂停' : '继续';
        });
        API.IpcSend('execute-show');
      } else if (res.run == 'init-timeout') {
        //初始化

        setNum(() => {
          init(res.fromName);
          API.IpcSend('execute-show');
          return 4;
        });
      }
    };


    //注册事件
    API.IpcHandelEvent('render-message', handler);


    return () => {
      clearInterval(_t.current);
      API.RemoveListener('render-message', handler);
    };
  }, []);




  return (
    <>
      {
        num > 0 && num !== 4 && <div className='TimeOutComp'>
          <h1>{num}</h1>
          <div className='max-div'>
            <div className='min-div'></div>
          </div>
          <div className='text'>按Ctrl+F2停止</div>
          <h2>本地录制</h2>
        </div>
      }
      {
        num == 0 && str && <div className='TimeOutComp'>
          <h1 style={{ fontSize: 90, top: '49%' }}>{str}</h1>
          <div className='max-div'>
            <div className='min-div'></div>
          </div>
        </div>
      }
    </>
  )
}

export default TimeOutComp;
