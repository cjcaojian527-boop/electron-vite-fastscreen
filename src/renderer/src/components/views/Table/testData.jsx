import React, { useState, useRef, useEffect, useContext } from 'react';
import { Tooltip, Form } from 'antd';
import { renderMap } from '../Form/testData';
import { deepClone } from '@/utils/utils';
// import dayjs from 'dayjs';
const EditableContext = React.createContext(null);

const dayjs = () => { };

const sortFn = (a, b) => {
    console.log(a, b);
    return a.name.length - b.name.length;
}


export const dataSource = [
    {
        key: '1',
        name: '胡彦',
        age: 32,
        address: '西湖区湖底公园1号',
    },
    {
        key: '2',
        name: '黄星2',
        age: 42,
        address: '湖北省武汉市杨园',
    },
    {
        key: '3',
        name: '杜甫',
        age: 50,
        address: '茅屋为秋风所破歌',

    },
];

export const columns = [
    {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        //sorser 是一个函数，你需要把它赋值给 columns 配置项中某一列的属性。当用户点击该列的排序按钮时，AntD Table 内部会调用这个 sorter 函数来对数据进行排序
        sorter: sortFn,// (a, b) => a.name.length - b.name.length,

        //sortDirections 是一个数组，它定义了用户点击列头排序按钮时，排序状态将如何循环切换。
        /*
        默认情况下，sortDirections 是 ['ascend', 'descend']。这意味着当你第一次点击排序按钮时，会从无排序状态切换到 'ascend' (升序)；
        再次点击会切换到 'descend' (降序)；
        第三次点击会切换回无排序状态。
        ['ascend', 'descend', 'ascend'] 的作用：
        第一次点击：无排序 -> ascend (升序)
        第二次点击：ascend -> descend (降序)
        第三次点击：descend -> ascend (升序)
        永远不会回到无排序状态。 这就是它“禁止排序恢复到默认状态”的意思。用户只能在升序和降序之间切换，不能彻底取消排序
        */
        sortDirections: ['ascend', 'descend', 'ascend'],
        width: 100,
    },
    {
        title: '年龄',
        dataIndex: 'age',
        width: 100,
        key: 'age',
        sortDirections: ['ascend', 'descend', 'ascend'],
        //defaultSortOrder: 'descend',//设置列的默认排序顺序
        sorter: (a, b) => a.age - b.age,
    },
    {
        title: '住址',
        dataIndex: 'address',
        key: 'address',
        fixed: 'right',

    },
];

export const customLocale = {
    // 覆盖 Table 组件的文本
    Table: {
        filterTitle: '筛选',
        filterConfirm: '确定',
        filterReset: '重置',
        filterEmptyText: '无数据',
        filterCheckall: '全选',
        filterSearchPlaceholder: '搜索筛选',
        emptyText: '暂无数据',
        selectAll: '全选当页',
        selectInvert: '反选当页',
        selectNone: '清空所有',
        selectionAll: '全选所有',
        sortTitle: '排序', // 这个是鼠标悬停在排序图标上的总提示
        expandText: '展开行',
        collapseText: '收起行',
        triggerDesc: '点击降序', // 从无序或升序到降序的提示
        triggerAsc: '点击升序',   // 从无序或降序到升序的提示
        cancelSort: '点击取消排序', // 从有排序到无排序的提示


    },
    // ... 其他组件的 locale 配置
};
//首列排序
export const OrderData = {
    title: 'No.',
    align: 'center',
    dataIndex: 'Order',
    width: 30,
    render: (v, item, index) => v || '--',
    fixed: 'left'
}


export const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

//- 可编辑的单元格
export const EditableCell = ({ editable, editableTitle, rowData, dataIndex, saveCallback, formData, children, ...props }) => {


    const [showformItem, set_showformItem] = useState(false);
    const itemRef = useRef(null);

    const currentVal = useRef(null);
    const { setFieldValue, getFieldValue, getFieldError } = useContext(EditableContext);


    const getCurrentformItem = () => {
        const { customizeProps = {}, ..._prop } = deepClone(formData);
        customizeProps.renderProps.ref = itemRef;
        if (customizeProps.renderType == 'input') {
            customizeProps.renderProps.onPressEnter = onOpenChange;//按下回车
            customizeProps.renderProps.onBlur = onOpenChange;//失去焦点
            customizeProps.renderProps.onFocus = e => e.target.select();//全选文本

        }
        _prop.label = null;
        return (<Form.Item {..._prop} >{renderMap[customizeProps?.renderType]({ customizeProps, ..._prop })}</Form.Item>);

    }

    const cellClick = () => {
        set_showformItem(!showformItem);
    }
    //Tooltip隐藏时
    const onOpenChange = () => {
        set_showformItem(false);
        if (getFieldValue(dataIndex) && getFieldValue(dataIndex) !== currentValFN().get() && getFieldError(dataIndex).length == 0) {
            currentValFN().set(getFieldValue(dataIndex));
            saveCallback({ ...rowData, "updateVal": currentValFN().get() });
        }
    }

    const currentValFN = () => {
        let newV;
        return {
            get() {
                // if (formData.customizeProps.renderType == 'datepicker') {
                //     newV = moment(currentVal.current)
                // }
                return newV || currentVal.current;
            },
            set(v) {

                if (formData.customizeProps.renderType == 'datepicker') {
                    newV = dayjs(v)
                } else if (Object.prototype.toString.call(v) === '[object Object]' && v._id) {
                    newV = v._id;
                }
                currentVal.current = newV || v;
            }
        }
    }

    useEffect(() => {

        if (showformItem) {
            if (!currentValFN().get()) {
                currentValFN().set(rowData[dataIndex]);
            }

            itemRef.current && itemRef.current.focus();


            setFieldValue(dataIndex, currentValFN().get());
        }

    }, [showformItem]);


    if (editable) {
        editableTitle = editableTitle || "点击单元格编辑";
        //是否自定义单元格
        return (<>
            {/* {showformItem ? (<td {...props}>{<Tooltip onOpenChange={onOpenChange} color="#fff" title={getCurrentformItem()}>{children}</Tooltip>}</td>) :
                (<td {...props}>
                    <Tooltip title="点击单元格编辑">
                        <div onClick={cellClick} className='cell-showformItem'>{children}</div>
                    </Tooltip>
                </td>)} */}

            {showformItem ? (<td {...props}>{getCurrentformItem()}</td>) :
                (<td {...props}>
                    <Tooltip title={editableTitle}>
                        <div onClick={cellClick} className='cell-showformItem'>{children}</div>
                    </Tooltip>
                </td>)}
        </>);


    }

    return (<td {...props}>{children}</td>);
};

