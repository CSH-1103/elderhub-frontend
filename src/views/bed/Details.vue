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
        <el-input
          v-model="query.roomNo"
          placeholder="房间号"
          clearable
          style="width: 120px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-date-picker
          v-model="query.startDate"
          type="date"
          placeholder="入住日期"
          value-format="YYYY-MM-DD"
          style="width: 150px"
        />
        <el-select v-model="query.status" style="width: 130px" @change="search">
          <el-option label="正在使用" :value="1" />
          <el-option label="使用历史" :value="2" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="customerName" label="客户姓名" min-width="100">
        <template #default="{ row }">{{ row.customerName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="bedNo" label="床位" width="100" />
      <el-table-column prop="roomNo" label="房间号" width="90" />
      <el-table-column label="入住日期" width="110">
        <template #default="{ row }">{{ fmtDate(row.startDate) }}</template>
      </el-table-column>
      <el-table-column label="到期日期" width="110">
        <template #default="{ row }">{{ fmtDate(row.endDate) }}</template>
      </el-table-column>
      <el-table-column prop="bedDetails" label="备注" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ fmtOrDash(row.bedDetails) }}</template>
      </el-table-column>
      <el-table-column prop="statusMsg" label="状态" width="100" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEndDate(row)">改到期日</el-button>
          <el-button
            v-if="row.status === 1"
            link
            type="warning"
            @click="openTransfer(row)"
          >调换床位</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 14px; display: flex; justify-content: flex-end">
      <Pagination
        v-model:page="query.pageNum"
        v-model:size="query.pageSize"
        :total="total"
        @change="load"
      />
    </div>

    <!-- 修改到期日 -->
    <el-dialog v-model="endDateVisible" title="修改到期日期" width="380px">
      <el-date-picker
        v-model="endDateValue"
        type="date"
        placeholder="选择新到期日期"
        value-format="YYYY-MM-DD"
        style="width: 100%"
      />
      <template #footer>
        <el-button @click="endDateVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="doUpdateEndDate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 调换床位 -->
    <el-dialog v-model="transferVisible" title="调换床位" width="440px">
      <el-descriptions :column="1" border size="small" style="margin-bottom: 14px">
        <el-descriptions-item label="客户">{{ current.customerName }}（ID:{{ current.customerId }}）</el-descriptions-item>
        <el-descriptions-item label="当前床位">{{ current.bedNo }}（{{ current.roomNo }} 房）</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="80px">
        <el-form-item label="目标床位">
          <RoomBedPicker v-model:room-no="target.roomNo" v-model:bed-id="target.newBedId" />
        </el-form-item>
        <el-form-item label="调换说明">
          <el-input v-model="target.bedDetails" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!target.newBedId" :loading="saving" @click="doTransfer">
          确认调换
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { listDetails, updateDetails, transferBed } from '@/api/bed'
import { fmtDate, fmtOrDash } from '@/utils/format'
import Pagination from '@/components/Pagination.vue'
import RoomBedPicker from '@/components/RoomBedPicker.vue'

const query = reactive({ customerName: '', roomNo: '', startDate: '', status: 1, pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)

// 改到期日
const endDateVisible = ref(false)
const endDateValue = ref('')
let endDateId = null

// 调床
const transferVisible = ref(false)
const current = ref({})
const target = ref({ roomNo: null, newBedId: null, bedDetails: '' })

async function load() {
  loading.value = true
  try {
    const page = await listDetails({ ...query })
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

function openEndDate(row) {
  endDateId = row.id
  endDateValue.value = row.endDate ? fmtDate(row.endDate) : ''
  endDateVisible.value = true
}

async function doUpdateEndDate() {
  saving.value = true
  try {
    await updateDetails(endDateId, endDateValue.value)
    ElMessage.success('修改成功')
    endDateVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

function openTransfer(row) {
  current.value = row
  transferVisible.value = true
}

async function doTransfer() {
  saving.value = true
  try {
    await transferBed({
      customerId: current.value.customerId,
      oldBedId: current.value.bedId,
      newBedId: target.value.newBedId,
      bedDetails: target.value.bedDetails,
    })
    ElMessage.success('调换成功')
    transferVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

watch(transferVisible, (v) => {
  if (v) target.value = { roomNo: null, newBedId: null, bedDetails: '' }
})

onMounted(load)
</script>
