import { parseQRCBuffer } from './qrcParser'

const TIMESTAMP = /\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/g

export function normalizeLyrics(entries) {
  if (!Array.isArray(entries)) throw new Error('歌词 JSON 必须是数组，或包含 lyrics 数组。')

  return entries
    .map((entry) => {
      const end = Number(entry.end)
      return {
        start: Number(entry.start ?? entry.time),
        text: String(entry.text ?? entry.lyric ?? '').trim(),
        ...(Number.isFinite(end) ? { end } : {}),
        ...(Array.isArray(entry.words) ? { words: entry.words } : {}),
      }
    })
    .filter((entry) => Number.isFinite(entry.start) && entry.start >= 0 && entry.text)
    .sort((a, b) => a.start - b.start)
}

export function parseLRC(source) {
  const entries = []

  String(source).split(/\r?\n/).forEach((line) => {
    const text = line.replace(TIMESTAMP, '').trim()
    const matches = [...line.matchAll(TIMESTAMP)]
    if (!text || !matches.length) return

    matches.forEach((match) => {
      const minutes = Number(match[1])
      const seconds = Number(match[2])
      entries.push({ start: minutes * 60 + seconds, text })
    })
  })

  return normalizeLyrics(entries)
}

export function parseLyricsFile(filename, source) {
  const extension = filename.split('.').pop()?.toLowerCase()
  if (extension === 'lrc') return parseLRC(source)
  if (extension === 'qrc') return normalizeLyrics(parseQRCBuffer(source))
  if (extension === 'json') {
    const parsed = JSON.parse(source)
    return normalizeLyrics(Array.isArray(parsed) ? parsed : parsed.lyrics)
  }
  throw new Error('请选择 .qrc、.lrc 或 .json 歌词文件。')
}
