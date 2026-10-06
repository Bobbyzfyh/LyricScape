<script setup>
import { computed } from 'vue'

const props = defineProps({ current: { type: Number, default: 0 }, duration: { type: Number, default: 0 } })
const emit = defineEmits(['seek'])
const percentage = computed(() => props.duration ? Math.min(100, (props.current / props.duration) * 100) : 0)
</script>

<template>
  <div class="progress-wrap">
    <div class="progress-track" aria-hidden="true">
      <div class="progress-fill" :style="{ width: `${percentage}%` }" />
    </div>
    <input
      class="progress-input"
      type="range"
      min="0"
      :max="duration || 0"
      step="0.01"
      :value="current"
      aria-label="歌曲进度"
      @input="emit('seek', Number($event.target.value))"
    />
  </div>
</template>

<style scoped>
.progress-wrap { position: relative; width: 100%; height: 20px; display: grid; align-items: center; }
.progress-track { height: 3px; overflow: hidden; border-radius: 4px; background: rgba(255,255,255,.18); }
.progress-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, rgba(255,255,255,.7), #fff); box-shadow: 0 0 12px rgba(255,255,255,.35); }
.progress-input { position: absolute; inset: 0; width: 100%; height: 20px; margin: 0; opacity: 0; cursor: pointer; }
.progress-wrap:hover .progress-track, .progress-wrap:focus-within .progress-track { height: 5px; }
</style>
