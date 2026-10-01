import { onBeforeUnmount, ref } from 'vue'
import { createThumbnail } from '../utils/image'

// A plain counter: crypto.randomUUID is unavailable on http:// LAN addresses used for phone testing
let nextId = 1

export function useImageList() {
  const items = ref([])
  const adding = ref({ done: 0, total: 0 })

  // Adds files one by one and resolves with how many could not be read
  async function addFiles(files) {
    const candidates = files.filter((file) => !file.type || file.type.startsWith('image/'))
    let failed = files.length - candidates.length

    adding.value = { done: 0, total: candidates.length }
    try {
      for (const file of candidates) {
        try {
          const thumb = await createThumbnail(file)
          items.value.push({ id: nextId++, name: file.name, file, rotation: 0, ...thumb })
        } catch {
          failed += 1
        }
        adding.value.done += 1
      }
    } finally {
      adding.value = { done: 0, total: 0 }
    }
    return { failed }
  }

  function removeItem(id) {
    const index = items.value.findIndex((item) => item.id === id)
    if (index === -1) return
    URL.revokeObjectURL(items.value[index].thumbUrl)
    items.value.splice(index, 1)
  }

  // Rotation is cumulative so the card preview keeps spinning forward instead of unwinding
  function rotateItem(id) {
    const item = items.value.find((entry) => entry.id === id)
    if (item) item.rotation += 90
  }

  function clearAll() {
    items.value.forEach((item) => URL.revokeObjectURL(item.thumbUrl))
    items.value = []
  }

  onBeforeUnmount(clearAll)

  return { items, adding, addFiles, removeItem, rotateItem, clearAll }
}
