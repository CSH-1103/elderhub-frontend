<template>
  <div class="page-card">
    <div class="table-toolbar">
      <div class="toolbar-filters">
        <span>楼层：</span>
        <el-radio-group v-model="floor" @change="loadMap">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button v-for="f in floors" :key="f" :label="f">{{ f }}层</el-radio-button>
        </el-radio-group>
      </div>
      <!-- 图例 -->
      <div class="legend">
        <span class="legend-item bed-free"><i />空闲</span>
        <span class="legend-item bed-occupied"><i />已入住</span>
        <span class="legend-item bed-away"><i />外出</span>
      </div>
    </div>

    <el-empty v-if="!loading && rooms.length === 0" description="该楼层暂无房间数据" />

    <el-row :gutter="14">
      <el-col v-for="room in rooms" :key="room.roomNo" :xs="12" :sm="8" :md="6" :lg="4">
        <div class="room-card">
          <div class="room-title">{{ room.roomFloor }}层 · {{ room.roomNo }} 房</div>
          <div class="bed-list">
            <div
              v-for="bed in room.beds"
              :key="bed.id"
              class="bed-cell"
              :class="bedClass(bed.bedStatus)"
              :title="`床位ID:${bed.id}${bed.remarks ? '，' + bed.remarks : ''}`"
              @click="onBedClick(bed)"
            >
              <div class="bed-no">{{ bed.bedNo }}</div>
              <div class="bed-status">{{ statusLabel(bed.bedStatus) }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getBedMap, listRooms } from '@/api/bed'
import { BED_STATUS } from '@/utils/constants'

const rooms = ref([])
const floors = ref([])
const floor = ref('')
const loading = ref(false)

async function loadFloors() {
  const data = (await listRooms()) || []
  floors.value = [...new Set(data.map((r) => r.roomFloor))]
}

async function loadMap() {
  loading.value = true
  try {
    rooms.value = (await getBedMap(floor.value || undefined)) || []
  } finally {
    loading.value = false
  }
}

function bedClass(status) {
  return { 1: 'bed-free', 2: 'bed-occupied', 3: 'bed-away' }[status] || ''
}

function statusLabel(status) {
  return BED_STATUS[status]?.label || '未知'
}

function onBedClick(bed) {
  if (bed.bedStatus === 1) {
    ElMessage.info('该床位空闲，可在「客户管理-入住登记」中分配')
    return
  }
  // 床位图接口不含客户信息，调换/回院等操作请到「床位使用详情」页
  ElMessage.info('请在「床位管理-使用详情」页进行调床、改期等操作')
}

onMounted(() => {
  loadFloors()
  loadMap()
})
</script>

<style scoped>
.legend {
  display: flex;
  gap: 16px;
  align-items: center;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 4px;
}
.legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}
.room-card {
  border: 1px solid #eef0f4;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 14px;
  background: #fafbfc;
}
.room-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 600;
}
.bed-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.bed-cell {
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s;
  border: 1px solid transparent;
}
.bed-cell:hover {
  transform: translateY(-2px);
}
.bed-no {
  font-weight: 600;
  font-size: 13px;
}
.bed-status {
  font-size: 12px;
  margin-top: 2px;
  opacity: 0.85;
}
</style>
