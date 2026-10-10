<template>
  <el-header class="navbar">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="navbar-right">
      <el-tag :type="userStore.isAdmin ? 'danger' : 'primary'" size="small" effect="light">
        {{ userStore.isAdmin ? '管理员' : '健康管家' }}
      </el-tag>
      <el-dropdown trigger="click" @command="onCommand">
        <span class="user-info">
          <el-icon><UserFilled /></el-icon>
          {{ userStore.username }}
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

async function onCommand(command) {
  if (command === 'logout') {
    await userStore.logout()
    router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
  }
}
</script>

<style scoped>
.navbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #303133;
  outline: none;
}
</style>
