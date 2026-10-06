<script setup>
import { ref } from 'vue'
import { useSceneCanvas } from '../composables/useSceneCanvas'

const props = defineProps({
  audioData: { type: Object, required: true },
  progress: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
})

const canvas = ref(null)
let stars = []
let particles = []
let meteors = []
let nextMeteorAt = 0
let rocket = null

function seed(width, height) {
  const count = Math.min(170, Math.max(90, Math.floor(width * height / 9000)))
  stars = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height * .72,
    radius: .35 + Math.random() * 1.35,
    phase: Math.random() * Math.PI * 2,
    speed: .4 + Math.random() * 1.5,
    bright: index % 13 === 0,
  }))
  particles = Array.from({ length: 34 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: .5 + Math.random() * 1.5,
    drift: .12 + Math.random() * .24,
    phase: Math.random() * Math.PI * 2,
  }))
  meteors = []
  nextMeteorAt = performance.now() + 1200 + Math.random() * 1200
  rocket = {
    active: false,
    startAt: 0,
    nextAt: performance.now() + 3500 + Math.random() * 1800,
    duration: 10000,
  }
}

function spawnMeteor(width, height, time) {
  if (meteors.length >= 3) return
  meteors.push({
    born: time,
    duration: 1100 + Math.random() * 800,
    x: width * (.08 + Math.random() * .58),
    y: height * (.06 + Math.random() * .3),
    speed: .45 + Math.random() * .28,
    length: 60 + Math.random() * 90,
  })
}

function drawMeteor(context, meteor, time, treble) {
  const age = time - meteor.born
  const life = age / meteor.duration
  const x = meteor.x + age * meteor.speed
  const y = meteor.y + age * meteor.speed * .48
  const opacity = Math.sin(Math.min(1, life) * Math.PI) * (.42 + treble * .34)
  const tailX = x - meteor.length
  const tailY = y - meteor.length * .48
  const trail = context.createLinearGradient(tailX, tailY, x, y)
  trail.addColorStop(0, 'rgba(164,206,255,0)')
  trail.addColorStop(.8, `rgba(197,224,255,${opacity * .5})`)
  trail.addColorStop(1, `rgba(255,255,255,${opacity})`)
  context.strokeStyle = trail
  context.lineWidth = .7 + treble * .8
  context.beginPath()
  context.moveTo(tailX, tailY)
  context.lineTo(x, y)
  context.stroke()
  context.fillStyle = `rgba(255,255,255,${opacity})`
  context.beginPath()
  context.arc(x, y, 1.1 + treble, 0, Math.PI * 2)
  context.fill()
}

function drawRocket(context, width, height, time, energy, treble) {
  if (!rocket.active && time >= rocket.nextAt) {
    rocket.active = true
    rocket.startAt = time
  }
  if (!rocket.active) return

  const journey = (time - rocket.startAt) / rocket.duration
  if (journey >= 1) {
    rocket.active = false
    rocket.nextAt = time + 26000 + Math.random() * 24000
    return
  }

  const eased = journey * journey * (3 - 2 * journey)
  const x = -70 + eased * (width + 150)
  const y = height * .72 - eased * height * .54 - Math.sin(journey * Math.PI) * height * .09
  const dx = width + 150
  const dy = -height * .54 - Math.cos(journey * Math.PI) * Math.PI * height * .09
  const angle = Math.atan2(dy, dx)
  const scale = 1.02 + Math.sin(journey * Math.PI) * .3

  context.save()
  context.translate(x, y)
  context.rotate(angle)
  context.scale(scale, scale)
  context.globalAlpha = .82 + energy * .14
  context.shadowColor = 'rgba(169,211,255,.55)'
  context.shadowBlur = 8
  context.fillStyle = '#d9e3ed'
  context.beginPath()
  context.moveTo(16, 0)
  context.quadraticCurveTo(10, -5, -8, -4.6)
  context.lineTo(-13, 0)
  context.lineTo(-8, 4.6)
  context.quadraticCurveTo(10, 5, 16, 0)
  context.fill()
  context.fillStyle = '#7287a2'
  context.beginPath()
  context.moveTo(-5, 4)
  context.lineTo(-12, 10)
  context.lineTo(1, 4)
  context.fill()
  context.beginPath()
  context.moveTo(-5, -4)
  context.lineTo(-12, -10)
  context.lineTo(1, -4)
  context.fill()
  context.fillStyle = '#8bd5ff'
  context.beginPath()
  context.arc(6, -1.2, 2.2, 0, Math.PI * 2)
  context.fill()
  context.shadowColor = '#ffb46b'
  context.shadowBlur = 11
  context.fillStyle = `rgba(255,181,93,${.6 + treble * .3})`
  context.beginPath()
  context.moveTo(-12, -2.7)
  context.lineTo(-25 - Math.sin(time * .02) * 3 - energy * 8, 0)
  context.lineTo(-12, 2.7)
  context.fill()
  context.restore()
}

