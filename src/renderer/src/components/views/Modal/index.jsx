import React from 'react'
import { Modal } from 'antd';
import "./index.scss";
const ModalComp = (props) => {
    const { children, title = "模态框", open } = props;

    return (
        <Modal
            title={title}
            closable={false}
            mask={false}
            className="ModalComp"
            open={open}
            maskClosable={false}
            footer={<div className='footer'>
                <span onClick={() => props.confirmFunc(false)} className='a2'>取消</span>
                <span onClick={() => props.confirmFunc(true)} className='a1'>确定</span>
            </div>}
        >
            {children}
        </Modal>
    )
}

export default ModalComp;
