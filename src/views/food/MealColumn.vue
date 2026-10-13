<template>
  <div class="page-card meal-column">
    <!-- 栏目标题 -->
    <div class="meal-header">
      <el-icon :size="22" :color="headerColor">
        <component :is="icon" />
      </el-icon>
      <span class="meal-title">{{ title }}</span>
      <span class="meal-count">{{ meals.length }} 道</span>
    </div>

    <!-- 菜品列表 -->
    <div v-loading="loading" class="meal-list">
      <el-empty v-if="!loading && meals.length === 0" description="暂无菜品" />

      <div
        v-for="dish in meals"
        :key="dish.id"
        class="dish-item"
        :class="{ 'dish-conflict': getConflicts(dish).length > 0 }"
      >
        <div class="dish-main">
          <span class="dish-name">{{ dish.name }}</span>
          <span class="dish-price">¥{{ dish.price }}</span>
        </div>

        <!-- 营养标签 -->
        <div class="dish-tags" v-if="dish.nutrient_tags && dish.nutrient_tags.length">
          <el-tag
            v-for="tag in dish.nutrient_tags"
            :key="tag"
            size="small"
            effect="plain"
            class="nutrient-tag"
          >
            {{ tagLabel(tag) }}
          </el-tag>
        </div>

        <!-- 冲突提示 -->
        <div v-if="getConflicts(dish).length > 0" class="conflict-bar">
          <el-icon :size="14" color="#f56c6c"><Warning /></el-icon>
          <span class="conflict-text">
            与客户忌口冲突：{{ getConflicts(dish).join('、') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { checkConflict, NUTRIENT_TAGS } from '@/api/food'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'Sunny' },
  meals: { type: Array, default: () => [] },
  preference: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

// 栏目对应的主题色
const headerColor = computed(() => {
  switch (props.title) {
    case '早餐':
      return '#e6a23c' // 暖橙
    case '午餐':
      return '#2f9e8f' // 主色青绿
    case '晚餐':
      return '#7b61ff' // 柔和紫
    default:
      return '#2f9e8f'
  }
})

// 冲突检测（纯函数，直接调用即可）
function getConflicts(dish) {
  if (!props.preference) return []
  return checkConflict(dish, props.preference)
}

// 营养标签编码 -> 中文
function tagLabel(tag) {
  return NUTRIENT_TAGS[tag] || tag
}
</script>

<style scoped>
.meal-column {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}
.meal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}
.meal-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.meal-count {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}
.meal-list {
  flex: 1;
}
.dish-item {
  padding: 12px 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafbfc;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.dish-item:hover {
  background: #f5f9f8;
  border-color: #d9efeb;
}
/* 冲突样式 */
.dish-conflict {
  background: #fef0f0 !important;
  border-color: #fbc4c4 !important;
}
.dish-conflict .dish-name {
  color: #f56c6c;
  font-weight: 600;
}
.dish-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.dish-name {
  font-size: 14px;
  color: #303133;
}
.dish-price {
  font-size: 14px;
  color: #2f9e8f;
  font-weight: 500;
}
.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.nutrient-tag {
  border-radius: 10px;
}
.conflict-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #fbc4c4;
}
.conflict-text {
  font-size: 12px;
  color: #f56c6c;
}
</style>
