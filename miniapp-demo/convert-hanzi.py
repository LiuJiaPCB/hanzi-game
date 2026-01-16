#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将 hanzi_3500.txt 转换为小程序可用的 JS 模块
"""

import re

def convert_txt_to_js(input_file, output_file):
    """转换字库文件为JS模块"""
    
    output_map = {}
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for line in lines:
        parts = line.strip().split('\t')
        if len(parts) >= 2:
            target = parts[0]
            structure = parts[1]
            
            # 解析结构：⿰左右 或 ⿱上下
            match = re.search(r'[⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻]([\s\S])([\s\S])', structure)
            if match:
                left = match.group(1)
                right = match.group(2)
                key = f"{left}+{right}"
                output_map[key] = target
    
    # 生成JS代码
    js_code = "// 汉字字库数据 - 自动生成\n"
    js_code += "// 共 {} 个汉字组合\n\n".format(len(output_map))
    js_code += "const HANZI_LIB = {\n"
    
    for key, char in sorted(output_map.items()):
        # 转义特殊字符
        key_escaped = key.replace('\\', '\\\\').replace("'", "\\'")
        char_escaped = char.replace('\\', '\\\\').replace("'", "\\'")
        js_code += f"  '{key_escaped}': '{char_escaped}',\n"
    
    js_code += "};\n\n"
    js_code += "module.exports = {\n"
    js_code += "  HANZI_LIB\n"
    js_code += "};\n"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"✅ 转换完成！")
    print(f"📊 共转换 {len(output_map)} 个汉字组合")
    print(f"📁 输出文件: {output_file}")

if __name__ == '__main__':
    input_file = 'data/hanzi_3500.txt'
    output_file = 'utils/hanzi-data.js'
    convert_txt_to_js(input_file, output_file)
