export function speakHanzi(text: string) {
  // 1. 取消当前正在播放的所有语音（防止重叠）
  window.speechSynthesis.cancel();

  // 2. 创建播报对象
  const msg = new SpeechSynthesisUtterance(text);

  // 3. 配置参数
  msg.lang = 'zh-CN';  // 设置中文
  msg.rate = 1.0;      // 语速略慢，适合小朋友
  msg.pitch = 1.2;     // 音调略高，听起来更亲切

  // 4. 执行播报
  window.speechSynthesis.speak(msg);
}

export function showToast(msg: string) {
  const toast = document.createElement('div');
  toast.className = 'toast-hint';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = '0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}
