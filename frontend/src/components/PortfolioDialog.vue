<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { X } from '@lucide/vue'

defineProps({ title: { type: String, required: true } })
const emit = defineEmits(['close'])
const dialog = ref(null)
let previousFocus

onMounted(() => {
  previousFocus = document.activeElement
  dialog.value.showModal()
})
onUnmounted(() => previousFocus?.focus())
</script>

<template>
  <dialog
    ref="dialog"
    class="portfolio-dialog"
    aria-labelledby="dialog-title"
    @cancel.prevent="emit('close')"
    @click="
      (event) => {
        if (event.target === dialog) emit('close')
      }
    "
  >
    <div class="dialog-header">
      <p class="eyebrow">A closer look</p>
      <button class="icon-button" aria-label="Close dialog" title="Close" @click="emit('close')">
        <X :size="22" />
      </button>
    </div>
    <h2 id="dialog-title">{{ title }}</h2>
    <slot />
  </dialog>
</template>
