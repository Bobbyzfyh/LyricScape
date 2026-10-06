<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSceneStore } from '../../stores/scene'
import StarryNight from '../../scenes/StarryNight.vue'
import SunsetOcean from '../../scenes/SunsetOcean.vue'
import RainyWindow from '../../scenes/RainyWindow.vue'

defineProps({
  audioData: { type: Object, required: true },
  progress: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
})

const sceneStore = useSceneStore()
const scenes = { starry: StarryNight, sunset: SunsetOcean, rainy: RainyWindow }
const activeId = ref(sceneStore.currentScene)
const outgoingId = ref(null)
const activeScene = computed(() => scenes[activeId.value])
const outgoingScene = computed(() => outgoingId.value ? scenes[outgoingId.value] : null)
let transitionTimer

watch(() => sceneStore.currentScene, (next) => {
  if (next === activeId.value) return
  outgoingId.value = activeId.value
  activeId.value = next
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => { outgoingId.value = null }, 900)
})

onBeforeUnmount(() => clearTimeout(transitionTimer))
</script>

<template>
  <div class="scene-renderer">
    <component
      :is="outgoingScene"
      v-if="outgoingScene"
      class="scene-layer scene-layer--outgoing"
      :audio-data="audioData"
      :progress="progress"
      :current-time="currentTime"
    />
    <component
      :is="activeScene"
      :key="activeId"
      class="scene-layer scene-layer--active"
      :audio-data="audioData"
      :progress="progress"
      :current-time="currentTime"
    />
    <div class="scene-vignette" />
  </div>
</template>

<style scoped>
.scene-renderer, .scene-layer, .scene-vignette { position: absolute; inset: 0; }
.scene-renderer { overflow: hidden; background: #050710; }
.scene-layer--active { z-index: 1; animation: scene-in 900ms ease both; }
.scene-layer--outgoing { z-index: 0; animation: scene-out 900ms ease both; }
.scene-vignette { z-index: 2; pointer-events: none; background: radial-gradient(circle at 50% 44%, transparent 24%, rgba(0,0,0,.1) 65%, rgba(0,0,0,.44) 120%), linear-gradient(180deg, rgba(0,0,0,.2), transparent 22%, transparent 66%, rgba(0,0,0,.35)); }
@keyframes scene-in { from { opacity: 0; transform: scale(1.012); } to { opacity: 1; transform: scale(1); } }
@keyframes scene-out { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .scene-layer--active, .scene-layer--outgoing { animation-duration: 120ms; } }
</style>
