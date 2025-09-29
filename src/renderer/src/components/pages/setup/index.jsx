import React, { useEffect, useState } from 'react';
import { Flex, Layout, message } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';
import "./index.scss";
import { moveTo, updateServeStore } from '@/utils/utils';
import { grab } from '@/utils/const';
// import { ffmpegData } from '@/store/ffmpegOptins';
import MenuComp from '@/components/views/Menu';
import API from '@/utils/ipcRenderer';
import { SetupChildren } from '@/routes';
const { Header, Sider, Content } = Layout;

const SetupComp = () => {

  const [menuKey, set_menuKey] = useState(sessionStorage.getItem('menuKey') || '1');
  const navigate = useNavigate();

  const menuChange = (item) => {
    sessionStorage.setItem('menuKey', item.key + "");
    const { path } = SetupChildren.filter(f => !f.index).find(f => f.key == item.key);
    navigate(path, { replace: true });
    set_menuKey(item.key + "");
  }

  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = (state = 'info', msg = '') => {
    messageApi[state] && messageApi[state](msg);
  };


  //顶部图标点击
  const headIocnClick = (name) => {
    // console.log(name);
    if (name == 'CloseOutlined') {
      updateServeStore();//先推送一遍 
      //API.IpcPostMessage('render-message', { toName: 'main', fromName: 'setuppool', run: 'set-screenSetingData'});

      //隐藏自己
      API.IpcSend('close');
      //API.IpcSend('execute-hide');
    }
  }


  useEffect(() => {

    document.title = "录屏设置";

    API.IpcHandelEvent('render-message', (event, res) => {
      // console.log(res);
      if (res.type == 'show') {
        //显示自己
        API.IpcSend('execute-show');
      }
    });

    window.addEventListener('contextmenu', ev => {
      ev.preventDefault();
      //const data = { x: +(ev.clientX / BASEscale).toFixed(2), y: +(ev.clientY / BASEscale).toFixed(2) };
      API.IpcSend('right-click', {});
    });

    API.IpcSend('execute-show');

  }, []);

  return (
    <Layout>
      {contextHolder}
      <Header>
        <Flex className='setup-title' align='center' justify="space-between">
          <span>设置</span>
          <div className='title-bar'
            onMouseDown={({ nativeEvent }) => moveTo({ nativeEvent })}
            onMouseEnter={({ nativeEvent }) => document.body.style.cursor = `url(${grab}) 10 10, auto`}
            onMouseLeave={({ nativeEvent }) => document.body.style.cursor = "auto"}
          ></div>
          <CloseOutlined onClick={() => headIocnClick('CloseOutlined')} />
        </Flex>
      </Header>
      <Layout>
        <Sider width="14%">
          <MenuComp onSelect={menuChange} defaultKey={menuKey} items={SetupChildren.filter(f => !f.index).map(({ key, label, icon }) => ({ key, label, icon }))} />
        </Sider>
        <Content><Outlet context={{ showMessage }} /></Content>
      </Layout>
      {/* <Footer><FooterComp start={startDV} /></Footer> */}
    </Layout>
  )
}

export default SetupComp;
