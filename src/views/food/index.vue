<template>
  <div>
    <el-tabs v-model="activeTab" class="food-tabs">
      <!-- ============ Tab 1: 食品管理 ============ -->
      <el-tab-pane label="食品管理" name="food">
        <div class="page-card">
          <div class="table-toolbar">
            <div class="toolbar-filters">
              <el-input
                v-model="foodQuery.foodName"
                placeholder="食品名称"
                clearable
                style="width: 160px"
                @keyup.enter="foodSearch"
                @clear="foodSearch"
              />
              <el-select
                v-model="foodQuery.foodType"
                placeholder="食品分类"
                clearable
                style="width: 140px"
                @change="foodSearch"
              >
                <el-option v-for="t in FOOD_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
              <el-select
                v-model="foodQuery.isHalal"
                placeholder="是否清真"
                clearable
                style="width: 120px"
                @change="foodSearch"
              >
                <el-option label="清真" :value="1" />
                <el-option label="非清真" :value="0" />
              </el-select>
              <el-button type="primary" :icon="Search" @click="foodSearch">查询</el-button>
            </div>
            <el-button type="primary" :icon="Plus" @click="openFoodAdd">新增食品</el-button>
          </div>

          <el-table v-loading="foodLoading" :data="foodList" border stripe>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="food_name" label="食品名称" min-width="120" />
            <el-table-column prop="food_type" label="分类" width="100">
              <template #default="{ row }">{{ row.food_type || '—' }}</template>
            </el-table-column>
            <el-table-column prop="price" label="价格(元)" width="100" />
            <el-table-column label="清真" width="90">
              <template #default="{ row }">
                <el-tag v-if="row.is_halal === 1" type="success" effect="light">清真</el-tag>
                <span v-else style="color: #c0c4cc">—</span>
              </template>
            </el-table-column>
            <el-table-column prop="food_img" label="图片" width="80">
              <template #default="{ row }">
                <el-image
                  v-if="row.food_img"
                  :src="row.food_img"
                  :preview-src-list="[row.food_img]"
                  fit="cover"
                  style="width: 48px; height: 48px; border-radius: 4px"
                />
                <span v-else style="color: #c0c4cc">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openFoodEdit(row)">编辑</el-button>
                <el-popconfirm title="确认删除该食品？" @confirm="doFoodRemove(row)">
                  <template #reference>
                    <el-button link type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 14px; display: flex; justify-content: flex-end">
            <Pagination
              v-model:page="foodQuery.pageNum"
              v-model:size="foodQuery.pageSize"
              :total="foodTotal"
              @change="loadFoods"
            />
          </div>
        </div>

        <!-- 食品 新增/编辑 -->
        <el-dialog v-model="foodDialogVisible" :title="foodIsEdit ? '编辑食品' : '新增食品'" width="480px">
          <el-form ref="foodFormRef" :model="foodForm" :rules="foodRules" label-width="90px">
            <el-form-item label="食品名称" prop="food_name">
              <el-input v-model="foodForm.food_name" placeholder="如：清蒸鲈鱼" />
            </el-form-item>
            <el-form-item label="食品分类" prop="food_type">
              <el-select v-model="foodForm.food_type" style="width: 100%" placeholder="请选择分类">
                <el-option v-for="t in FOOD_TYPES" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item label="价格(元)" prop="price">
              <el-input-number v-model="foodForm.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
            <el-form-item label="是否清真" prop="is_halal">
              <el-radio-group v-model="foodForm.is_halal">
                <el-radio :value="1">清真</el-radio>
                <el-radio :value="0">非清真</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="图片路径">
              <el-input v-model="foodForm.food_img" placeholder="如：/img/food/lv.png（可留空）" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="foodDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="foodSaving" @click="doFoodSave">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- ============ Tab 2: 膳食日历 ============ -->
      <el-tab-pane label="膳食日历" name="meal">
        <div class="page-card">
          <div class="table-toolbar">
            <div class="toolbar-filters">
              <el-select
                v-model="mealQuery.weekDay"
                placeholder="星期"
                clearable
                style="width: 120px"
                @change="mealSearch"
              >
                <el-option v-for="d in WEEK_DAYS" :key="d" :label="d" :value="d" />
              </el-select>
              <el-select
                v-model="mealQuery.mealType"
                placeholder="餐次"
                clearable
                style="width: 120px"
                @change="mealSearch"
              >
                <el-option label="早餐" :value="1" />
                <el-option label="午餐" :value="2" />
                <el-option label="晚餐" :value="3" />
              </el-select>
              <el-select
                v-model="mealQuery.status"
                placeholder="状态"
                style="width: 110px"
                @change="mealSearch"
              >
                <el-option label="启用" :value="1" />
                <el-option label="停用" :value="2" />
                <el-option label="全部" :value="0" />
              </el-select>
              <el-button type="primary" :icon="Search" @click="mealSearch">查询</el-button>
            </div>
            <el-button type="primary" :icon="Plus" @click="openMealAdd">新增膳食</el-button>
          </div>

          <el-table v-loading="mealLoading" :data="mealList" border stripe>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="week_day" label="星期" width="100" />
            <el-table-column label="餐次" width="100">
              <template #default="{ row }">
                <el-tag :type="MEAL_TYPE_TAG[row.meal_type]" effect="light">
                  {{ MEAL_TYPE_LABEL[row.meal_type] || '—' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="food_id" label="食品ID" width="90" />
            <el-table-column prop="taste" label="口味要求" min-width="140">
              <template #default="{ row }">{{ row.taste || '—' }}</template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="light">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openMealEdit(row)">编辑</el-button>
                <el-button
                  link
                  :type="row.status === 1 ? 'warning' : 'success'"
                  @click="doMealToggleStatus(row)"
                >
                  {{ row.status === 1 ? '停用' : '启用' }}
                </el-button>
                <el-popconfirm title="确认删除？" @confirm="doMealRemove(row)">
                  <template #reference>
                    <el-button link type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 14px; display: flex; justify-content: flex-end">
            <Pagination
              v-model:page="mealQuery.pageNum"
              v-model:size="mealQuery.pageSize"
              :total="mealTotal"
              @change="loadMeals"
            />
          </div>
        </div>

        <!-- 膳食 新增/编辑 -->
        <el-dialog v-model="mealDialogVisible" :title="mealIsEdit ? '编辑膳食' : '新增膳食'" width="480px">
          <el-form ref="mealFormRef" :model="mealForm" :rules="mealRules" label-width="90px">
            <el-form-item label="星期" prop="week_day">
              <el-select v-model="mealForm.week_day" style="width: 100%" placeholder="请选择">
                <el-option v-for="d in WEEK_DAYS" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
            <el-form-item label="餐次" prop="meal_type">
              <el-radio-group v-model="mealForm.meal_type">
                <el-radio :value="1">早餐</el-radio>
                <el-radio :value="2">午餐</el-radio>
                <el-radio :value="3">晚餐</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="食品" prop="food_id">
              <el-select
                v-model="mealForm.food_id"
                filterable
                :loading="foodOptionsLoading"
                placeholder="选择食品（输入可搜索）"
                style="width: 100%"
              >
                <el-option
                  v-for="f in foodOptions"
                  :key="f.id"
                  :label="`${f.food_name}（${f.food_type || '—'}）`"
                  :value="f.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="口味要求">
              <el-input v-model="mealForm.taste" placeholder="如：少糖、少盐、少油" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="mealDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="mealSaving" @click="doMealSave">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- ============ Tab 3: 客户膳食配置 ============ -->
      <el-tab-pane label="客户膳食配置" name="customerMeal">
        <div class="page-card">
          <div class="table-toolbar">
            <div class="toolbar-filters">
              <el-input
                v-model="cmQuery.customerName"
                placeholder="客户姓名"
                clearable
                style="width: 160px"
                @keyup.enter="cmSearch"
                @clear="cmSearch"
              />
              <el-button type="primary" :icon="Search" @click="cmSearch">查询</el-button>
            </div>
            <el-button type="primary" :icon="Plus" @click="openCmAdd">新增配置</el-button>
          </div>

          <el-table v-loading="cmLoading" :data="cmList" border stripe>
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="customerName" label="客户" min-width="110">
              <template #default="{ row }">{{ row.customerName || `客户#${row.customerId}` }}</template>
            </el-table-column>
            <el-table-column prop="weekDay" label="星期" width="100" />
            <el-table-column label="餐次" width="100">
              <template #default="{ row }">
                <el-tag :type="MEAL_TYPE_TAG[row.mealType]" effect="light">
                  {{ MEAL_TYPE_LABEL[row.mealType] || '—' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="foodName" label="食品" min-width="140">
              <template #default="{ row }">{{ row.foodName || `食品#${row.foodId}` }}</template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openCmEdit(row)">编辑</el-button>
                <el-popconfirm title="确认删除该配置？" @confirm="doCmRemove(row)">
                  <template #reference>
                    <el-button link type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 14px; display: flex; justify-content: flex-end">
            <Pagination
              v-model:page="cmQuery.pageNum"
              v-model:size="cmQuery.pageSize"
              :total="cmTotal"
              @change="loadCustomerMeals"
            />
          </div>
        </div>

        <!-- 客户膳食配置 新增/编辑 -->
        <el-dialog v-model="cmDialogVisible" :title="cmIsEdit ? '编辑配置' : '新增配置'" width="480px">
          <el-form ref="cmFormRef" :model="cmForm" :rules="cmRules" label-width="90px">
            <el-form-item label="客户" prop="customer_id">
              <el-select
                v-model="cmForm.customer_id"
                filterable
                :loading="cmCustomersLoading"
                placeholder="选择在住客户（输入可搜索）"
                style="width: 100%"
                :disabled="cmIsEdit"
              >
                <el-option
                  v-for="c in cmCustomers"
                  :key="c.customerId"
                  :label="`${c.customerName}（${c.roomNo || '—'}房）`"
                  :value="c.customerId"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="星期" prop="week_day">
              <el-select v-model="cmForm.week_day" style="width: 100%" placeholder="请选择">
                <el-option v-for="d in WEEK_DAYS" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
            <el-form-item label="餐次" prop="meal_type">
              <el-radio-group v-model="cmForm.meal_type">
                <el-radio :value="1">早餐</el-radio>
                <el-radio :value="2">午餐</el-radio>
                <el-radio :value="3">晚餐</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="食品" prop="food_id">
              <el-select
                v-model="cmForm.food_id"
                filterable
                :loading="foodOptionsLoading"
                placeholder="选择食品（输入可搜索）"
                style="width: 100%"
              >
                <el-option
                  v-for="f in foodOptions"
                  :key="f.id"
                  :label="`${f.food_name}（${f.food_type || '—'}）`"
                  :value="f.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="cmDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="cmSaving" @click="doCmSave">保存</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  listFoods,
  saveFood,
  updateFood,
  removeFood,
  listMeals,
  saveMeal,
  updateMeal,
  removeMeal,
  updateMealStatus,
  listCustomerMeals,
  saveCustomerMeal,
  updateCustomerMeal,
  removeCustomerMeal,
} from '@/api/food'
import { listDetails } from '@/api/bed'
import Pagination from '@/components/Pagination.vue'

/* ============ 常量 ============ */
const FOOD_TYPES = ['主食', '汤类', '肉类', '蔬菜', '水果', '豆制品', '海鲜', '其他']
const WEEK_DAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
const MEAL_TYPE_LABEL = { 1: '早餐', 2: '午餐', 3: '晚餐' }
const MEAL_TYPE_TAG = { 1: 'warning', 2: '', 3: 'info' }

/* ============ Tab ============ */
const activeTab = ref('food')

/* ============ 食品管理 ============ */
const foodQuery = reactive({ foodName: '', foodType: null, isHalal: null, pageNum: 1, pageSize: 10 })
const foodList = ref([])
const foodTotal = ref(0)
const foodLoading = ref(false)

const foodDialogVisible = ref(false)
const foodIsEdit = ref(false)
const foodFormRef = ref()
const foodSaving = ref(false)
const emptyFoodForm = () => ({ id: null, food_name: '', food_type: '', price: 0, is_halal: 0, food_img: '' })
const foodForm = reactive(emptyFoodForm())
const foodRules = {
  food_name: [{ required: true, message: '请输入食品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

async function loadFoods() {
  foodLoading.value = true
  try {
    const page = await listFoods({ ...foodQuery })
    foodList.value = page.list
    foodTotal.value = page.total
  } catch {
    /* axios 拦截器已弹 ElMessage.error */
  } finally {
    foodLoading.value = false
  }
}
function foodSearch() {
  foodQuery.pageNum = 1
  loadFoods()
}
function openFoodAdd() {
  foodIsEdit.value = false
  Object.assign(foodForm, emptyFoodForm())
  foodDialogVisible.value = true
}
function openFoodEdit(row) {
  foodIsEdit.value = true
  Object.assign(foodForm, { ...emptyFoodForm(), ...row })
  foodDialogVisible.value = true
}
async function doFoodSave() {
  await foodFormRef.value.validate().catch(() => { throw new Error('validate') })
  foodSaving.value = true
  try {
    if (foodIsEdit.value) {
      await updateFood({ ...foodForm })
      ElMessage.success('修改成功')
    } else {
      await saveFood({ ...foodForm })
      ElMessage.success('新增成功')
    }
    foodDialogVisible.value = false
    loadFoods()
  } catch (e) {
    // validate 失败或 axios 已弹过提示
  } finally {
    foodSaving.value = false
  }
}
async function doFoodRemove(row) {
  await removeFood(row.id)
  ElMessage.success('已删除')
  loadFoods()
}

/* ============ 膳食日历 ============ */
const mealQuery = reactive({ weekDay: null, mealType: null, status: 1, pageNum: 1, pageSize: 10 })
const mealList = ref([])
const mealTotal = ref(0)
const mealLoading = ref(false)

const mealDialogVisible = ref(false)
const mealIsEdit = ref(false)
const mealFormRef = ref()
const mealSaving = ref(false)
const emptyMealForm = () => ({ id: null, week_day: '', meal_type: 1, food_id: null, taste: '' })
const mealForm = reactive(emptyMealForm())
const mealRules = {
  week_day: [{ required: true, message: '请选择星期', trigger: 'change' }],
  meal_type: [{ required: true, message: '请选择餐次', trigger: 'change' }],
  food_id: [{ required: true, message: '请选择食品', trigger: 'change' }],
}

// 新增膳食弹窗时下拉加载全部食品（分页 500 条）
const foodOptions = ref([])
const foodOptionsLoading = ref(false)
async function loadFoodOptions() {
  foodOptionsLoading.value = true
  try {
    const page = await listFoods({ pageNum: 1, pageSize: 500 })
    foodOptions.value = page.list
  } catch {
    /* axios 拦截器已弹 ElMessage.error */
  } finally {
    foodOptionsLoading.value = false
  }
}

async function loadMeals() {
  mealLoading.value = true
  try {
    const page = await listMeals({ ...mealQuery })
    mealList.value = page.list
    mealTotal.value = page.total
  } catch {
    /* axios 拦截器已弹 ElMessage.error */
  } finally {
    mealLoading.value = false
  }
}
function mealSearch() {
  mealQuery.pageNum = 1
  loadMeals()
}
function openMealAdd() {
  mealIsEdit.value = false
  Object.assign(mealForm, emptyMealForm())
  mealDialogVisible.value = true
  loadFoodOptions()
}
function openMealEdit(row) {
  mealIsEdit.value = true
  Object.assign(mealForm, { ...emptyMealForm(), ...row })
  mealDialogVisible.value = true
  loadFoodOptions()
}
async function doMealSave() {
  await mealFormRef.value.validate().catch(() => { throw new Error('validate') })
  mealSaving.value = true
  try {
    if (mealIsEdit.value) {
      await updateMeal({ ...mealForm })
      ElMessage.success('修改成功')
    } else {
      await saveMeal({ ...mealForm })
      ElMessage.success('新增成功')
    }
    mealDialogVisible.value = false
    loadMeals()
  } catch (e) {
    // validate 失败或 axios 已弹过提示
  } finally {
    mealSaving.value = false
  }
}
async function doMealRemove(row) {
  await removeMeal(row.id)
  ElMessage.success('已删除')
  loadMeals()
}
async function doMealToggleStatus(row) {
  const target = row.status === 1 ? 2 : 1
  await updateMealStatus(row.id, target)
  ElMessage.success(target === 1 ? '已启用' : '已停用')
  loadMeals()
}

/* ============ 客户膳食配置 ============ */
const cmQuery = reactive({ customerName: '', pageNum: 1, pageSize: 10 })
const cmList = ref([])
const cmTotal = ref(0)
const cmLoading = ref(false)

const cmDialogVisible = ref(false)
const cmIsEdit = ref(false)
const cmFormRef = ref()
const cmSaving = ref(false)
const emptyCmForm = () => ({ id: null, customer_id: null, week_day: '', meal_type: 1, food_id: null })
const cmForm = reactive(emptyCmForm())
const cmRules = {
  customer_id: [{ required: true, message: '请选择客户', trigger: 'change' }],
  week_day: [{ required: true, message: '请选择星期', trigger: 'change' }],
  meal_type: [{ required: true, message: '请选择餐次', trigger: 'change' }],
  food_id: [{ required: true, message: '请选择食品', trigger: 'change' }],
}

// 在住客户下拉（customerType=0 查全部）
const cmCustomers = ref([])
const cmCustomersLoading = ref(false)
async function loadCmCustomers() {
  cmCustomersLoading.value = true
  try {
    const page = await listDetails({ status: 1, customerType: 0, pageNum: 1, pageSize: 500 })
    const seen = new Set()
    cmCustomers.value = (page.list || []).filter((x) => {
      if (seen.has(x.customerId)) return false
      seen.add(x.customerId)
      return true
    })
  } catch {
    /* axios 拦截器已弹 ElMessage.error */
  } finally {
    cmCustomersLoading.value = false
  }
}

async function loadCustomerMeals() {
  cmLoading.value = true
  try {
    const page = await listCustomerMeals({ ...cmQuery })
    cmList.value = page.list
    cmTotal.value = page.total
  } catch {
    /* axios 拦截器已弹 ElMessage.error */
  } finally {
    cmLoading.value = false
  }
}
function cmSearch() {
  cmQuery.pageNum = 1
  loadCustomerMeals()
}
function openCmAdd() {
  cmIsEdit.value = false
  Object.assign(cmForm, emptyCmForm())
  cmDialogVisible.value = true
  loadCmCustomers()
  loadFoodOptions()
}
function openCmEdit(row) {
  cmIsEdit.value = true
  Object.assign(cmForm, {
    id: row.id,
    customer_id: row.customerId,
    week_day: row.weekDay,
    meal_type: row.mealType,
    food_id: row.foodId,
  })
  cmDialogVisible.value = true
  loadCmCustomers()
  loadFoodOptions()
}
async function doCmSave() {
  await cmFormRef.value.validate().catch(() => { throw new Error('validate') })
  cmSaving.value = true
  try {
    if (cmIsEdit.value) {
      await updateCustomerMeal({ ...cmForm })
      ElMessage.success('修改成功')
    } else {
      await saveCustomerMeal({ ...cmForm })
      ElMessage.success('新增成功')
    }
    cmDialogVisible.value = false
    loadCustomerMeals()
  } catch (e) {
    // validate 失败或 axios 已弹过提示
  } finally {
    cmSaving.value = false
  }
}
async function doCmRemove(row) {
  await removeCustomerMeal(row.id)
  ElMessage.success('已删除')
  loadCustomerMeals()
}

watch(activeTab, (name) => {
  if (name === 'meal') loadMeals()
  if (name === 'customerMeal') loadCustomerMeals()
})

onMounted(() => {
  loadFoods()
})
</script>

<style scoped>
.food-tabs :deep(.el-tabs__header) {
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 0 16px;
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
}
.food-tabs :deep(.el-tabs__content) {
  margin-top: -1px;
}
.food-tabs :deep(.el-tab-pane) {
  padding: 0;
}
</style>
