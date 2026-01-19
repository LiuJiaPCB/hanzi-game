// pages/index/index.js
const app = getApp();
const ttsUtil = require('../../utils/tts-util');
const { HANZI_DATA } = require('../../utils/hanzi-data');

Page({
  data: {
    currentHanzi: '汉',
    pinyin: 'hàn',
    strokeCount: 5,
    word: '汉字',
    hanziList: [] // 将从 HANZI_DATA 中获取
  },

  onLoad() {
    console.log('首页加载');
    // 从 HANZI_DATA 中获取所有汉字列表
    const hanziList = Object.keys(HANZI_DATA);
    this.setData({ hanziList });
    console.log(`加载了 ${hanziList.length} 个汉字`);
    this.changeHanzi();
  },

  onUnload() {
    // 页面卸载时停止语音播放
    ttsUtil.stop();
  },

  // 随机切换汉字
  changeHanzi() {
    const { hanziList } = this.data;
    if (hanziList.length === 0) {
      console.error('汉字列表为空');
      return;
    }

    const randomIndex = Math.floor(Math.random() * hanziList.length);
    const hanzi = hanziList[randomIndex];

    // 从 HANZI_DATA 获取汉字信息
    const hanziInfo = HANZI_DATA[hanzi];
    if (!hanziInfo) {
      console.error(`未找到汉字信息：${hanzi}`);
      return;
    }

    // 转换拼音格式（从 "Hàn" 转为 "hàn"）
    const pinyin = hanziInfo.pinyin ? hanziInfo.pinyin.toLowerCase() : 'unknown';
    const strokeCount = hanziInfo.strokeCount || 0;
    const word = hanziInfo.word || '';

    this.setData({
      currentHanzi: hanzi,
      pinyin: pinyin,
      strokeCount: strokeCount,
      word: word
    });

    // 显示提示
    const displayText = word ? `${hanzi}（${word}）` : hanzi;
    wx.showToast({
      title: `切换到：${displayText}`,
      icon: 'none',
      duration: 1000
    });
  },

  // 朗读汉字
  playSound() {
    const { currentHanzi, pinyin, word } = this.data;

    // 构建播报文本：汉字  + 组词
    let speakText = `${currentHanzi}`;
    if (word) {
      speakText += `，${word}`;
    }

    // 使用腾讯云语音合成播报汉字
    ttsUtil.speak(speakText, {
      voiceType: 0, // 0-女声，1-男声
      speed: -1, // 语速：-2到2，负数表示慢速
      volume: 8, // 音量：0-10
      success: () => {
        console.log('语音播报成功');
        const displayText = word ? `${currentHanzi}（${word}）` : currentHanzi;
        wx.showToast({
          title: `正在朗读：${displayText}`,
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
