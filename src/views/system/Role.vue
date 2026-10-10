<template>
  <div class="page-card">
    <div class="table-toolbar">
      <span class="tip">角色列表由后端维护（当前仅提供查询接口）</span>
      <el-button :icon="Refresh" @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" min-width="140" />
      <el-table-column label="说明" min-width="200">
        <template #default="{ row }">
          {{ row.id === 1 ? '系统管理员，拥有全部权限' : row.id === 2 ? '健康管家，负责在住老人的日常护理' : '—' }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { listRoles } from '@/api/role'

const list = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    list.value = (await listRoles()) || []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.tip {
  color: #909399;
  font-size: 13px;
}
</style>
