// 拼音工具类
// 提供汉字转拼音和语音播报功能
// 统一从 hanzi-data.js 获取数据

const { HANZI_DATA } = require('./hanzi-data.js');

// 词组映射表（可以后续扩展到 hanzi-data.js 中）
const PHRASE_MAP = {
  '江': '江河', '河': '河流', '湖': '湖泊', '海': '海洋', '沙': '沙滩', '泪': '眼泪', '汗': '汗水', '洋': '海洋', '池': '池塘', '清': '清水',
  '休': '休息', '体': '身体', '住': '居住', '信': '相信', '们': '我们', '他': '他人', '你': '你好', '俄': '俄罗斯', '返': '返回', '份': '一份',
  '林': '森林', '村': '村庄', '杜': '杜鹃', '李': '李子', '材': '木材', '杯': '杯子', '板': '木板', '机': '机器', '校': '学校', '课': '上课',
  '叶': '树叶', '吃': '吃饭', '吧': '好吧', '咖': '咖啡', '吗': '好吗', '呵': '呵呵', '咩': '咩咩', '唱': '唱歌', '喝': '喝水', '嘴': '嘴巴',
  '拜': '拜拜', '打': '打球', '抱': '拥抱', '扮': '打扮', '抄': '抄写', '招': '招手', '披': '披风', '拉': '拉手', '推': '推车', '拿': '拿起',
  '好': '好人', '妈': '妈妈', '她': '她们', '姓': '姓名', '姑': '姑娘', '婧': '婧女', '妹': '妹妹', '姐': '姐姐', '娘': '姑娘', '嫁': '出嫁',
  '明': '明天', '时': '时间', '早': '早上', '晚': '晚上', '星': '星星', '晴': '晴天', '暗': '黑暗', '晒': '晒太阳', '暖': '温暖', '晨': '早晨',
  '话': '说话', '语': '语言', '说': '说话', '请': '请求', '谐': '和谐', '谈': '谈话', '讲': '讲课', '诉': '诉说', '词': '词语', '诗': '诗歌',
  '钢': '钢铁', '钞': '钞票', '钣': '钣金', '钸': '钸鼓', '铁': '铁路', '铜': '铜钱', '银': '银子', '针': '针线', '钉': '钉子', '钱': '金钱',
  
  // 象形字词组
  '上': '上面', '下': '下面', '中': '中间', '虹': '彩虹', '雨': '下雨', '乌': '乌鸦', '云': '白云', '井': '水井', '人': '人类', '从': '从来',
  '仓': '仓库', '休': '休息', '众': '众人', '伞': '雨伞', '保': '保护', '儿': '儿童', '光': '光明', '兔': '兔子', '力': '力气', '勺': '勺子',
  '口': '口腔', '土': '土地', '壶': '茶壶', '刀': '刀子', '大': '大小', '天': '天空', '夫': '丈夫', '夹': '夹子', '女': '女人', '好': '好人',
  '子': '孩子', '安': '安全', '家': '家庭', '尾': '尾巴', '尿': '尿液', '屎': '粪便', '山': '高山', '巾': '毛巾', '弓': '弓箭', '心': '心脏',
  '户': '户口', '手': '手掌', '日': '日子', '明': '明亮', '晶': '晶莹', '月': '月亮', '木': '木头', '林': '树林', '果': '水果', '栗': '栗子'
};

class PinyinUtil {
  /**
   * 获取汉字的拼音（从 HANZI_DATA 中获取）
   * @param {string} char - 单个汉字
   * @returns {string} 拼音
   */
  static getPinyin(char) {
    // 类型检查
    if (!char || typeof char !== 'string' || char.length === 0) {
      console.warn('getPinyin: 无效的字符参数', char);
      return '';
    }
    
    // 如果是多个字，只取第一个
    const firstChar = char.charAt(0);
    
    // 从 HANZI_DATA 中查找
    const hanziData = HANZI_DATA[firstChar];
    
    if (hanziData) {
      // 优先使用 pinyinArray（不带声调的拼音）
      if (hanziData.pinyinArray && hanziData.pinyinArray.length > 0) {
        return hanziData.pinyinArray[0];
      }
      // 备用：使用 pinyin（带声调的拼音）
      if (hanziData.pinyin) {
        // 移除声调标记
        return this.removeTone(hanziData.pinyin);
      }
    }
    
    // 如果找不到，返回原字符
    console.warn(`未找到汉字 "${firstChar}" 的拼音`);
    return firstChar;
  }

  /**
   * 移除拼音中的声调标记
   * @param {string} pinyinWithTone - 带声调的拼音
   * @returns {string} 不带声调的拼音
   */
  static removeTone(pinyinWithTone) {
    // 声调映射
    const toneMap = {
      'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
      'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
      'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
      'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
      'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
      'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
      'ü': 'v'
    };

    let result = '';
    for (let i = 0; i < pinyinWithTone.length; i++) {
      const char = pinyinWithTone[i];
      result += toneMap[char] || char;
    }
    
    // 将首字母小写
    if (result.length > 0) {
      result = result.charAt(0).toLowerCase() + result.slice(1);
    }
    
    return result;
  }

  /**
   * 获取汉字的词组
   * @param {string} char - 单个汉字
   * @returns {string} 词组
   */
  static getPhrase(char) {
    // 类型检查
    if (!char || typeof char !== 'string' || char.length === 0) {
      console.warn('getPhrase: 无效的字符参数', char);
      return '';
    }
    
    const firstChar = char.charAt(0);
    const phrase = PHRASE_MAP[firstChar];
    
    if (phrase) {
      return phrase;
    }
    
    // 如果找不到，返回默认词组
    return '组合成功';
  }

  /**
   * 语音播报汉字（简化版，无需授权）
   * @param {string} text - 要播报的文本
   * @param {object} options - 播报选项
   */
  static speak(text, options = {}) {
    // 直接使用简化版播报，无需插件授权
    this.simpleSpeak(text);
  }

  /**
   * 简化版语音播报（不依赖插件）
   * @param {string} text - 要播报的文本
   */
  static simpleSpeak(text) {
  }

  /**
   * 播报汉字和拼音
   * @param {string} char - 汉字
   */
  static speakCharWithPinyin(char) {
    const pinyin = this.getPinyin(char);
    const text = `${char}，拼音：${pinyin}`;
    this.speak(text);
  }

  /**
   * 播报汉字、拼音和词组
   * @param {string} char - 汉字
   */
  static speakCharFull(char) {
    const pinyin = this.getPinyin(char);
    const phrase = this.getPhrase(char);
    const text = `${char}，拼音：${pinyin}，词组：${phrase}`;
    this.speak(text);
  }

  /**
   * 添加自定义词组映射
   * @param {string} char - 汉字
   * @param {string} phrase - 词组
   */
  static addPhrase(char, phrase) {
    PHRASE_MAP[char] = phrase;
  }

  /**
   * 批量添加词组映射
   * @param {object} map - 词组映射对象
   */
  static addPhraseBatch(map) {
    Object.assign(PHRASE_MAP, map);
  }
}

module.exports = {
  PinyinUtil,
  PHRASE_MAP
};
