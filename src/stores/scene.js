import { defineStore } from 'pinia'

export const SCENES = [
  { id: 'starry', label: 'Starry Night' },
  { id: 'sunset', label: 'Sunset Ocean' },
  { id: 'rainy', label: 'Rainy Window' },
]

export const useSceneStore = defineStore('scene', {
  state: () => ({ currentScene: 'starry' }),
  actions: {
    select(sceneId) {
      if (SCENES.some((scene) => scene.id === sceneId)) this.currentScene = sceneId
    },
  },
})
