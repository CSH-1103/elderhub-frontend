<template>
  <div class="room-bed-picker">
    <el-select
      :model-value="roomNo"
      placeholder="请选择房间"
      style="width: 100%"
      :loading="roomLoading"
      @change="onRoomChange"
    >
      <el-option-group
        v-for="group in groupedRooms"
        :key="group.floor"
        :label="`${group.floor}层`"
      >
        <el-option
          v-for="room in group.rooms"
          :key="room.roomNo"
          :label="`${room.roomNo} 房`"
          :value="room.roomNo"
        />
      </el-option-group>
    </el-select>
    <el-select
      :model-value="bedId"
      placeholder="请先选择房间，再选空闲床位"
      :disabled="!roomNo"
      :loading="bedLoading"
      style="width: 100%; margin-top: 10px"
      @change="emit('update:bedId', $event)"
    >
      <el-option
        v-for="bed in freeBeds"
        :key="bed.id"
        :label="`${bed.bedNo}（${bed.remarks || '空闲'}）`"
        :value="bed.id"
      />
    </el-select>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { listRooms, listFreeBeds } from '@/api/bed'

/**
 * 房间 → 空闲床位 两级联动选择器（房间按楼层分组）
 * v-model:roomNo / v-model:bedId
 */
const props = defineProps({
  roomNo: { type: [Number, String], default: null },
  bedId: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:roomNo', 'update:bedId'])

const rooms = ref([])
const freeBeds = ref([])
const roomLoading = ref(false)
const bedLoading = ref(false)

// 按楼层分组
const groupedRooms = computed(() => {
  const map = new Map()
  for (const room of rooms.value) {
    if (!map.has(room.roomFloor)) map.set(room.roomFloor, [])
    map.get(room.roomFloor).push(room)
  }
  return [...map.entries()]
    .sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'zh-Hans-CN', { numeric: true }))
    .map(([floor, list]) => ({ floor, rooms: list }))
})

listRooms()
  .then((data) => {
    rooms.value = data || []
  })
  .catch(() => {})

watch(
  () => props.roomNo,
  async (roomNo) => {
    freeBeds.value = []
    emit('update:bedId', null)
    if (!roomNo) return
    bedLoading.value = true
    try {
      freeBeds.value = (await listFreeBeds(roomNo)) || []
    } finally {
      bedLoading.value = false
    }
  },
  { immediate: true }
)

function onRoomChange(roomNo) {
  emit('update:roomNo', roomNo)
}
</script>
