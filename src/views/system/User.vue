<template>
  <div class="page-card">
    <div class="table-toolbar">
      <div class="toolbar-filters">
        <el-input
          v-model="query.nickname"
          placeholder="姓名"
          clearable
          style="width: 160px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select v-model="query.roleId" placeholder="角色" clearable style="width: 140px" @change="search">
          <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增用户</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="nickname" label="姓名" min-width="100" />
      <el-table-column prop="username" label="账号" min-width="110" />
      <el-table-column label="性别" width="80">
        <template #default="{ row }">
          <StatusTag :value="row.sex" :dict="USER_SEX" />
        </template>
      </el-table-column>
      <el-table-column prop="roleName" label="角色" width="110">
        <template #default="{ row }">{{ row.roleName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="150">
        <template #default="{ row }">{{ fmtOrDash(row.email) }}</template>
      </el-table-column>
      <el-table-column prop="phoneNumber" label="电话" width="130">
        <template #default="{ row }">{{ fmtOrDash(row.phoneNumber) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">{{ fmtDateTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-popconfirm title="确认删除该用户？" @confirm="doRemove(row)">
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="姓名" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <template v-if="!isEdit">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="留空默认手机号后6位" />
          </el-form-item>
        </template>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" style="width: 100%">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phoneNumber" maxlength="11" />
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
import { listUsers, saveUser, updateUser, removeUser } from '@/api/user'
import { listRoles } from '@/api/role'
import { USER_SEX } from '@/utils/constants'
import { fmtDateTime, fmtOrDash } from '@/utils/format'
import Pagination from '@/components/Pagination.vue'
import StatusTag from '@/components/StatusTag.vue'

const query = reactive({ nickname: '', roleId: null, pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const roles = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const form = reactive({ id: null, nickname: '', username: '', password: '', sex: 1, roleId: null, email: '', phoneNumber: '' })

const rules = {
  nickname: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  // 密码非必填：留空时后端默认手机号后6位
  password: [],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function load() {
  loading.value = true
  try {
    const page = await listUsers({ ...query })
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
  Object.assign(form, { id: null, nickname: '', username: '', password: '', sex: 1, roleId: null, email: '', phoneNumber: '' })
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    nickname: row.nickname,
    username: row.username,
    password: '',
    sex: row.sex,
    roleId: row.roleId,
    email: row.email,
    phoneNumber: row.phoneNumber,
  })
  dialogVisible.value = true
}

async function doSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isEdit.value) {
      // 后端 UserUpdateDTO 不含 username/password
      await updateUser({
        id: form.id,
        nickname: form.nickname,
        email: form.email,
        phoneNumber: form.phoneNumber,
        sex: form.sex,
        roleId: form.roleId,
      })
      ElMessage.success('修改成功')
    } else {
      await saveUser({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function doRemove(row) {
  await removeUser(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(async () => {
  load()
  roles.value = (await listRoles()) || []
})
</script>
