// pages/runtown/runtown.js
const { hanziLoader } = require('../../utils/hanzi-loader.js');
const { PinyinUtil } = require('../../utils/pinyin-util.js');

// 默认部件库（支持多种结构类型）
const DEFAULT_LEFT = [
  // 左右结构常用偏旁
  '氵', '亻', '口', '木', '扌', '艹', '讠', '宀', '钅', '女', '纟', '阝', '忄', '禾', '石',
  // 上下结构常用部件
  '日', '火', '田', '目', '刀', '艹', '宀', '土', '人', '山', '弓', '夕',
  // 叠加结构常用字
  '日', '木', '又', '口', '人', '弓',
  // 包围结构外部
  '囗', '冂', '凵', '匚', '厂', '⺁', '辶', '廴'
];

const DEFAULT_RIGHT = [
  // 左右结构常用右部
  '工', '可', '胡', '每', '少', '目', '干', '羊', '也', '青',
  '木', '本', '主', '言', '门', '尔', '我', '反', '分',
  '寸', '土', '子', '才', '不', '反', '几', '交', '果',
  '手', '丁', '包', '召', '皮',
  '子', '马', '也', '生', '青',
  '舌', '吾', '兑', '青', '皆',
  '少', '反', '包',
  '工', '色', '包',
  '工', '马', '也',
  '化', '早', '包', '可',
  // 上下结构常用部件
  '月', '寸', '十', '免', '生', '青', '京', '光',
  '火', '口', '中', '日', '必',
  '心', '力', '共', '一',
  '山', '丁', '包', '因',
  '木', '垂', '少',
  '巴', '牛',
  '化', '早', '包', '可', '田',
  '女', '豕', '玉', '它', '寺',
  '天', '十', '乞', '昌', '羊',
  '也', '里', '成',
  '言', '王', '良',
  // 叠加结构常用字
  '日', '木', '又', '口', '人', '弓', '夕', '火', '金',
  // 包围结构内部
  '王', '元', '或', '韦', '里',
  '木', '儿', '可',
  '人', '儿',
  '大', '女',
  '大', '白', '可',
  '口', '日', '乞',
  '元', '可', '韦',
  '工', '建'
];

