<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col v-for="card in cards" :key="card.label" :span="6">
        <div class="stat-card page-card">
          <div class="stat-icon" :style="{ background: card.bg, color: card.color }">
            <el-icon :size="26"><component :is="card.icon" /></el-icon>
          </div>
          <div>
            <div class="stat-value">{{ stat[card.key] ?? '—' }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 占用率 -->
    <div class="page-card" style="margin-top: 16px">
      <h3 class="block-title">床位使用情况</h3>
      <el-row :gutter="40">
        <el-col :span="10">
          <div class="progress-row">
            <span class="progress-label">入住率</span>
            <el-progress
              :percentage="occupancyRate"
              :stroke-width="18"
              :text-inside="true"
              status="success"
            />
            <span class="progress-desc">{{ stat.occupiedBeds ?? 0 }} / {{ stat.totalBeds ?? 0 }} 张</span>
          </div>
          <div class="progress-row">
            <span class="progress-label">外出率</span>
            <el-progress
              :percentage="awayRate"
              :stroke-width="18"
              :text-inside="true"
              color="#e6a23c"
            />
            <span class="progress-desc">{{ stat.awayBeds ?? 0 }} / {{ stat.totalBeds ?? 0 }} 张</span>
          </div>
        </el-col>
        <el-col :span="14">
          <!-- 快捷入口 -->
          <h3 class="block-title">快捷入口</h3>
          <div class="quick-links">
            <template v-for="link in quickLinks" :key="link.path">
              <div class="quick-item" @click="$router.push(link.path)">
                <el-icon :size="20" color="var(--el-color-primary)"><component :is="link.icon" /></el-icon>
                <span>{{ link.title }}</span>
              </div>
            </template>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getStatistics } from '@/api/bed'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const stat = ref({})
const cards = [
  { key: 'totalBeds', label: '床位总数', icon: 'Grid', bg: '#ecf7f5', color: '#2f9e8f' },
  { key: 'freeBeds', label: '空闲床位', icon: 'CircleCheck', bg: '#eefaf3', color: '#52c41a' },
  { key: 'occupiedBeds', label: '已入住', icon: 'UserFilled', bg: '#e8f1fd', color: '#3d7fd9' },
  { key: 'awayBeds', label: '外出中', icon: 'Position', bg: '#fdf3e7', color: '#e6a23c' },
]

const quickLinks = computed(() =>
  userStore.isAdmin
    ? [
        { title: '入住登记', path: '/customer', icon: 'Plus' },
        { title: '床位图', path: '/bed/map', icon: 'Grid' },
        { title: '外出审批', path: '/outward', icon: 'Stamp' },
        { title: '护理项目', path: '/nurse/content', icon: 'FirstAidKit' },
      ]
    : [
        { title: '我的客户', path: '/my/customers', icon: 'UserFilled' },
        { title: '录入护理记录', path: '/my/customers', icon: 'EditPen' },
        { title: '外出登记', path: '/my/outward', icon: 'Position' },
        { title: '退住申请', path: '/my/backdown', icon: 'CircleClose' },
      ]
)

const occupancyRate = computed(() => pct(stat.value.occupiedBeds, stat.value.totalBeds))
const awayRate = computed(() => pct(stat.value.awayBeds, stat.value.totalBeds))

function pct(part, total) {
  if (!total) return 0
  return Math.round(((part || 0) / total) * 100)
}

onMounted(async () => {
  stat.value = (await getStatistics()) || {}
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
}
.stat-label {
  font-size: 13px;
  color: #909399;
}
.block-title {
  font-size: 15px;
  margin-bottom: 16px;
  color: #303133;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.progress-label {
  width: 56px;
  color: #606266;
  font-size: 14px;
}
.progress-row :deep(.el-progress) {
  flex: 1;
}
.progress-desc {
  color: #909399;
  font-size: 13px;
  white-space: nowrap;
}
.quick-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.quick-item {
  border: 1px solid #eef0f4;
  border-radius: 8px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #606266;
}
.quick-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  box-shadow: 0 2px 10px rgba(47, 158, 143, 0.15);
}
</style>
