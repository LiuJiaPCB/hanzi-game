// pages/stroke/stroke.js
const { HANZI_DATA } = require('../../utils/hanzi-data.js');

Page({
  data: {
    currentHanzi: '一',
    strokeOrder: '横',
    hanziList: ['一', '二', '三', '十', '大', '小', '人', '口'],
    currentIndex: 0
  },

  ctx: null,
  lastX: 0,
  lastY: 0,

  onLoad() {
    // 初始化 Canvas
    this.ctx = wx.createCanvasContext('hanziCanvas');
    this.ctx.setStrokeStyle('#4CAF50');
    this.ctx.setLineWidth(5);
    this.ctx.setLineCap('round');
    this.ctx.setLineJoin('round');
    
    // 从 HANZI_DATA 中获取初始汉字的笔画信息
    const { currentHanzi } = this.data;
    const hanziData = HANZI_DATA[currentHanzi];
    const strokeOrder = hanziData && hanziData.strokeShapes
      ? hanziData.strokeShapes.join('、')
      : '未知';
    
    this.setData({
      strokeOrder: strokeOrder
    });
  },

  // 触摸开始
  touchStart(e) {
    this.lastX = e.touches[0].x;
    this.lastY = e.touches[0].y;
  },

  // 触摸移动
  touchMove(e) {
    const x = e.touches[0].x;
    const y = e.touches[0].y;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.draw(true);
    
    this.lastX = x;
    this.lastY = y;
  },

  // 触摸结束
  touchEnd() {
    // 可以在这里添加笔画识别逻辑
  },

  // 清空画布
  clearCanvas() {
    this.ctx.clearRect(0, 0, 300, 300);
    this.ctx.draw();
    
    wx.showToast({
      title: '画布已清空',
      icon: 'success'
    });
  },

  // 显示笔画
  showStroke() {
    const { currentHanzi } = this.data;
    
    // 从 HANZI_DATA 中获取笔画形状
    const hanziData = HANZI_DATA[currentHanzi];
    
    if (hanziData && hanziData.strokeShapes) {
      // 在画布上绘制汉字
      this.ctx.setFillStyle('#E0E0E0');
      this.ctx.setFontSize(200);
      this.ctx.fillText(currentHanzi, 50, 200);
      this.ctx.draw(true);
      
      // 显示笔画形状
      wx.showToast({
        title: `笔画：${hanziData.strokeShapes.join('、')}`,
        icon: 'none'
      });
    } else {
      wx.showToast({
        title: '未找到汉字数据',
        icon: 'none'
      });
    }
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
    const nextIndex = (currentIndex + 1) % hanziList.length;
    const nextHanzi = hanziList[nextIndex];
    
    // 从 HANZI_DATA 中获取笔画信息
    const hanziData = HANZI_DATA[nextHanzi];
    const strokeOrder = hanziData && hanziData.strokeShapes
      ? hanziData.strokeShapes.join('、')
      : '未知';
    
    this.setData({
      currentHanzi: nextHanzi,
      strokeOrder: strokeOrder,
      currentIndex: nextIndex
    });
    
    this.clearCanvas();
  }
})
