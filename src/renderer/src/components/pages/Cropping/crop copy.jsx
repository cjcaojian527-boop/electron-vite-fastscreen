import React, { useState, useRef, useEffect, useCallback } from 'react';
import './crop.scss';

const Cropping = ({ container, videoRef, onEdgeMatch }) => {
    const [rect, setRect] = useState({ x: 50, y: 50, width: 120, height: 80 });

    const isDragging = useRef(false);
    const isResizing = useRef(false);
    const activeHandle = useRef(null);
    const startPos = useRef({ x: 0, y: 0 });

    const minSize = 20;
    const snapThreshold = 5;

    /** 获取视频内容区域 */
    const getVideoBox = useCallback(() => {
        if (!videoRef?.current) return null;
        const style = getComputedStyle(videoRef.current);
        const borderLeft = parseInt(style.borderLeftWidth) || 0;
        const borderTop = parseInt(style.borderTopWidth) || 0;
        const borderRight = parseInt(style.borderRightWidth) || 0;
        const borderBottom = parseInt(style.borderBottomWidth) || 0;

        return {
            x: videoRef.current.offsetLeft + borderLeft,
            y: videoRef.current.offsetTop + borderTop,
            w: videoRef.current.clientWidth - borderLeft - borderRight,
            h: videoRef.current.clientHeight - borderTop - borderBottom,
        };
    }, [videoRef]);

    /** 鼠标抬起 */
    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        isResizing.current = false;
        activeHandle.current = null;

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    /** 鼠标移动 */
    const handleMouseMove = useCallback((e) => {
        if (!container) return;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;

        setRect(prevRect => {
            let newRect = { ...prevRect };
            const videoBox = getVideoBox();

            if (isDragging.current) {
                newRect.x = prevRect.x + dx;
                newRect.y = prevRect.y + dy;
            } else if (isResizing.current) {
                const resizeLogic = {
                    'n': () => { newRect.y += dy; newRect.height -= dy; },
                    's': () => { newRect.height += dy; },
                    'w': () => { newRect.x += dx; newRect.width -= dx; },
                    'e': () => { newRect.width += dx; },
                    'nw': () => { newRect.x += dx; newRect.width -= dx; newRect.y += dy; newRect.height -= dy; },
                    'ne': () => { newRect.width += dx; newRect.y += dy; newRect.height -= dy; },
                    'sw': () => { newRect.x += dx; newRect.width -= dx; newRect.height += dy; },
                    'se': () => { newRect.width += dx; newRect.height += dy; }
                };
                const currentLogic = resizeLogic[activeHandle.current];
                if (currentLogic) currentLogic();

                // 限制“另一边不超过视频边界”
                if (videoBox) {
                    // 水平方向
                    if (newRect.x < videoBox.x) {
                        newRect.width -= videoBox.x - newRect.x;
                        newRect.x = videoBox.x;
                    }
                    if (newRect.x + newRect.width > videoBox.x + videoBox.w) {
                        newRect.width = videoBox.x + videoBox.w - newRect.x;
                    }
                    // 垂直方向
                    if (newRect.y < videoBox.y) {
                        newRect.height -= videoBox.y - newRect.y;
                        newRect.y = videoBox.y;
                    }
                    if (newRect.y + newRect.height > videoBox.y + videoBox.h) {
                        newRect.height = videoBox.y + videoBox.h - newRect.y;
                    }
                }
            }

            // 最小尺寸
            if (newRect.width < minSize) newRect.width = minSize;
            if (newRect.height < minSize) newRect.height = minSize;

            // 容器范围
            newRect.x = Math.max(0, Math.min(newRect.x, containerWidth - newRect.width));
            newRect.y = Math.max(0, Math.min(newRect.y, containerHeight - newRect.height));

            return newRect;
        });

        startPos.current = { x: e.clientX, y: e.clientY };
    }, [container, getVideoBox]);

    /** 鼠标按下 */
    const handleMouseDown = useCallback((e, handleType = null) => {
        e.stopPropagation();
        startPos.current = { x: e.clientX, y: e.clientY };
        if (handleType) {
            isResizing.current = true;
            activeHandle.current = handleType;
        } else {
            isDragging.current = true;
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);

    /** 吸附 */
    const getDisplayRect = useCallback(() => {
        const videoBox = getVideoBox();
        if (!videoBox) return rect;

        let displayRect = { ...rect };
        if (Math.abs(rect.y - videoBox.y) <= snapThreshold) displayRect.y = videoBox.y;
        if (Math.abs(rect.y + rect.height - (videoBox.y + videoBox.h)) <= snapThreshold)
            displayRect.y = videoBox.y + videoBox.h - rect.height;
        if (Math.abs(rect.x - videoBox.x) <= snapThreshold) displayRect.x = videoBox.x;
        if (Math.abs(rect.x + rect.width - (videoBox.x + videoBox.w)) <= snapThreshold)
            displayRect.x = videoBox.x + videoBox.w - rect.width;

        return displayRect;
    }, [rect, getVideoBox]);

    const displayRect = getDisplayRect();

    /** 高亮边界 */
    useEffect(() => {
        const videoBox = getVideoBox();
        if (!videoBox || !videoRef.current) return;

        const { x, y, width, height } = displayRect;
        const epsilon = 1;
        const videoEl = videoRef.current;
        const matchedEdges = [];

        videoEl.style.borderTop = '';
        videoEl.style.borderBottom = '';
        videoEl.style.borderLeft = '';
        videoEl.style.borderRight = '';

        if (Math.abs(y - videoBox.y) <= epsilon) {
            videoEl.style.borderTop = '2px solid red';
            matchedEdges.push('top');
        }
        if (Math.abs(y + height - (videoBox.y + videoBox.h)) <= epsilon) {
            videoEl.style.borderBottom = '2px solid red';
            matchedEdges.push('bottom');
        }
        if (Math.abs(x - videoBox.x) <= epsilon) {
            videoEl.style.borderLeft = '2px solid red';
            matchedEdges.push('left');
        }
        if (Math.abs(x + width - (videoBox.x + videoBox.w)) <= epsilon) {
            videoEl.style.borderRight = '2px solid red';
            matchedEdges.push('right');
        }
        onEdgeMatch?.(matchedEdges);
    }, [displayRect, videoRef, onEdgeMatch, getVideoBox]);

    return (
        <div
            className="draggable-box"
            style={{
                left: displayRect.x,
                top: displayRect.y,
                width: displayRect.width,
                height: displayRect.height,
                transition: isDragging.current || isResizing.current ? 'none' : 'all 0.1s ease-out',
            }}
            onMouseDown={(e) => handleMouseDown(e, null)}
        >
            {childern}
            <div className="handle handle-n" onMouseDown={(e) => handleMouseDown(e, 'n')}></div>
            <div className="handle handle-e" onMouseDown={(e) => handleMouseDown(e, 'e')}></div>
            <div className="handle handle-s" onMouseDown={(e) => handleMouseDown(e, 's')}></div>
            <div className="handle handle-w" onMouseDown={(e) => handleMouseDown(e, 'w')}></div>
            <div className="handle handle-nw" onMouseDown={(e) => handleMouseDown(e, 'nw')}></div>
            <div className="handle handle-ne" onMouseDown={(e) => handleMouseDown(e, 'ne')}></div>
            <div className="handle handle-sw" onMouseDown={(e) => handleMouseDown(e, 'sw')}></div>
            <div className="handle handle-se" onMouseDown={(e) => handleMouseDown(e, 'se')}></div>
        </div>
    );
};

export default Cropping;
