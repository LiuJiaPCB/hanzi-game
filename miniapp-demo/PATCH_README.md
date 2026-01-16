# hanzi-writer 修补说明

## 问题
新版本的 hanzi-writer 存在以下兼容性问题：
1. 默认使用 2D Canvas API，在某些环境中可能不兼容
2. 默认使用 Path2D API，在某些小程序环境中可能导致母字无法正常渲染

## 解决方案
通过以下两个修补来解决兼容性问题：
1. 将 Canvas type 默认值从 `'2d'` 改为 `''`（使用旧版 Canvas）
2. 强制禁用 Path2D API（添加 `false &&` 条件）

## 使用方法

### 方式 1：手动运行修补脚本（推荐）
每次在微信开发者工具中"构建 npm"后，运行：
```bash
npm run patch
```

### 方式 2：直接运行脚本
```bash
node patch-hanzi-writer.js
```

## 修改内容

### 修补 1: hanzi-writer-view.js
**修改前：**
```javascript
type: {
  type: String,
  value: '2d'  // 默认使用2d canvas
}
```

**修改后：**
```javascript
type: {
  type: String,
  value: ''  // 使用旧版 canvas
}
```

### 修补 2: hanzi-writer/index.js (第2609行)
**修改前：**
```javascript
if (usePath2D && global.Path2D) {
```

**修改后：**
```javascript
if (false && usePath2D && global.Path2D) {
```

## 注意事项
⚠️ **重要**：每次在微信开发者工具中点击"构建 npm"后，都需要重新运行修补脚本！

## 版本控制建议
建议将修补后的 `miniprogram_npm` 目录提交到版本控制，这样团队成员就不需要每次都运行修补脚本。
