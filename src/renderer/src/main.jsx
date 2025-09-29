import './assets/main.css'
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

try {
  window.NODEAPI = NODEAPI || {};
} catch (e) {
  try {
    window.NODEAPI = {}
  } catch (e) { }
}

function MainApplicationWrapper() {
  useEffect(() => {
    // 隐藏骨架屏
    const skeletonContainer = document.getElementById('skeleton-container');
    if (skeletonContainer) {
      //skeletonContainer.style.display = 'none'; // 直接隐藏，或者可以加动画
      skeletonContainer.style.opacity = '0'; // 如果要淡出效果
      setTimeout(() => {
        skeletonContainer.style.display = 'none';
        skeletonContainer.remove()
      }, 500); // 配合淡出动画
    }

    // 显示 React 内容
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('loaded'); // 通过 CSS 动画使其平滑显示
    }
  }, []);


  return (
    // <StrictMode>
    <App />
    // </StrictMode>
  );
}

// 渲染你的应用
createRoot(document.getElementById('root')).render(<MainApplicationWrapper />);

