<script setup>
import { ref } from 'vue'
import { useSceneCanvas } from '../composables/useSceneCanvas'

const props = defineProps({
  audioData: { type: Object, required: true },
  progress: { type: Number, default: 0 },
  currentTime: { type: Number, default: 0 },
})
const canvas = ref(null)
let drops = []
let lights = []
let cars = []

function seed(width, height) {
  drops = Array.from({ length: Math.min(95, Math.floor(width / 13)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    length: 9 + Math.random() * 26,
    speed: 1.8 + Math.random() * 3.6,
    alpha: .08 + Math.random() * .22,
  }))
  const colors = ['#e2a36e', '#67a6c9', '#cb6f76', '#e4c486']
  lights = Array.from({ length: Math.min(46, Math.floor(width / 24)) }, () => ({
    x: Math.random() * width,
    y: height * (.35 + Math.random() * .43),
    radius: 4 + Math.random() * 14,
    color: colors[Math.floor(Math.random() * colors.length)],
    phase: Math.random() * Math.PI * 2,
  }))
  cars = Array.from({ length: Math.min(11, Math.max(7, Math.floor(width / 150))) }, (_, index) => ({
    x: Math.random() * width,
    lane: index % 3,
    direction: index % 2 === 0 ? 1 : -1,
    speed: .42 + Math.random() * .62,
    length: 20 + Math.random() * 28,
    phase: Math.random() * Math.PI * 2,
  }))
}

function drawCar(context, car, width, height, delta, energy, time, reducedMotion) {
  const streetTop = height * .72
  const laneY = streetTop + height * (.055 + car.lane * .072)
  if (!reducedMotion) car.x += car.direction * car.speed * (delta / 16.7) * (1 + energy * .7)
  if (car.direction > 0 && car.x > width + 80) car.x = -80
  if (car.direction < 0 && car.x < -80) car.x = width + 80

  const flicker = .82 + Math.sin(time * .003 + car.phase) * .08
  context.save()
  context.globalAlpha = (.5 + energy * .34) * flicker
  context.translate(car.x, laneY)
  context.scale(car.direction, 1)
  const beam = context.createLinearGradient(2, 0, car.length * 2.6, 0)
  beam.addColorStop(0, 'rgba(220,235,228,.38)')
  beam.addColorStop(1, 'rgba(220,235,228,0)')
  context.fillStyle = beam
  context.fillRect(4, -1.5, car.length * 2.6, 3)
  context.fillStyle = 'rgba(8,11,15,.9)'
  context.fillRect(-car.length * .45, -4, car.length, 7)
  context.shadowBlur = 9 + energy * 10
  context.shadowColor = '#f5dfb2'
  context.fillStyle = '#f5dfb2'
  context.fillRect(car.length * .52, -2.7, 2.4, 2.4)
  context.shadowColor = '#e65055'
  context.fillStyle = '#e65055'
  context.fillRect(-car.length * .48, -2.7, 2.2, 2.2)
  context.restore()
}

useSceneCanvas(canvas, (context, width, height, time, delta, reducedMotion) => {
  const { bass, treble, energy, beat } = props.audioData
  const pulse = 1 + bass * .004 + (beat ? .0025 : 0)
  context.translate(width / 2, height / 2)
  context.scale(pulse, pulse)
  context.translate(-width / 2, -height / 2)

  const night = context.createLinearGradient(0, 0, 0, height)
  night.addColorStop(0, '#070a12')
  night.addColorStop(.5, '#101a26')
  night.addColorStop(1, '#05080d')
  context.fillStyle = night
  context.fillRect(-6, -6, width + 12, height + 12)

  const skylineY = height * .58
  const streetTop = height * .72
  context.fillStyle = 'rgba(2,5,9,.68)'
  for (let x = -10, index = 0; x < width + 20; index += 1) {
    const buildingWidth = 42 + (index * 23 % 72)
    const buildingHeight = 80 + (index * 47 % Math.max(100, height * .34))
    context.fillRect(x, skylineY - buildingHeight, buildingWidth, streetTop - skylineY + buildingHeight)
    x += buildingWidth + 5
  }

  context.save()
  context.filter = 'blur(8px)'
  lights.forEach((light) => {
    const flicker = 1 + Math.sin(time * .0017 + light.phase) * treble * .16
    context.globalAlpha = (.16 + energy * .42) * flicker
    context.fillStyle = light.color
    context.beginPath()
    context.arc(light.x, light.y, light.radius * (1 + energy * .14), 0, Math.PI * 2)
    context.fill()
  })
  context.restore()
  context.globalAlpha = 1

  const street = context.createLinearGradient(0, streetTop, 0, height)
  street.addColorStop(0, 'rgba(9,14,19,.96)')
  street.addColorStop(1, 'rgba(2,5,8,.98)')
  context.fillStyle = street
  context.fillRect(0, streetTop, width, height - streetTop)
  context.strokeStyle = 'rgba(132,157,169,.07)'
  context.lineWidth = 1
  for (let lane = 1; lane < 3; lane += 1) {
    context.beginPath()
    context.moveTo(0, streetTop + height * lane * .07)
    context.lineTo(width, streetTop + height * lane * .07)
    context.stroke()
  }
  cars.forEach((car) => drawCar(context, car, width, height, delta, energy, time, reducedMotion))

  context.strokeStyle = 'rgba(185,213,229,.25)'
  context.lineWidth = 1
  context.lineCap = 'round'
  drops.forEach((drop) => {
    if (!reducedMotion) {
      drop.y += drop.speed * (delta / 16.7) * (1 + energy * .55)
      drop.x -= .22 * (delta / 16.7)
      if (drop.y > height + 30) { drop.y = -drop.length; drop.x = Math.random() * width }
    }
    context.globalAlpha = drop.alpha + treble * .08
    context.beginPath()
    context.moveTo(drop.x, drop.y)
    context.quadraticCurveTo(drop.x - 1.5, drop.y + drop.length * .55, drop.x - 3, drop.y + drop.length)
    context.stroke()
  })
  context.globalAlpha = 1

  context.strokeStyle = 'rgba(5,7,12,.72)'
  context.lineWidth = Math.max(12, width * .013)
  context.beginPath()
  context.moveTo(width * .5, 0)
  context.lineTo(width * .5, height)
  context.moveTo(0, height * .54)
  context.lineTo(width, height * .54)
  context.stroke()

  const glass = context.createLinearGradient(0, 0, width, height)
  glass.addColorStop(0, 'rgba(126,166,190,.05)')
  glass.addColorStop(.5, 'rgba(20,31,44,.16)')
  glass.addColorStop(1, 'rgba(111,145,168,.04)')
  context.fillStyle = glass
  context.fillRect(0, 0, width, height)
}, seed)
</script>

<template><canvas ref="canvas" class="scene-canvas" aria-hidden="true" /></template>
<style scoped>.scene-canvas { width: 100%; height: 100%; display: block; }</style>
