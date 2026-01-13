import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import cnchar from 'cnchar-all'

// 初始化 cnchar 库
// 确保 cnchar 在应用启动时被加载
if (cnchar) {
  // cnchar 已加载，可以在组件中使用
}

const app = createApp(App)
app.mount('#app')
