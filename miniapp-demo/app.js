App({
  onLaunch() {
    console.log('汉字实验室小程序启动');
    
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
