<template>
  <el-tag v-if="meta" :type="meta.type" effect="light">{{ meta.label }}</el-tag>
  <span v-else>—</span>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 状态标签：dict 形如 { 1: { label, type } }
 */
const props = defineProps({
  value: { type: [Number, String], default: null },
  dict: { type: Object, required: true },
})

const meta = computed(() => props.dict[props.value] || null)
</script>
