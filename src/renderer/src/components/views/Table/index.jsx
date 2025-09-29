import React, { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { ConfigProvider, Table, Flex, Form } from 'antd';
import zh_CN from 'antd/locale/zh_CN';
import { customLocale, OrderData, EditableRow, EditableCell } from './testData';
// import Page from '../Pagination';
import './index.scss'

const TableCom = forwardRef((props, ref) => {
    let {
        loading = false,
        size = 'large',//large | middle | small
        title = '表格标题',
        height = 310,
        rowSelection = false,//多行勾选
        data = [],
        columns = [],
        bordered = true,
        Order = true,//是否首列加入顺序列项
        headerChildern = null,
        rowHandClick = () => { },
        rowHandRightClick = () => { },
        pagination = false,
        style = {},
        onChange = () => { },
        handSelectChange,
    } = props;


    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRowKey, setSelectedRowKey] = useState(null);
    const tableRef = useRef(null);
    const onSelectChange = (newSelectedRowKeys, selectedRows) => {
        //console.log('选中的: ', newSelectedRowKeys,selectedRows);
        setSelectedRowKeys(newSelectedRowKeys);
        // 计算未被勾选的行数据
        const unselectedRows = InitData(data).filter(item => !newSelectedRowKeys.includes(item.key));

        handSelectChange && handSelectChange(newSelectedRowKeys, selectedRows, unselectedRows)
    };

    const scrollTo = () => {
        const el = document.querySelector(".ant-table-body");
        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth" // 平滑滚动，可选
        });
    }

    if (ref) {
        useImperativeHandle(ref, () => ({
            // 暴露给父组件的方法
            setSelectedRowKey,
            scrollTo,
            tableRef,
        }));
    }


    const rowSelectionObject = {
        selectedRowKeys,
        onChange: onSelectChange,
    };


    const InitData = data => {
        if (data.length == 0) return [];

        return data.map((m, i) => {
            let obj = {
                ...m,
                key: m.key == undefined ? i + 1 : m.key,
            }
            //首列加入顺序列项
            if (Order) {
                obj.Order = i + 1;
            }
            return obj;
        });
    }

    const initHeader = () => {
        return (<Flex gap="4px 0" justify='space-between' align='center'>
            <span className='table-item-title'>{title}</span>
            <div>{headerChildern}</div>
        </Flex>)

    }
    const initFooter = () => {
        // if (pagination) {
        //     return (<Flex gap="4px 0" justify='space-between' align='center'>
        //         <span></span>
        //         <div><Page {...pagination} /></div>
        //     </Flex>)
        // }

        return pagination;

    }
    const handleRow = (record, index) => {
        return {
            onContextMenu: (event) => { // 右键点击事件
                event.preventDefault(); // 阻止浏览器默认右键菜单
                //console.log('右键点击了行:', record);
                rowHandRightClick(record, index);
            },
            onClick: (event) => { // 可以同时监听左键点击
                //console.log('左键点击了行:', record);
                setSelectedRowKey(record.key);
                rowHandClick(record, index);
            },
            onMouseEnter: (event) => {
                // console.log('进入:', record);
                props.onMouseEnter && props.onMouseEnter(record);
            },
            onDoubleClick: () => {
                //双击
                props.onDoubleClick && props.onDoubleClick(record);
            }
        };

    }


    return (
        <div className='table-item' style={style}>
            <ConfigProvider locale={{ ...customLocale, ...zh_CN }}>
                <Table
                    onChange={onChange}
                    loading={loading} size={size} title={initHeader}
                    rowSelection={rowSelection ? rowSelectionObject : false}
                    pagination={false} tableLayout="fixed"
                    onRow={handleRow} // 绑定 onRow 事件
                    rowClassName={(record) => {
                        // 如果当前行的 key 等于 state 中的 key，则添加高亮类
                        return record.key === selectedRowKey ? 'ant-table-row-selected-custom' : '';
                    }}
                    ref={tableRef}
                    scroll={{ y: height }}
                    bordered={bordered} // 加个边框更明显
                    footer={initFooter}
                    columns={Order ? [OrderData, ...columns] : columns}
                    components={{
                        body: {
                            row: EditableRow,
                            cell: p => EditableCell(p),
                        },
                    }}
                    dataSource={InitData(data)} />
            </ConfigProvider>
        </div>
    )
});

export default TableCom;
