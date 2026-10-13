<template>
  <div class="page-card">
    <div class="table-toolbar">
      <div class="toolbar-filters">
        <el-input
          v-model="query.customerId"
          placeholder="客户ID"
          clearable
          style="width: 140px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增饮食喜好</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="customer_id" label="客户ID" width="90" />
      <el-table-column prop="preferences" label="饮食喜好" min-width="140">
        <template #default="{ row }">{{ row.preferences || '—' }}</template>
      </el-table-column>
      <el-table-column prop="attention" label="忌口注意事项" min-width="160">
        <template #default="{ row }">{{ row.attention || '—' }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.remark || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确认删除？" @confirm="doRemove(row)">
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

    <!-- 新增/编辑 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑饮食喜好' : '新增饮食喜好'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="客户ID" prop="customer_id">
          <el-input-number v-model="form.customer_id" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="饮食喜好" prop="preferences">
          <el-input v-model="form.preferences" placeholder="如：喜欢清淡、偏好面食" />
        </el-form-item>
        <el-form-item label="忌口注意事项" prop="attention">
          <el-input v-model="form.attention" type="textarea" :rows="2" placeholder="如：花生过敏、忌辛辣、忌海鲜" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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
import {
  listPreferences,
  savePreference,
  updatePreference,
  removePreference,
} from '@/api/food'
import Pagination from '@/components/Pagination.vue'

const query = reactive({ customerId: null, pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const saving = ref(false)

const emptyForm = () => ({ id: null, customer_id: null, preferences: '', attention: '', remark: '' })
const form = reactive(emptyForm())
const rules = {
  customer_id: [{ required: true, message: '请输入客户ID', trigger: 'blur' }],
  attention: [{ required: true, message: '请填写忌口注意事项', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    const page = await listPreferences({ ...query })
    list.value = page.list
    total.value = page.total
  } catch {
    /* axios 拦截器已弹 ElMessage.error */
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
  Object.assign(form, { ...emptyForm(), ...row })
  dialogVisible.value = true
}
async function doSave() {
  await formRef.value.validate().catch(() => { throw new Error('validate') })
  saving.value = true
  try {
    if (isEdit.value) {
      await updatePreference({ ...form })
      ElMessage.success('修改成功')
    } else {
      await savePreference({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    load()
  } catch (e) {
    // validate 失败或 axios 已弹过提示
  } finally {
    saving.value = false
  }
}
async function doRemove(row) {
  try {
    await removePreference(row.id)
    ElMessage.success('已删除')
    load()
  } catch {
    /* axios 拦截器已弹提示 */
  }
}

onMounted(load)
</script>
