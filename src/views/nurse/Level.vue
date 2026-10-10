<template>
  <div class="page-card">
    <div class="table-toolbar">
      <div class="toolbar-filters">
        <el-select v-model="query.levelStatus" placeholder="状态" clearable style="width: 130px" @change="search">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="2" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增级别</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="level_name" label="级别名称" min-width="140" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            :model-value="row.level_status === 1"
            inline-prompt
            active-text="启用"
            inactive-text="停用"
            @change="(v) => toggleStatus(row, v)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">{{ fmtDateTime(row.create_time) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openItems(row)">配置项目</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 14px; display: flex; justify-content: flex-end">
      <Pagination v-model:page="query.pageNum" v-model:size="query.pageSize" :total="total" @change="load" />
    </div>

    <!-- 新增级别 -->
    <el-dialog v-model="addVisible" title="新增护理级别" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="级别名称" prop="level_name">
          <el-input v-model="form.level_name" placeholder="如：一级护理" />
        </el-form-item>
        <el-form-item label="状态" prop="level_status">
          <el-radio-group v-model="form.level_status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="doAdd">保存</el-button>
      </template>
    </el-dialog>

    <!-- 配置项目抽屉 -->
    <el-drawer v-model="drawerVisible" :title="`配置护理项目 - ${current.level_name || ''}`" size="480px">
      <div class="table-toolbar">
        <span>从下方选择项目加入该级别</span>
        <el-select
          v-model="pickItemId"
          placeholder="选择护理项目"
          filterable
          style="width: 220px"
        >
          <el-option
            v-for="c in allContents"
            :key="c.id"
            :label="`${c.nursing_name}（${c.serial_number || c.id}）`"
            :value="c.id"
            :disabled="levelItemIds.has(c.id)"
          />
        </el-select>
        <el-button type="primary" :disabled="!pickItemId" :loading="saving" @click="doAddItem">添加</el-button>
      </div>

      <el-table v-loading="itemsLoading" :data="levelItems" border size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="nursing_name" label="项目名称" min-width="110" />
        <el-table-column prop="service_price" label="价格" width="80" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="doRemoveItem(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { listLevels, saveLevel, updateLevelStatus, listLevelItems, saveLevelItem, removeLevelItem } from '@/api/nurseLevel'
import { listContents } from '@/api/nurseContent'
import { fmtDateTime } from '@/utils/format'
import Pagination from '@/components/Pagination.vue'

const query = reactive({ levelStatus: null, pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)

// 新增
const addVisible = ref(false)
const formRef = ref()
const form = reactive({ level_name: '', level_status: 1 })
const rules = {
  level_name: [{ required: true, message: '请输入级别名称', trigger: 'blur' }],
  level_status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 配置项目
const drawerVisible = ref(false)
const current = ref({})
const levelItems = ref([])
const itemsLoading = ref(false)
const allContents = ref([])
const pickItemId = ref(null)
const levelItemIds = computed(() => new Set(levelItems.value.map((i) => i.id)))

async function load() {
  loading.value = true
  try {
    const page = await listLevels({ ...query })
    list.value = page.list
    total.value = page.total
  } finally {
    loading.value = false
  }
}

function search() {
  query.pageNum = 1
  load()
}

function openAdd() {
  Object.assign(form, { level_name: '', level_status: 1 })
  addVisible.value = true
}

async function doAdd() {
  await formRef.value.validate()
  saving.value = true
  try {
    await saveLevel({ level_name: form.level_name, level_status: form.level_status })
    ElMessage.success('新增成功')
    addVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row, enabled) {
  const target = enabled ? 1 : 2
  await updateLevelStatus(row.id, target)
  row.level_status = target
  ElMessage.success(enabled ? '已启用' : '已停用')
}

async function openItems(row) {
  current.value = row
  drawerVisible.value = true
  itemsLoading.value = true
  pickItemId.value = null
  try {
    levelItems.value = (await listLevelItems(row.id)) || []
    allContents.value = (await listContents({ pageNum: 1, pageSize: 500 }))?.list || []
  } finally {
    itemsLoading.value = false
  }
}

async function doAddItem() {
  saving.value = true
  try {
    await saveLevelItem(current.value.id, pickItemId.value)
    ElMessage.success('已添加')
    pickItemId.value = null
    levelItems.value = (await listLevelItems(current.value.id)) || []
  } finally {
    saving.value = false
  }
}

async function doRemoveItem(row) {
  await ElMessageBox.confirm(`确认从该级别移除项目「${row.nursing_name}」？`, '移除项目')
  await removeLevelItem(current.value.id, row.id)
  ElMessage.success('已移除')
  levelItems.value = (await listLevelItems(current.value.id)) || []
}

onMounted(load)
</script>
