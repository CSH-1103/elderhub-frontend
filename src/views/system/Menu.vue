<template>
  <div class="page-card">
    <div class="table-toolbar">
      <span class="tip">
        后端 menu 表当前无初始数据，系统实际使用前端静态菜单（src/config/menu.js）。
        下表展示后端 /admin/menu/tree 的原始数据。
      </span>
      <el-button :icon="Refresh" @click="load">刷新</el-button>
    </div>
    <el-empty v-if="!loading && list.length === 0" description="后端菜单表为空，前端正在使用静态菜单" />
    <el-table v-else v-loading="loading" :data="list" row-key="id" border default-expand-all>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="菜单标题" min-width="140" />
      <el-table-column prop="icon" label="图标" width="120">
        <template #default="{ row }">{{ row.icon || '—' }}</template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" min-width="140">
        <template #default="{ row }">{{ row.path || '—' }}</template>
      </el-table-column>
      <el-table-column prop="menus_index" label="菜单索引" width="100">
        <template #default="{ row }">{{ row.menus_index || '—' }}</template>
      </el-table-column>
      <el-table-column prop="parent_id" label="父菜单ID" width="100" />
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { listMenuTree } from '@/api/role'

const list = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    list.value = (await listMenuTree()) || []
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
