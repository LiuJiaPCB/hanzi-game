<template>
  <div class="game-container" style="display: flex;">
    <h2>看图找汉字，象形字变变变！</h2>
    <div class="match-stage">
      <div class="match-col" id="xiang-pics" style="display:flex; flex-direction:column; gap:10px;">
        <div 
          v-for="item in currentPics" 
          :key="'pic-'+item.char"
          class="pic-card"
          :class="{ selected: selPic && selPic.char === item.char }"
          @click="selectPic(item)"
        >
          <img :src="item.pic" :alt="item.char">
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; width: 300px;">
        <div style="display: flex; gap: 20px;">
          <div id="slot-pic" class="slot">
            <img v-if="selPic" :src="selPic.pic" style="width: 70%; height: 70%;">
            <span v-else>?</span>
          </div>
          <div id="slot-han" class="slot">
            <span v-if="selHan" style="font-size: 45px; font-weight: bold;">{{ selHan.char }}</span>
            <span v-else>?</span>
          </div>
        </div>
        <button class="btn-main" @click="checkMatch">💡 变一变</button>
        <div style="color: #999; font-size: 16px;">先从左右各选一张卡片哦</div>
      </div>
      
      <div class="match-col" id="xiang-hans" style="display:flex; flex-direction:column; gap:10px;">
        <div 
          v-for="item in currentHans" 
          :key="'han-'+item.char"
          class="han-card"
          :class="{ selected: selHan && selHan.char === item.char }"
          @click="selectHan(item)"
        >
          {{ item.char }}
        </div>
      </div>
    </div>
  </div>

  <!-- 模态框 -->
  <div class="overlay" v-if="showModal" @click="closeModal"></div>
  <div class="modal" v-if="showModal">
    <h2 style="color: var(--soft-green); font-size: 32px;">🌟 太棒啦！找对了！</h2>
    <div id="xiang-writer" ref="writerRef" class="tian-grid"></div>
    <div id="xiang-tip" style="font-size: 20px; color: #666; margin-bottom: 20px; max-width: 400px;">
      {{ matchedTip }}
    </div>
    <button class="btn-main" @click="closeModal">继续挑战</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import HanziWriter from 'hanzi-writer';
import { speakHanzi, showToast } from '../utils/common';
import { xiangData } from '../utils/data';

interface XiangItem {
  char: string;
  pic: string;
  tip: string;
}

const currentPics = ref<XiangItem[]>([]);
const currentHans = ref<XiangItem[]>([]);
const selPic = ref<XiangItem | null>(null);
const selHan = ref<XiangItem | null>(null);
const showModal = ref(false);
const matchedTip = ref('');
const writerRef = ref<HTMLElement | null>(null);

function initXiang() {
  // 随机选5个
  const selectedData = [...xiangData].sort(() => Math.random() - 0.5).slice(0, 5);
  // 打乱顺序
  currentPics.value = [...selectedData].sort(() => Math.random() - 0.5);
  currentHans.value = [...selectedData].sort(() => Math.random() - 0.5);
  
  selPic.value = null;
  selHan.value = null;
}

function selectPic(item: XiangItem) {
  selPic.value = item;
}

function selectHan(item: XiangItem) {
  selHan.value = item;
}

function checkMatch() {
  if (!selPic.value || !selHan.value) return showToast("请先选两张卡片哦！");
  
  if (selPic.value.char === selHan.value.char) {
    const ding = document.getElementById('ding') as HTMLAudioElement;
    if (ding) ding.play();

    speakHanzi(selHan.value.char + "。" + selPic.value.tip);

    showModal.value = true;
    matchedTip.value = selPic.value.tip;
    
    nextTick(() => {
      if (writerRef.value && selHan.value) {
        writerRef.value.innerHTML = '';
        HanziWriter.create(writerRef.value, selHan.value.char, {
          width: 200, height: 200, padding: 10, strokeColor: '#e74c3c'
        }).animateCharacter();
      }
    });
  } else {
    showToast("💡 哎呀，它们不是好朋友，再找找看！");
  }
}

function closeModal() {
  showModal.value = false;
  initXiang();
}

onMounted(() => {
  initXiang();
});
</script>

<style scoped>
.match-stage {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 900px;
  background: white;
  padding: 30px;
  border-radius: 30px;
  border: 5px solid #FFE4E1;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.pic-card,
.han-card {
  width: 100px;
  height: 100px;
  border: 3px solid #eee;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: 0.3s;
}

.pic-card img {
  width: 75%;
  height: 75%;
  object-fit: contain;
}

.han-card {
  font-size: 45px;
  font-weight: bold;
  color: #333;
}

.pic-card.selected {
  border-color: var(--secondary);
  background: #fff9ed;
  transform: scale(1.1);
}

.han-card.selected {
  border-color: var(--primary);
  background: #f0f7ff;
  transform: scale(1.1);
}

.slot {
  width: 90px;
  height: 90px;
  border: 3px dashed #ccc;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  background: #fafafa;
}
</style>