import request from './request'

/**
 * 餐饮管理 API
 * TODO: 后端 Controller 就绪后，将 mock 实现替换为真实请求
 */

/* ============ Mock 数据 ============ */

// 客户饮食偏好 mock（实际应由后端 Customer / Preference 接口返回）
const mockCustomers = [
  {
    id: 1,
    customer_name: '张大爷',
    allergies: ['花生', '海鲜'],
    avoid_tags: ['辛辣'],
    notes: '高血压，低盐低脂',
  },
  {
    id: 2,
    customer_name: '李奶奶',
    allergies: ['鸡蛋'],
    avoid_tags: ['甜腻', '生冷'],
    notes: '糖尿病，低糖',
  },
  {
    id: 3,
    customer_name: '王爷爷',
    allergies: [],
    avoid_tags: [],
    notes: '无特殊忌口',
  },
  {
    id: 4,
    customer_name: '赵阿姨',
    allergies: ['牛奶', '大豆'],
    avoid_tags: ['油腻'],
    notes: '乳糖不耐受',
  },
]

// 营养标签可选值
const NUTRIENT_TAGS = {
  LOW_SALT: '低盐',
  LOW_FAT: '低脂',
  HIGH_PROTEIN: '高蛋白',
  EASY_DIGEST: '易消化',
  HIGH_FIBER: '高纤维',
  LOW_SUGAR: '低糖',
  CALCIUM_RICH: '补钙',
  IRON_RICH: '补铁',
}

// 过敏原/忌口可选值
const ALLERGEN_TAGS = ['花生', '海鲜', '鸡蛋', '牛奶', '大豆', '小麦', '坚果', '辛辣', '甜腻', '生冷', '油腻']

// 某一天的菜单 mock
const mockDailyMenu = {
  breakfast: [
    { id: 'b1', name: '小米粥', price: 3, nutrient_tags: ['LOW_SALT', 'EASY_DIGEST'], allergens: [] },
    { id: 'b2', name: '煮鸡蛋', price: 2, nutrient_tags: ['HIGH_PROTEIN'], allergens: ['鸡蛋'] },
    { id: 'b3', name: '蒸南瓜', price: 4, nutrient_tags: ['LOW_SUGAR', 'HIGH_FIBER'], allergens: [] },
    { id: 'b4', name: '牛奶燕麦', price: 5, nutrient_tags: ['CALCIUM_RICH', 'HIGH_FIBER'], allergens: ['牛奶'] },
    { id: 'b5', name: '酱牛肉', price: 8, nutrient_tags: ['HIGH_PROTEIN', 'LOW_FAT'], allergens: [] },
  ],
  lunch: [
    { id: 'l1', name: '清蒸鲈鱼', price: 18, nutrient_tags: ['HIGH_PROTEIN', 'EASY_DIGEST'], allergens: ['海鲜'] },
    { id: 'l2', name: '清炒西兰花', price: 6, nutrient_tags: ['HIGH_FIBER', 'LOW_SALT'], allergens: [] },
    { id: 'l3', name: '番茄炒蛋', price: 8, nutrient_tags: ['HIGH_PROTEIN'], allergens: ['鸡蛋'] },
    { id: 'l4', name: '排骨藕汤', price: 15, nutrient_tags: ['CALCIUM_RICH'], allergens: [] },
    { id: 'l5', name: '糙米饭', price: 2, nutrient_tags: ['HIGH_FIBER', 'LOW_SUGAR'], allergens: [] },
    { id: 'l6', name: '宫保鸡丁', price: 12, nutrient_tags: [], allergens: ['花生'] },
  ],
  dinner: [
    { id: 'd1', name: '冬瓜丸子汤', price: 10, nutrient_tags: ['LOW_FAT', 'EASY_DIGEST'], allergens: [] },
    { id: 'd2', name: '白灼虾', price: 16, nutrient_tags: ['HIGH_PROTEIN'], allergens: ['海鲜'] },
    { id: 'd3', name: '凉拌黄瓜', price: 5, nutrient_tags: ['LOW_SALT'], allergens: [] },
    { id: 'd4', name: '麻婆豆腐', price: 9, nutrient_tags: ['HIGH_PROTEIN'], allergens: ['大豆', '辛辣'] },
    { id: 'd5', name: '小米饭', price: 2, nutrient_tags: ['EASY_DIGEST', 'IRON_RICH'], allergens: [] },
  ],
}

/* ============ 冲突检测工具 ============ */

/**
 * 检测菜品与客户饮食偏好的冲突
 * @param {Object} dish - 菜品对象 { allergens: [] }
 * @param {Object} preference - 客户偏好 { allergies: [], avoid_tags: [] }
 * @returns {Array<string>} 冲突标签数组，空数组表示无冲突
 */
export function checkConflict(dish, preference) {
  if (!preference) return []
  const conflicts = []
  // 过敏原冲突
  if (dish.allergens && preference.allergies) {
    dish.allergens.forEach((tag) => {
      if (preference.allergies.includes(tag)) conflicts.push(tag)
    })
  }
  // 忌口冲突
  if (dish.allergens && preference.avoid_tags) {
    dish.allergens.forEach((tag) => {
      if (preference.avoid_tags.includes(tag) && !conflicts.includes(tag)) conflicts.push(tag)
    })
  }
  return conflicts
}

/* ============ API 函数（mock 实现） ============ */

/**
 * 获取指定日期的菜单
 * @param {string} date - YYYY-MM-DD
 */
export const getDailyMenu = async (date) => {
  // TODO: 后端接口就绪后改为 return request.get(`/admin/food/menu?date=${date}`)
  return new Promise((resolve) => {
    setTimeout(() => resolve({ date, ...mockDailyMenu }), 200)
  })
}

/**
 * 获取客户饮食偏好列表
 */
export const listCustomerPreferences = async () => {
  // TODO: 后端接口就绪后改为 return request.get('/admin/food/preferences')
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockCustomers]), 200)
  })
}

/**
 * 获取单个客户饮食偏好
 * @param {number|string} customerId
 */
export const getCustomerPreference = async (customerId) => {
  // TODO: 后端接口就绪后改为 return request.get(`/admin/food/preference/${customerId}`)
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCustomers.find((c) => String(c.id) === String(customerId)) || null), 200)
  })
}

export { NUTRIENT_TAGS, ALLERGEN_TAGS }
