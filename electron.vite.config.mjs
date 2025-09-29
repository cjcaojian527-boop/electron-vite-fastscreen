import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    entry: 'src/main/index.js',           // 指定入口文件，默认是 src/main/index.ts
    format: 'cjs',                        // 输出格式，可选 'cjs' | 'esm'，默认 'cjs'
    target: 'node18',                     // 构建目标 Node 版本，默认 node16
    minify: false,                        // 是否压缩
    external: ['fluent-ffmpeg', 'ffmpeg-static', 'ffprobe-static'],//添加可能导致问题的依赖，确保它们不会被打包
    plugins: [externalizeDepsPlugin()],   // 插件，默认推荐使用 externalizeDepsPlugin()
    sourcemap: true,                      //是否开启 source map（方便调试）
    resolve: {
      alias: {
        '@resources': resolve(__dirname, './resources'),
        '@store': resolve(__dirname, 'src/main/store'),
        '@util': resolve(__dirname, 'src/main/utils/utils.js'),
      }
    },
    build: {
      outDir: 'out/main',
      emptyOutDir: true,
      rollupOptions: {
        treeshake: true,
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    external: ['fluent-ffmpeg', 'ffmpeg-static', 'ffprobe-static'],
    build: {
      outDir: 'out/preload'
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        '@public': resolve(__dirname, 'src/renderer/public'),
      }
    },
    plugins: [react()],
    server: {
      port: 9090,              // 开发服务器端口（默认 5173）
      host: '0.0.0.0',         // 设置为 '0.0.0.0' 可在局域网访问
      open: false,              // 启动时自动在浏览器中打开
      https: false,            // 是否启用 https（可传入证书配置对象）
      proxy: {},               // 配置本地开发时的 API 代理
      strictPort: false,       // true 表示端口被占用时直接报错，false 会自动尝试其他端口
      cors: true,              // 开启 CORS 跨域请求

    },
    build: {
      emptyOutDir: true,//先清理文件夹
      outDir: 'out/renderer',
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.css$/.test(name ?? '')) {
              return 'css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg)$/.test(name ?? '')) {
              return 'images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'react';     // react / react-dom
              if (id.includes('antd')) return 'antd';       // antd UI
              if (id.match(/mobx/)) return 'mobx';          // mobx 独立
              return 'vendor';                              // 其他依赖
            }
          }
        }
      }
    }
  }
})
