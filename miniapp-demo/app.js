App({
  onLaunch() {
    console.log('汉字实验室小程序启动');
    
    // 初始化云开发
    if (wx.cloud) {
      // ⚠️ 重要：请替换为你的真实云开发环境ID
      // 格式：cloud1-xxxxxxxx（以cloud1-开头，后面跟8位字符）
      // 获取方式：
      // 1. 点击微信开发者工具顶部的"云开发"按钮
      // 2. 点击"云开发控制台"
      // 3. 在左上角点击环境名称旁的下拉箭头
      // 4. 复制"环境 ID"（例如：cloud1-2g8h3j4k）
      
      const cloudEnvId = 'cloudbase-3gukm4e80bf8b293'; // 👈 请在这fgdsgfewf里填写你的环境ID
      
      wx.cloud.init({
        env: cloudEnvId,
        traceUser: true
      });
      console.log('✅ 云开发初始化成功，环境ID:', cloudEnvId);
    } else {
      console.warn('当前微信版本不支持云开发');
    }
    // 获取系统信息
    // wx.getSystemInfoSync is deprecated, use new APIs
    const windowInfo = wx.getWindowInfo();
    const deviceInfo = wx.getDeviceInfo();
    const appBaseInfo = wx.getAppBaseInfo();
    const appAuthorizeSetting = wx.getAppAuthorizeSetting();
    const systemSetting = wx.getSystemSetting();

    const systemInfo = {
      ...windowInfo,
      ...deviceInfo,
      ...appBaseInfo,
      ...appAuthorizeSetting,
      ...systemSetting,
      // 保持兼容性，手动添加一些可能缺失的字段或别名，如果需要的话
      // 目前大部分常用字段都在上述对象中
    };

    this.globalData.systemInfo = systemInfo;
    console.log('系统信息:', systemInfo);
  },
  
  globalData: {
    systemInfo: null,
    hanziList: ['一', '二', '三', '上', '下', '大', '小', '人', '口', '手']
  }
})
