<template>
  <el-aside width="220px" class="sidebar">
    <div class="logo">
      <el-icon :size="22" color="var(--el-color-primary)"><OfficeBuilding /></el-icon>
      <span class="logo-title">颐养中心</span>
    </div>
    <el-scrollbar>
      <el-menu
        router
        :default-active="$route.path"
        class="sidebar-menu"
        background-color="#ffffff"
        text-color="#303133"
        active-text-color="var(--el-color-primary)"
      >
        <template v-for="menu in menus" :key="menu.title">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="menu.children && menu.children.length" :index="menu.title">
            <template #title>
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path">
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <!-- 一级菜单 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon><component :is="menu.icon" /></el-icon>
            <template #title>{{ menu.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { menusForRole } from '@/config/menu'

const userStore = useUserStore()
const menus = computed(() => menusForRole(userStore.role))
</script>

<style scoped>
.sidebar {
  background: #fff;
  border-right: 1px solid #eef0f4;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid #eef0f4;
}
.logo-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
  letter-spacing: 2px;
}
.sidebar-menu {
  border-right: none;
}
</style>
