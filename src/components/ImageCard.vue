<script setup>
import { computed } from 'vue'
import { planPage } from '../utils/layout'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
})

defineEmits(['rotate', 'remove'])

// True when this image will be turned upright automatically while building the PDF
const autoTurn = computed(() => planPage(props.item.width, props.item.height, props.item.rotation).autoTurn)
</script>

<template>
  <article class="card" @contextmenu.prevent>
    <div class="thumb">
      <img
        :src="item.thumbUrl"
        :alt="`第 ${index + 1} 張：${item.name}`"
        draggable="false"
        :style="{ transform: `rotate(${item.rotation}deg)` }"
      >
      <span class="badge">{{ index + 1 }}</span>
      <span v-if="autoTurn" class="chip">轉成直式</span>
    </div>
    <div class="actions">
      <button class="card-btn" type="button" aria-label="旋轉這張圖片" @click="$emit('rotate')">
        <AppIcon name="rotate" />
        旋轉
      </button>
      <button class="card-btn card-btn-danger" type="button" aria-label="刪除這張圖片" @click="$emit('remove')">
        <AppIcon name="trash" />
        刪除
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow);
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.thumb {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--thumb-bg);
}

.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  transition: transform 0.25s ease;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  display: grid;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  place-items: center;
  border-radius: 14px;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 0.9rem;
  font-weight: 700;
}

.chip {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgb(0 0 0 / 0.6);
  color: #fff;
  font-size: 0.75rem;
}

.actions {
  display: flex;
  border-top: 1px solid var(--border);
}

.card-btn {
  display: flex;
  flex: 1;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  touch-action: manipulation;
}

.card-btn + .card-btn {
  border-left: 1px solid var(--border);
}

.card-btn:active {
  background: var(--accent-soft);
}

.card-btn-danger {
  color: var(--danger);
}
</style>
