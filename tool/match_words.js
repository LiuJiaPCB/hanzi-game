const fs = require('fs');

function processCharacters() {
  try {
    // 1. 读取常用汉字文件
    // 假设文件名为 common_chars.txt
    const commonCharsRaw = fs.readFileSync('../data/hanzi.txt', 'utf8');

    // 使用正则提取引号内的汉字，适应 "["字","字"]" 这种格式
    const commonCharsSet = new Set(commonCharsRaw.match(/[\u4e00-\u9fa5]/g));

    // 2. 读取 idx.txt
    const idxContent = fs.readFileSync('../data/ids.txt', 'utf8');
    const lines = idxContent.split(/\r?\n/);

    const result = [];

    // 3. 逐行匹配
    for (const line of lines) {
      if (!line.trim()) continue;

      // 根据你的格式：U+8BB2	讲	⿰讠井
      // 使用 tab 分隔
      const parts = line.split('\t');
      if (parts.length >= 3) {
        const char = parts[1]; // 第二列是汉字
        const structure = parts[2]; // 第三列是拆解信息

        if (commonCharsSet.has(char)) {
          result.push(`${char}\t${structure}`);
        }
      }
    }

    // 4. 写入新文件
    fs.writeFileSync('output.txt', result.join('\n'), 'utf8');
    console.log(`处理完成！共匹配到 ${result.length} 个汉字。结果已保存至 output.txt`);

  } catch (err) {
    console.error('处理文件时出错:', err.message);
  }
}

processCharacters();