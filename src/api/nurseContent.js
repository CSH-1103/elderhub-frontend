import request, { normalizePage } from './request'

/**
 * 护理项目（/admin/nurse-content）
 * 注意：NurseContent 实体直出，JSON 字段为下划线
 * （serial_number/nursing_name/service_price/message/status/execution_cycle/execution_times）
 */

/** 分页查询 params: { pageNum, pageSize, status?, nursingName? } */
export async function listContents(params) {
  const data = await request.get('/admin/nurse-content/list', { params })
  return normalizePage(data)
}

/** 新增项目 body 为下划线字段 */
export const saveContent = (data) => request.post('/admin/nurse-content/save', data)

/** 修改项目 body 为下划线字段（需带 id） */
export const updateContent = (data) => request.put('/admin/nurse-content/update', data)

/** 删除项目（逻辑删除） */
export const removeContent = (id) => request.delete(`/admin/nurse-content/remove/${id}`)
