<script setup>
import { formatTime } from '../../utils/time'
import ProgressBar from './ProgressBar.vue'

defineProps({
  current: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false },
  sourceName: { type: String, default: 'Demo lyrics' },
  lineCount: { type: Number, default: 0 },
})

defineEmits(['toggle', 'seek', 'restart'])
</script>

<template>
  <section class="timeline-shell" aria-label="歌词时间轴">
    <div class="timeline-row">
      <button class="timeline-info" type="button" title="从头开始" @click="$emit('restart')">
        <span class="timeline-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M7 4v16M11 8h7M11 12h7M11 16h5" /></svg>
        </span>
        <span class="timeline-copy">
          <strong>{{ sourceName }}</strong>
          <small>{{ lineCount }} lines · 与 QQ 音乐手动同步</small>
        </span>
      </button>

      <div class="timeline-progress">
        <ProgressBar :current="current" :duration="duration" @seek="$emit('seek', $event)" />
        <div class="time-row">
          <span>{{ formatTime(current) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <button class="play-button" type="button" :aria-label="isPlaying ? '暂停歌词' : '开始歌词'" @click="$emit('toggle')">
        <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6v12M16 6v12" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path class="play-fill" d="M8 5.5l10 6.5-10 6.5z" /></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.timeline-shell {
  width: min(92vw, 940px);
  padding: 16px 20px 12px;
  border: 1px solid rgba(255,255,255,.11);
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(13,18,31,.6), rgba(8,11,20,.36));
  box-shadow: 0 18px 50px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.06);
  backdrop-filter: blur(24px) saturate(1.25);
  -webkit-backdrop-filter: blur(24px) saturate(1.25);
}
.timeline-row { display: grid; grid-template-columns: minmax(180px, 260px) 1fr auto; align-items: center; gap: 24px; }
.timeline-info { display: flex; min-width: 0; align-items: center; gap: 12px; padding: 0; border: 0; color: #fff; background: transparent; text-align: left; cursor: pointer; }
.timeline-mark { display: grid; flex: 0 0 42px; width: 42px; height: 42px; place-items: center; border: 1px solid rgba(255,255,255,.14); border-radius: 13px; background: linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.04)); }
.timeline-mark svg { width: 20px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; }
.timeline-copy { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.timeline-copy strong { overflow: hidden; font-size: .93rem; font-weight: 560; text-overflow: ellipsis; white-space: nowrap; }
.timeline-copy small { color: rgba(255,255,255,.45); font-size: .7rem; letter-spacing: .035em; }
.timeline-progress { min-width: 0; }
.time-row { display: flex; justify-content: space-between; color: rgba(255,255,255,.42); font-size: .68rem; font-variant-numeric: tabular-nums; }
.play-button { display: grid; width: 46px; height: 46px; place-items: center; border: 1px solid rgba(255,255,255,.25); border-radius: 50%; color: #fff; background: rgba(255,255,255,.12); box-shadow: 0 5px 22px rgba(0,0,0,.18); cursor: pointer; transition: transform 200ms ease, background 200ms ease; }
.play-button:hover { transform: scale(1.05); background: rgba(255,255,255,.2); }
.play-button svg { width: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
.play-button .play-fill { fill: currentColor; stroke: none; }
@media (max-width: 700px) {
  .timeline-shell { padding: 13px 14px 10px; border-radius: 18px; }
  .timeline-row { grid-template-columns: 1fr auto; gap: 10px 16px; }
  .timeline-progress { grid-column: 1 / -1; grid-row: 2; }
}
</style>
