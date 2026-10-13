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
      <el-button type="primary" :icon="Plus" @click="openAdd">新增外出登记</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="记录ID" width="90" />
      <el-table-column label="客户姓名" min-width="100">
        <template #default="{ row }">{{ row.customerName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="outgoingReason" label="外出事由" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ fmtOrDash(row.outgoingReason) }}</template>
      </el-table-column>
      <el-table-column label="外出时间" width="150">
        <template #default="{ row }">{{ fmtDateTime(row.outgoingTime) }}</template>
      </el-table-column>
      <el-table-column label="预计回院" width="150">
        <template #default="{ row }">{{ fmtDateTime(row.expectedReturnTime) }}</template>
      </el-table-column>
      <el-table-column label="实际回院" width="150">
        <template #default="{ row }">{{ fmtDateTime(row.actualReturnTime) }}</template>
      </el-table-column>
      <el-table-column label="审批状态" width="100">
        <template #default="{ row }">
          <StatusTag :value="row.auditStatus" :dict="AUDIT_STATUS" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="success"
            :disabled="row.auditStatus !== 1 || row.actualReturnTime"
            @click="doReturn(row)"
          >登记回院</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 14px; display: flex; justify-content: flex-end">
      <Pagination v-model:page="query.pageNum" v-model:size="query.pageSize" :total="total" @change="load" />
    </div>

    <!-- 新增外出登记 -->
    <el-dialog v-model="addVisible" title="新增外出登记" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customerId">
          <CustomerPicker v-model="form.customerId" source="live" />
        </el-form-item>
        <el-form-item label="外出事由" prop="outgoingReason">
          <el-input v-model="form.outgoingReason" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="外出时间" prop="outgoingTime">
          <el-date-picker v-model="form.outgoingTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预计回院" prop="expectedReturnTime">
          <el-date-picker v-model="form.expectedReturnTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="陪同人">
              <el-input v-model="form.escorted" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="与客户关系">
              <el-input v-model="form.relation" placeholder="如：之子" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="陪同人电话">
              <el-input v-model="form.escortedTel" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { nurseListOutwards, nurseSaveOutward, nurseReturnOutward } from '@/api/outward'
import { useUserStore } from '@/stores/user'
import { AUDIT_STATUS } from '@/utils/constants'
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
  outgoingReason: '',
  outgoingTime: '',
  expectedReturnTime: '',
  escorted: '',
  relation: '',
  escortedTel: '',
  remarks: '',
})
const form = reactive(emptyForm())

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  outgoingReason: [{ required: true, message: '请填写外出事由', trigger: 'blur' }],
  outgoingTime: [{ required: true, message: '请选择外出时间', trigger: 'change' }],
  expectedReturnTime: [{ required: true, message: '请选择预计回院时间', trigger: 'change' }],
}

async function load() {
  loading.value = true
  try {
    const page = await nurseListOutwards({ ...query, userId: userStore.userId })
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
    await nurseSaveOutward({ ...form })
    ElMessage.success('登记成功，等待管理员审批')
    addVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function doReturn(row) {
  await ElMessageBox.confirm('确认登记该客户回院？', '登记回院')
  await nurseReturnOutward(row.id)
  ElMessage.success('已登记回院')
  load()
}

onMounted(load)
</script>
