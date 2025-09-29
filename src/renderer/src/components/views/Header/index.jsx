import { Flex } from 'antd';
import { appName, grab } from '@/utils/const';
import { moveTo } from '@/utils/utils';
import { HeaderIcons } from '@/assets/icons';
import './index.scss';
import headerLogo from "@/assets/images/header-logo.png"

const HeaderComp = ({ title = appName, headIocnClick = () => { }}) => {

    return (
        <div onMouseDown={({ nativeEvent }) => moveTo({ nativeEvent })}
            onMouseEnter={({ nativeEvent }) => document.body.style.cursor = `url(${grab}) 10 10, auto`}
            onMouseLeave={({ nativeEvent }) => document.body.style.cursor = "auto"}
        >
            <Flex className='HeaderComp' align="center" justify="space-between">
                <div className='logoDIV'>
                    <img src={headerLogo} alt="" />
                </div>
                <Flex align="center" gap={20}>
                    {HeaderIcons.map((Icon, i) => <Icon className="icon-items" onClick={() => headIocnClick(i)} key={Icon.displayName} />)}
                </Flex>
            </Flex>
        </div>
    )
}


export default HeaderComp;
