<template>
  <div class="game-container" style="display: flex;">
    <h2>点点笔画，看看藏着哪些小伙伴？</h2>
    <div
      style="margin-bottom: 25px; background: white; padding: 10px 25px; border-radius: 50px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <span style="font-size: 20px; font-weight: bold; color: #8b4513;">请输入母字：</span>
      <input type="text" v-model="charInput" maxlength="1"
             style="font-size: 24px; width: 60px; text-align: center; border: 3px solid var(--primary); border-radius: 15px; outline: none;">
      <button class="btn-main" @click="initSplit"
              style="padding: 8px 25px; font-size: 18px; margin-left: 10px;">变变变！</button>
      <button class="btn-main" @click="randomHanzi"
              style="padding: 8px 25px; font-size: 18px; margin-left: 10px; background: var(--secondary); box-shadow: 0 4px 0 #d35400;">换一个</button>
    </div>
    <div class="split-main">
      <div class="hanzi-box">
        <div id="target-bg" ref="bgRef"></div>
        <div id="target-fg" ref="fgRef"></div>
      </div>
      <div class="stroke-panel" style="width:450px;">
        <div class="child-btn-list" style="justify-content: flex-start; margin-top:0; margin-bottom: 25px;">
          <button 
            v-for="(stroke, index) in strokes" 
            :key="index"
            class="child-btn"
            :class="{ active: strokeStatus[index] }"
            @click="handleStrokeClick(index, stroke)"
          >
            {{ stroke }}
          </button>
        </div>
        <div style="display: flex; gap: 15px;">
          <button class="btn-main" @click="findExactMatches"
                  style="background: var(--soft-green); box-shadow: 0 4px 0 #5bbd5b;">🔍 找一找</button>
          <button class="child-btn" @click="resetStrokes"
                  style="background: var(--secondary); color:white; box-shadow: 0 4px 0 #d35400;">🔄 重选</button>
        </div>
        <div class="matching-area">
          <span style="font-weight: bold; font-size: 18px; color: var(--primary); display: block; margin-bottom: 10px;">🌟 发现的小伙伴：</span>
          <div id="matchResults" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: flex-start;">
            <div v-if="matchedChars.length === 0" style="color: #aaa;">等待小朋友挑战...</div>
            <div v-for="char in matchedChars" :key="char" class="char-card">
              <span class="pinyin">{{ getPinyin(char) }}</span>
              <div :id="'g-' + char" :ref="el => setCharRef(el, char)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import cnchar from 'cnchar-all';
import HanziWriter from 'hanzi-writer';
import { speakHanzi, showToast } from '../utils/common';
import { matchLibrary } from '../utils/data';

const charInput = ref('克');
const strokes = ref<string[]>([]);
const strokeStatus = ref<boolean[]>([]);
const clickSequence = ref<string[]>([]);
const matchedChars = ref<string[]>([]);
const foundChars = new Set<string>();
const bgRef = ref<HTMLElement | null>(null);
const fgRef = ref<HTMLElement | null>(null);
let writerFg: any = null;

// 常用汉字列表 - 从文件加载
const hanziList = ref<string[]>([]);

const STROKE_MAP: Record<string, string> = { '一': 'H', '㇀': 'H', '丶': 'N', '㇏': 'N' };

