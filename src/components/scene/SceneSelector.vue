<script setup>
import { SCENES, useSceneStore } from '../../stores/scene'

const sceneStore = useSceneStore()
</script>

<template>
  <nav class="scene-selector" aria-label="背景场景">
    <button
      v-for="scene in SCENES"
      :key="scene.id"
      type="button"
      :class="{ active: sceneStore.currentScene === scene.id }"
      :aria-pressed="sceneStore.currentScene === scene.id"
      @click="sceneStore.select(scene.id)"
    >
      <span class="scene-dot" />
      <span>{{ scene.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.scene-selector { display: flex; gap: 4px; padding: 4px; border: 1px solid rgba(255,255,255,.09); border-radius: 999px; background: rgba(8,10,18,.22); backdrop-filter: blur(14px); }
.scene-selector button { display: flex; align-items: center; gap: 7px; min-height: 34px; padding: 7px 11px; border: 0; border-radius: 999px; color: rgba(255,255,255,.46); background: transparent; font: inherit; font-size: .73rem; letter-spacing: .025em; cursor: pointer; transition: color 250ms ease, background 250ms ease; }
.scene-selector button:hover { color: rgba(255,255,255,.8); }
.scene-selector button.active { color: #fff; background: rgba(255,255,255,.1); }
.scene-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; box-shadow: 0 0 8px currentColor; }
@media (max-width: 700px) { .scene-selector button span:last-child { display: none; } .scene-selector button { padding: 9px 12px; } }
</style>
