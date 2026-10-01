<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import draggable from 'vuedraggable'
import AppIcon from './components/AppIcon.vue'
import ImageCard from './components/ImageCard.vue'
import ResultSheet from './components/ResultSheet.vue'
import { useImageList } from './composables/useImageList'
import { buildPdf } from './utils/pdf'

const { items, adding, addFiles, removeItem, rotateItem, clearAll } = useImageList()

const fileInput = ref(null)
const toast = ref('')
let toastTimer = 0

const converting = ref(false)
const progress = ref({ done: 0, total: 0 })
const result = ref(null)
let lastPdfUrl = ''

const isAdding = computed(() => adding.value.total > 0)

function showToast(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 4000)
}

function pickFiles() {
  fileInput.value?.click()
}

async function onFilesPicked(event) {
  const files = Array.from(event.target.files ?? [])
  // Reset so picking the same file again still fires a change event
  event.target.value = ''
  if (!files.length) return

  const { failed } = await addFiles(files)
  if (failed) showToast(`有 ${failed} 個檔案無法讀取，已略過`)
}

function onClearAll() {
  if (window.confirm('確定要清除全部圖片嗎？')) clearAll()
}

function onChoose() {
  navigator.vibrate?.(15)
}

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function buildFileName() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  return `圖片合併_${date}_${pad(now.getHours())}${pad(now.getMinutes())}.pdf`
}

function revokeLastPdf() {
  if (lastPdfUrl) URL.revokeObjectURL(lastPdfUrl)
  lastPdfUrl = ''
}

async function onConvert() {
  if (converting.value || isAdding.value || !items.value.length) return

  converting.value = true
  progress.value = { done: 0, total: items.value.length }
  result.value = null

  try {
    const blob = await buildPdf(items.value, (done, total) => {
      progress.value = { done, total }
    })

    revokeLastPdf()
    lastPdfUrl = URL.createObjectURL(blob)

    // The window is null when the browser blocks the popup, which the result sheet covers
    const opened = window.open(lastPdfUrl, '_blank')
    result.value = {
      url: lastPdfUrl,
      fileName: buildFileName(),
      pages: items.value.length,
      sizeText: formatSize(blob.size),
      autoOpened: Boolean(opened),
    }
  } catch (error) {
    console.error(error)
    showToast('轉換失敗了，請再試一次（圖片太多或太大時可以分批轉換）')
  } finally {
    converting.value = false
  }
}

