import request, { normalizePage } from './request'

/**
 * 用户管理（/admin/user）
 * 注意：后端 VO 为驼峰（nickname/phoneNumber/roleId/roleName）
 */

/** 分页查询用户列表 params: { nickname?, roleId?, pageNum, pageSize } */
export async function listUsers(params) {
  const data = await request.get('/admin/user/list', { params })
  return normalizePage(data)
}

/** 用户详情 */
export const getUserById = (id) => request.get(`/admin/user/${id}`)

/** 新增用户 body: { nickname, username, password, sex, email, phoneNumber, roleId } */
export const saveUser = (data) => request.post('/admin/user/save', data)

/** 修改用户 body: { id, nickname, email, phoneNumber, sex, roleId }（不可改 username/password） */
export const updateUser = (data) => request.put('/admin/user/update', data)

/** 删除用户（逻辑删除） */
export const removeUser = (id) => request.delete(`/admin/user/remove/${id}`)

/** 健康管家列表（roleId=2）params: { nickname? } */
export const listNurses = (nickname) =>
  request.get('/admin/user/nurse-list', { params: { nickname } })
