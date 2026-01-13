# 汉字实验室 (Hanzi Game) - 重构版

这是一个基于 Vue 3 + Vite + TypeScript 重构的汉字教学互动应用。

## 🚀 快速开始

### 1. 安装依赖

在项目根目录下运行：

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问显示的地址（通常是 `http://localhost:5173`）。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将位于 `dist` 目录。

## 📁 项目结构

- `src/`
  - `components/`: 游戏模块组件 (RunTown, StrokeLab, XiangXing)
  - `utils/`: 工具函数和静态数据
  - `App.vue`: 主应用入口
  - `main.ts`: 程序入口
  - `style.css`: 全局样式
- `public/`: 静态资源 (data, images_opt)
- `index.html`: 入口 HTML

## 🛠 技术栈

- Vue 3
- Vite
- TypeScript
- cnchar (汉字处理)
- hanzi-writer (汉字书写动画)
