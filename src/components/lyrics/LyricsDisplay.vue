<script setup>
import { computed } from 'vue'

const props = defineProps({
  lyrics: { type: Array, required: true },
  activeIndex: { type: Number, default: -1 },
})

const visibleLines = computed(() => {
  if (!props.lyrics.length) return []
  const center = Math.max(0, props.activeIndex)
  return [-1, 0, 1].map((offset) => {
    const index = center + offset
    return {
      key: props.lyrics[index] ? `${index}-${props.lyrics[index].start}` : `empty-${index}`,
      text: props.lyrics[index]?.text || '',
      position: offset === 0 ? 'current' : offset < 0 ? 'previous' : 'next',
    }
  })
})
</script>

<template>
  <section class="lyrics-stage" aria-live="polite" aria-label="同步歌词">
    <TransitionGroup name="lyric-shift" tag="div" class="lyrics-stack">
      <p
        v-for="line in visibleLines"
        :key="line.key"
        class="lyric-line"
        :class="`lyric-line--${line.position}`"
      >
        {{ line.text }}
      </p>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.lyrics-stage {
  position: relative;
  z-index: 5;
  display: grid;
  place-items: center;
  width: min(90vw, 980px);
  min-height: 300px;
  pointer-events: none;
  text-align: center;
}

.lyrics-stack {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 270px;
}

.lyric-line {
  position: absolute;
  width: 100%;
  margin: 0;
  color: rgba(255, 255, 255, 0.94);
  font-size: clamp(1.12rem, 2.1vw, 1.75rem);
  font-weight: 460;
  line-height: 1.5;
  letter-spacing: 0.025em;
  text-wrap: balance;
  transition: transform 700ms cubic-bezier(.2,.75,.2,1), opacity 700ms ease, filter 700ms ease;
}

.lyric-line--previous {
  transform: translateY(-82px) scale(.9);
  opacity: .3;
  filter: blur(.7px);
}

.lyric-line--current {
  transform: translateY(0) scale(1.05);
  opacity: 1;
  font-size: clamp(1.75rem, 3.5vw, 3.45rem);
  font-weight: 560;
  text-shadow: 0 2px 18px rgba(0,0,0,.75), 0 0 36px rgba(205,226,255,.3);
}

.lyric-line--next {
  transform: translateY(84px) scale(.95);
  opacity: .5;
  filter: blur(.35px);
}

.lyric-shift-enter-active,
.lyric-shift-leave-active { transition: all 700ms cubic-bezier(.2,.75,.2,1); }
.lyric-shift-enter-from { opacity: 0; transform: translateY(115px) scale(.9); filter: blur(8px); }
.lyric-shift-leave-to { opacity: 0; transform: translateY(-115px) scale(.86); filter: blur(8px); }

@media (max-height: 700px) {
  .lyrics-stage { min-height: 220px; transform: translateY(-3vh); }
  .lyrics-stack { min-height: 210px; }
  .lyric-line--previous { transform: translateY(-65px) scale(.9); }
  .lyric-line--next { transform: translateY(66px) scale(.95); }
}

@media (prefers-reduced-motion: reduce) {
  .lyric-line,
  .lyric-shift-enter-active,
  .lyric-shift-leave-active { transition-duration: 120ms; }
}
</style>
