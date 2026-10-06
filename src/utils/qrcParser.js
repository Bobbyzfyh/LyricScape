import { decryptQrc } from 'qrc-decoder'

// QQ Music PC cache mask traversal, adapted from the documented MIT-licensed
// LRC-GET implementation: https://github.com/valenbine/LRC-GET
const QMC_SEED_MAP = [
  [0x4a, 0xd6, 0xca, 0x90, 0x67, 0xf7, 0x52],
  [0x5e, 0x95, 0x23, 0x9f, 0x13, 0x11, 0x7e],
  [0x47, 0x74, 0x3d, 0x90, 0xaa, 0x3f, 0x51],
  [0xc6, 0x09, 0xd5, 0x9f, 0xfa, 0x66, 0xf9],
  [0xf3, 0xd6, 0xa1, 0x90, 0xa0, 0xf7, 0xf0],
  [0x1d, 0x95, 0xde, 0x9f, 0x84, 0x11, 0xf4],
  [0x0e, 0x74, 0xbb, 0x90, 0xbc, 0x3f, 0x92],
  [0x00, 0x09, 0x5b, 0x9f, 0x62, 0x66, 0xa1],
]

function unescapeXml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
}

function decodeQmcMask(bytes) {
  let x = -1
  let y = 8
  let dx = 1
  let index = -1
  const decoded = new Uint8Array(bytes.length)

  const nextMask = () => {
    let mask
    index += 1
    if (x < 0) {
      dx = 1
      y = (8 - y) % 8
      mask = 0xc3
    } else if (x > 6) {
      dx = -1
      y = 7 - y
      mask = 0xd8
    } else {
      mask = QMC_SEED_MAP[y][x]
    }
    x += dx
    if (index === 0x8000 || (index > 0x8000 && (index + 1) % 0x8000 === 0)) return nextMask()
    return mask
  }

  bytes.forEach((byte, offset) => { decoded[offset] = byte ^ nextMask() })
  return decoded
}

function bytesToHex(bytes) {
  let result = ''
  for (const byte of bytes) result += byte.toString(16).padStart(2, '0')
  return result
}

function looksLikeQrcText(value) {
  return /LyricContent\s*=|\[\d+\s*,\s*\d+\]/i.test(value)
}

function extractLyricContent(source) {
  const match = String(source).match(/LyricContent\s*=\s*(["'])([\s\S]*?)\1/i)
  return match ? unescapeXml(match[2]) : String(source)
}

export function parseQRCText(source) {
  const content = extractLyricContent(source)
  const timestamp = /\[(\d+)\s*,\s*(\d+)]/g
  const matches = [...content.matchAll(timestamp)]
  const lines = []

  matches.forEach((match, index) => {
    const startMilliseconds = Number(match[1])
    const durationMilliseconds = Number(match[2])
    const bodyStart = match.index + match[0].length
    const bodyEnd = matches[index + 1]?.index ?? content.length
    const body = content.slice(bodyStart, bodyEnd).replace(/^[\r\n]+|[\r\n]+$/g, '')
    const words = []
    const wordPattern = /([\s\S]*?)\((\d+)\s*,\s*(\d+)\)/g

    for (const wordMatch of body.matchAll(wordPattern)) {
      const wordStart = Number(wordMatch[2])
      const wordDuration = Number(wordMatch[3])
      words.push({
        start: wordStart / 1000,
        end: (wordStart + wordDuration) / 1000,
        text: wordMatch[1],
      })
    }

    const text = (words.length
      ? words.map((word) => word.text).join('')
      : body.replace(/\(\d+\s*,\s*\d+\)/g, '')).trim()

    if (text) {
      lines.push({
        start: startMilliseconds / 1000,
        end: (startMilliseconds + durationMilliseconds) / 1000,
        text,
        words,
      })
    }
  })

  return lines.sort((a, b) => a.start - b.start)
}

function decryptHexPayload(hex) {
  const normalized = hex.replace(/\s+/g, '')
  if (!/^[\da-f]+$/i.test(normalized) || normalized.length % 2) throw new Error('不是有效的 QRC 十六进制数据')
  return decryptQrc(normalized)
}

function tryLocalCache(bytes) {
  const decoded = decodeQmcMask(bytes)
  const newline = decoded.indexOf(0x0a)
  if (newline < 0) return null
  const header = new TextDecoder().decode(decoded.slice(0, newline)).trim()
  if (!/^\[offset:-?\d+]$/.test(header)) return null
  return decryptHexPayload(bytesToHex(decoded.slice(newline + 1)))
}

export function parseQRCBuffer(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/^\uFEFF/, '').trim()
  const attempts = []

  if (looksLikeQrcText(decodedText)) attempts.push(() => decodedText)
  if (/^[\da-f\s]+$/i.test(decodedText) && decodedText.replace(/\s+/g, '').length % 2 === 0) {
    attempts.push(() => decryptHexPayload(decodedText))
  }
  attempts.push(() => tryLocalCache(bytes))
  attempts.push(() => decryptHexPayload(bytesToHex(bytes)))

  for (const attempt of attempts) {
    try {
      const content = attempt()
      if (!content) continue
      const parsed = parseQRCText(content)
      if (parsed.length) return parsed
    } catch {
      // Different QQ Music versions wrap QRC payloads differently; try the next form.
    }
  }

  throw new Error('无法解析此 QRC。请确认它来自 QQ 音乐，且文件没有损坏。')
}
