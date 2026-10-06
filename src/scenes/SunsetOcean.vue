<script setup>
import { ref } from 'vue'
import { useSceneCanvas } from '../composables/useSceneCanvas'

const props = defineProps({
  audioData: { type: Object, required: true },
  progress: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
})
const canvas = ref(null)
let glints = []
let birds = []
let sceneStartedAt = 0

function seed(width, height) {
  glints = Array.from({ length: 32 }, () => ({
    x: width * (.35 + Math.random() * .3),
    y: height * (.61 + Math.random() * .32),
    width: 3 + Math.random() * 22,
    phase: Math.random() * Math.PI * 2,
  }))
  birds = Array.from({ length: 5 }, (_, index) => ({
    offset: index * (width * .11) + Math.random() * 70,
    y: height * (.18 + Math.random() * .18),
    size: 4 + Math.random() * 3.5,
    phase: Math.random() * Math.PI * 2,
  }))
  sceneStartedAt = performance.now()
}

function drawBird(context, x, y, size, wing, opacity) {
  context.save()
  context.translate(x, y)
  context.globalAlpha = opacity
  context.strokeStyle = '#3b3344'
  context.lineWidth = 1.25
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(0, 0)
  context.quadraticCurveTo(-size * .55, -size * (wing + .15), -size, -size * .18)
  context.moveTo(0, 0)
  context.quadraticCurveTo(size * .55, -size * (wing + .15), size, -size * .18)
  context.stroke()
  context.restore()
}

function drawBoat(context, x, y, scale, bass, energy, time) {
  const bob = Math.sin(time * .0016) * (1.2 + bass * 2)
  context.save()
  context.translate(x, y + bob)
  context.scale(scale, scale)
  context.globalAlpha = .78
  context.fillStyle = '#201f2b'
  context.beginPath()
  context.moveTo(-24, 2)
  context.quadraticCurveTo(-18, 11, 19, 9)
  context.lineTo(27, 1)
  context.closePath()
  context.fill()
  context.strokeStyle = 'rgba(28,27,38,.92)'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(0, 3)
  context.lineTo(0, -29)
  context.stroke()
  context.fillStyle = `rgba(91,65,75,${.74 + energy * .12})`
  context.beginPath()
  context.moveTo(2, -27)
  context.lineTo(2, 1)
  context.lineTo(21, -2)
  context.closePath()
  context.fill()
  context.fillStyle = 'rgba(238,179,129,.62)'
  context.beginPath()
  context.moveTo(-2, -24)
  context.lineTo(-2, 0)
  context.lineTo(-17, -3)
  context.closePath()
  context.fill()
  context.restore()
}

function wave(context, width, y, amplitude, frequency, phase, color, thickness) {
  context.strokeStyle = color
  context.lineWidth = thickness
  context.beginPath()
  for (let x = -10; x <= width + 10; x += 8) {
    const pointY = y + Math.sin(x * frequency + phase) * amplitude + Math.sin(x * frequency * .41 - phase * .7) * amplitude * .45
    if (x === -10) context.moveTo(x, pointY)
    else context.lineTo(x, pointY)
  }
  context.stroke()
}

useSceneCanvas(canvas, (context, width, height, time, delta, reducedMotion) => {
  const { bass, treble, energy, beat } = props.audioData
  const brightness = .92 + energy * .16
  context.filter = `brightness(${brightness})`
  const sky = context.createLinearGradient(0, 0, 0, height * .66)
  sky.addColorStop(0, '#251d4a')
  sky.addColorStop(.44, '#b3546d')
  sky.addColorStop(.78, '#f19063')
  sky.addColorStop(1, '#ffd08c')
  context.fillStyle = sky
  context.fillRect(0, 0, width, height * .66)

  const sunX = width * .66
  const sunY = height * .43
  const sunGlow = context.createRadialGradient(sunX, sunY, 5, sunX, sunY, Math.min(width, height) * .2)
  sunGlow.addColorStop(0, 'rgba(255,238,181,.95)')
  sunGlow.addColorStop(.25, 'rgba(255,182,112,.36)')
  sunGlow.addColorStop(1, 'rgba(255,140,100,0)')
  context.fillStyle = sunGlow
  context.fillRect(0, 0, width, height * .66)
  context.fillStyle = 'rgba(255,224,164,.9)'
  context.beginPath()
  context.arc(sunX, sunY, Math.min(width, height) * .045, 0, Math.PI * 2)
  context.fill()

  const cloudTime = reducedMotion ? 0 : time * .002
  context.save()
  context.filter = 'blur(14px)'
  context.fillStyle = 'rgba(49,39,79,.28)'
  context.beginPath()
  context.ellipse((width * .18 + cloudTime) % (width + 320) - 160, height * .2, 190, 27, .04, 0, Math.PI * 2)
  context.ellipse((width * .78 + cloudTime * .55) % (width + 380) - 190, height * .31, 150, 21, -.05, 0, Math.PI * 2)
  context.fill()
  context.restore()

  const ocean = context.createLinearGradient(0, height * .58, 0, height)
  ocean.addColorStop(0, '#76526e')
  ocean.addColorStop(.22, '#3d526d')
  ocean.addColorStop(1, '#091b2d')
  context.fillStyle = ocean
  context.fillRect(0, height * .58, width, height * .42)

  const elapsed = Math.max(0, time - sceneStartedAt)
  const boatX = (width * .14 + elapsed * .011 * (1 + energy * .28)) % (width + 150) - 55
  drawBoat(context, boatX, height * .592, Math.max(.72, Math.min(1.12, width / 1450)), bass, energy, time)

  birds.forEach((bird, index) => {
    const travel = elapsed * (.012 + energy * .006)
    const x = (width * .12 + bird.offset + travel) % (width + 120) - 60
    const y = bird.y + Math.sin(time * .0007 + bird.phase) * 8
    const wing = .22 + (Math.sin(time * .004 + bird.phase + index) + 1) * .2
    drawBird(context, x, y, bird.size, reducedMotion ? .28 : wing, .35 + treble * .2)
  })

  const phase = (reducedMotion ? 0 : time * .00045) + props.currentTime * .04
  const amplitude = 2.5 + bass * 5.5 + (beat ? 1 : 0)
  for (let line = 0; line < 9; line += 1) {
    const y = height * .59 + line * height * .047
    wave(context, width, y, amplitude * (1 + line * .09), .012 + line * .0007, phase * (1 + line * .11), `rgba(196,211,220,${.09 + line * .012})`, 1.1)
  }

  glints.forEach((glint) => {
    const shimmer = Math.max(0, Math.sin(time * .002 + glint.phase))
    context.globalAlpha = (.06 + treble * .28) * shimmer
    context.fillStyle = '#fff0c9'
    context.fillRect(glint.x - glint.width / 2, glint.y, glint.width, .7 + treble)
  })
  context.globalAlpha = 1
  context.filter = 'none'
}, seed)
</script>

<template><canvas ref="canvas" class="scene-canvas" aria-hidden="true" /></template>
<style scoped>.scene-canvas { width: 100%; height: 100%; display: block; }</style>