// 加载汉字列表
async function loadHanziList() {
  try {
    const response = await fetch('data/hanzi.txt');
    const text = await response.text();
    // 解析CSV格式的汉字，去除引号并分割
    hanziList.value = text.split(',').map(char => char.trim().replace(/"/g, ''));
  } catch (error) {
    console.error('加载汉字列表失败:', error);
    // 如果加载失败，使用一些默认汉字
    hanziList.value = ['克', '明', '林', '休', '好', '家', '山', '水', '火', '木', '日', '月', '人', '口', '手', '目', '田', '心', '门', '车'];
  }
}

function getStandardCode(strokeArray: string[]) {
  if (!strokeArray) return '';
  return strokeArray.map(s => STROKE_MAP[s] || s).join(',');
}

function getPinyin(char: string) {
  return cnchar.spell(char);
}

// 动态 ref 处理
const charRefs: Record<string, HTMLElement> = {};
function setCharRef(el: any, char: string) {
  if (el) charRefs[char] = el;
}

function randomHanzi() {
  if (hanziList.value.length === 0) {
    showToast('汉字列表还在加载中...');
    return;
  }
  const randomIndex = Math.floor(Math.random() * hanziList.value.length);
  charInput.value = hanziList.value[randomIndex];
  initSplit();
}

function initSplit() {
  const char = charInput.value || '克';
  speakHanzi(char);

  if (bgRef.value) bgRef.value.innerHTML = '';
  if (fgRef.value) fgRef.value.innerHTML = '';
  
  matchedChars.value = [];
  clickSequence.value = [];
  foundChars.clear();
  
  if (bgRef.value) {
    HanziWriter.create(bgRef.value, char, { width: 300, height: 300, padding: 25, strokeColor: '#F5F5F5' });
  }
  
  if (fgRef.value) {
    writerFg = HanziWriter.create(fgRef.value, char, { width: 300, height: 300, padding: 25, strokeColor: '#FF8E9E' });
    writerFg.hideCharacter();
  }

  const charStrokes = cnchar.stroke(char, 'order', 'shape')[0];
  if (Array.isArray(charStrokes)) {
      strokes.value = charStrokes;
      strokeStatus.value = new Array(charStrokes.length).fill(false);
  }
}

function handleStrokeClick(index: number, strokeName: string) {
  if (strokeStatus.value[index]) return;
  strokeStatus.value[index] = true;
  clickSequence.value.push(strokeName);
  writerFg.animateStroke(index);
}

function resetStrokes() {
  writerFg.hideCharacter();
  strokeStatus.value.fill(false);
  clickSequence.value = [];
}

function findExactMatches() {
  if (clickSequence.value.length === 0) return;
  const currentCode = getStandardCode(clickSequence.value);
  const newMatched: string[] = [];

  matchLibrary.forEach(char => {
    const charData = cnchar.stroke(char, 'order', 'shape')[0];
    if (Array.isArray(charData)) {
        const charCode = getStandardCode(charData);
        if (currentCode === charCode && !foundChars.has(char)) {
            newMatched.push(char);
            foundChars.add(char);
        }
    }
  });

  if (newMatched.length > 0) {
    // 添加到结果列表
    matchedChars.value.push(...newMatched);
    
    // 播放音效
    const ding = document.getElementById('ding') as HTMLAudioElement;
    if (ding) ding.play();

    // 渲染新发现的字
    nextTick(() => {
      newMatched.forEach(c => {
        const el = charRefs[c];
        if (el) {
            el.innerHTML = ''; // 清空旧的
            HanziWriter.create(el, c, {
                width: 70, height: 70, padding: 5, strokeColor: '#3498db'
            });
        }
        speakHanzi(c);
      });
    });
  } else {
    showToast("💡 还没找到对应的小伙伴，再试一组笔画？");
  }
}

onMounted(() => {
  loadHanziList(); // 加载常用汉字列表
  initSplit();
});
</script>

<style scoped>
.split-main {
  display: flex;
  gap: 30px;
  background: white;
  padding: 30px;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 5px solid #FFD1D1;
}

.hanzi-box {
  position: relative;
  width: 300px;
  height: 300px;
  border: 2px solid #eee;
  border-radius: 20px;
  background: #fff;
}

#target-fg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
}

.matching-area {
  margin-top: 20px;
  padding: 15px;
  border: 3px dashed var(--primary);
  border-radius: 20px;
  min-height: 150px;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.char-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 8px;
  border-radius: 12px;
  border: 2px solid #FFE4E1;
  width: 85px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.pinyin {
  font-size: 14px;
  color: var(--danger);
  font-weight: bold;
  margin-bottom: 3px;
}
</style>