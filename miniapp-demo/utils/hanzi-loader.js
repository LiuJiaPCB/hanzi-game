// 汉字字库加载工具
const { HANZI_DATA } = require('./hanzi-data.js');

class HanziLoader {
  constructor() {
    this.outputLibMap = {};
    this.isLoaded = false;
  }

  // 加载字库数据
  async load() {
    if (this.isLoaded) {
      return this.outputLibMap;
    }

    try {
      // 从 HANZI_DATA 中解析组合关系
      this.parseCombinationData();
      
      this.isLoaded = true;
      console.log('✅ 字库加载成功，共', Object.keys(this.outputLibMap).length, '个组合');
      return this.outputLibMap;
    } catch (err) {
      console.warn('字库加载失败，使用内置字库:', err);
    }
  }

  // 从 HANZI_DATA 中解析所有二元结构的汉字组合
  parseCombinationData() {
    this.outputLibMap = {};
    const structureStats = {};

    for (const char in HANZI_DATA) {
      const hanziData = HANZI_DATA[char];
      const structure = hanziData.structure || '';

      // 检测所有二元结构（不只是左右结构）
      if (structure.length > 0 && this.isBinaryOperator(structure[0])) {
        // 提取两部分部件
        const parts = this.parseStructureParts(structure);
        if (parts && parts.length === 2) {
          const key = `${parts[0]}+${parts[1]}`;
          this.outputLibMap[key] = { char };

          // 统计各结构类型的数量
          const operator = structure[0];
          const operatorName = this.getOperatorName(operator);
          structureStats[operatorName] = (structureStats[operatorName] || 0) + 1;
        }
      }
    }

    console.log(`从 HANZI_DATA 中解析出 ${Object.keys(this.outputLibMap).length} 个组合`);
    console.log('结构分布:', structureStats);
  }

  // 判断是否是二元结构操作符
  isBinaryOperator(operator) {
    // 二元结构操作符（两个部件组成）
    const binaryOperators = [
      '⿰',  // 左右结构
      '⿱',  // 上下结构
      '⿴',  // 全包围结构
      '⿵',  // 上三面包围结构
      '⿶',  // 下三面包围结构
      '⿷',  // 左三面包围结构
      '⿸',  // 左上包围结构
      '⿹',  // 右上包围结构
      '⿺',  // 左下包围结构
      '⿻'   // 叠加结构
    ];
    return binaryOperators.includes(operator);
  }

  // 获取操作符的名称
  getOperatorName(operator) {
    const names = {
      '⿰': '左右结构',
      '⿱': '上下结构',
      '⿲': '左中右结构',
      '⿳': '上中下结构',
      '⿴': '全包围结构',
      '⿵': '上三面包围结构',
      '⿶': '下三面包围结构',
      '⿷': '左三面包围结构',
      '⿸': '左上包围结构',
      '⿹': '右上包围结构',
      '⿺': '左下包围结构',
      '⿻': '叠加结构'
    };
    return names[operator] || '未知结构';
  }

  // 解析结构字符串，提取部件
  parseStructureParts(structure) {
    if (structure.length < 2) return null;

    const operator = structure[0];
    const rest = structure.slice(1);

    // 所有二元结构都使用相同的分割逻辑
    // 因为结构描述都是"操作符+部件1+部件2"的格式
    if (this.isBinaryOperator(operator)) {
      return this.splitIntoTwoParts(rest);
    }

    // 三元结构（不支持的，返回null）
    // ⿲: 左中右结构
    // ⿳: 上中下结构
    return null;
  }

  // 将字符串分割为两部分
  splitIntoTwoParts(str) {
    if (!str || str.length < 2) return null;

    // 策略1: 检查是否包含另一个 IDC 操作符（说明有嵌套结构）
    for (let i = 1; i < str.length; i++) {
      const char = str[i];
      if (this.isIDCOperator(char)) {
        // 在操作符之前分割
        return [str.slice(0, i), str.slice(i)];
      }
    }

    // 策略2: 检查第一个字符是否是常见的偏旁部首
    const commonRadicals = [
      // 常见偏旁
      '氵', '亻', '扌', '艹', '讠', '宀', '钅', '纟', '阝', '忄',
      '禾', '石', '页', '贝', '攵', '隹', '犭', '虫', '木', '口',
      '女', '月', '日', '土', '火', '王', '目', '立', '足', '走',
      '言', '金', '马', '鸟', '鱼', '车', '足', '门', '广', '疒',
      '辶', '廴', '尸', '户', '弓', '矛', '矢', '米', '糸', '衣',
      '舟', '羽', '角', '齿', '骨', '革', '鬼', '食', '鱼', '黑'
    ];

    if (commonRadicals.includes(str[0])) {
      return [str[0], str.slice(1)];
    }

    // 策略3: 尝试在第一个字符后分割
    // 适用于大部分简单组合
    if (str.length <= 3) {
      return [str[0], str.slice(1)];
    }

    // 策略4: 智能判断分割点
    // 如果字符串较长，尝试找到合适的分割点
    for (let i = 1; i < str.length - 1; i++) {
      const leftPart = str.slice(0, i);
      const rightPart = str.slice(i);
      
      // 如果左边是常用偏旁或简单汉字，分割
      if (leftPart.length === 1 && this.isSimpleHanzi(leftPart)) {
        return [leftPart, rightPart];
      }
    }

    // 默认分割：第一个字符和剩余部分
    return [str[0], str.slice(1)];
  }

  // 判断是否是简单汉字（不含IDC操作符）
  isSimpleHanzi(char) {
    // 简单判断：不含IDC操作符
    return !this.isIDCOperator(char);
  }

  // 判断是否是 IDC 操作符
  isIDCOperator(char) {
    const operators = ['⿰', '⿱', '⿲', '⿳', '⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺', '⿻'];
    return operators.includes(char);
  }

}

// 导出单例
const hanziLoader = new HanziLoader();

module.exports = {
  hanziLoader
};
