import request, { normalizePage } from './request'

/**
 * 日常护理（/nurse，管家操作，全部需要显式传 userId）
 */

/** 管家分页查询自己服务的客户 params: { pageNum, pageSize, customerName?, userId } */
export async function listMyCustomers(params) {
  const data = await request.get('/nurse/customer/list', { params })
  return normalizePage(data)
}

/** 查询客户已购护理项目（含剩余次数/状态），userId 为 query */
export const listCustomerItems = (customerId, userId) =>
  request.get(`/nurse/customer/items/${customerId}`, { params: { userId } })
