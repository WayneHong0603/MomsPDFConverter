export const A4_WIDTH_CM = 21
export const A4_HEIGHT_CM = 29.7
export const TARGET_HEIGHT_CM = 29

export const normalizeRotation = (deg) => ((deg % 360) + 360) % 360

// Works out how one image is placed on one A4 page.
// Landscape images (after the user's rotation) are turned 90 degrees so their long side runs along the page height.
// The image is then scaled to TARGET_HEIGHT_CM; if that would be wider than the page it is scaled down to the page width.
export function planPage(srcWidth, srcHeight, userRotation, pageWidth = A4_WIDTH_CM, pageHeight = A4_HEIGHT_CM) {
  const swapped = normalizeRotation(userRotation) % 180 !== 0
  const viewWidth = swapped ? srcHeight : srcWidth
  const viewHeight = swapped ? srcWidth : srcHeight

  const autoTurn = viewWidth > viewHeight
  const rotation = normalizeRotation(userRotation + (autoTurn ? 90 : 0))
  const outWidth = autoTurn ? viewHeight : viewWidth
  const outHeight = autoTurn ? viewWidth : viewHeight

  const ratio = outWidth / outHeight
  let height = TARGET_HEIGHT_CM
  let width = height * ratio
  if (width > pageWidth) {
    width = pageWidth
    height = width / ratio
  }

  return {
    autoTurn,
    rotation,
    outWidth,
    outHeight,
    width,
    height,
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
  }
}
