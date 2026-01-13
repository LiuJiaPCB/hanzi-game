<template>
  <div class="tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      class="tab-btn" 
      :class="{ active: currentTab === tab.id }"
      @click="currentTab = tab.id"
    >
      {{ tab.name }}
    </button>
  </div>

  <RunTown v-if="currentTab === 'run'" />
  <StrokeLab v-if="currentTab === 'split'" />
  <XiangXing v-if="currentTab === 'xiang'" />
  
  <audio id="ding" src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"></audio>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RunTown from './components/RunTown.vue';
import StrokeLab from './components/StrokeLab.vue';
import XiangXing from './components/XiangXing.vue';

const currentTab = ref('run');

const tabs = [
  { id: 'run', name: '跑跑镇 (合体字)' },
  { id: 'split', name: '笔画实验室 (拆解字)' },
  { id: 'xiang', name: '象形实验室 (变变变)' }
];
</script>

<style>
/* 全局样式已在 style.css 中定义 */
</style>