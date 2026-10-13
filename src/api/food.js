import request, { normalizePage } from './request'

/**
 * 食品管理 /admin/food
 * 实体字段均为下划线风格（MySQL 直出）：
 *   Food  { id, food_name, food_type, price, is_halal, food_img }
 */

/**
 * 分页查询食品
 * params: { pageNum?, pageSize?, foodName?, foodType?, isHalal? }
 */
export async function listFoods(params) {
  const data = await request.get('/admin/food/list', { params })
  return normalizePage(data)
}

/** 食品详情 */
export const getFood = (id) => request.get(`/admin/food/${id}`)

/** 新增食品 body: Food */
export const saveFood = (data) => request.post('/admin/food/save', data)

/** 修改食品 body: Food（必须带 id） */
export const updateFood = (data) => request.put('/admin/food/update', data)

/** 删除食品（物理删除） */
export const removeFood = (id) => request.delete(`/admin/food/remove/${id}`)

/* ============ 膳食日历 /admin/meal ============ */

/**
 * 分页查询膳食日历
 * params: { pageNum?, pageSize?, weekDay?, mealType? }
 *   mealType: 1-早餐 2-午餐 3-晚餐
 *   weekDay: 星期几（如 "星期一" / "周一" 等，按后端约定）
 */
export async function listMeals(params) {
  const data = await request.get('/admin/meal/list', { params })
  return normalizePage(data)
}

/** 膳食详情 */
export const getMeal = (id) => request.get(`/admin/meal/${id}`)

/** 新增膳食 body: Meal { week_day, meal_type, food_id, taste } */
export const saveMeal = (data) => request.post('/admin/meal/save', data)

/** 修改膳食 body: Meal（必须带 id） */
export const updateMeal = (data) => request.put('/admin/meal/update', data)

/** 删除膳食（逻辑删除） */
export const removeMeal = (id) => request.delete(`/admin/meal/remove/${id}`)

/* ============ 客户饮食喜好 /admin/customer-preference ============ */

/**
 * 分页查询客户饮食喜好
 * params: { pageNum?, pageSize?, customerId? }
 */
export async function listPreferences(params) {
  const data = await request.get('/admin/customer-preference/list', { params })
  return normalizePage(data)
}

/** 饮食喜好详情 */
export const getPreference = (id) => request.get(`/admin/customer-preference/${id}`)

/** 新增 body: CustomerPreference { customer_id, preferences, attention, remark } */
export const savePreference = (data) =>
  request.post('/admin/customer-preference/save', data)

/** 修改 body: CustomerPreference（必须带 id） */
export const updatePreference = (data) =>
  request.put('/admin/customer-preference/update', data)

/** 删除（逻辑删除） */
export const removePreference = (id) =>
  request.delete(`/admin/customer-preference/remove/${id}`)
