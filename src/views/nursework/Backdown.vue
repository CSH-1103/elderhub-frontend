<template>
  <div class="page-card">
    <div class="table-toolbar">
      <div class="toolbar-filters">
        <el-input
          v-model="query.customerName"
          placeholder="客户姓名"
          clearable
          style="width: 160px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增退住申请</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="customerId" label="客户ID" width="90" />
      <el-table-column prop="customerName" label="客户姓名" min-width="100">
        <template #default="{ row }">{{ row.customerName || '—' }}</template>
      </el-table-column>
      <el-table-column label="退住类型" width="110">
        <template #default="{ row }">
          <StatusTag :value="row.retreatType" :dict="RETREAT_TYPE" />
        </template>
      </el-table-column>
      <el-table-column prop="retreatReason" label="退住原因" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ fmtOrDash(row.retreatReason) }}</template>
      </el-table-column>
      <el-table-column label="退住时间" width="150">
        <template #default="{ row }">{{ fmtDateTime(row.retreatTime) }}</template>
      </el-table-column>
      <el-table-column label="审批状态" width="100">
        <template #default="{ row }">
          <StatusTag :value="row.auditStatus" :dict="AUDIT_STATUS" />
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 14px; display: flex; justify-content: flex-end">
      <Pagination v-model:page="query.pageNum" v-model:size="query.pageSize" :total="total" @change="load" />
    </div>

    <!-- 新增退住申请 -->
    <el-dialog v-model="addVisible" title="新增退住申请" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customerId">
          <CustomerPicker v-model="form.customerId" source="live" :apply-type="1" />
        </el-form-item>
        <el-form-item label="退住类型" prop="retreatType">
          <el-radio-group v-model="form.retreatType">
            <el-radio :value="0">正常退住</el-radio>
            <el-radio :value="1">死亡退住</el-radio>
            <el-radio :value="2">保留床位</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退住时间" prop="retreatTime">
          <el-date-picker v-model="form.retreatTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="退住原因" prop="retreatReason">
          <el-input v-model="form.retreatReason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="doSave">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { nurseListBackDowns, nurseSaveBackDown } from '@/api/backdown'
import { useUserStore } from '@/stores/user'
import { AUDIT_STATUS, RETREAT_TYPE } from '@/utils/constants'
import { fmtDateTime, fmtOrDash } from '@/utils/format'
import Pagination from '@/components/Pagination.vue'
import StatusTag from '@/components/StatusTag.vue'
import CustomerPicker from '@/components/CustomerPicker.vue'

const userStore = useUserStore()
const query = reactive({ customerName: '', pageNum: 1, pageSize: 10, userId: null })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)

const addVisible = ref(false)
const formRef = ref()
const emptyForm = () => ({
  customerId: null,
  retreatType: 0,
  retreatTime: '',
  retreatReason: '',
  remarks: '',
})
const form = reactive(emptyForm())

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  retreatType: [{ required: true, message: '请选择退住类型', trigger: 'change' }],
  retreatTime: [{ required: true, message: '请选择退住时间', trigger: 'change' }],
  retreatReason: [{ required: true, message: '请填写退住原因', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    const page = await nurseListBackDowns({ ...query, userId: userStore.userId })
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
  Object.assign(form, emptyForm())
  addVisible.value = true
}

async function doSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    await nurseSaveBackDown({ ...form })
    ElMessage.success('申请已提交，等待管理员审批')
    addVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
