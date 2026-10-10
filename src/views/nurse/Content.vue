<template>
  <div class="page-card">
    <div class="table-toolbar">
      <div class="toolbar-filters">
        <el-input
          v-model="query.nursingName"
          placeholder="项目名称"
          clearable
          style="width: 160px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select v-model="query.status" placeholder="状态" clearable style="width: 130px" @change="search">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="2" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增项目</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="serial_number" label="项目编号" width="100">
        <template #default="{ row }">{{ row.serial_number || '—' }}</template>
      </el-table-column>
      <el-table-column prop="nursing_name" label="项目名称" min-width="120" />
      <el-table-column prop="service_price" label="价格(元)" width="90" />
      <el-table-column prop="execution_cycle" label="执行周期" width="90">
        <template #default="{ row }">{{ row.execution_cycle || '—' }}</template>
      </el-table-column>
      <el-table-column prop="execution_times" label="执行次数" width="90">
        <template #default="{ row }">{{ row.execution_times || '—' }}</template>
      </el-table-column>
      <el-table-column prop="message" label="项目描述" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ fmtOrDash(row.message) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <StatusTag :value="row.status" :dict="ENABLE_STATUS" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确认删除该项目？" @confirm="doRemove(row)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 14px; display: flex; justify-content: flex-end">
      <Pagination v-model:page="query.pageNum" v-model:size="query.pageSize" :total="total" @change="load" />
    </div>

    <!-- 新增/编辑弹窗（NurseContent 实体为下划线字段） -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑护理项目' : '新增护理项目'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="项目编号" prop="serial_number">
          <el-input v-model="form.serial_number" placeholder="如：HL001（留空自动生成时后端可能要求必填）" />
        </el-form-item>
        <el-form-item label="项目名称" prop="nursing_name">
          <el-input v-model="form.nursing_name" placeholder="如：晨间护理" />
        </el-form-item>
        <el-form-item label="价格(元)" prop="service_price">
          <el-input-number v-model="form.service_price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="执行周期" prop="execution_cycle">
          <el-select v-model="form.execution_cycle" style="width: 100%">
            <el-option v-for="c in ['每日', '每周', '每月', '按需']" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行次数" prop="execution_times">
          <el-input v-model="form.execution_times" placeholder="如：1次/天" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="form.message" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="doSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { listContents, saveContent, updateContent, removeContent } from '@/api/nurseContent'
import { ENABLE_STATUS } from '@/utils/constants'
import { fmtOrDash } from '@/utils/format'
import Pagination from '@/components/Pagination.vue'
import StatusTag from '@/components/StatusTag.vue'

const query = reactive({ nursingName: '', status: null, pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const emptyForm = () => ({
  serial_number: '',
  nursing_name: '',
  service_price: 0,
  execution_cycle: '每日',
  execution_times: '',
  status: 1,
  message: '',
})
const form = reactive(emptyForm())

const rules = {
  serial_number: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
  nursing_name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  service_price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    const page = await listContents({ ...query })
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
  isEdit.value = false
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    serial_number: row.serial_number,
    nursing_name: row.nursing_name,
    service_price: row.service_price,
    execution_cycle: row.execution_cycle,
    execution_times: row.execution_times,
    status: row.status,
    message: row.message,
  })
  dialogVisible.value = true
}

async function doSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isEdit.value) {
      await updateContent({ ...form })
      ElMessage.success('修改成功')
    } else {
      await saveContent({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function doRemove(row) {
  await removeContent(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>
