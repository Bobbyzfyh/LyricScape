import { onBeforeUnmount, onMounted } from 'vue'

export function useSceneCanvas(canvasRef, draw, setup) {
  let frame
  let resizeObserver
  let width = 1
  let height = 1
  let lastTime = 0
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const resize = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const context = canvas.getContext('2d')
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    setup?.(width, height)
  }

  const render = (time) => {
    const canvas = canvasRef.value
    if (!canvas) return
    const context = canvas.getContext('2d')
    const delta = reducedMotion ? 0 : Math.min(40, time - lastTime || 16.7)
    lastTime = time
    context.save()
    draw(context, width, height, time, delta, reducedMotion)
    context.restore()
    frame = requestAnimationFrame(render)
  }

  onMounted(() => {
    resize()
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvasRef.value)
    frame = requestAnimationFrame(render)
  })

  onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
  })
}
