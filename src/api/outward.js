import request, { normalizePage } from './request'

/**
 * 外出管理：管理员审批 /admin/outward + 管家登记 /nurse/outward
 * OutwardVO 驼峰。已知后端缺陷：VO 无 id 字段、customerName 恒为 null、
 * customerId 实际存的是外出记录 id —— 审批/回院操作传 row.customerId，客户名显示"—"。
 * TODO: 待后端修复 OutwardVO（补充 id、修正联表查询）后仅需调整此文件
 */

/** 管理员：外出登记分页 params: { customerName?, pageNum, pageSize } */
export async function adminListOutwards(params) {
  const data = await request.get('/admin/outward/list', { params })
  return normalizePage(data)
}

/** 管理员：审批（query 传参）auditStatus: 1-通过 2-拒绝 */
export const adminAuditOutward = (id, auditStatus, auditPerson) =>
  request.put('/admin/outward/audit', null, { params: { id, auditStatus, auditPerson } })

/** 管家：新增外出登记 body: OutwardAddDTO（驼峰） */
export const nurseSaveOutward = (data) => request.post('/nurse/outward/save', data)

/** 管家：外出登记分页（需传 userId） */
export async function nurseListOutwards(params) {
  const data = await request.get('/nurse/outward/list', { params })
  return normalizePage(data)
}

/** 管家：登记回院（query 传参，实际回院时间由后端记录） */
export const nurseReturnOutward = (id) =>
  request.put('/nurse/outward/return', null, { params: { id } })
