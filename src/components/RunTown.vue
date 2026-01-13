<template>
  <div class="game-container" style="display: flex;">
    <h2>两个字跑跑，碰在一起变新字！</h2>
    
    <!-- 舞台区域 -->
    <div id="stage-run">
      <div 
        id="leftPart-run" 
        class="word-run" 
        :style="{ left: leftX + 'px', display: showParts ? 'block' : 'none' }"
      >
        {{ libLeft[runIdxLeft] }}
      </div>
      <div 
        id="rightPart-run" 
        class="word-run" 
        :style="{ right: rightX + 'px', display: showParts ? 'block' : 'none' }"
      >
        {{ libRight[runIdxRight] }}
      </div>
      
      <!-- 结果展示区域 -->
      <div id="resBox-run" :style="{ display: showResult ? 'flex' : 'none' }">
        <div class="res-detail" style="display:flex; flex-direction:column; align-items:center;">
          <div id="resPinyin-run">{{ resultPinyin }}</div>
          <div id="resChar-writer" ref="writerContainer"></div>
        </div>
        <div style="text-align: left;">
          <div id="resPhrase-run"
               style="font-size:50px; color:#333; font-weight:bold; border-left: 5px solid var(--primary); padding-left: 20px;">
            {{ resultPhrase }}
          </div>
          <div style="font-size: 20px; color: #999; margin-top: 10px; padding-left: 20px;">🎉 组合成功！</div>
        </div>
      </div>
    </div>

    <!-- 控制区域 -->
    <div class="controls" style="margin-top: 35px; width: 100%; display: flex; flex-direction: column; align-items: center;">
      <div style="display: flex; justify-content: center; gap: 15px;">
        <button id="actionBtn-run" class="btn-main" @click="toggleRun" :disabled="isSuccess">
          {{ runBtnText }}
        </button>
        <button @click="resetRun" class="child-btn"
                style="background: var(--secondary); color:white; box-shadow: 0 4px 0 #d35400;">🔄 重置</button>
      </div>
      
      <div style="display: flex; gap: 40px; margin-top: 25px;">
        <div>
          <div style="text-align: center; color: #8b4513; font-weight: bold; margin-bottom: 10px;">左边部分</div>
          <div class="hexagon-grid" style="max-width: 400px;">
            <button 
              v-for="(char, index) in libLeft" 
              :key="'left-'+index"
              class="hexagon-item left-part-item"
              :class="{ 'left-active': index === runIdxLeft }"
              @click="selectLeft(index)"
            >
              {{ char }}
            </button>
          </div>
        </div>
        <div>
          <div style="text-align: center; color: #8b4513; font-weight: bold; margin-bottom: 10px;">右边部分</div>
          <div class="hexagon-grid" style="max-width: 400px;">
            <button 
              v-for="(char, index) in libRight" 
              :key="'right-'+index"
              class="hexagon-item right-part-item"
              :class="{ 'right-active': index === runIdxRight }"
              @click="selectRight(index)"
            >
              {{ char }}
            </button>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px; width: 100%; text-align: center;">
        <button @click="showAdmin = !showAdmin" class="child-btn" style="font-size: 14px; padding: 8px 15px;">⚙️
          字库设置与备份</button>
      </div>

      <!-- 管理面板 -->
      <div v-if="showAdmin" class="admin-section" style="display: block;">
        <h3 style="margin-top:0;">🏫 跑跑镇字库管理</h3>

        <div style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: center;">
          <input type="text" v-model="newPartInput" class="admin-input" placeholder="点这里" maxlength="2">
          <button @click="addNewPart('left')" class="child-btn" style="background:var(--primary); color:white;">➕ 加入左边</button>
          <button @click="addNewPart('right')" class="child-btn" style="background:var(--secondary); color:white;">➕ 加入右边</button>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div style="flex: 1;">
            <strong style="color:var(--primary)">左边部件库：</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;">
              <div v-for="(char, index) in libLeft" :key="'del-left-'+index" 
                   style="background:#f0f7ff; padding:5px 10px; border-radius:10px; display:flex; align-items:center; gap:5px; border:1px solid #bcd7f3">
                <span>{{ char }}</span>
                <span @click="deletePart('left', index)" style="color:red; cursor:pointer; font-weight:bold; font-size:14px">×</span>
              </div>
            </div>
          </div>
          <div style="flex: 1;">
            <strong style="color:var(--secondary)">右边部件库：</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;">
              <div v-for="(char, index) in libRight" :key="'del-right-'+index"
                   style="background:#fff0f0; padding:5px 10px; border-radius:10px; display:flex; align-items:center; gap:5px; border:1px solid #f3bcbc">
                <span>{{ char }}</span>
                <span @click="deletePart('right', index)" style="color:red; cursor:pointer; font-weight:bold; font-size:14px">×</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import cnchar from 'cnchar-all';
import HanziWriter from 'hanzi-writer';
import { speakHanzi, showToast } from '../utils/common';

// 默认数据
const DEFAULT_LEFT = ['氵', '亻', '口', '木', '扌', '艹', '一', '月', '土', '讠', '日', '宀', '钅', '女', '虫', '纟', '阝', '忄', '禾', '石'];
const DEFAULT_RIGHT = ['心', '口', '刂', '土', '力', '木', '页', '贝', '攵', '隹', '寸', '日', '月', '鸟', '欠', '灬', '虫', '一', '十', '又'];

