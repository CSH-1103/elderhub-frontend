<template>
  <el-select
    :model-value="modelValue"
    placeholder="请选择客户"
    filterable
    :loading="loading"
    style="width: 100%"
    @change="emit('update:modelValue', $event)"
  >
    <el-option
      v-for="c in customers"
      :key="c.id"
      :label="c.customer_name ? `${c.customer_name}（ID:${c.id}）` : `ID:${c.id}`"
      :value="c.id"
    />
  </el-select>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listNoNurse } from '@/api/customer'
import { listDetails } from '@/api/bed'

/**
 * 客户下拉选择器
 * source: 'no-nurse' 无管家客户池（默认）| 'live' 在住客户（床位使用详情 status=1）
 * v-model:modelValue = customerId
 */
const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  source: { type: String, default: 'no-nurse' },
})
const emit = defineEmits(['update:modelValue'])

const customers = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    if (props.source === 'live') {
      const page = await listDetails({ status: 1, pageNum: 1, pageSize: 500 })
      customers.value = page.list
    } else {
      customers.value = (await listNoNurse()) || []
    }
  } finally {
    loading.value = false
  }
})
</script>
