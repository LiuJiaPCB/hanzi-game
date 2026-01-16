# 汉字实验室 - 微信小程序 Demo

这是一个简单的微信小程序 Demo，用于学习小程序开发基础。

## 📱 功能介绍

1. **首页**：展示随机汉字，可以切换和朗读
2. **笔画练习**：在画布上临摹汉字笔画
3. **象形字探索**：了解汉字的象形演变

## 🚀 如何运行

### 第一步：安装微信开发者工具

1. 访问：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 下载并安装微信开发者工具（macOS 版本）

### 第二步：导入项目

1. 打开微信开发者工具
2. 点击"+"号，选择"导入项目"
3. 项目目录选择：`/Users/myronliu/IdeaProjects/hanzi-game/miniapp-demo`
4. AppID 选择：使用测试号（或输入你的 AppID）
5. 项目名称：汉字实验室 Demo
6. 点击"导入"

### 第三步：开始调试

1. 导入成功后，会自动打开项目
2. 左侧是代码编辑器
3. 右侧是模拟器，可以看到小程序运行效果
4. 点击模拟器中的按钮进行交互

## 🎯 调试技巧

### 1. 查看控制台
- 点击开发者工具底部的"Console"标签
- 可以看到 `console.log()` 的输出
- 可以看到错误信息

### 2. 查看网络请求
- 点击"Network"标签
- 可以看到所有的网络请求（本 Demo 没有网络请求）

### 3. 查看存储
- 点击"Storage"标签
- 可以查看本地存储的数据

### 4. 真机调试
- 点击工具栏的"预览"按钮
- 用微信扫描二维码
- 在真实手机上查看效果

### 5. 修改代码实时预览
- 修改任何 `.wxml`、`.wxss`、`.js` 文件
- 保存后（Cmd+S）会自动刷新模拟器
- 可以立即看到效果

## 📁 项目结构

```
miniapp-demo/
├── app.js              # 小程序入口逻辑
├── app.json            # 小程序全局配置
├── app.wxss            # 小程序全局样式
├── sitemap.json        # 搜索配置
├── project.config.json # 项目配置
└── pages/              # 页面目录
    ├── index/          # 首页
    │   ├── index.wxml  # 页面结构
    │   ├── index.wxss  # 页面样式
    │   ├── index.js    # 页面逻辑
    │   └── index.json  # 页面配置
    ├── stroke/         # 笔画练习页
    └── xiangxing/      # 象形字页
```

## 🎨 小程序开发基础

### 1. 文件类型
- `.wxml`：类似 HTML，定义页面结构
- `.wxss`：类似 CSS，定义页面样式
- `.js`：JavaScript，定义页面逻辑
- `.json`：JSON 配置文件

### 2. 数据绑定
```html
<!-- WXML -->
<view>{{message}}</view>
```
```javascript
// JS
Page({
  data: {
    message: 'Hello World'
  }
})
```

### 3. 事件绑定
```html
<!-- WXML -->
<button bindtap="handleClick">点击我</button>
```
```javascript
// JS
Page({
  handleClick() {
    console.log('按钮被点击了');
  }
})
```

### 4. 修改数据
```javascript
this.setData({
  message: '新的内容'
});
```

## 🔧 常见问题

### Q1: 模拟器显示空白？
A: 检查 Console 是否有错误信息，确保所有文件都已保存。

### Q2: 如何切换页面？
A: 点击底部的 TabBar，或使用 `wx.navigateTo()` 跳转。

### Q3: 如何添加新页面？
A: 
1. 在 `pages/` 目录下创建新文件夹
2. 创建 `.wxml`、`.wxss`、`.js`、`.json` 四个文件
3. 在 `app.json` 的 `pages` 数组中添加路径

### Q4: 真机预览需要什么？
A: 需要注册微信小程序账号，或使用测试号。

## 📚 学习资源

- 官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- API 文档：https://developers.weixin.qq.com/miniprogram/dev/api/
- 组件文档：https://developers.weixin.qq.com/miniprogram/dev/component/

## 🎉 下一步

1. 尝试修改页面文字和颜色
2. 添加新的汉字到列表
3. 尝试添加新的功能页面
4. 学习更多小程序 API

祝你学习愉快！🚀
