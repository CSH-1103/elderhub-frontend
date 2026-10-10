import request from './request'

/** 角色列表 */
export const listRoles = () => request.get('/admin/role/list')

/** 菜单树（后端菜单表当前无数据，前端以静态菜单兜底） */
export const listMenuTree = () => request.get('/admin/menu/tree')
