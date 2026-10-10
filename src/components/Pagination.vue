<template>
  <el-pagination
    :current-page="page"
    :page-size="size"
    :page-sizes="[10, 20, 50]"
    :total="total"
    layout="total, sizes, prev, pager, next, jumper"
    background
    @current-change="emit('update:page', $event)"
    @size-change="onSizeChange"
  />
</template>

<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  size: { type: Number, required: true },
  total: { type: Number, default: 0 },
})
const emit = defineEmits(['update:page', 'update:size', 'change'])

function onSizeChange(size) {
  emit('update:size', size)
  emit('update:page', 1)
  emit('change')
}
</script>