function drawCloud(context, x, y, size, alpha) {
  context.save()
  context.globalAlpha = alpha
  context.filter = `blur(${size * .08}px)`
  const gradient = context.createRadialGradient(x, y, 0, x, y, size)
  gradient.addColorStop(0, 'rgba(135,153,193,.32)')
  gradient.addColorStop(1, 'rgba(67,78,115,0)')
  context.fillStyle = gradient
  context.beginPath()
  context.ellipse(x, y, size * 1.8, size * .42, -.08, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

useSceneCanvas(canvas, (context, width, height, time, delta, reducedMotion) => {
  const { bass, treble, energy, beat } = props.audioData
  const pulse = 1 + bass * .006 + (beat ? .003 : 0)
  context.translate(width / 2, height / 2)
  context.scale(pulse, pulse)
  context.translate(-width / 2, -height / 2)

  const sky = context.createLinearGradient(0, 0, 0, height)
  sky.addColorStop(0, '#030611')
  sky.addColorStop(.48, '#0a1330')
  sky.addColorStop(1, '#172346')
  context.fillStyle = sky
  context.fillRect(-8, -8, width + 16, height + 16)

  const glow = context.createRadialGradient(width * .74, height * .2, 0, width * .74, height * .2, width * .42)
  glow.addColorStop(0, `rgba(87,115,183,${.1 + energy * .08})`)
  glow.addColorStop(1, 'rgba(10,18,48,0)')
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)

  stars.forEach((star) => {
    const twinkle = .42 + Math.sin(time * .001 * star.speed + star.phase) * (.18 + treble * .26)
    context.globalAlpha = Math.max(.12, twinkle + (star.bright ? .22 : 0))
    context.fillStyle = star.bright ? '#d8edff' : '#acc9ef'
    context.beginPath()
    context.arc(star.x, star.y, star.radius * (1 + treble * .3), 0, Math.PI * 2)
    context.fill()
  })
  context.globalAlpha = 1

  if (!reducedMotion && time >= nextMeteorAt) {
    spawnMeteor(width, height, time)
    nextMeteorAt = time + 5200 + Math.random() * 4200 * (1 - treble * .24)
  }
  meteors.forEach((meteor) => drawMeteor(context, meteor, time, treble))
  meteors = meteors.filter((meteor) => time - meteor.born < meteor.duration)

  const cloudShift = reducedMotion ? 0 : time * .003
  drawCloud(context, (width * .18 + cloudShift) % (width + 320) - 160, height * .28, 150, .34)
  drawCloud(context, (width * .72 + cloudShift * .55) % (width + 420) - 210, height * .48, 210, .24)

  particles.forEach((particle) => {
    if (!reducedMotion) {
      particle.y -= particle.drift * (delta / 16.7) * (1 + energy * 1.9)
      particle.x += Math.sin(time * .0006 + particle.phase) * .08
      if (particle.y < -10) particle.y = height + 10
    }
    context.globalAlpha = .12 + energy * .26
    context.fillStyle = '#bfddff'
    context.beginPath()
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
    context.fill()
  })
  context.globalAlpha = 1
  if (!reducedMotion) drawRocket(context, width, height, time, energy, treble)

  const horizon = context.createLinearGradient(0, height * .66, 0, height)
  horizon.addColorStop(0, 'rgba(17,29,58,0)')
  horizon.addColorStop(1, 'rgba(3,6,16,.72)')
  context.fillStyle = horizon
  context.fillRect(0, height * .6, width, height * .4)
}, seed)
</script>

<template><canvas ref="canvas" class="scene-canvas" aria-hidden="true" /></template>

<style scoped>.scene-canvas { width: 100%; height: 100%; display: block; }</style>
