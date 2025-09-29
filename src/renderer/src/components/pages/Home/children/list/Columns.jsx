
import { Dropdown } from 'antd';
// import { formatYear, formatDate, formatBirth } from '@/utils/format';
// import { mapData } from '@/utils/const';
import { formatTime, formatTimestamp } from '@/utils/utils';

import { BarsOutlined } from '@ant-design/icons';

const DropdownItems = [
    {
        key: '1',
        label: "播放",
    },

    {
        key: '2',
        label: "高清转码",
    },
    {
        key: '3',
        label: "文件位置",
    },
    {
        key: '4',
        label: "删除",
        danger: true
    },
];

const formitemMap = {
    "videoName": {
        label: '姓名',
        name: 'videoName',
        hidden: false,
        // rules: [isRequired],
        //自定义属性
        customizeProps: {
            renderType: 'input',
            renderProps: {
                placeholder: '',
                style: { width: '85%' }
            }
        }
    },
}


export const Columns = ({ identity }, BaseBtnClick, cellChange) => {

    //- 正常渲染的字段
    const normalList = [
        {
            title: '视频名',
            align: 'center',
            dataIndex: 'videoName',
            width: 170,
            editable: true,//是否单元格编辑
            render: (v, item, index) => <span title={v}>{v}</span> || '--',
        },
        {
            title: '时长',
            align: 'center',
            dataIndex: 'time',
            width: 50,
            render: (t, item, index) => {
                if (isNaN(+t)) {
                    return '--:--';
                }
                return formatTime(+t) || '--:--';
            },
            sorter: (a, b) => {
                return a.time - b.time;
            },
            sortDirections: ['descend', 'ascend', 'descend'],
        },
        {
            title: '大小',
            align: 'center',
            dataIndex: 'size',
            width: 50,
            render: (v, item, index) => (v / (1024 * 1024)).toFixed(2) + ' M' || '--',
            sorter: (a, b) => {
                return a.size - b.size;
            },
            sortDirections: ['descend', 'ascend', 'descend'],
        },

        {
            title: '日期',
            align: 'center',
            dataIndex: 'date',
            width: 100,
            render: (date, item, index) => formatTimestamp(+date) || '--',
            sorter: (a, b) => {
                return a.date - b.date;
            },
            sortDirections: ['descend', 'ascend', 'descend'],
        },
        {
            title: '更多',
            align: 'center',
            dataIndex: 'Basicoperations',
            width: 50,
            fixed: 'right',
            render: (v, item, index) => {
                return (<Dropdown arrow menu={{ items: DropdownItems, onClick: BaseBtnClick }} placement="bottom">
                    <BarsOutlined />
                </Dropdown>);
            },
        }
    ];



    //处理行编辑
    let renderColumnsList = normalList.map(m => {
        if (!m.editable) {
            return m;
        }

        let obj = { ...m };
        obj.onCell = (rowData, rowIndex) => {

            // record 是当前行的数据对象
            // rowIndex 是当前行的索引
            return {
                rowData,
                dataIndex: m.dataIndex,
                editable: true,
                editableTitle: '编辑文件名',
                formData: formitemMap[m.dataIndex],
                "saveCallback": cellChange,
            };
        }

        return obj;
    })

    return renderColumnsList;
};