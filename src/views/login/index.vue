<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-head">
        <el-icon :size="34" color="var(--el-color-primary)"><OfficeBuilding /></el-icon>
        <h2>颐养中心管理系统</h2>
        <p class="sub">ElderHub 养老机构综合管理平台</p>
      </div>

      <el-tabs v-model="tab" stretch>
        <!-- 登录 -->
        <el-tab-pane label="登 录" name="login">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large" @keyup.enter="doLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" clearable />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            <el-button type="primary" class="submit-btn" :loading="loading" @click="doLogin">
              登 录
            </el-button>
          </el-form>
        </el-tab-pane>

        <!-- 注册（注意：后端 register 仅写入 username/password，其他字段为空，可能受数据库非空约束限制） -->
        <el-tab-pane label="注 册" name="register">
          <el-form ref="regFormRef" :model="regForm" :rules="regRules" size="large">
            <el-form-item prop="username">
              <el-input v-model="regForm.username" placeholder="用户名" :prefix-icon="User" clearable />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="regForm.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
            </el-form-item>
            <el-form-item prop="confirm">
              <el-input v-model="regForm.confirm" type="password" placeholder="确认密码" :prefix-icon="Lock" show-password />
            </el-form-item>
            <el-button type="primary" class="submit-btn" :loading="loading" @click="doRegister">
              注 册
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login, register } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const tab = ref('login')
const loading = ref(false)
const loginFormRef = ref()
const regFormRef = ref()

const loginForm = reactive({ username: '', password: '' })
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const regForm = reactive({ username: '', password: '', confirm: '' })
const regRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 4, message: '密码至少 4 位', trigger: 'blur' }],
  confirm: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, cb) => (value === regForm.password ? cb() : cb(new Error('两次密码不一致'))),
      trigger: 'blur',
    },
  ],
}

async function doLogin() {
  await loginFormRef.value.validate()
  loading.value = true
  try {
    const data = await login({ username: loginForm.username, password: loginForm.password })
    userStore.setLogin(data)
    ElMessage.success(`欢迎，${data.username}`)
    // redirect 目标若超出当前角色权限则回退到 dashboard，避免守卫弹"无权限访问该页面"
    const target = route.query.redirect || '/dashboard'
    const resolved = router.resolve(target)
    const role = userStore.isAdmin ? 'ADMIN' : 'USER'
    if (resolved.meta?.roles && !resolved.meta.roles.includes(role)) {
      router.push('/dashboard')
    } else {
      router.push(target)
    }
  } finally {
    loading.value = false
  }
}

async function doRegister() {
  await regFormRef.value.validate()
  loading.value = true
  try {
    await register({ username: regForm.username, password: regForm.password })
    ElMessage.success('注册成功，请登录')
    loginForm.username = regForm.username
    loginForm.password = ''
    tab.value = 'login'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ecf7f5 0%, #e8f1fd 50%, #f5f7fa 100%);
}
.login-card {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 36px 32px 28px;
  box-shadow: 0 8px 30px rgba(0, 21, 41, 0.08);
}
.login-head {
  text-align: center;
  margin-bottom: 18px;
}
.login-head h2 {
  margin-top: 8px;
  color: #303133;
}
.sub {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
}
.submit-btn {
  width: 100%;
  margin-top: 4px;
}
</style>
