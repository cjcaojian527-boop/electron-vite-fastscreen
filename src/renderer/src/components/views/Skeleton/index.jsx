import React from 'react';


//骨架屏过渡组件
const SkeletomComp = () => {
    return (
        <div id="skeleton-container" title='骨架屏component'>
            {/* 模拟多张卡片 */}
            <div className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-title skeleton-line"></div>
                <div className="skeleton-text skeleton-line" style={{ width: '95%' }}></div>
                <div className="skeleton-text skeleton-line" style={{ width: '80%' }}></div>
                <div className="skeleton-text skeleton-line" style={{ width: '60%' }}></div>
            </div>
            <div className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-title skeleton-line"></div>
                <div className="skeleton-text skeleton-line" style={{ width: '90%' }}></div>
                <div className="skeleton-text skeleton-line" style={{ width: '75%' }}></div>
                <div className="skeleton-text skeleton-line" style={{ width: '50%' }}></div>
            </div>
            <div className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-title skeleton-line"></div>
                <div className="skeleton-text skeleton-line" style={{ width: '85%' }}></div>
                <div className="skeleton-text skeleton-line" style={{ width: '70%' }}></div>
                <div className="skeleton-text skeleton-line" style={{ width: '55%' }}></div>
            </div>
        </div>
    )
}

export default SkeletomComp;