// 状态
const libLeft = ref<string[]>(JSON.parse(localStorage.getItem('paopao_left') || JSON.stringify(DEFAULT_LEFT)));
const libRight = ref<string[]>(JSON.parse(localStorage.getItem('paopao_right') || JSON.stringify(DEFAULT_RIGHT)));
const runIdxLeft = ref(0);
const runIdxRight = ref(0);
const isRunning = ref(false);
const isSuccess = ref(false);
const leftX = ref(80);
const rightX = ref(80);
const showParts = ref(true);
const showResult = ref(false);
const resultPinyin = ref('');
const resultPhrase = ref('');
const showAdmin = ref(false);
const newPartInput = ref('');
const writerContainer = ref<HTMLElement | null>(null);

// 字库映射
const outputLibMap: Record<string, { char: string, phrase: string }> = {};

// 计算属性
const runBtnText = computed(() => {
  if (isSuccess.value) return '✨ 成功！';
  return isRunning.value ? '⏸ 暂停' : '🚀 开始跑跑';
});

// 加载字库
async function loadOutputData() {
  try {
    const response = await fetch('data/hanzi_3500.txt');
    const text = await response.text();
    const lines = text.split('\n');
    lines.forEach(line => {
      const [target, structure] = line.trim().split('\t');
      if (target && structure) {
        const parts = structure.match(/[⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻]([\s\S])([\s\S])/u);
        if (parts) {
          const key = parts[1] + "+" + parts[2];
          outputLibMap[key] = { char: target, phrase: "字库组合" };
        }
      }
    });
    console.log("外部字库加载成功");
  } catch (e) {
    console.error("加载 output.txt 失败:", e);
  }
}

// 动画循环
let runAnim: number;

function toggleRun() {
  if (isSuccess.value) return;
  
  if (isRunning.value) {
    isRunning.value = false;
    cancelAnimationFrame(runAnim);
  } else {
    isRunning.value = true;
    step();
  }
}

function step() {
  if (!isRunning.value) return;
  leftX.value += 7;
  rightX.value += 7;
  
  if (800 - leftX.value - rightX.value <= 100) {
    isRunning.value = false;
    const ding = document.getElementById('ding') as HTMLAudioElement;
    if (ding) ding.play();
    showRunResult();
  } else {
    runAnim = requestAnimationFrame(step);
  }
}

function showRunResult() {
  const leftPart = libLeft.value[runIdxLeft.value];
  const rightPart = libRight.value[runIdxRight.value];
  const comboKey = leftPart + "+" + rightPart;

  let targetChar, phrase;

  if (outputLibMap[comboKey]) {
    targetChar = outputLibMap[comboKey].char;
    const words = cnchar.words(targetChar);
    phrase = (words && words.length > 0) ? words[0] : ("问问老师怎么组词吧😊");
  } else {
    showToast("哎呀，这两个字碰不出火花呢！");
    resetRun();
    return;
  }

  showParts.value = false;
  showResult.value = true;
  isSuccess.value = true;
  resultPinyin.value = cnchar.spell(targetChar);
  resultPhrase.value = phrase;

  if (writerContainer.value) {
    writerContainer.value.innerHTML = '';
    HanziWriter.create(writerContainer.value, targetChar, {
      width: 180, height: 180, padding: 10, strokeColor: '#e74c3c'
    }).animateCharacter();
  }

  speakHanzi(`${targetChar}。${phrase}。`);
}

function resetRun() {
  cancelAnimationFrame(runAnim);
  isRunning.value = false;
  isSuccess.value = false;
  leftX.value = 80;
  rightX.value = 80;
  showParts.value = true;
  showResult.value = false;
}

function selectLeft(index: number) {
  runIdxLeft.value = index;
  resetRun();
}

function selectRight(index: number) {
  runIdxRight.value = index;
  resetRun();
}

// 管理功能
function addNewPart(side: 'left' | 'right') {
  const val = newPartInput.value.trim();
  if (!val) return showToast("请输入部件");

  if (side === 'left') {
    if (!libLeft.value.includes(val)) {
      libLeft.value.push(val);
    } else {
      return showToast("左侧已存在该部件");
    }
  } else {
    if (!libRight.value.includes(val)) {
      libRight.value.push(val);
    } else {
      return showToast("右侧已存在该部件");
    }
  }

  saveLib();
  newPartInput.value = '';
  showToast("添加成功！");
}

function deletePart(side: 'left' | 'right', index: number) {
  if (!confirm("确定要删除这个部件吗？")) return;

  if (side === 'left') {
    libLeft.value.splice(index, 1);
    if (runIdxLeft.value >= libLeft.value.length) runIdxLeft.value = 0;
  } else {
    libRight.value.splice(index, 1);
    if (runIdxRight.value >= libRight.value.length) runIdxRight.value = 0;
  }

  saveLib();
  resetRun();
  showToast("删除成功！");
}

function saveLib() {
  localStorage.setItem('paopao_left', JSON.stringify(libLeft.value));
  localStorage.setItem('paopao_right', JSON.stringify(libRight.value));
}

onMounted(() => {
  loadOutputData();
});
</script>

<style scoped>
#stage-run {
  position: relative;
  width: 800px;
  height: 350px;
  background: white;
  border-radius: 30px;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 5px solid #FFD1D1;
}

.word-run {
  position: absolute;
  font-size: 100px;
  font-weight: bold;
  top: 100px;
  transition: color 0.3s;
}

#resBox-run {
  position: absolute;
  width: 100%;
  height: 100%;
  display: none;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 30px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
}

#resPinyin-run {
  font-size: 32px;
  color: var(--danger);
  font-weight: bold;
  margin-bottom: 10px;
}

.admin-section {
  margin-top: 50px;
  width: 900px;
  background: #fff;
  padding: 25px;
  border-radius: 25px;
  border: 2px dashed #ccc;
  display: none;
}

.admin-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 80px;
  text-align: center;
  font-size: 20px;
}
</style>