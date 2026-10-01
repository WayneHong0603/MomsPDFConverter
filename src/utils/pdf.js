import { canvasToBlob, loadImage, releaseCanvas } from './image'
import { planPage } from './layout'

// Longest side of the image embedded in the PDF, roughly 200 DPI on a 29 cm page
const MAX_EMBED_SIDE_PX = 2400
const JPEG_QUALITY = 0.85

// Lets the progress UI repaint between pages; timers are enough when the tab is hidden.
function yieldToUi() {
  return new Promise((resolve) => {
    if (document.hidden) setTimeout(resolve, 0)
    else requestAnimationFrame(() => setTimeout(resolve, 0))
  })
}

async function renderPageBytes(img, plan) {
  const scale = Math.min(1, MAX_EMBED_SIDE_PX / Math.max(plan.outWidth, plan.outHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(plan.outWidth * scale))
  canvas.height = Math.max(1, Math.round(plan.outHeight * scale))

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((plan.rotation * Math.PI) / 180)

  const drawWidth = img.naturalWidth * scale
  const drawHeight = img.naturalHeight * scale
  ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

  const blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
  releaseCanvas(canvas)
  return new Uint8Array(await blob.arrayBuffer())
}

// Builds one A4 portrait page per item, in list order, and resolves with the PDF Blob.
export async function buildPdf(items, onProgress) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'cm', format: 'a4', orientation: 'portrait', compress: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 0; i < items.length; i++) {
    onProgress?.(i, items.length)
    await yieldToUi()

    const { img, dispose } = await loadImage(items[i].file)
    try {
      const plan = planPage(img.naturalWidth, img.naturalHeight, items[i].rotation, pageWidth, pageHeight)
      const bytes = await renderPageBytes(img, plan)
      if (i > 0) doc.addPage('a4', 'portrait')
      doc.addImage(bytes, 'JPEG', plan.x, plan.y, plan.width, plan.height, `page-${i}`)
    } finally {
      dispose()
    }
  }

  onProgress?.(items.length, items.length)
  return doc.output('blob')
}
