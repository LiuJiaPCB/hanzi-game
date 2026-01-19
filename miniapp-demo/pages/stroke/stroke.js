// pages/stroke/stroke.js
const { HANZI_DATA } = require('../../utils/hanzi-data.js');
const { PRACTICE_HANZI_LIST } = require('../../utils/practice-hanzi-list.js');

// 引入 hanzi-writer-miniprogram
let createHanziWriter;
try {
  createHanziWriter = require('../../miniprogram_npm/hanzi-writer-miniprogram/index.js');
} catch (e) {
  console.error('引入 hanzi-writer-miniprogram 失败:', e);
  try {
    createHanziWriter = require('hanzi-writer-miniprogram');
  } catch (e2) {
    console.error('再次尝试引入 hanzi-writer-miniprogram 失败:', e2);
  }
}

Page({
  data: {
    currentHanzi: '一',
    strokeOrder: '横',
    hanziList: [],
    currentIndex: 0,
    canvasSize: 300 // 默认值
  },

  writer: null,

  onLoad() {
    // 计算 Canvas 尺寸 (600rpx 转 px)
    try {
      const windowInfo = wx.getWindowInfo();
      const rpxRatio = windowInfo.windowWidth / 750;
      const canvasSize = Math.floor(600 * rpxRatio);
      console.log('Canvas Size:', canvasSize);
      this.setData({ canvasSize });
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
    
    // 使用预定义的汉字列表
    const hanziList = PRACTICE_HANZI_LIST;
    console.log('汉字列表:', hanziList, '共', hanziList.length, '个');
    
    // 从 HANZI_DATA 中获取初始汉字的笔画信息
    const { currentHanzi } = this.data;
    const hanziData = HANZI_DATA[currentHanzi];
    const strokeOrder = hanziData && hanziData.strokeShapes
      ? hanziData.strokeShapes.join('、')
      : '未知';
    
    this.setData({
      hanziList: hanziList,
      strokeOrder: strokeOrder
    });
  },
  


  onReady() {
    // 页面渲染完成后初始化 HanziWriter
    this.initHanziWriter();
  },

  // 初始化 HanziWriter
  initHanziWriter() {
    const { currentHanzi, canvasSize } = this.data;
    
    if (!createHanziWriter) {
      console.error('HanziWriter 未加载');
      wx.showToast({
        title: 'HanziWriter 加载失败',
        icon: 'none'
      });
      return;
    }
    
    // 验证汉字是否存在于 HANZI_DATA 中
    if (!HANZI_DATA[currentHanzi]) {
      console.error('汉字不存在于 HANZI_DATA 中:', currentHanzi);
      wx.showToast({
        title: '该汉字暂不支持',
        icon: 'none'
      });
      return;
    }

    console.log('初始化 HanziWriter，汉字:', currentHanzi);

    wx.nextTick(() => {
      const comp = this.selectComponent('#hanzi-writer');
      if (!comp) {
        console.error('未找到 hanzi-writer 组件');
        return;
      }

      // 创建 HanziWriter 实例
      this.writer = createHanziWriter({
        id: 'hanzi-writer',
        character: currentHanzi,
        page: this,
        width: canvasSize,
        height: canvasSize,
        padding: 5,
        showCharacter: false, // 隐藏汉字本身
        showOutline: false,    // 默认隐藏笔画轮廓，点击提示按钮时显示
        strokeColor: '#4CAF50',
        outlineColor: '#DDD',
        drawingColor: '#333',
        showHintAfterMisses: 1, // 错误1次后显示提示
        onLoadCharDataSuccess: (data) => {
          console.log('汉字数据加载成功:', data);
          // 启动 quiz 模式
          this.startQuiz();
        },
        onLoadCharDataError: (error) => {
          console.error('汉字数据加载失败:', error);
          wx.showToast({
            title: '汉字数据加载失败',
            icon: 'none'
          });
        }
      });
    });
  },

  // 启动 quiz 模式
  startQuiz() {
    if (!this.writer) {
      console.error('Writer 未初始化');
      return;
    }

    console.log('启动 quiz 模式');
    
    this.writer.quiz({
      onMistake: (strokeData) => {
        console.log('笔画错误:', strokeData);
        wx.showToast({
          title: '笔画不正确，请重试',
          icon: 'none',
          duration: 1000
        });
      },
      onCorrectStroke: (strokeData) => {
        console.log('笔画正确:', strokeData);
        wx.showToast({
          title: '正确！',
          icon: 'success',
          duration: 500
        });
      },
      onComplete: (summaryData) => {
        console.log('完成:', summaryData);
        wx.showToast({
          title: '太棒了！完成了！',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 重新开始练习
  resetQuiz() {
    if (!this.writer) {
      console.error('Writer 未初始化');
      return;
    }
    
    console.log('重新开始 quiz');
    
    // 隐藏轮廓
    this.writer.hideOutline();
    
    // 重新开始 quiz
    this.writer.cancelQuiz();
    this.startQuiz();
    
    wx.showToast({
      title: '重新开始',
      icon: 'success'
    });
  },

  // 显示提示
  showHint() {
    if (!this.writer) {
      console.error('Writer 未初始化');
      return;
    }
    console.log('显示提示');
    // 显示轮廓
    this.writer.showOutline();
  },

  // 根据笔画名称查找对应的汉字
  findHanziByStrokes(strokes) {
    const results = [];
    
    for (const hanzi in HANZI_DATA) {
      const data = HANZI_DATA[hanzi];
      if (data.strokeShapes) {
        // 将笔画名称数组转换为字符串进行比较
        const strokeStr = data.strokeShapes.join('、');
        const inputStrokeStr = strokes.join('、');
        
        if (strokeStr === inputStrokeStr) {
          results.push({
            hanzi: hanzi,
            pinyin: data.pinyin,
            strokeCount: data.strokeCount
          });
        }
      }
    }
    
    return results;
  },

  // 下一个汉字
  nextHanzi() {
    const { hanziList, currentIndex } = this.data;
    
    if (!hanziList || hanziList.length === 0) {
      console.error('汉字列表为空');
      wx.showToast({
        title: '没有可用的汉字',
        icon: 'none'
      });
      return;
    }
    
    const nextIndex = (currentIndex + 1) % hanziList.length;
    const nextHanzi = hanziList[nextIndex];
    
    // 验证汉字数据
    const hanziData = HANZI_DATA[nextHanzi];
    if (!hanziData || !hanziData.strokeShapes) {
      console.error('汉字数据无效:', nextHanzi);
      // 跳过这个汉字，尝试下一个
      this.setData({ currentIndex: nextIndex });
      this.nextHanzi();
      return;
    }
    
    const strokeOrder = hanziData.strokeShapes.join('、');
    
    this.setData({
      currentHanzi: nextHanzi,
      strokeOrder: strokeOrder,
      currentIndex: nextIndex
    });
    
    // 取消当前 quiz 并更新汉字
    if (this.writer) {
      // 隐藏轮廓
      this.writer.hideOutline();
      
      this.writer.cancelQuiz();
      this.writer.setCharacter(nextHanzi);
      // 等待汉字数据加载后启动 quiz
      setTimeout(() => {
        this.startQuiz();
      }, 500);
    }
  }
})
