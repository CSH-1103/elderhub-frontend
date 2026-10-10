import request, { normalizePage } from './request'

/**
 * 护理级别（/admin/nurse-level）
 * 注意：NurseLevel 实体直出，JSON 字段为下划线（level_name/level_status/create_time）
 */

/** 分页查询 params: { pageNum, pageSize, levelStatus? } */
export async function listLevels(params) {
  const data = await request.get('/admin/nurse-level/list', { params })
  return normalizePage(data)
}

/** 新增级别 body: { level_name, level_status } */
export const saveLevel = (data) => request.post('/admin/nurse-level/save', data)

/** 修改级别状态（query 传参）1:启用 2:停用 */
export const updateLevelStatus = (id, levelStatus) =>
  request.put('/admin/nurse-level/update-status', null, { params: { id, levelStatus } })

/** 查询某级别下配置的护理项目（NurseContent 实体，下划线字段） */
export const listLevelItems = (levelId) =>
  request.get(`/admin/nurse-level/items/${levelId}`)

/** 给级别添加护理项目（query 传参） */
export const saveLevelItem = (levelId, itemId) =>
  request.post('/admin/nurse-level/item/save', null, { params: { levelId, itemId } })

/** 从级别移除护理项目 */
export const removeLevelItem = (levelId, itemId) =>
  request.delete(`/admin/nurse-level/item/remove/${levelId}/${itemId}`)
