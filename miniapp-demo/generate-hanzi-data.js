const fs = require('fs');
const path = require('path');
const cnchar = require('cnchar');
const order = require('cnchar-order');

// 注册插件
cnchar.use(order);

// 读取原始汉字数据
const inputFile = path.join(__dirname, 'data', 'hanzi_3500.txt');
const outputFile = path.join(__dirname, 'utils', 'hanzi-data.js');

console.log('📖 正在读取汉字数据...');
const content = fs.readFileSync(inputFile, 'utf-8');
const lines = content.trim().split('\n');

console.log(`📊 共读取 ${lines.length} 个汉字`);

// 存储处理后的数据
const hanziData = {};
let processedCount = 0;

// 辅助函数：从嵌套数组中提取笔画数据
function extractStrokeData(strokeResult) {
  if (!Array.isArray(strokeResult)) return [];
  if (strokeResult.length === 0) return [];
  // 返回第一个元素（笔画数组）
  const firstElement = strokeResult[0];
  if (Array.isArray(firstElement)) {
    return firstElement;
  }
  return [];
}

// 处理每个汉字
for (const line of lines) {
  const [char, structure] = line.trim().split('\t');
  
  if (!char || !structure) continue;
  
  processedCount++;
  
  // 获取笔画数
  let strokeCount = 0;
  try {
    strokeCount = cnchar.stroke(char);
  } catch (e) {
    console.warn(`⚠️  获取 "${char}" 笔画数失败:`, e.message);
    strokeCount = 0;
  }
  
  // 获取笔画名称（标准顺序）
  let strokeNames = [];
  try {
    const rawNames = cnchar.stroke(char, 'order', 'name');
    strokeNames = extractStrokeData(rawNames);
  } catch (e) {
    console.warn(`⚠️  获取 "${char}" 笔画名称失败:`, e.message);
    strokeNames = [];
  }
  
  // 获取笔画形状
  let strokeShapes = [];
  try {
    const rawShapes = cnchar.stroke(char, 'order', 'shape');
    strokeShapes = extractStrokeData(rawShapes);
  } catch (e) {
    console.warn(`⚠️  获取 "${char}" 笔画形状失败:`, e.message);
    strokeShapes = [];
  }
  
  // 获取拼音（带声调）
  let pinyin = '';
  try {
    pinyin = cnchar.spell(char, 'tone');
  } catch (e) {
    console.warn(`⚠️  获取 "${char}" 拼音失败:`, e.message);
    pinyin = '';
  }
  
  // 获取拼音数组（不带声调）
  let pinyinArray = [];
  try {
    pinyinArray = cnchar.spell(char, 'array');
    if (!Array.isArray(pinyinArray)) {
      pinyinArray = [];
    }
  } catch (e) {
    console.warn(`⚠️  获取 "${char}" 拼音数组失败:`, e.message);
  }
  
  hanziData[char] = {
    structure: structure,
    strokeCount: strokeCount,
    strokeNames: strokeNames,          // 笔画名称数组（如：["横", "竖", "撇", "捺"]）
    strokeShapes: strokeShapes,        // 笔画形状数组
    pinyin: pinyin,                     // 拼音（带声调）
    pinyinArray: pinyinArray            // 拼音数组（不带声调）
  };
  
  // 显示进度
  if (processedCount % 100 === 0) {
    console.log(`⏳ 已处理 ${processedCount}/${lines.length} 个汉字...`);
  }
}

console.log(`\n✅ 处理完成！共处理 ${processedCount} 个汉字`);

// 生成 JS 模块文件
const jsContent = `// 汉字字库数据 - 自动生成
// 包含汉字的笔画顺序、拼音、笔画数等信息
// 共 ${processedCount} 个汉字
// 
// 数据结构说明：
// - structure: 汉字结构（使用 Ideographic Description Characters）
// - strokeCount: 笔画数
// - strokeNames: 笔画名称数组（如：["横", "竖", "撇", "捺"]）
// - strokeShapes: 笔画形状数组（如：["一", "丨", "丿", "㇏"]）
// - pinyin: 拼音（带声调）
// - pinyinArray: 拼音数组（不带声调）

const HANZI_DATA = ${JSON.stringify(hanziData, null, 2)};

module.exports = {
  HANZI_DATA
};
`;

// 写入文件
fs.writeFileSync(outputFile, jsContent, 'utf-8');

console.log(`📁 输出文件: ${outputFile}`);
console.log(`📊 文件大小: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
console.log('✅ 完成！');