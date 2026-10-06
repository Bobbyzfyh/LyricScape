import { computed, ref } from 'vue'
import { parseLyricsFile } from '../utils/lrcParser'

export const DEMO_LYRICS = [
  { start: 0, text: 'Welcome to LyricScape' },
  { start: 4, text: 'Where music becomes a world' },
  { start: 8, text: 'Every lyric has its moment' },
  { start: 12, text: 'Every beat moves the scene' },
  { start: 16, text: 'Stay here, just a little longer' },
]

export function useLyrics(currentTime) {
  const lyrics = ref([...DEMO_LYRICS])
  const sourceName = ref('Demo lyrics')
  const error = ref('')

  const activeIndex = computed(() => {
    const time = currentTime.value
    let low = 0
    let high = lyrics.value.length - 1
    let result = -1
    while (low <= high) {
      const middle = Math.floor((low + high) / 2)
      if (lyrics.value[middle].start <= time) {
        result = middle
        low = middle + 1
      } else {
        high = middle - 1
      }
    }
    return result
  })

  const loadFile = async (file) => {
    error.value = ''
    try {
      const isQrc = file.name.toLowerCase().endsWith('.qrc')
      const source = isQrc ? await file.arrayBuffer() : await file.text()
      const parsed = await parseLyricsFile(file.name, source)
      if (!parsed.length) throw new Error('文件中没有可用的歌词行。')
      lyrics.value = parsed
      sourceName.value = file.name
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : '无法读取歌词文件。'
    }
  }

  const loadDemo = () => {
    lyrics.value = [...DEMO_LYRICS]
    sourceName.value = 'Demo lyrics'
    error.value = ''
  }

  return { lyrics, activeIndex, sourceName, error, loadFile, loadDemo }
}
