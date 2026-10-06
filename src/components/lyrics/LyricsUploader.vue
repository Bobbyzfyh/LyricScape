<script setup>
import { ref } from 'vue'

defineProps({ sourceName: { type: String, default: '' }, error: { type: String, default: '' } })
const emit = defineEmits(['select', 'demo'])
const input = ref(null)

function handleFile(event) {
  const file = event.target.files?.[0]
  if (file) emit('select', file)
  event.target.value = ''
}
</script>

<template>
  <div class="lyrics-upload">
    <input ref="input" class="sr-only" type="file" accept=".qrc,.lrc,.json,application/json" @change="handleFile" />
    <button class="quiet-button" type="button" title="导入 QRC、LRC 或 JSON 歌词" @click="input?.click()">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15.5v3A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5v-3"/></svg>
      <span>Lyrics</span>
    </button>
    <button class="source-label" type="button" title="恢复示例歌词" @click="emit('demo')">{{ sourceName }}</button>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.lyrics-upload { position: relative; display: flex; align-items: center; gap: 10px; }
.quiet-button, .source-label {
  border: 0;
  color: rgba(255,255,255,.78);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.quiet-button { display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 8px 12px; border-radius: 999px; }
.quiet-button:hover, .quiet-button:focus-visible { color: #fff; background: rgba(255,255,255,.1); }
.quiet-button svg { width: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.source-label { max-width: min(32vw, 230px); overflow: hidden; color: rgba(255,255,255,.46); font-size: .78rem; text-overflow: ellipsis; white-space: nowrap; }
.source-label:hover { color: rgba(255,255,255,.8); }
.upload-error { position: absolute; top: 44px; left: 0; width: 280px; margin: 0; padding: 8px 11px; border: 1px solid rgba(255,140,140,.2); border-radius: 10px; color: #ffd0d0; background: rgba(35,10,18,.72); font-size: .76rem; backdrop-filter: blur(16px); }
@media (max-width: 620px) { .source-label { display: none; } .quiet-button span { display: none; } }
</style>
