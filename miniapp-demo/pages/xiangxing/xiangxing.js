// pages/xiangxing/xiangxing.js
const { PinyinUtil } = require('../../utils/pinyin-util.js');

// 象形字数据
const xiangData = [
  { char: '上', pic: '/images_opt/上.webp', tip: '一横在下面，一竖往上指，方向朝上就是它！' },
  { char: '下', pic: '/images_opt/下.webp', tip: '一横在上面，一点往下落，方向朝下看仔细！' },
  { char: '中', pic: '/images_opt/中.webp', tip: '旗杆立中央，飘带两边扬，正中位置就是它！' },
  { char: '虹', pic: '/images_opt/虹.webp', tip: '弯弯彩虹像小桥，双头神兽藏山腰～' },
  { char: '雨', pic: '/images_opt/雨.webp', tip: '云朵飘上头，雨滴往下流，下雨啦真凉快！' },
  { char: '乌', pic: '/images_opt/乌.webp', tip: '乌鸦黑漆漆，眼睛看不见，全身都是黑羽毛。' },
  { char: '云', pic: '/images_opt/云.webp', tip: '天上白云飘，像棉花糖一样软绵绵。' },
  { char: '井', pic: '/images_opt/井.webp', tip: '一口深水井，木架搭上面，打水要小心。' },
  { char: '人', pic: '/images_opt/人.webp', tip: '头在上一撇，身在下一捺，站立行走就是人。' },
  { char: '从', pic: '/images_opt/从.webp', tip: '一人前头走，一人后头跟，大家排队守秩序。' },
  { char: '仓', pic: '/images_opt/仓.webp', tip: '屋顶尖尖盖，粮食里面藏，仓库满满心不慌。' },
  { char: '休', pic: '/images_opt/休.webp', tip: '人靠大树旁，乘凉好舒服，休息一下再出发。' },
  { char: '众', pic: '/images_opt/众.webp', tip: '上面一个人，下面两个人，大家团结力量大。' },
  { char: '伞', pic: '/images_opt/伞.webp', tip: '大伞撑开来，挡雨又遮阳，下面躲着好多人。' },
  { char: '保', pic: '/images_opt/保.webp', tip: '人背着孩子，保护小宝贝，安全守护最重要。' },
  { char: '儿', pic: '/images_opt/儿.webp', tip: '脑袋圆溜溜，两腿跑得快，是个可爱小娃娃。' },
  { char: '光', pic: '/images_opt/光.webp', tip: '火把举头顶，照亮黑夜路，光明就在正前方。' },
  { char: '兔', pic: '/images_opt/兔.webp', tip: '长长耳朵竖，短短尾巴翘，小白兔爱吃萝卜。' },
  { char: '力', pic: '/images_opt/力.webp', tip: '手臂弯弯曲，肌肉鼓起来，用力干活劲很大。' },
  { char: '勺', pic: '/images_opt/勺.webp', tip: '圆圆小勺子，里面有东西，舀起汤来真方便。' },
  { char: '口', pic: '/images_opt/口.webp', tip: '张开大嘴巴，像个方框框，吃饭说话全靠它。' },
  { char: '土', pic: '/images_opt/土.webp', tip: '地上长植物，下面是泥土，万物生长靠大地。' },
  { char: '壶', pic: '/images_opt/壶.webp', tip: '盖子圆圆顶，肚子大又圆，装满茶水待客人。' },
  { char: '刀', pic: '/images_opt/刀.webp', tip: '弯弯刀刃利，刀柄握手里，切菜砍柴真锋利。' },
  { char: '大', pic: '/images_opt/大.webp', tip: '人儿张开手，伸展腿和臂，大大方方站得稳。' },
  { char: '天', pic: '/images_opt/天.webp', tip: '大字头顶上，还有一片天，蓝天白云真广阔。' },
  { char: '夫', pic: '/images_opt/夫.webp', tip: '大字加一横，簪子插头上，古代男子叫丈夫。' },
  { char: '夹', pic: '/images_opt/夹.webp', tip: '大字胳肢窝，两边夹东西，紧紧夹住不掉落。' },
  { char: '女', pic: '/images_opt/女.webp', tip: '双手交身前，跪坐姿态美，温柔贤惠是女子。' },
  { char: '好', pic: '/images_opt/好.webp', tip: '女子抱孩子，儿女双全好，幸福美满乐陶陶。' },
  { char: '子', pic: '/images_opt/子.webp', tip: '大头小身子，挥舞两只手，襁褓婴儿真可爱。' },
  { char: '安', pic: '/images_opt/安.webp', tip: '屋里有个女，安稳又静谧，平平安安最重要。' },
  { char: '家', pic: '/images_opt/家.webp', tip: '屋顶下面猪，养猪能致富，有房有猪就是家。' },
  { char: '尾', pic: '/images_opt/尾.webp', tip: '屁股后面长，毛茸茸一条，摇来摇去真好玩。' },
  { char: '尿', pic: '/images_opt/尿.webp', tip: '身体排废水，水滴往下走，排出废水身体好。' },
  { char: '屎', pic: '/images_opt/屎.webp', tip: '身体排废物，米粒变残渣，虽然臭臭也有用。' },
  { char: '山', pic: '/images_opt/山.webp', tip: '中间高高峰，两边低低岭，连绵起伏是高山。' },
  { char: '巾', pic: '/images_opt/巾.webp', tip: '挂在架子上，垂下两条边，擦脸擦手用毛巾。' },
  { char: '弓', pic: '/images_opt/弓.webp', tip: '弯弯一张弓，弦儿拉得紧，射出箭去嗖嗖飞。' },
  { char: '心', pic: '/images_opt/心.webp', tip: '像个红桃子，里面有孔窍，扑通扑通跳不停。' },
  { char: '户', pic: '/images_opt/户.webp', tip: '单扇一扇门，守护家里人，进出都要随手关。' },
  { char: '手', pic: '/images_opt/手.webp', tip: '五指张开来，手掌在中间，灵巧双手能干活。' },
  { char: '日', pic: '/images_opt/日.webp', tip: '圆圆太阳照，中间一点光，白天全靠它照亮。' },
  { char: '明', pic: '/images_opt/明.webp', tip: '日头和月亮，一起来照耀，光明灿烂照四方。' },
  { char: '晶', pic: '/images_opt/晶.webp', tip: '三个太阳聚，闪闪亮晶晶，水晶宝石真漂亮。' },
  { char: '月', pic: '/images_opt/月.webp', tip: '弯弯像镰刀，有时圆又圆，晚上出来亮晶晶。' },
  { char: '木', pic: '/images_opt/木.webp', tip: '上面是树枝，下面是树根，一棵大树站得稳。' },
  { char: '林', pic: '/images_opt/林.webp', tip: '两棵大树站，手拉手成排，树木多了成树林。' },
  { char: '果', pic: '/images_opt/果.webp', tip: '树上结圆球，沉甸甸压枝，香甜果实真好吃。' },
  { char: '栗', pic: '/images_opt/栗.webp', tip: '树上长刺球，里面藏坚果，炒熟以后香喷喷。' }
];

