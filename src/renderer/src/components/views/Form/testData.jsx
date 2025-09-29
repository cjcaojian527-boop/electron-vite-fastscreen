import { Button, DatePicker, Select, Input, InputNumber } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
// import UploadFileComp from '../Upload';

export const defaultPropsMap = {
    input: {
        placeholder: '请输入~',
        size: 'small',//large | middle | small
        allowClear: <CloseCircleOutlined />,
        disabled: false,
        style: { width: 200 }
    },
    password: {
        placeholder: '请输入password',
        size: 'middle',//large | middle | small
        allowClear: <CloseCircleOutlined />,
        disabled: false,
        style: { width: 200 }
    },
    select: {
        // allowClear: true,
        placeholder: '请选择',
        removeIcon: <CloseCircleOutlined />,
        size: 'small',//large | middle | small
        style: { width: 150 },
    },
    datepicker: {
        allowClear: true,
        style: { width: 200 },
        disabled: false,
        // locale: zh_CN,
        placeholder: '请输入日期',
        placement: 'bottomLeft',//bottomLeft bottomRight topLeft topRight
        size: 'large',//large | middle | small

    },
    inputnumber: {
        precision: 0,
        style: { width: 150 },
        max: 60,
        min: 1,
        size: 'small',//large | middle | small
        // defaultValue: 60,
    }
    // upload: {
    //     // accept: "image/*,.pdf",
    //     style: { width: 200 },
    //     disabled: false,
    // }
}
export const renderMap = {
    input: ({ customizeProps: { renderProps = {}, renderType } }) => {
        const defaultProp = defaultPropsMap[renderType] || {};
        return (<Input {...Object.assign({}, defaultProp, renderProps)} />);
    },
    select: ({ customizeProps: { renderProps = {}, renderType } }) => {
        const defaultProp = defaultPropsMap[renderType] || {};
        return (<Select {...Object.assign({}, defaultProp, renderProps)} />);
    },
    password: ({ customizeProps: { renderProps = {}, renderType } }) => {
        const defaultProp = defaultPropsMap[renderType] || {};
        return (<Input.Password {...Object.assign({}, defaultProp, renderProps)} />);
    },
    datepicker: ({ customizeProps: { renderProps = {}, renderType } }) => {
        const defaultProp = defaultPropsMap[renderType] || {};
        return (<DatePicker {...Object.assign({}, defaultProp, renderProps)} />)
    },
    inputnumber: ({ customizeProps: { renderProps = {}, renderType } }) => {
        const defaultProp = defaultPropsMap[renderType] || {};
        return (<InputNumber {...Object.assign({}, defaultProp, renderProps)} />)
    },
    // upload: ({ customizeProps: { renderProps = {}, renderType, hidden } }) => {
    //     const defaultProp = defaultPropsMap[renderType] || {};
    //     //if (hidden) return null;
    //     return (<UploadFileComp {...Object.assign({}, defaultProp, renderProps)} />)
    // },
}