Page({
  data: {
    libLeft: [],
    libRight: [],
    runIdxLeft: 0,
    runIdxRight: 0,
    isRunning: false,
    isSuccess: false,
    leftX: 80,
    rightX: 80,
    showParts: true,
    showResult: false,
    resultPinyin: '',
    resultPhrase: '',
    resultChar: '',
    showAdmin: false,
    newPartInput: '',
    runBtnText: '🚀 开始跑跑'
  },

  // 字库映射
  outputLibMap: {},

  async onLoad() {
    // 加载本地存储的部件库
    const savedLeft = wx.getStorageSync('paopao_left');
    const savedRight = wx.getStorageSync('paopao_right');
    
    this.setData({
      libLeft: savedLeft || DEFAULT_LEFT,
      libRight: savedRight || DEFAULT_RIGHT
    });

    // 加载汉字字库（异步）
    wx.showLoading({ title: '加载字库中...' });
    try {
      this.outputLibMap = await hanziLoader.load();
      wx.hideLoading();
      wx.showToast({
        title: '字库加载完成',
        icon: 'success',
        duration: 1500
      });
    } catch (err) {
      wx.hideLoading();
      console.error('字库加载失败:', err);
    }
  },

  // 开始/暂停跑跑
  toggleRun() {
    if (this.data.isSuccess) return;

    if (this.data.isRunning) {
      // 暂停
      this.setData({
        isRunning: false,
        runBtnText: '🚀 开始跑跑'
      });
      if (this.animationTimer) {
        clearInterval(this.animationTimer);
      }
    } else {
      // 开始
      this.setData({
        isRunning: true,
        runBtnText: '⏸ 暂停'
      });
      this.startAnimation();
    }
  },

  // 动画循环
  startAnimation() {
    this.animationTimer = setInterval(() => {
      let { leftX, rightX } = this.data;
      leftX += 7;
      rightX += 7;

      // 检查是否碰撞（舞台宽度约750rpx = 375px）
      if (375 - leftX - rightX <= 50) {
        clearInterval(this.animationTimer);
        this.setData({
          isRunning: false,
          leftX,
          rightX
        });
        this.showRunResult();
      } else {
        this.setData({ leftX, rightX });
      }
    }, 16); // 约60fps
  },

  // 显示结果
  showRunResult() {
    const { libLeft, libRight, runIdxLeft, runIdxRight } = this.data;
    const leftPart = libLeft[runIdxLeft];
    const rightPart = libRight[runIdxRight];
    const comboKey = leftPart + '+' + rightPart;

    if (this.outputLibMap[comboKey]) {
      const targetChar = this.outputLibMap[comboKey].char;
      
      // 播放成功音效
      wx.showToast({
        title: '✨ 组合成功！',
        icon: 'success'
      });

      this.setData({
        showParts: false,
        showResult: true,
        isSuccess: true,
        resultChar: targetChar,
        resultPinyin: this.getPinyin(targetChar),
        resultPhrase: this.getPhrase(targetChar),
        runBtnText: '✨ 成功！',
        leftX: 80,  // 重置位置，避免影响布局
        rightX: 80
      });

      // 绘制汉字
      this.drawHanzi(targetChar);
      
      // 播放语音
      setTimeout(() => {
        this.playVoice(targetChar);
      }, 500);
    } else {
      wx.showToast({
        title: '这两个部件组合不成字哦~',
        icon: 'none'
      });
      this.resetRun();
    }
  },

  // 获取拼音
  getPinyin(char) {
    return PinyinUtil.getPinyin(char);
  },

  // 获取词组
  getPhrase(char) {
    return PinyinUtil.getPhrase(char);
  },

  // 播放语音
  playVoice(e) {
    // 如果是event对象，从dataset中获取char
    let char = e;
    if (e && e.currentTarget && e.currentTarget.dataset) {
      char = e.currentTarget.dataset.char;
    }
    
    // 确保char是字符串
    if (!char || typeof char !== 'string') {
      console.error('playVoice: 无效的字符参数', char);
      return;
    }
    
    const pinyin = PinyinUtil.getPinyin(char);
    const phrase = PinyinUtil.getPhrase(char);
    const text = `${char}，拼音${pinyin}，词组${phrase}`;
    
    // 使用简化版语音播报
    PinyinUtil.speak(text);
  },

  // 绘制汉字到Canvas
  drawHanzi(char) {
    const ctx = wx.createCanvasContext('hanziCanvas', this);
    
    // 清空画布
    ctx.clearRect(0, 0, 180, 180);
    
    // 绘制背景
    ctx.setFillStyle('#f5f5f5');
    ctx.fillRect(0, 0, 180, 180);
    
    // 绘制汉字
    ctx.setFillStyle('#e74c3c');
    ctx.setFontSize(120);
    ctx.setTextAlign('center');
    ctx.setTextBaseline('middle');
    ctx.fillText(char, 90, 90);
    
    ctx.draw();
  },

  // 重置
  resetRun() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
    }
    
    this.setData({
      isRunning: false,
      isSuccess: false,
      leftX: 80,
      rightX: 80,
      showParts: true,
      showResult: false,
      runBtnText: '🚀 开始跑跑'
    });
  },

  // 选择左边部件
  selectLeft(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ runIdxLeft: index });
    this.resetRun();
  },

  // 选择右边部件
  selectRight(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ runIdxRight: index });
    this.resetRun();
  },

  // 切换管理面板
  toggleAdmin() {
    this.setData({
      showAdmin: !this.data.showAdmin
    });
  },

  // 输入框变化
  onInputChange(e) {
    this.setData({
      newPartInput: e.detail.value
    });
  },

  // 添加到部件一
  addLeft() {
    const val = this.data.newPartInput.trim();
    if (!val) {
      wx.showToast({ title: '请输入部件', icon: 'none' });
      return;
    }

    if (this.data.libLeft.includes(val)) {
      wx.showToast({ title: '部件库一已存在该部件', icon: 'none' });
      return;
    }

    const newLibLeft = [...this.data.libLeft, val];
    this.setData({
      libLeft: newLibLeft,
      newPartInput: ''
    });
    this.saveLib();
    wx.showToast({ title: '添加成功！', icon: 'success' });
  },

  // 添加到部件二
  addRight() {
    const val = this.data.newPartInput.trim();
    if (!val) {
      wx.showToast({ title: '请输入部件', icon: 'none' });
      return;
    }

    if (this.data.libRight.includes(val)) {
      wx.showToast({ title: '部件库二已存在该部件', icon: 'none' });
      return;
    }

    const newLibRight = [...this.data.libRight, val];
    this.setData({
      libRight: newLibRight,
      newPartInput: ''
    });
    this.saveLib();
    wx.showToast({ title: '添加成功！', icon: 'success' });
  },

  // 删除部件一
  deleteLeft(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个部件吗？',
      success: (res) => {
        if (res.confirm) {
          const newLibLeft = this.data.libLeft.filter((_, i) => i !== index);
          this.setData({
            libLeft: newLibLeft,
            runIdxLeft: 0
          });
          this.saveLib();
          this.resetRun();
          wx.showToast({ title: '删除成功！', icon: 'success' });
        }
      }
    });
  },

  // 删除部件二
  deleteRight(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个部件吗？',
      success: (res) => {
        if (res.confirm) {
          const newLibRight = this.data.libRight.filter((_, i) => i !== index);
          this.setData({
            libRight: newLibRight,
            runIdxRight: 0
          });
          this.saveLib();
          this.resetRun();
          wx.showToast({ title: '删除成功！', icon: 'success' });
        }
      }
    });
  },

  // 保存部件库到本地
  saveLib() {
    wx.setStorageSync('paopao_left', this.data.libLeft);
    wx.setStorageSync('paopao_right', this.data.libRight);
  },

  onUnload() {
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
    }
  }
});