Page({
  data: {
    currentPics: [],
    currentHans: [],
    selPic: null,
    selHan: null,
    showModal: false,
    matchedTip: '',
    matchedChar: ''
  },

  onLoad() {
    this.initGame();
  },

  // 初始化游戏
  initGame() {
    // 随机选5个象形字
    const shuffled = xiangData.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    // 打乱图片和汉字的顺序
    const pics = [...selected].sort(() => Math.random() - 0.5);
    const hans = [...selected].sort(() => Math.random() - 0.5);
    
    this.setData({
      currentPics: pics,
      currentHans: hans,
      selPic: null,
      selHan: null
    });
  },

  // 选择图片
  selectPic(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      selPic: item
    });
  },

  // 选择汉字
  selectHan(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      selHan: item
    });
  },

  // 检查配对
  checkMatch() {
    const { selPic, selHan } = this.data;
    
    if (!selPic || !selHan) {
      wx.showToast({
        title: '请先选两张卡片哦！',
        icon: 'none'
      });
      return;
    }
    
    if (selPic.char === selHan.char) {
      // 配对成功
      wx.showToast({
        title: '🌟 太棒啦！',
        icon: 'success'
      });
      
      this.setData({
        showModal: true,
        matchedTip: selPic.tip,
        matchedChar: selPic.char
      });
    } else {
      // 配对失败
      wx.showToast({
        title: '💡 哎呀，再找找看！',
        icon: 'none'
      });
    }
  },

  // 关闭弹窗，开始新一轮
  closeModal() {
    this.setData({
      showModal: false
    });
    this.initGame();
  },

  // 播放汉字语音
  playCharVoice() {
    const { matchedChar } = this.data;
    if (matchedChar) {
      const pinyin = PinyinUtil.getPinyin(matchedChar);
      const text = `${matchedChar}，拼音${pinyin}`;
      // 使用真实语音播报
      PinyinUtil.speak(text);
    }
  },

  // 播放提示语音
  playTipVoice() {
    const { matchedTip } = this.data;
    if (matchedTip) {
      // 使用真实语音播报
      PinyinUtil.speak(matchedTip);
    }
  }
})