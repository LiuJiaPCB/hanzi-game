const fs = require('fs');
const path = require('path');

console.log('开始修补 hanzi-writer...\n');

let hasError = false;

// ========== 修补 1: hanzi-writer-view.js - 移除 2d canvas 默认值 ==========
try {
  const viewFile = path.join(__dirname, 'miniprogram_npm/hanzi-writer-miniprogram/hanzi-writer-view.js');
  console.log('📝 修补 hanzi-writer-view.js...');
  
  let content = fs.readFileSync(viewFile, 'utf8');
  
  const oldCode = `    type: {
      type: String,
      value: '2d'
    },`;
  const newCode = `    type: {
      type: String,
      value: ''
    },`;
  
  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(viewFile, content, 'utf8');
    console.log('   ✅ 已将 type 默认值从 "2d" 改为 ""');
  } else if (content.includes(newCode)) {
    console.log('   ✅ type 默认值已经是 ""');
  } else {
    console.log('   ⚠️  警告：未找到 type 属性定义');
  }
} catch (error) {
  console.error('   ❌ 修补失败：', error.message);
  hasError = true;
}

console.log('');

// ========== 修补 2: hanzi-writer/index.js - 强制禁用 Path2D ==========
try {
  const indexFile = path.join(__dirname, 'miniprogram_npm/hanzi-writer/index.js');
  console.log('📝 修补 hanzi-writer/index.js...');
  
  let content = fs.readFileSync(indexFile, 'utf8');
  
  const oldCode = '  if (false && usePath2D && global.Path2D) {';
  const newCode = '  if (false && usePath2D && global.Path2D) {';
  const originalCode = '  if (usePath2D && global.Path2D) {';
  
  if (content.includes(oldCode)) {
    console.log('   ✅ Path2D 已经被强制禁用');
  } else if (content.includes(originalCode)) {
    content = content.replace(originalCode, oldCode);
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log('   ✅ 已强制禁用 Path2D (添加 false &&)');
  } else {
    console.log('   ⚠️  警告：未找到 Path2D 判断代码');
  }
} catch (error) {
  console.error('   ❌ 修补失败：', error.message);
  hasError = true;
}

console.log('');

if (hasError) {
  console.error('❌ 修补过程中出现错误');
  process.exit(1);
} else {
  console.log('🎉 所有修补完成！');
}
