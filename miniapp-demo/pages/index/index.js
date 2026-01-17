// pages/index/index.js
const app = getApp();
const ttsUtil = require('../../utils/tts-util');

Page({
  data: {
    currentHanzi: '汉',
    pinyin: 'hàn',
    strokeCount: 5,
    hanziList: ['汉', '字', '学', '习', '一', '二', '三', '上', '下', '大', '小', '人', '口', '手', '山', '水', '火', '木', '日', '月']
  },

  onLoad() {
    console.log('首页加载');
    this.changeHanzi();
  },

  onUnload() {
    // 页面卸载时停止语音播放
    ttsUtil.stop();
  },

  // 随机切换汉字
  changeHanzi() {
    const { hanziList } = this.data;
    const randomIndex = Math.floor(Math.random() * hanziList.length);
    const hanzi = hanziList[randomIndex];

    // 模拟获取汉字信息（实际项目中可以调用 cnchar 库）
    const pinyinMap = {
      '汉': 'hàn', '字': 'zì', '学': 'xué', '习': 'xí',
      '一': 'yī', '二': 'èr', '三': 'sān', '上': 'shàng',
      '下': 'xià', '大': 'dà', '小': 'xiǎo', '人': 'rén',
      '口': 'kǒu', '手': 'shǒu', '山': 'shān', '水': 'shuǐ',
      '火': 'huǒ', '木': 'mù', '日': 'rì', '月': 'yuè'
    };

    const strokeMap = {
      '汉': 5, '字': 6, '学': 8, '习': 3,
      '一': 1, '二': 2, '三': 3, '上': 3,
      '下': 3, '大': 3, '小': 3, '人': 2,
      '口': 3, '手': 4, '山': 3, '水': 4,
      '火': 4, '木': 4, '日': 4, '月': 4
    };

    this.setData({
      currentHanzi: hanzi,
      pinyin: pinyinMap[hanzi] || 'unknown',
      strokeCount: strokeMap[hanzi] || 0
    });

    // 显示提示
    wx.showToast({
      title: `切换到：${hanzi}`,
      icon: 'none',
      duration: 1000
    });
  },

  // 朗读汉字
  playSound() {
    const { currentHanzi, pinyin } = this.data;

    // 使用腾讯云语音合成播报汉字
    ttsUtil.speak(currentHanzi, {
      voiceType: 0, // 0-女声，1-男声
      speed: -1, // 语速：-2到2，负数表示慢速
      volume: 8, // 音量：0-10
      success: () => {
        console.log('语音播报成功');
        wx.showToast({
          title: `正在朗读：${currentHanzi}`,
          icon: 'none',
          duration: 1500
        });
      },
      fail: (error) => {
        console.error('语音播报失败', error);
        wx.showToast({
          title: '语音播报失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 跳转到跑跑镇
  goToRuntown() {
    wx.navigateTo({
      url: '/pages/runtown/runtown'
    });
  },

  // 跳转到拆字
  goToChaizi() {
    wx.navigateTo({
      url: '/pages/chaizi/chaizi'
    });
  },

  // 跳转到笔画练习
  goToStroke() {
    wx.navigateTo({
      url: '/pages/stroke/stroke'
    });
  },

  // 跳转到象形字
  goToXiangxing() {
    wx.navigateTo({
      url: '/pages/xiangxing/xiangxing'
    });
  }
})
