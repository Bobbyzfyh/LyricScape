<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import LyricsDisplay from './components/lyrics/LyricsDisplay.vue'
import LyricsUploader from './components/lyrics/LyricsUploader.vue'
import LyricsTimeline from './components/player/LyricsTimeline.vue'
import SceneRenderer from './components/scene/SceneRenderer.vue'
import SceneSelector from './components/scene/SceneSelector.vue'
import { useLyrics } from './composables/useLyrics'
import { useTimelineClock } from './composables/useTimelineClock'

const timeline = useTimelineClock()
const lyricsEngine = useLyrics(timeline.currentTime)
const controlsIdle = ref(false)
let idleTimer

const progress = computed(() => timeline.duration.value
  ? Math.min(1, timeline.currentTime.value / timeline.duration.value)
  : 0)

const ambientData = {
  get bass() { return .09 + (Math.sin(performance.now() * .0007) + 1) * .025 },
  get mid() { return .1 + (Math.sin(performance.now() * .00043 + 1.7) + 1) * .02 },
  get treble() { return .08 + (Math.sin(performance.now() * .0011 + 3.1) + 1) * .025 },
  get energy() { return .11 + (Math.sin(performance.now() * .00031) + 1) * .025 },
  beat: false,
}

watch(lyricsEngine.lyrics, (lines) => {
  const last = lines.at(-1)
  const inferredDuration = last ? (Number.isFinite(last.end) ? last.end : last.start + 4) : 0
  timeline.setDuration(inferredDuration)
  timeline.seek(0)
}, { immediate: true })

async function loadLyricsFile(file) {
  timeline.pause()
  await lyricsEngine.loadFile(file)
}

function loadDemoLyrics() {
  timeline.pause()
  lyricsEngine.loadDemo()
}

function showControls() {
  controlsIdle.value = false
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => { controlsIdle.value = true }, 4200)
}

showControls()
onBeforeUnmount(() => clearTimeout(idleTimer))
</script>

<template>
  <main
    class="app-shell"
    :class="{ 'controls-idle': controlsIdle }"
    @pointermove="showControls"
    @pointerdown="showControls"
    @keydown="showControls"
  >
    <SceneRenderer
      :audio-data="ambientData"
      :progress="progress"
      :current-time="timeline.currentTime.value"
    />

    <header class="top-bar ui-chrome">
      <div class="brand" aria-label="LyricScape">
        <span class="brand-glyph" aria-hidden="true"><i /><i /><i /></span>
        <span>LYRICSCAPE</span>
      </div>
      <div class="top-tools">
        <LyricsUploader
          :source-name="lyricsEngine.sourceName.value"
          :error="lyricsEngine.error.value"
          @select="loadLyricsFile"
          @demo="loadDemoLyrics"
        />
        <SceneSelector />
      </div>
    </header>

    <div class="center-stage">
      <LyricsDisplay :lyrics="lyricsEngine.lyrics.value" :active-index="lyricsEngine.activeIndex.value" />
    </div>

    <footer class="bottom-bar ui-chrome">
      <LyricsTimeline
        :current="timeline.currentTime.value"
        :duration="timeline.duration.value"
        :is-playing="timeline.isPlaying.value"
        :source-name="lyricsEngine.sourceName.value"
        :line-count="lyricsEngine.lyrics.value.length"
        @toggle="timeline.toggle"
        @seek="timeline.seek"
        @restart="timeline.seek(0)"
      />
    </footer>
  </main>
</template>
