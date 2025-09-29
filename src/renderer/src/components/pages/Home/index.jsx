import React, { useEffect, useState } from 'react';
import { message, Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import "./index.scss";
import HeaderComp from '@/components/views/Header';
import FooterComp from '@/components/views/Footer';
import MenuComp from '@/components/views/Menu';
import Loading from '@/components/views/Loading';
import { updateServeStore } from '@/utils/utils';
import API from '@/utils/ipcRenderer';
import { HomeChildren } from '@/routes';
const { Header, Footer, Sider, Content } = Layout;



const Home = () => {

  const [loading, set_loading] = useState(false);
  const [loadingText, set_loadingText] = useState("加载中...");


  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = (state = 'info', msg = '') => {
    messageApi[state] && messageApi[state](msg);
  };


  const [menuKey, set_menuKey] = useState(sessionStorage.getItem('menuKey') || '1');

  const navigate = useNavigate();

  const menuChange = (item) => {
    sessionStorage.setItem('menuKey', item.key + "");
    const { path } = HomeChildren.filter(f => !f.index).find(f => f.key == item.key);
    navigate(path, { replace: true });
    set_menuKey(item.key + "");
  }


  //顶部图标点击
  const headIocnClick = (i) => {
    console.log(i);
    if (i == 3) {
      //隐藏自己
      API.IpcSend('execute-hide');
    } else if (i == 2) {
      //最小化
      API.IpcSend('MinusOutlined');

    } else if (i == 0) {
      //点击设置
      updateServeStore();//先推送一遍
      API.IpcPostMessage('load-setuppool', { toName: 'setuppool', fromName: 'main' });
    }
  }


  useEffect(() => {

    const handler = (event, res) => {
      if (res.type == 'show') {
        //显示自己
        API.IpcSend('execute-show');
      } else if (res.type == 'navigate') {
        menuChange({ key: '2' });//进入列表
        if (res.loading) {
          set_loading(true);
          set_loadingText(res.message);
        }

      } else if (res.type == 'hideLoading') {
        set_loading(false);
        set_loadingText("加载中...");

      }
    }

    API.IpcHandelEvent('render-message', handler);

    window.addEventListener('contextmenu', ev => {
      ev.preventDefault();
      API.IpcSend('right-click', {});
    });

    return () => {
      API.IpcHandelEvent('render-message', handler);
    }
  }, []);

  return (
    <Layout>
      {contextHolder}
      <Header><HeaderComp headIocnClick={headIocnClick} /></Header>
      <Layout>
        <Loading loading={loading} message={loadingText} />
        <Sider width="14%">
          <MenuComp onSelect={menuChange} defaultKey={menuKey} items={HomeChildren.filter(f => !f.index).map(({ key, label, icon }) => ({ key, label, icon }))} />
        </Sider>
        <Content><Outlet context={{ showMessage }} /></Content>
      </Layout>
      <Footer><FooterComp setItem={menuChange} showMessage={showMessage} /></Footer>
    </Layout>
  )
}

export default Home;
