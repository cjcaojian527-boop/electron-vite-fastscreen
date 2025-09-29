import React, { useRef, useEffect, useState } from 'react';
import FormCom from '@/components/views/Form';
import { Button } from 'antd';
import { outputList, fileSetList } from './data';
import API from '@/utils/ipcRenderer';
// import { updateLocalStore, updateServeStore } from '@/utils/utils';
import { ffmpegData } from '@/store/ffmpegOptins';
import { useOutletContext } from "react-router-dom";


const ScreenSet = () => {
  const formRef = useRef(null);
  const formRef2 = useRef(null);
  const { showMessage } = useOutletContext();//使用父组件方法



  const onValuesChange = (v, data, key) => {
    // console.log(v, data);
    ffmpegData._set(key, data);//更新
    //BasicState.setScreenData(getFormData());

  }
  const onValuesChange2 = (data) => {

    const [key, val] = Object.entries(data)[0];
    console.log(key, val);
    ffmpegData._set(key, val);//更新
    //BasicState.setScreenData(getFormData());
    // console.log(ffmpegData._getAll());

  }

  const getFormData = () => {
    return formRef?.current?.form.getFieldsValue() || {};
  }

  const init = () => {
    formRef.current.form.setFieldsValue(ffmpegData.outputOptions);
    formRef2.current.form.setFieldsValue(ffmpegData._getAll());

  }
  const openPath = () => {
    let path = ffmpegData._get('output');
    API.Invoke('openResource', { path }).then(res => {

    }).catch(err => {
       showMessage('error', '找不到文件或目录！');
    });
  
  }

  const openFileDialog = () => {
    const options = {
      title: '更改保存路径',
      defaultPath: ffmpegData._get('output'),
      properties: ['openDirectory', 'createDirectory']
    };
    API.Invoke('showOpenDialog', options).then(res => {
      console.log(res);
      if (!res.canceled) {
        //选择了
        ffmpegData._set('output', res.filePaths[0]);
        formRef2.current.form.setFieldValue('output', res.filePaths[0]);
      }
    })
  }

  useEffect(() => {
    const handler = (event, res) => {
      // if (res.run === 'get-screenSetingData-callback') {

      // }

    };
    API.IpcHandelEvent('render-message', handler);

    init();

    return () => {
      API.RemoveListener('render-message', handler);
    }
  }, []);


  return (
    <div>
      <FormCom
        formTitle="视频设置"
        maxHeight={150}
        itemList={outputList}
        onValuesChange={(v, data) => onValuesChange(v, data, 'outputOptions')}
        ref={formRef} />
      <FormCom
        formTitle="文件设置"
        maxHeight={150}
        itemList={fileSetList.map(m => {
          if (m.name == 'output') {
            m.customizeProps.renderProps = {
              style: { "width": 500 },
              disabled: true,
              addonAfter: <> <Button type="link" size="small" onClick={openFileDialog}>更改</Button>
                <Button size="small" type="link" onClick={openPath}>打开</Button></>
            }
          }
          return m;
        })}
        onValuesChange={onValuesChange2}
        ref={formRef2} />
    </div>
  )
}

export default ScreenSet;
