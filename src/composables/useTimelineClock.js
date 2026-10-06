import { onBeforeUnmount, ref } from 'vue'

export function useTimelineClock() {
  const currentTime = ref(0)
  const duration = ref(0)
  const isPlaying = ref(false)
  let frame
  let startedAt = 0
  let startedFrom = 0
  let lastPublishedAt = 0

  const stopFrame = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = null
  }

  const tick = (now) => {
    if (!isPlaying.value) return
    const nextTime = startedFrom + (now - startedAt) / 1000
    if (nextTime >= duration.value) {
      currentTime.value = duration.value
      isPlaying.value = false
      stopFrame()
      return
    }
    if (now - lastPublishedAt >= 66) {
      currentTime.value = nextTime
      lastPublishedAt = now
    }
    frame = requestAnimationFrame(tick)
  }

  const seek = (seconds) => {
    const nextTime = Math.max(0, Math.min(Number(seconds) || 0, duration.value))
    currentTime.value = nextTime
    startedFrom = nextTime
    startedAt = performance.now()
  }

  const play = () => {
    if (!duration.value) return
    if (currentTime.value >= duration.value) seek(0)
    startedFrom = currentTime.value
    startedAt = performance.now()
    lastPublishedAt = 0
    isPlaying.value = true
    stopFrame()
    frame = requestAnimationFrame(tick)
  }

  const pause = () => {
    if (isPlaying.value) seek(startedFrom + (performance.now() - startedAt) / 1000)
    isPlaying.value = false
    stopFrame()
  }

  const toggle = () => (isPlaying.value ? pause() : play())
  const setDuration = (seconds) => {
    duration.value = Math.max(0, Number(seconds) || 0)
    if (currentTime.value > duration.value) seek(duration.value)
  }

  onBeforeUnmount(stopFrame)

  return { currentTime, duration, isPlaying, play, pause, toggle, seek, setDuration }
}
