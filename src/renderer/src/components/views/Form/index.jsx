import React, { useImperativeHandle, forwardRef } from 'react';
import './index.scss';
import zh_CN from 'antd/locale/zh_CN';
// import PropTypes from 'prop-types';
import { Button, ConfigProvider, Form, Tag, Flex } from 'antd';
import { renderMap } from './testData.jsx';

/*
调用子组件
1.forwardRef包裹 （props,ref）
2.useImperativeHandle暴露方法属性
*/
const FormCom = forwardRef((props, ref) => {
    const {
        name = 'basic_form_' + Date.now(),
        formTitle = '查询项',
        size = 'middle',
        colon = false,
        vertical = false,
        initialValues = {},
        onFinish = () => { },
        onFinishFailed = () => { },
        onValuesChange = () => { },
        btmChildren = null,
        itemList = [],
        maxHeight = 200,//必传
        ...FormProps
    } = props;
    
    const FormProps2 = { ...FormProps, name, size, colon, initialValues, onFinish, onFinishFailed, onValuesChange };
    const [form] = Form.useForm();
    const errStr = <Tag color='red'>表单项映射失败</Tag>;

    // console.log('FormProps2:',FormProps2)

    // useImperativeHandle 允许父组件通过 ref 访问子组件内部定义的方法或属性
    try {
        ref && useImperativeHandle(ref, () => ({
            // 暴露给父组件的方法
            form
        }));

    } catch (error) {

    }


    return (
        <div className='form-item'>
            {/* title区域 */}
            <div className='formTitle'>{formTitle}</div>
            <ConfigProvider locale={zh_CN}>
                <Form
                    form={form}
                    style={{ maxHeight }}
                    {...FormProps2}
                >
                    <Flex vertical justify='space-between' style={{ height: '100%' }}>
                        <Flex wrap gap="0 14px" align='center' vertical={vertical}>
                            {!!itemList.length && itemList.map(({ customizeProps = {}, ..._prop }, i) =>
                                (<Form.Item {..._prop} key={i + 1}>{renderMap[customizeProps?.renderType] ? renderMap[customizeProps?.renderType]({ customizeProps, ..._prop }) : errStr}</Form.Item>)
                            )}
                        </Flex>
                        {/* 按钮区域 */}
                        {
                            btmChildren && <Flex gap="0 4px" align='center' justify='flex-end'>
                                {btmChildren}
                            </Flex>
                        }
                    </Flex>
                </Form>
            </ConfigProvider>


        </div>

    );
});
//文档 https://ant-design.antgroup.com/components/form-cn
export default FormCom;