onBeforeUnmount(() => {
  clearTimeout(toastTimer)
  revokeLastPdf()
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>圖片轉 PDF</h1>
      <p>選好照片、排好順序，一鍵合成 A4 的 PDF</p>
    </header>

    <main class="app-main">
      <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFilesPicked">

      <section v-if="!items.length && !isAdding" class="empty">
        <div class="empty-mark"><AppIcon name="image" /></div>
        <h2>先選幾張圖片吧</h2>
        <ol class="steps">
          <li><span>1</span>按下面的按鈕，選擇照片</li>
          <li><span>2</span>長按卡片，拖曳調整順序</li>
          <li><span>3</span>按「轉成 PDF」就完成了</li>
        </ol>
        <button class="btn btn-primary btn-xl" type="button" @click="pickFiles">
          <AppIcon name="plus" />
          選擇圖片
        </button>
      </section>

      <section v-else>
        <div class="list-head">
          <strong>已選 {{ items.length }} 張</strong>
          <span>長按卡片後拖曳，可以調整順序</span>
        </div>

        <draggable
          v-model="items"
          class="grid"
          item-key="id"
          :delay="300"
          :delay-on-touch-only="false"
          :touch-start-threshold="6"
          :animation="200"
          :force-fallback="true"
          :fallback-on-body="true"
          :scroll-sensitivity="90"
          filter=".card-btn"
          :prevent-on-filter="false"
          ghost-class="is-ghost"
          chosen-class="is-chosen"
          drag-class="is-dragging"
          fallback-class="is-dragging"
          @choose="onChoose"
        >
          <template #item="{ element, index }">
            <ImageCard
              :item="element"
              :index="index"
              @rotate="rotateItem(element.id)"
              @remove="removeItem(element.id)"
            />
          </template>
          <template #footer>
            <button class="add-tile" type="button" :disabled="isAdding" @click="pickFiles">
              <AppIcon name="plus" />
              <span>{{ isAdding ? `加入中 ${adding.done}/${adding.total}` : '再加圖片' }}</span>
            </button>
          </template>
        </draggable>
      </section>
    </main>

    <footer v-if="items.length" class="action-bar">
      <div class="action-inner">
        <button class="btn btn-secondary" type="button" :disabled="converting || isAdding" @click="onClearAll">
          <AppIcon name="trash" />
          清除
        </button>
        <button class="btn btn-primary btn-xl confirm" type="button" :disabled="converting || isAdding" @click="onConvert">
          <AppIcon name="file" />
          確認，轉成 PDF
        </button>
      </div>
    </footer>

    <div v-if="converting" class="overlay" role="status" aria-live="polite">
      <div class="progress-card">
        <div class="spinner" />
        <p>正在轉換第 {{ Math.min(progress.done + 1, progress.total) }} / {{ progress.total }} 張</p>
        <div class="bar"><div class="bar-fill" :style="{ width: `${(progress.done / progress.total) * 100}%` }" /></div>
        <small>請先不要離開這個畫面</small>
      </div>
    </div>

    <ResultSheet
      v-if="result"
      v-bind="result"
      @close="result = null"
    />

    <Transition name="fade">
      <div v-if="toast" class="toast" role="alert">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px;
}

.app-header {
  padding: calc(20px + env(safe-area-inset-top)) 0 12px;
}

.app-header h1 {
  margin: 0;
  font-size: 1.7rem;
}

.app-header p {
  margin: 4px 0 0;
  color: var(--muted);
}

.app-main {
  padding-bottom: calc(120px + env(safe-area-inset-bottom));
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 32px 20px;
  border: 2px dashed var(--border);
  border-radius: 24px;
  background: var(--surface);
  text-align: center;
}

.empty h2 {
  margin: 0;
  font-size: 1.4rem;
}

.empty-mark {
  display: grid;
  width: 80px;
  height: 80px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--primary);
  font-size: 2.4rem;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 0 8px;
  padding: 0;
  list-style: none;
  text-align: left;
}

.steps li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.steps span {
  display: grid;
  width: 28px;
  height: 28px;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.empty .btn {
  width: 100%;
  max-width: 320px;
}

.list-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  margin: 8px 0 12px;
}

.list-head span {
  color: var(--muted);
  font-size: 0.95rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.add-tile {
  display: flex;
  min-height: 150px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px dashed var(--primary);
  border-radius: 16px;
  background: transparent;
  color: var(--primary);
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.add-tile :deep(.icon) {
  width: 2em;
  height: 2em;
}

.add-tile:disabled {
  opacity: 0.6;
  cursor: progress;
}

.action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(10px);
}

.action-inner {
  display: flex;
  max-width: 960px;
  gap: 10px;
  margin: 0 auto;
}

.confirm {
  flex: 1;
  padding: 0 12px;
  white-space: nowrap;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  padding: 16px;
  place-items: center;
  background: rgb(20 12 6 / 0.55);
}

.progress-card {
  display: flex;
  width: 100%;
  max-width: 320px;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 20px;
  border-radius: 20px;
  background: var(--surface);
  text-align: center;
}

.progress-card p {
  margin: 0;
  font-weight: 700;
}

.progress-card small {
  color: var(--muted);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 5px solid var(--accent-soft);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

.bar {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 4px;
  background: var(--accent-soft);
}

.bar-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.2s ease;
}

.toast {
  position: fixed;
  right: 16px;
  bottom: calc(100px + env(safe-area-inset-bottom));
  left: 16px;
  z-index: 40;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  border-radius: 12px;
  background: #2a211b;
  color: #fff;
  font-size: 0.95rem;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .empty {
    margin-top: 32px;
    padding: 48px 20px;
  }
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
