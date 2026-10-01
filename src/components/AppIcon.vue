<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
})

const PATHS = {
  plus: ['M12 5v14', 'M5 12h14'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13', 'M10 11v6', 'M14 11v6'],
  rotate: ['M20 12a8 8 0 1 1-2.6-5.9', 'M20 4v5h-5'],
  image: ['M4 5h16v14H4z', 'M4 17l5-5 4 4 3-3 4 4', 'M9 9.5h.01'],
  check: ['M5 12.5l4.5 4.5L19 7'],
  file: ['M7 3h7l5 5v13H7z', 'M14 3v5h5'],
  download: ['M12 4v11', 'M7 11l5 5 5-5', 'M5 20h14'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v6H4V6h6'],
}

const paths = computed(() => PATHS[props.name] ?? [])
</script>

<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in paths" :key="d" :d="d" />
  </svg>
</template>

<style scoped>
.icon {
  width: 1.25em;
  height: 1.25em;
  flex: none;
}
</style>
