import request from './request'

/**
 * 管家-客户分配（/admin/user，管理员操作）
 */

/** 查询某管家服务的客户列表（Customer 实体，下划线字段） */
export const listNurseCustomers = (nurseId) =>
  request.get(`/admin/user/nurse-customers/${nurseId}`)

/** 给管家分配客户（query 传参） */
export const assignCustomer = (nurseId, customerId) =>
  request.post('/admin/user/assign-customer', null, { params: { nurseId, customerId } })

/** 移除客户的管家关系 */
export const removeCustomerAssign = (customerId) =>
  request.delete(`/admin/user/remove-customer/${customerId}`)
