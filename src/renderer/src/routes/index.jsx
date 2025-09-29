import { useRoutes } from "react-router-dom";
import { MenuIonsMap } from '@/assets/icons';
import { Navigate } from 'react-router-dom';
import { KeepAlive } from "react-activation";
import React, { Suspense } from 'react';
import Skeleton from '@/components/views/Skeleton';



// import BaseComp from '@/components/pages/Home/children/base/baseComp';
// import ListComp from '@/components/pages/Home/children/list/listComp';
// import VipComp from '@/components/pages/Home/children/vip/vipComp';


//主页子路由和菜单
const BaseComp = React.lazy(() => import('@/components/pages/Home/children/base/baseComp'));
const ListComp = React.lazy(() => import('@/components/pages/Home/children/list/listComp'));
const VipComp = React.lazy(() => import('@/components/pages/Home/children/vip/vipComp'));


//主页子路由和菜单
export const HomeChildren = [
    {
        index: true,
        element: <Navigate to="base" replace />//重定向
    },
    {
        path: 'base',
        element: (
            <KeepAlive id="home-base">
                <Suspense fallback={<Skeleton />}>
                    <BaseComp />
                </Suspense>
            </KeepAlive>
        ),
        key: 1,
        icon: <MenuIonsMap.AppstoreOutlined />,
        label: '常规'
    },
    {
        path: 'list',
        element: (
            <KeepAlive id="home-list">
                <Suspense fallback={<Skeleton />}>
                    <ListComp />
                </Suspense>
            </KeepAlive>
        ),
        key: 2,
        icon: <MenuIonsMap.UnorderedListOutlined />,
        label: '列表'
    },
    {
        path: 'vip',
        element: (
            <KeepAlive id="home-vip">
                <Suspense fallback={<Skeleton />}>
                    <VipComp />
                </Suspense>
            </KeepAlive>
        ),
        key: 3,
        icon: <MenuIonsMap.CrownOutlined />,
        label: '会员'
    }
];
//设置页面子路由和菜单
const ScreenSet = React.lazy(() => import('@/components/pages/setup/children/ScreenSet'));
const MouseSet = React.lazy(() => import('@/components/pages/setup/children/MouseSet'));
const Other = React.lazy(() => import('@/components/pages/setup/children/Other'));

//设置页面子路由和菜单
export const SetupChildren = [
    {
        index: true,
        element: <Navigate to="ScreenSet" replace />//重定向
    },
    {
        path: 'ScreenSet',
        element: <Suspense fallback={<Skeleton />}><ScreenSet /></Suspense>,
        key: 1,
        // icon: <MenuIonsMap.AppstoreOutlined />,
        label: '录屏设置'
    },
    {
        path: 'MouseSet',
        element: <Suspense fallback={<Skeleton />}><MouseSet /></Suspense>,
        key: 2,
        // icon: <MenuIonsMap.UnorderedListOutlined />,
        label: '鼠标设置'
    },
    {
        path: 'Other',
        element: <Suspense fallback={<Skeleton />}><Other /></Suspense>,
        key: 3,
        // icon: <MenuIonsMap.CrownOutlined />,
        label: '其他'
    }
];

const Home = React.lazy(() => import('@/components/pages/Home'));
const Timeout = React.lazy(() => import('@/components/pages/Timeout'));
const SuspendedBall = React.lazy(() => import('@/components/pages/SuspendedBall'));
const TrayMenu = React.lazy(() => import('@/components/pages/TrayMenu'));
const Cropping = React.lazy(() => import('@/components/pages/Cropping'));
const Setup = React.lazy(() => import('@/components/pages/setup'));

const RootComp = () => {
    const Pages = useRoutes([
        {
            path: "/",
            element: <Home />,
            children: HomeChildren
        },
        {
            path: "/timeout",
            element: <Timeout />,

        },
        {
            path: "/SuspendedBall",
            element: <SuspendedBall />,
        },
        {
            path: "/TrayMenu",//托盘菜单
            element: <TrayMenu />,
        },
        {
            path: "/Cropping",//窗口截取
            element: <Cropping />,
        },
        {
            path: "/setup",//设置窗口
            element: <Setup />,
            children: SetupChildren,
        },
        {
            path: "*",
            element: <h2>404页面</h2>,
        },
    ]);
    return Pages;
}

export default RootComp;
