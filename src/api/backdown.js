import request, { normalizePage } from './request'

/**
 * 退住管理：管理员审批 /admin/back-down + 管家申请 /nurse/back-down
 * BackDownVO 驼峰：{ id, customerId, customerName, retreatTime, retreatType, retreatReason, auditStatus, auditPerson, auditTime, remarks }
 */

/** 管理员：退住登记分页 params: { customerName?, pageNum, pageSize } */
export async function adminListBackDowns(params) {
  const data = await request.get('/admin/back-down/list', { params })
  return normalizePage(data)
}

/** 管理员：审批（query 传参）auditStatus: 1-通过 2-拒绝 */
export const adminAuditBackDown = (id, auditStatus, auditPerson) =>
  request.put('/admin/back-down/audit', null, { params: { id, auditStatus, auditPerson } })

/** 管家：新增退住申请 body: BackDownAddDTO（驼峰） */
export const nurseSaveBackDown = (data) => request.post('/nurse/back-down/save', data)

/** 管家：退住申请分页（需传 userId） */
export async function nurseListBackDowns(params) {
  const data = await request.get('/nurse/back-down/list', { params })
  return normalizePage(data)
}
