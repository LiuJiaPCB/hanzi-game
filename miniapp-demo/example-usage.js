// 汉字数据使用示例
const { HANZI_DATA } = require('./utils/hanzi-data');

console.log('📚 汉字字库使用示例\n');

// 示例1：查询单个汉字
const char = '中';
const data = HANZI_DATA[char];

if (data) {
  console.log(`汉字: ${char}`);
  console.log(`结构: ${data.structure}`);
  console.log(`笔画数: ${data.strokeCount}`);
  console.log(`笔画名称: ${data.strokeNames.join(' → ')}`);
  console.log(`笔画形状: ${data.strokeShapes.join(' → ')}`);
  console.log(`拼音: ${data.pinyin}`);
  console.log(`拼音数组: ${JSON.stringify(data.pinyinArray)}`);
}

console.log('\n' + '='.repeat(50) + '\n');

// 示例2：遍历所有汉字
console.log('📊 字库统计：');
const allChars = Object.keys(HANZI_DATA);
console.log(`总汉字数: ${allChars.length}`);

// 统计笔画数分布
const strokeCountDistribution = {};
allChars.forEach(char => {
  const count = HANZI_DATA[char].strokeCount;
  strokeCountDistribution[count] = (strokeCountDistribution[count] || 0) + 1;
});

console.log('\n笔画数分布:');
Object.keys(strokeCountDistribution)
  .sort((a, b) => parseInt(a) - parseInt(b))
  .forEach(count => {
    console.log(`  ${count}画: ${strokeCountDistribution[count]} 个汉字`);
  });

console.log('\n' + '='.repeat(50) + '\n');

// 示例3：搜索功能
console.log('🔍 搜索示例：');

// 查找笔画数为 4 的汉字
const stroke4Chars = allChars.filter(char => HANZI_DATA[char].strokeCount === 4);
console.log(`笔画数为4的汉字（前10个）: ${stroke4Chars.slice(0, 10).join(', ')}...`);

// 查找拼音以 "a" 开头的汉字
const pinyinAChars = allChars.filter(char => 
  HANZI_DATA[char].pinyin.toLowerCase().startsWith('a')
);
console.log(`拼音以"a"开头的汉字（前10个）: ${pinyinAChars.slice(0, 10).join(', ')}...`);

// 查找包含"横"笔画的汉字
const hasHorizontal = allChars.filter(char => 
  HANZI_DATA[char].strokeNames.includes('横')
);
console.log(`包含"横"笔画的汉字（前10个）: ${hasHorizontal.slice(0, 10).join(', ')}...`);

console.log('\n✅ 示例运行完成！');