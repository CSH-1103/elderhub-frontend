import request, { normalizePage } from './request'

/**
 * 床位管理（/admin/bed），VO 均为驼峰
 */

/** 床位统计 { totalBeds, freeBeds, occupiedBeds, awayBeds } */
export const getStatistics = () => request.get('/admin/bed/statistics')

/** 床位示意图 params: { floor? } → RoomBedVO[] { id, roomFloor, roomNo, beds: BedVO[] } */
export const getBedMap = (floor) => request.get('/admin/bed/map', { params: { floor } })

/**
 * 床位使用详情分页 params: { customerName?, roomNo?, startDate?, status, pageNum, pageSize }
 * status: 1-正在使用 2-使用历史
 */
export async function listDetails(params) {
  const data = await request.get('/admin/bed/details/list', { params })
  return normalizePage(data)
}

/** 修改床位使用详情（仅 endDate，yyyy-MM-dd），query 传参 */
export const updateDetails = (id, endDate) =>
  request.put('/admin/bed/details/update', null, { params: { id, endDate } })

/** 床位调换 body: { customerId, oldBedId, newBedId, bedDetails } */
export const transferBed = (data) => request.post('/admin/bed/transfer', data)

/** 房间列表 RoomVO[] { id, roomFloor, roomNo } */
export const listRooms = () => request.get('/admin/bed/room/list')

/** 按房间号查空闲床位 BedVO[] */
export const listFreeBeds = (roomNo) => request.get(`/admin/bed/free/${roomNo}`)
