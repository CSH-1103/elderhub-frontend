/**
 * 全局状态字典
 * 注意：User.sex(0女1男) 与 Customer.customer_sex(0男1女) 语义相反，两套字典严禁混用！
 */

// 床位状态（bed.bed_status）
export const BED_STATUS = {
  1: { label: '空闲', type: 'success' },
  2: { label: '已入住', type: 'primary' },
  3: { label: '外出', type: 'warning' },
}

// 审批状态（外出/退住通用）
export const AUDIT_STATUS = {
  0: { label: '待审核', type: 'info' },
  1: { label: '已通过', type: 'success' },
  2: { label: '已拒绝', type: 'danger' },
}

// 退住类型（backdown.retreat_type）
export const RETREAT_TYPE = {
  0: { label: '正常退住', type: 'info' },
  1: { label: '死亡退住', type: 'danger' },
  2: { label: '保留床位', type: 'warning' },
}

// 用户性别（user.sex）0女 1男
export const USER_SEX = {
  0: { label: '女', type: 'danger' },
  1: { label: '男', type: 'primary' },
}

// 客户性别（customer.customer_sex）0男 1女
export const CUSTOMER_SEX = {
  0: { label: '男', type: 'primary' },
  1: { label: '女', type: 'danger' },
}

// 护理项目客户购买状态（CustomerNurseItemVO.status）
export const ITEM_STATUS = {
  1: { label: '正常', type: 'success' },
  2: { label: '欠费', type: 'danger' },
  3: { label: '已到期', type: 'warning' },
}

// 护理级别/项目 启停状态（level_status / status）
export const ENABLE_STATUS = {
  1: { label: '启用', type: 'success' },
  2: { label: '停用', type: 'info' },
}

// 床位使用详情状态（BedDetailsVO.status）
export const BED_USE_STATUS = {
  1: { label: '正在使用', type: 'success' },
  2: { label: '使用历史', type: 'info' },
}
