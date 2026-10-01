<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import AppIcon from './AppIcon.vue'

defineProps({
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  pages: { type: Number, required: true },
  sizeText: { type: String, required: true },
  autoOpened: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <div class="done-mark"><AppIcon name="check" /></div>
      <h2 id="result-title">PDF 完成了</h2>
      <p class="meta">共 {{ pages }} 頁 · A4 · {{ sizeText }}</p>
      <p class="note">
        {{ autoOpened ? '已經幫你開在新的分頁了。想再看一次，按下面的按鈕。' : '瀏覽器擋住了自動開啟，請按下面的按鈕來看 PDF。' }}
      </p>

      <a class="btn btn-primary btn-xl" :href="url" target="_blank" rel="noopener">
        <AppIcon name="external" />
        開啟 PDF
      </a>
      <a class="btn btn-secondary" :href="url" :download="fileName">
        <AppIcon name="download" />
        下載到手機
      </a>
      <button class="btn btn-text" type="button" @click="emit('close')">回去繼續編輯</button>
    </section>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(20 12 6 / 0.5);
}

.sheet {
  display: flex;
  width: 100%;
  max-width: 480px;
  flex-direction: column;
  gap: 12px;
  padding: 28px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: var(--surface);
  text-align: center;
  animation: rise 0.25s ease-out;
}

.done-mark {
  display: grid;
  width: 56px;
  height: 56px;
  margin: 0 auto;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--primary);
  font-size: 1.6rem;
}

h2 {
  margin: 4px 0 0;
  font-size: 1.5rem;
}

.meta {
  margin: 0;
  color: var(--muted);
}

.note {
  margin: 0 0 8px;
  line-height: 1.6;
}

@keyframes rise {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
}

@media (min-width: 600px) {
  .backdrop {
    align-items: center;
  }

  .sheet {
    border-radius: 24px;
  }
}
</style>
