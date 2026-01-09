//npm install sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = '../images';          // 你的原始图片目录
const outputDir = '../images_opt';    // 压缩后的图片存放目录

// 如果输出目录不存在则创建
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdirSync(inputDir).forEach(file => {
  const filePath = path.join(inputDir, file);
  const outputFilePath = path.join(outputDir, file.replace(/\.(png|jpg|jpeg)$/, '.webp'));

  // 检查是否为图片文件
  if (file.match(/\.(png|jpg|jpeg)$/i)) {
    sharp(filePath)
    .resize(150, 150, { // 调整为150px以匹配HTML中的实际显示尺寸（75px的2倍，支持视网膜屏）
      fit: 'inside',    // 保持比例，图片完全包含在指定尺寸内
      withoutEnlargement: true // 不放大比目标尺寸小的图片
    })
    .webp({ quality: 70 }) // 质量调整为70，在保证清晰度的同时进一步优化文件大小
    .toFile(outputFilePath)
    .then(info => console.log(`成功: ${file} -> ${info.size / 1024} KB`))
    .catch(err => console.error(`失败: ${file}`, err));
  }
});