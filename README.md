# 廖思淇 Liao Siqi — Portfolio

个人作品集网站（新媒体运营 / AIGC 内容创作方向）。单页应用，包含首屏动态海报背景、作品卷轴、ABOUT ME 四角贴纸、联系悬浮墙等模块，支持中英双语切换。

## 技术栈

- **React 18** + **Vite 7**（构建工具）
- **GSAP** + **ScrollTrigger**（动画 / 滚动联动）
- **Lenis**（平滑滚动）
- **Three.js / @react-three/fiber / drei / rapier / ogl**（3D 纸张世界、挂绳卡片等）
- 原生 **Canvas 2D**（首屏半调网点大字 + 粉色渐变球弹性碰撞）
- 纯 CSS 响应式布局，兼容 Edge / Safari / Chrome

## 环境要求

- **Node.js 18+**（推荐 20 LTS）
- npm（随 Node 一同安装）

> 开发服务器默认绑定 `127.0.0.1:5173`，可在 `vite.config.js` 中修改。

## 安装依赖

```bash
npm install
```

该命令会根据 `package-lock.json` 安装全部依赖（含开发依赖）。若网络较慢，可改用镜像源，例如：

```bash
npm install --registry=https://registry.npmmirror.com
```

## 本地开发预览

```bash
npm run dev
```

启动后浏览器访问：<http://127.0.0.1:5173>

代码热更新（HMR），修改 `src/` 下文件将即时刷新。

## 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录（已做代码分割与资源压缩）。

本地预览构建产物：

```bash
npm run preview
```

## 部署

将 `npm run build` 生成的 `dist/` 目录整体上传到任意静态托管服务即可，例如：

- **Vercel**（推荐，已内置 `vercel.json`）：直接连接仓库，框架自动识别为 Vite，构建命令 `npm run build`、输出目录 `dist`。项目已包含 `.npmrc`（放行 esbuild 的 install 脚本）与升级后的 `vite@7`，可避免旧版 esbuild postinstall 被拦截导致的构建失败。
- GitHub Pages（可配合 `gh-pages` 或 Actions 部署 `dist`）
- Netlify（直接连接仓库，构建命令填 `npm run build`，输出目录填 `dist`）
- 任意 Nginx / Apache 静态目录

> 若部署到子路径（如 `https://user.github.io/repo/`），需要在 `vite.config.js` 中设置 `base: '/repo/'`。

## 目录结构

```
.
├─ index.html                 # 页面入口
├─ package.json              # 依赖与脚本
├─ package-lock.json         # 依赖锁版本
├─ vite.config.js            # Vite 配置（含 .glb 资源、dev 端口）
├─ vercel.json               # Vercel 部署配置
├─ .npmrc                    # npm 配置（放行 install 脚本）
├─ .gitignore                # Git 忽略规则
├─ public/                   # 静态资源（原样拷贝到根路径，不经过打包）
│  ├─ assets/
│  │  ├─ fonts/              # 本地字体
│  │  ├─ works/             # 作品封面图
│  │  ├─ stickers/          # ABOUT ME 四角贴纸（透明 PNG）
│  │  ├─ contact/           # 联系板块背景
│  │  ├─ lanyard/           # 挂绳 3D 卡片资源
│  │  ├─ resume/            # 中英简历 PDF
│  │  ├─ *.mp4              # 首屏 / 过场视频
│  │  └─ portrait.jpg
├─ src/
│  ├─ main.jsx              # 应用入口
│  ├─ App.jsx               # 页面装配与各板块编排
│  ├─ content.js            # 全部文案（中英双语，集中管理）
│  ├─ i18n.jsx              # 语言切换上下文
│  ├─ styles.css            # 全局样式
│  ├─ components/           # 复用组件（HeroBalls / Preloader / Nav 等）
│  └─ sections/             # 页面区块（Hero / AboutMe / Works / Contact 等）
└─ dist/                    # 构建产物（npm run build 生成，已加入 .gitignore）
```

## 上传到 GitHub

本项目目录已包含 `.gitignore`（忽略 `node_modules`、`dist` 等），可直接初始化仓库：

```bash
git init
git add .
git commit -m "Initial commit: Liao Siqi portfolio"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

## 自定义说明

- **文案 / 双语**：编辑 `src/content.js`，所有界面文字集中在此。
- **首屏背景**：`src/components/HeroBalls.jsx`（半调网点大字 + 粉球弹性碰撞）。
- **导航 / 语言**：`src/sections/Nav.jsx` 与 `src/i18n.jsx`。
- **样式**：全局在 `src/styles.css`，组件级样式就近同名 `.css`。

## 许可

本项目仅供个人作品集展示使用，相关素材版权归作者所有。
