import './index.scss';
import React, { useEffect } from 'react';
import { Menu } from 'antd';


const MenuComp = (props) => {
    const {
        onSelect = () => { },
        items = [],
        defaultKey = '1'

    } = props;

    useEffect(() => {
        return ()=>{
            sessionStorage.removeItem('menuKey');
        }
    }, []);
    return (
        <Menu
            style={{ height: '100%', paddingTop: 1, borderRight: 0 }}
            selectedKeys={[defaultKey]}
            onSelect={onSelect}
            mode="inline"
            items={items}
        />
    )
}

export default MenuComp;
