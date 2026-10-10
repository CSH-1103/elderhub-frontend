<template>
  <div class="page-card">
    <div class="table-toolbar">
      <div class="toolbar-filters">
        <CustomerPicker v-model="customerId" source="live" style="width: 260px" />
        <el-button type="primary" :icon="Search" :disabled="!customerId" @click="load">
          查询记录
        </el-button>
      </div>
    </div>

    <el-empty v-if="!customerId" description="请先选择客户后查询护理记录" />

    <template v-else>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nursingName" label="护理项目" min-width="120">
          <template #default="{ row }">{{ row.nursingName || '—' }}</template>
        </el-table-column>
        <el-table-column prop="nursingContent" label="护理内容" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ fmtOrDash(row.nursingContent) }}</template>
        </el-table-column>
        <el-table-column label="执行时间" width="160">
          <template #default="{ row }">{{ fmtDateTime(row.nursingTime) }}</template>
        </el-table-column>
        <el-table-column prop="nursingCount" label="次数" width="80" />
        <el-table-column prop="userId" label="护理人ID" width="90" />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-popconfirm title="确认删除该记录？" @confirm="doRemove(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { adminListRecords, adminRemoveRecord } from '@/api/nurseRecord'
import { fmtDateTime, fmtOrDash } from '@/utils/format'
import CustomerPicker from '@/components/CustomerPicker.vue'

const route = useRoute()
const customerId = ref(route.query.customerId ? Number(route.query.customerId) : null)
const list = ref([])
const loading = ref(false)

async function load() {
  if (!customerId.value) return
  loading.value = true
  try {
    list.value = (await adminListRecords(customerId.value)) || []
  } finally {
    loading.value = false
  }
}

async function doRemove(row) {
  await adminRemoveRecord(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(() => {
  if (customerId.value) load()
})
</script>
