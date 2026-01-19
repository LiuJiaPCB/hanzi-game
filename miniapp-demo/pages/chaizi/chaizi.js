const { PinyinUtil } = require('../../utils/pinyin-util.js');
const { HANZI_DATA } = require('../../utils/hanzi-data.js');
const ttsUtil = require('../../utils/tts-util');

// 尝试引入 hanzi-writer-miniprogram
let createHanziWriter;
try {
  // 尝试使用绝对路径引入，以确保在各种构建环境下都能找到
  createHanziWriter = require('../../miniprogram_npm/hanzi-writer-miniprogram/index.js');
} catch (e) {
  console.error('引入 hanzi-writer-miniprogram 失败:', e);
  try {
      // 备用方案：尝试直接包名引入
      createHanziWriter = require('hanzi-writer-miniprogram');
  } catch (e2) {
      console.error('再次尝试引入 hanzi-writer-miniprogram 失败:', e2);
  }
}

Page({
  data: {
    charInput: '克',
    strokes: [],
    strokeStatus: [],
    clickSequence: [],
    matchedChars: [],
    hanziList: [],
    canvasSize: 300, // 默认值
    word: '', // 组词
    pinyin: '' // 拼音
  },

  onLoad() {
    // 初始化实例变量
    this.foundChars = new Set();
    this.currentStrokeIndex = 0;
    this.writer = null;
    
    // 笔画映射表（定义在实例上）
    this.STROKE_MAP = {
      '一': 'H',
      '㇀': 'H',
      '丶': 'N',
      '㇏': 'N'
    };
    
    // 计算 Canvas 尺寸 (300rpx 转 px)
    try {
      // wx.getSystemInfoSync is deprecated
      const windowInfo = wx.getWindowInfo();
      const rpxRatio = windowInfo.windowWidth / 750;
      const canvasSize = Math.floor(300 * rpxRatio); // 300rpx 对应的 px 值
      console.log('Canvas Size:', canvasSize, 'Window Width:', windowInfo.windowWidth);
      this.setData({ canvasSize });
    } catch (e) {
      console.error('获取系统信息失败', e);
    }

    this.loadHanziList();
  },

  onReady() {
    // 确保组件已挂载后再初始化
    this.initSplit();
  },

  onUnload() {
    // 页面卸载时停止语音播放
    ttsUtil.stop();
  },

  // 加载汉字列表
  loadHanziList() {
    try {
      // 从 HANZI_DATA 中提取所有汉字
      const hanziList = Object.keys(HANZI_DATA);
      
      if (hanziList.length > 0) {
        this.setData({ hanziList });
      } else {
        throw new Error('汉字列表为空');
      }
    } catch (error) {
      console.error('加载汉字列表失败:', error);
      // 使用默认汉字列表
      this.setData({
        hanziList: ['克', '明', '林', '休', '好', '家', '山', '水', '火', '木', '日', '月', '人', '口', '手', '目', '田', '心', '门', '车']
      });
    }
  },

  // 输入字符
  onCharInput(e) {
    this.setData({
      charInput: e.detail.value
    });
  },

  // 朗读汉字
  playSound() {
    const { charInput, word } = this.data;

    // 构建播报文本：汉字 + 组词
    let speakText = `${charInput}`;
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
        const displayText = word ? `${charInput}（${word}）` : charInput;
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

  // 随机选择汉字
  randomHanzi() {
    const { hanziList } = this.data;
    if (hanziList.length === 0) {
      wx.showToast({
        title: '汉字列表还在加载中...',
        icon: 'none'
      });
      return;
    }
    const randomIndex = Math.floor(Math.random() * hanziList.length);
    this.setData({
      charInput: hanziList[randomIndex]
    }, () => {
      this.initSplit();
    });
  },

  // 初始化拆字
  initSplit() {
    const { charInput } = this.data;
    const char = charInput || '克';

    console.log(`[${Date.now()}] initSplit开始，char:`, char);

    // 播放语音
    PinyinUtil.speak(char);

    // 获取组词和拼音
    const hanziData = HANZI_DATA[char];
    const word = hanziData && hanziData.word ? hanziData.word : '';
    const pinyin = hanziData && hanziData.pinyin ? hanziData.pinyin.toLowerCase() : '';

    // 重置游戏状态
    this.foundChars.clear();
    this.currentStrokeIndex = 0;
    this.setData({
      matchedChars: [],
      clickSequence: [],
      word: word,
      pinyin: pinyin
    });

    // 获取本地笔画信息
    const strokes = this.getCharStrokes(char);
    console.log(`[${Date.now()}] getCharStrokes返回:`, strokes, '长度:', strokes.length);
    
    // 更新笔画数据（有则显示，无则清空等待远程加载）
    this.setData({
      strokes: strokes || [],
      strokeStatus: strokes ? new Array(strokes.length).fill(false) : []
    });

    // 初始化或更新 HanziWriter
    if (!createHanziWriter) {
      console.error('HanziWriter not available');
      return;
    }

    // 如果 writer 已存在，直接更新字符；否则创建新实例
    if (this.writer) {
      this.updateWriterCharacter(char);
    } else {
      this.initHanziWriter(char);
    }
  },

  // 创建 HanziWriter 实例（仅首次调用）
  initHanziWriter(char) {
    console.log(`[${Date.now()}] 创建 HanziWriter 实例，char:`, char, 'Size:', this.data.canvasSize);

    wx.nextTick(() => {
      const comp = this.selectComponent('#hanzi-canvas');
      if (!comp) {
        console.error('未找到 hanzi-canvas 组件');
        return;
      }

      this.writer = createHanziWriter({
        id: 'hanzi-canvas',
        character: char,
        page: this,
        width: this.data.canvasSize,
        height: this.data.canvasSize,
        padding: 20,
        showOutline: false,
        showCharacter: false,
        strokeColor: '#555',
        radicalColor: '#555',
        outlineColor: '#E0E0E0',
        charDataLoader: this.createCharDataLoader(),
        onLoadCharDataSuccess: (data) => this.handleCharDataLoaded(data)
      });
    });
  },

  // 更新 HanziWriter 字符（复用实例）
  updateWriterCharacter(char) {
    console.log(`[${Date.now()}] 更新 HanziWriter 字符:`, char);
    
    try {
      // 隐藏当前字符，准备切换
      this.writer.hideCharacter();
      
      // 延时再设置新字符，确保隐藏动画完成
      wx.nextTick(() => {
        this.writer.setCharacter(char);
      });
    } catch (e) {
      console.error('更新字符失败，尝试重新创建 writer:', e);
      // 如果更新失败，销毁后重新创建
      this.writer.destroy();
      this.writer = null;
      this.initHanziWriter(char);
    }
  },

  // 创建字符数据加载器
  createCharDataLoader() {
    return (char, onLoad, onError) => {
      console.log(`[${Date.now()}] 开始加载汉字数据:`, char);

      const loadFromCdn = (url) => {
        return new Promise((resolve, reject) => {
          wx.request({
            url: url,
            timeout: 1000, // 超时时间设置为 1 秒
            header: { 'content-type': 'application/json' },
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(res.data);
              } else {
                reject(new Error(`Status code: ${res.statusCode}`));
              }
            },
            fail: (err) => reject(err)
          });
        });
      };

      // CDN 地址
      const url1 = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`;
      const url2 = `https://unpkg.com/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`;

      // 尝试从 jsdelivr 加载，失败则尝试 unpkg
      loadFromCdn(url1)
        .then(data => {
          console.log(`[${Date.now()}] 汉字数据加载成功 (jsdelivr):`, char);
          onLoad(data);
        })
        .catch(err1 => {
          console.warn(`jsdelivr 加载失败:`, char, err1);
          return loadFromCdn(url2);
        })
        .then(data => {
          if (data) {
            console.log(`[${Date.now()}] 汉字数据加载成功 (unpkg):`, char);
            onLoad(data);
          }
        })
        .catch(err2 => {
          console.error(`汉字数据加载全部失败:`, char, err2);
          if (err2 && err2.errMsg && err2.errMsg.includes('domain list')) {
            wx.showModal({
              title: '开发环境配置提示',
              content: '请求被拦截。请在开发者工具右上角"详情" -> "本地设置"中勾选"不校验合法域名..."，然后重新编译。',
              showCancel: false
            });
          }
          onError(err2);
        });
    };
  },

  // 处理字符数据加载完成
  handleCharDataLoaded(data) {
    const inferredStrokes = this.inferStrokesFromData(data);
    this.setData({
      strokes: inferredStrokes,
      strokeStatus: new Array(data.strokes.length).fill(false)
    }, () => {
      if (this.writer) {
        this.writer.showOutline();
        this.writer.hideCharacter();
      }
    });
  },

  // 获取汉字笔画
  getCharStrokes(char) {
    // 从 HANZI_DATA 中获取笔画信息
    const hanziData = HANZI_DATA[char];
    if (hanziData && hanziData.strokeShapes) {
      // strokeShapes 是笔画形状的数组，直接返回
      return hanziData.strokeShapes;
    }
    return [];
  },

  // 根据汉字数据推断笔画名称
  inferStrokesFromData(data) {
    if (!data || !data.strokes) return [];
    
    // 从 HANZI_DATA 中获取标准笔画名称
    const { charInput } = this.data;
    const hanziData = HANZI_DATA[charInput];
    
    if (hanziData && hanziData.strokeShapes) {
      // 确保返回的笔画数量与实际数据匹配
      const realStrokeCount = data.strokes.length;
      return hanziData.strokeShapes.slice(0, realStrokeCount);
    }
    
    // 如果 HANZI_DATA 中没有数据，使用原推断逻辑作为备用
    return [];
  },

  // 绘制背景汉字 (已废弃，由 HanziWriter 接管)
  drawBgChar(char) {
    // 兼容旧代码，不做操作
  },

  // 清空前景画布 (已废弃，由 HanziWriter 接管)
  clearFgCanvas() {
    // 兼容旧代码，不做操作
  },

  // 点击笔画
  handleStrokeClick(e) {
    const { index, stroke } = e.currentTarget.dataset;
    const { strokeStatus, clickSequence } = this.data;

    // 如果已经点击过，不处理
    if (strokeStatus[index]) {
      return;
    }

    // 更新状态
    strokeStatus[index] = true;
    clickSequence.push(stroke);

    this.setData({
      strokeStatus,
      clickSequence
    });

    // 绘制笔画动画
    this.animateStroke(index);
  },

  animateStroke(index) {
    if (this.writer) {
      // 使用 animateStroke 并指定颜色
      this.writer.animateStroke(index, {
        strokeColor: '#168F16', // 高亮显示点击的笔画
        duration: 400 // 动画持续时间
      });
      wx.vibrateShort();
    }
  },

  // 重置笔画选择
  resetStrokes() {
    const { strokes } = this.data;
    this.setData({
      strokeStatus: new Array(strokes.length).fill(false),
      clickSequence: []
    });

    if (this.writer) {
      this.writer.hideCharacter();
    }
  },

  // 查找匹配的汉字
  findExactMatches() {
    const { clickSequence } = this.data;

    console.log('🔍 开始查找匹配，点击的笔画序列:', clickSequence);

    if (clickSequence.length === 0) {
      wx.showToast({
        title: '请先选择笔画',
        icon: 'none'
      });
      return;
    }

    const currentCode = this.getStandardCode(clickSequence);
    console.log('🔍 当前笔画的标准代码:', currentCode);

    const newMatched = [];

    // 调试：打印 HANZI_DATA 的前几个字符
    console.log('🔍 HANZI_DATA 字符总数:', Object.keys(HANZI_DATA).length);
    const sampleChars = Object.keys(HANZI_DATA).slice(0, 5);
    console.log('🔍 HANZI_DATA 示例字符:', sampleChars.map(char => {
      return { char, data: HANZI_DATA[char] };
    }));

    // 从 HANZI_DATA 中查找匹配的汉字
    for (const char in HANZI_DATA) {
      const hanziData = HANZI_DATA[char];

      // 获取汉字的笔画形状
      const charStrokes = hanziData.strokeShapes || [];
      const charCode = this.getStandardCode(charStrokes);

      // 调试：打印每个字符的匹配情况
      if (char === '十') {
        console.log(`🔍 检查字符 "十":`, {
          strokeShapes: charStrokes,
          charCode,
          currentCode,
          matches: currentCode === charCode,
          alreadyFound: this.foundChars.has(char)
        });
      }

      // 检查笔画是否匹配
      if (currentCode === charCode && !this.foundChars.has(char)) {
        const pinyin = hanziData.pinyin || PinyinUtil.getPinyin(char);
        newMatched.push({ char, pinyin });
        this.foundChars.add(char);
      }
    }

    console.log('🔍 新找到的匹配字符:', newMatched);
    console.log('🔍 已找到的字符集合:', Array.from(this.foundChars));

    if (newMatched.length > 0) {
      // 添加到结果列表
      const { matchedChars } = this.data;
      console.log('🔍 更新前的 matchedChars:', matchedChars);

      const updatedMatchedChars = [...matchedChars, ...newMatched];
      console.log('🔍 更新后的 matchedChars:', updatedMatchedChars);

      this.setData({
        matchedChars: updatedMatchedChars
      }, () => {
        // setData回调：DOM更新完成后再绘制
      });

      // 播放成功提示
      wx.showToast({
        title: `找到 ${newMatched.length} 个小伙伴！`,
        icon: 'success'
      });

      // 播放语音
      newMatched.forEach(item => {
        PinyinUtil.speak(item.char);
      });
    } else {
      wx.showToast({
        title: '💡 还没找到对应的小伙伴，再试一组笔画？',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 标准化笔画编码
  getStandardCode(strokeArray) {
    if (!strokeArray || strokeArray.length === 0) {
      return '';
    }
    return strokeArray.map(s => this.STROKE_MAP[s] || s).join(',');
  }
});