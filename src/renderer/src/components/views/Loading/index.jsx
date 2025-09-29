import React from "react";
import { Spin } from "antd";
import "./index.scss";
//父元素要给相对定位
const LoadingOverlay = ({ loading = false, message = "加载中..." }) => {
  return (
    <div
      className={`loading-overlay ${loading ? "loading-overlay--show" : ""}`}
      aria-hidden={!loading}
    >
      <div className="loading-box" role="status" aria-live="polite">
        <Spin size="large" />
        {message && <div className="loading-tip">{message}</div>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
