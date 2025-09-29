import React, { useEffect, useState, useRef, useCallback } from 'react';
import API from '@/utils/ipcRenderer';
import TableCom from '@/components/views/Table';
import { Columns } from './Columns';
import './list.scss';
import { ExclamationCircleFilled, RedoOutlined, ScissorOutlined } from '@ant-design/icons';
import { Modal, Flex, Button, message } from 'antd';
import { ffmpegData as frontStore } from '@/store/ffmpegOptins';
import { updateServeStore } from '@/utils/utils';



const ListComp = (props) => {

  const [loading, set_loading] = useState(false);

  const [tableData, set_tableData] = useState([]);

  const currentRow = useRef({});

  const TableRef = useRef(null);

  const [modal, contextHolder_modal] = Modal.useModal();

  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = (state = 'info', msg = '') => {
    messageApi[state] && messageApi[state](msg);
  };

  const BaseBtnClick = (e) => {
    // console.log(e);
    if (e.key == 1) {
      //播放

      set_loading(true);
      API.Invoke('openResource', { path: currentRow.current.filename }).then(res => {
        showMessage('success', '打开成功！');
        set_loading(false);
      }).catch(err => {
        showMessage('error', '找不到文件或目录！');
        set_loading(false);
      });


    } else if (e.key == 2) {

    } else if (e.key == 3) {
      //文件位置
      set_loading(true);
      API.Invoke('openResource', { path: currentRow.current.filename, isDir: true }).then(res => {
        showMessage('success', '打开成功！');
        set_loading(false);
      }).catch(err => {
        showMessage('error', '找不到文件或目录！');
        set_loading(false);
      });

    } else if (e.key == 4) {
      //删除

      modal.confirm({
        title: '删除文件',
        centered: true,
        keyboard: false,
        maskClosable: false,
        icon: <ExclamationCircleFilled />,
        content: '是否删除本地视频？',
        okText: '确认',
        cancelText: '取消',
        onOk: deleteFile,
        onCancel() {
          // console.log('Cancel');
        },
      });


    }
  }

  const deleteFile = () => {

    const list = tableData.filter(f => f.key !== currentRow.current.key);
    set_loading(true);
    API.Invoke('fs-unlink', { filePath: currentRow.current.filename }).then(res => {
      showMessage('success', '删除成功！');
      set_tableData(() => {
        frontStore._set("videoList", list, true);
        updateServeStore();
        return list;
      });
      set_loading(false);
    }).catch(err => {
      showMessage('error', '删除失败！');
      set_loading(false);
    });
  }

  ///双击
  const rowDbclick = (row) => {
    console.log(row);
    currentRow.current = row;
    set_loading(true);

    API.Invoke('openResource', { path: row.filename }).then(res => {
      showMessage('success', '打开成功！');

      set_loading(false);
    }).catch(err => {
      showMessage('error', '找不到文件或目录！');
      set_loading(false);
    });
  }

  const cellChange = (row) => {
    console.log(row);

    let updatevideoName = '';

    const newList1 = tableData.map(m => {
      if (m.key === row.key) {
        updatevideoName = updateValFunc(m.videoName, row.updateVal);
        m.videoName = updatevideoName;
      }
      return m;
    });

    if (tableData.some(f => f.key !== row.key && f.videoName === updatevideoName)) {
      //找到其他文件名相同的
      showMessage('error', '文件名冲突！');
      return;
    }


    if (updatevideoName) {
      API.Invoke('fs-rename', { oldPath: row.filename, newPathname: updatevideoName }).then(newPath => {
        showMessage('success', '修改成功！');
        const newList2 = newList1.map(m => {
          if (m.key === row.key) {
            m.filename = newPath;
          }
          return m;
        });

        set_tableData(() => {
          frontStore._set("videoList", newList2, true);
          updateServeStore();
          return newList2;
        });
      }).catch(err => {
        showMessage('error', '修改失败！');
      });
    }



  }

  const updateValFunc = (oleVal, val) => {
    let fileType = oleVal.substring(oleVal.lastIndexOf('.') + 1);
    if (!val.includes('.')) {
      var name = val + '.' + fileType;
    } else {
      if (val.substring(val.lastIndexOf('.') + 1) !== fileType) {
        var name = val + '.' + fileType;
      } else {
        return val;
      }
    }
    return name;
  }

  const onMouseEnter = (row) => {
    currentRow.current = row;
  }



  const appenData = (data) => {

    set_tableData(oldList => {
      if (oldList.find(f => f.key == data.key)) {
        return oldList;
      }
      const arr = [...oldList, data].sort((a, b) => a.date - b.date);
      return arr;
    });

    TableRef.current?.setSelectedRowKey(data.key);
    setTimeout(() => TableRef.current?.scrollTo(), 1000);
  };


  //表格按钮点击
  const footerBtnHandleClick = (type) => {
    if (type == 1) {
      //刷新
      set_loading(true);
      set_tableData(() => {
        API.IpcSend('getvideoSrcList', {});
        return [];
      });

    } else if (type == 2) {
      console.log(TableRef.current);
    }

  }


  const getFooter = () => {
    return (<Flex style={{ display: loading ? 'none' : 'flex' }} className='footerFlex' gap="4px 0" justify='space-between' align='center'>
      <div className='left'>
        当前位置：<span onClick={outputPathClick} title={frontStore._get('output')}>{frontStore._get('output')}</span>
        {/* <RedoOutlined /> */}
      </div>
      <div className='right'>
        <Button onClick={() => footerBtnHandleClick(1)} size='small' icon={<RedoOutlined />}>刷新</Button>
        <Button onClick={() => footerBtnHandleClick(2)} size='small' icon={<ScissorOutlined />}>剪辑</Button>
      </div>
    </Flex>);
  }

  const getvideoSrcListCallbackOver = (res) => {
    TableRef.current?.setSelectedRowKey("");
    // console.log(res.run, res.data);
    set_loading(false);
    frontStore._set("videoList", res.data, true);
    updateServeStore(1);

  }


  const outputPathClick = async (event) => {
    if (event.ctrlKey) {
      set_loading(true);
      await API.Invoke('openResource', { path: frontStore._get('output') });
      set_loading(false);
      return;
    }
    const text = await navigator.clipboard.readText();
    if (text === frontStore._get('output')) {
      showMessage('success', '复制成功！');
      return;
    }
    await navigator.clipboard.writeText(frontStore._get('output'));
    showMessage('success', '复制成功！');
  }


  useEffect(() => {



    if (frontStore._get("videoList")?.length) {
      set_tableData(frontStore._get("videoList").sort((a, b) => a.date - b.date));

    } else {
      API.IpcSend('getvideoSrcList', {});
    }


    const handler = (event, res) => {
      if (res.run === 'getvideoSrcList-callback') {
        // console.log(res.run, res.data);
        set_loading(false);
        appenData(res.data);

      } else if (res.run === 'getvideoSrcList-callback-over') {
        getvideoSrcListCallbackOver(res);

      }
    };

    API.IpcHandelEvent('render-message-getvideoSrcList', handler);

    return () => {
      API.RemoveListener('render-message-getvideoSrcList', handler);
    }
  }, []);


  return (
    <>
      {contextHolder_modal}
      {contextHolder}
      <TableCom
        data={tableData}
        Order={false}
        ref={TableRef}
        title=""
        onMouseEnter={onMouseEnter}
        onDoubleClick={rowDbclick}
        columns={Columns({}, BaseBtnClick, cellChange)}
        loading={loading}
        pagination={getFooter()}
      //pagination={set_pageData()}
      //rowHandRightClick={rowHandRightClick}
      // rowSelection
      //handSelectChange={handSelectChange}
      //onChange={tableOnChange} 
      />
    </>

  )
}

export default ListComp;
