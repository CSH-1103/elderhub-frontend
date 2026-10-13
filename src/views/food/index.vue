<template>
  <div>
    <!-- 顶部工具栏 -->
    <div class="page-card toolbar-area">
      <div class="toolbar-row">
        <div class="toolbar-item">
          <span class="toolbar-label">日期</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            :disabled-date="disableFuture"
            @change="loadMenu"
          />
        </div>
        <div class="toolbar-item">
          <span class="toolbar-label">客户</span>
          <el-select
            v-model="selectedCustomerId"
            placeholder="选择客户查看饮食偏好"
            filterable
            clearable
            style="width: 240px"
            :loading="customerLoading"
            @change="loadCustomerPreference"
          >
            <el-option
              v-for="c in customers"
              :key="c.id"
              :label="c.customer_name"
              :value="c.id"
            />
          </el-select>
        </div>
        <div v-if="selectedCustomer" class="customer-info">
          <el-tag
            v-for="tag in [...(selectedCustomer.allergies || []), ...(selectedCustomer.avoid_tags || [])]"
            :key="tag"
            type="danger"
            effect="light"
            size="small"
            class="conflict-tag"
          >
            忌：{{ tag }}
          </el-tag>
          <span v-if="selectedCustomer.notes" class="customer-notes">
            {{ selectedCustomer.notes }}
          </span>
        </div>
      </div>
    </div>

    <!-- 三栏菜单 -->
    <el-row :gutter="16" class="meal-row">
      <!-- 早餐 -->
      <el-col :span="8">
        <MealColumn
          title="早餐"
          icon="Sunrise"
          :meals="menu.breakfast || []"
          :preference="selectedCustomer"
          :loading="menuLoading"
        />
      </el-col>
      <!-- 午餐 -->
      <el-col :span="8">
        <MealColumn
          title="午餐"
          icon="Sunny"
          :meals="menu.lunch || []"
          :preference="selectedCustomer"
          :loading="menuLoading"
        />
      </el-col>
      <!-- 晚餐 -->
      <el-col :span="8">
        <MealColumn
          title="晚餐"
          icon="Moon"
          :meals="menu.dinner || []"
          :preference="selectedCustomer"
          :loading="menuLoading"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDailyMenu, listCustomerPreferences } from '@/api/food'
import MealColumn from './MealColumn.vue'

/* ============ 状态 ============ */
const selectedDate = ref('')
const selectedCustomerId = ref(null)
const selectedCustomer = ref(null)

const menu = ref({ breakfast: [], lunch: [], dinner: [] })
const menuLoading = ref(false)

const customers = ref([])
const customerLoading = ref(false)

/* ============ 方法 ============ */

// 不允许选择未来日期
function disableFuture(date) {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date.getTime() > today.getTime()
}

function loadMenu() {
  if (!selectedDate.value) return
  menuLoading.value = true
  getDailyMenu(selectedDate.value)
    .then((data) => {
      menu.value = {
        breakfast: data.breakfast || [],
        lunch: data.lunch || [],
        dinner: data.dinner || [],
      }
    })
    .catch(() => {
      ElMessage.error('加载菜单失败')
    })
    .finally(() => {
      menuLoading.value = false
    })
}

function loadCustomers() {
  customerLoading.value = true
  listCustomerPreferences()
    .then((list) => {
      customers.value = list || []
    })
    .catch(() => {
      ElMessage.error('加载客户列表失败')
    })
    .finally(() => {
      customerLoading.value = false
    })
}

function loadCustomerPreference(customerId) {
  if (!customerId) {
    selectedCustomer.value = null
    return
  }
  selectedCustomer.value =
    customers.value.find((c) => String(c.id) === String(customerId)) || null
}

onMounted(() => {
  // 默认今天
  const today = new Date()
  selectedDate.value = formatDate(today)
  loadMenu()
  loadCustomers()
})

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<style scoped>
.toolbar-area {
  margin-bottom: 16px;
}
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-label {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
}
.customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.customer-notes {
  color: #909399;
  font-size: 13px;
  background: #f5f7fa;
  padding: 4px 10px;
  border-radius: 4px;
}
.conflict-tag {
  font-weight: 500;
}
.meal-row {
  display: flex;
}
</style>
