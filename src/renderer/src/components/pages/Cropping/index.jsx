import React, { useState, useRef, useEffect, } from 'react';
import { Button } from 'antd';
import API from '@/utils/ipcRenderer';
import './index.scss';

//屏幕截取器
const Cropping = () => {

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [rect, setRect] = useState({ x: 50, y: 50, width: 300, height: 250 });
    const [activeHandle, setActiveHandle] = useState(null);

    const containerRef = useRef(null);

    const handleMouseDown = (e, handleType) => {
        e.stopPropagation();
        // API.IpcSend('enter-fullScreen');
        setStartPos({ x: e.clientX, y: e.clientY });
        if (handleType) {
            setIsResizing(true);
            setActiveHandle(handleType);
        } else {
            setIsDragging(true);
        }
    };

    const handleMouseMove = (e) => {
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const minSize = 200; // ✅ 最小限制
        const maxWidth = containerWidth * 0.98;  // ✅ 最大限制（98%）
        const maxHeight = containerHeight * 0.98;

        if (isDragging) {
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;
            setRect((prevRect) => {
                let newX = prevRect.x + dx;
                let newY = prevRect.y + dy;

                // 边界检测（保持矩形在容器内）
                newX = Math.max(0, Math.min(newX, containerWidth - prevRect.width));
                newY = Math.max(0, Math.min(newY, containerHeight - prevRect.height));

                return {
                    ...prevRect,
                    x: newX,
                    y: newY,
                };
            });
            setStartPos({ x: e.clientX, y: e.clientY });
        } else if (isResizing) {
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            setRect((prevRect) => {
                let newRect = { ...prevRect };

                switch (activeHandle) {
                    case 'n':
                        newRect.y += dy;
                        newRect.height -= dy;
                        break;
                    case 's':
                        newRect.height += dy;
                        break;
                    case 'w':
                        newRect.x += dx;
                        newRect.width -= dx;
                        break;
                    case 'e':
                        newRect.width += dx;
                        break;
                    case 'nw':
                        newRect.x += dx;
                        newRect.width -= dx;
                        newRect.y += dy;
                        newRect.height -= dy;
                        break;
                    case 'ne':
                        newRect.width += dx;
                        newRect.y += dy;
                        newRect.height -= dy;
                        break;
                    case 'sw':
                        newRect.x += dx;
                        newRect.width -= dx;
                        newRect.height += dy;
                        break;
                    case 'se':
                        newRect.width += dx;
                        newRect.height += dy;
                        break;
                    default:
                        break;
                }

                // ✅ 限制最小值
                if (newRect.width < minSize) newRect.width = minSize;
                if (newRect.height < minSize) newRect.height = minSize;

                // ✅ 限制最大值（98%）
                if (newRect.width > maxWidth) newRect.width = maxWidth;
                if (newRect.height > maxHeight) newRect.height = maxHeight;

                // ✅ 保持在容器内部
                if (newRect.x < 0) newRect.x = 0;
                if (newRect.y < 0) newRect.y = 0;
                if (newRect.x + newRect.width > containerWidth) {
                    newRect.width = containerWidth - newRect.x;
                }
                if (newRect.y + newRect.height > containerHeight) {
                    newRect.height = containerHeight - newRect.y;
                }

                return newRect;
            });
            setStartPos({ x: e.clientX, y: e.clientY });
        }
    };


    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setActiveHandle(null);
    };

    //点击确定或者取消
    const callback = (flag) => {
        API.IpcPostMessage('render-message', { toName: 'main', rect, run: 'getWinInfoCallback', flag })
        API.IpcSend('close');

    }

    useEffect(() => {
        API.IpcSend('execute-show');
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, startPos, activeHandle]);

    return (
        <div className="draggable-container" ref={containerRef}>
            <div
                className="draggable-box"
                style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.width,
                    height: rect.height,
                }}
                onMouseDown={handleMouseDown}
            >
                <p className='title-p'>x:{rect.x} y:{rect.y} w:{rect.width} h:{rect.height}</p>
                {/* 九宫格辅助线 */}
                <div className="line line-horizontal top-line"></div>
                <div className="line line-horizontal bottom-line"></div>
                <div className="line line-vertical left-line"></div>
                <div className="line line-vertical right-line"></div>

                {/* 调整大小的手柄 */}
                <div className="handle handle-n" onMouseDown={(e) => handleMouseDown(e, 'n')}></div>
                <div className="handle handle-e" onMouseDown={(e) => handleMouseDown(e, 'e')}></div>
                <div className="handle handle-s" onMouseDown={(e) => handleMouseDown(e, 's')}></div>
                <div className="handle handle-w" onMouseDown={(e) => handleMouseDown(e, 'w')}></div>
                <div className="handle handle-nw" onMouseDown={(e) => handleMouseDown(e, 'nw')}></div>
                <div className="handle handle-ne" onMouseDown={(e) => handleMouseDown(e, 'ne')}></div>
                <div className="handle handle-sw" onMouseDown={(e) => handleMouseDown(e, 'sw')}></div>
                <div className="handle handle-se" onMouseDown={(e) => handleMouseDown(e, 'se')}></div>
                <div className='btnBox'>
                    <Button size="small" onClick={() => callback()}>取消</Button>
                    <Button size="small" onClick={() => callback(1)} type="primary">确定</Button>
                </div>
            </div>
        </div>
    );
}

export default Cropping;
