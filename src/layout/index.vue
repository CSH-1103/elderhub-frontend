<template>
  <el-container class="layout">
    <Sidebar />
    <el-container direction="vertical">
      <Navbar />
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
</script>

<style scoped>
.layout {
  height: 100%;
}
.layout-main {
  background: #f5f7fa;
  padding: 16px;
  overflow-y: auto;
}
</style>
