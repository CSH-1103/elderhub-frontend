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
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="记录ID" width="80" />
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
      <el-table-column prop="escorted" label="陪同人" width="90">
        <template #default="{ row }">{{ fmtOrDash(row.escorted) }}</template>
      </el-table-column>
      <el-table-column label="审批状态" width="100">
        <template #default="{ row }">
          <StatusTag :value="row.auditStatus" :dict="AUDIT_STATUS" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            :disabled="row.auditStatus !== 0"
            @click="openAudit(row)"
          >审批</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 14px; display: flex; justify-content: flex-end">
      <Pagination v-model:page="query.pageNum" v-model:size="query.pageSize" :total="total" @change="load" />
    </div>

    <!-- 审批弹窗 -->
    <el-dialog v-model="auditVisible" title="外出审批" width="400px">
      <el-form label-width="90px">
        <el-form-item label="审批结果">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批人">
          <el-input v-model="auditForm.auditPerson" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="doAudit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Warning } from '@element-plus/icons-vue'
import { adminListOutwards, adminAuditOutward } from '@/api/outward'
import { AUDIT_STATUS } from '@/utils/constants'
import { fmtDateTime, fmtOrDash } from '@/utils/format'
import { useUserStore } from '@/stores/user'
import Pagination from '@/components/Pagination.vue'
import StatusTag from '@/components/StatusTag.vue'

const userStore = useUserStore()
const query = reactive({ customerName: '', pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)

const auditVisible = ref(false)
const auditForm = reactive({ recordId: null, auditStatus: 1, auditPerson: '' })

async function load() {
  loading.value = true
  try {
    const page = await adminListOutwards({ ...query })
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

function openAudit(row) {
  auditForm.recordId = row.id
  auditForm.auditStatus = 1
  auditForm.auditPerson = userStore.username
  auditVisible.value = true
}

async function doAudit() {
  saving.value = true
  try {
    await adminAuditOutward(auditForm.recordId, auditForm.auditStatus, auditForm.auditPerson)
    ElMessage.success('审批完成')
    auditVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
