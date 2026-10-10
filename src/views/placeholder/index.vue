<template>
  <div class="page-card placeholder">
    <el-empty :description="`${$route.meta.title} 模块建设中`">
      <template #image>
        <el-icon :size="72" color="#c3e5df"><Food /></el-icon>
      </template>
      <p class="desc">
        后端 Food / Meal / CustomerPreference 服务层已就绪，Controller 尚未开发，
        接口就绪后本页面将立即接入。
      </p>
    </el-empty>
  </div>
</template>

<script setup>
</script>

<style scoped>
.placeholder {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.desc {
  color: #909399;
  font-size: 13px;
  max-width: 360px;
  margin: 0 auto;
}
</style>
