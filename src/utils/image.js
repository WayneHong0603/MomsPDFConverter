const THUMB_MAX_SIDE = 480
const THUMB_QUALITY = 0.8

// Decodes a File into an HTMLImageElement. Call dispose() once drawing is done.
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, dispose: () => URL.revokeObjectURL(url) })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Cannot decode image: ${file.name}`))
    }
    img.src = url
  })
}

export function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      type,
      quality,
    )
  })
}

// Shrinking the canvas lets mobile Safari reclaim its backing store right away.
export function releaseCanvas(canvas) {
  canvas.width = 0
  canvas.height = 0
}

// Builds a small preview so large photos are not kept decoded in the card grid.
export async function createThumbnail(file) {
  const { img, dispose } = await loadImage(file)
  try {
    const width = img.naturalWidth
    const height = img.naturalHeight
    if (!width || !height) throw new Error(`Empty image: ${file.name}`)

    const scale = Math.min(1, THUMB_MAX_SIDE / Math.max(width, height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const blob = await canvasToBlob(canvas, 'image/jpeg', THUMB_QUALITY)
    releaseCanvas(canvas)
    return { thumbUrl: URL.createObjectURL(blob), width, height }
  } finally {
    dispose()
  }
}
