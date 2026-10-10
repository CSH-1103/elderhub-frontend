/**
 * 接口复验脚本（端到端验证用）
 * 用法：node scripts/verify-api.js
 */
const BASE = 'http://localhost:8080/ElderHub'

async function call(label, method, url, token, body) {
  try {
    const res = await fetch(BASE + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = await res.json()
    const summary =
      json.code === 200
        ? `code=200 data=${JSON.stringify(json.data).slice(0, 260)}`
        : `code=${json.code} msg=${json.message}`
    console.log(`${json.code === 200 ? 'PASS' : 'FAIL'}  ${label}: ${summary}`)
    return json
  } catch (e) {
    console.log(`ERR   ${label}: ${e.message}`)
    return null
  }
}

async function main() {
  // 1. 登录
  const admin = await call('admin登录', 'POST', '/auth/login', null, { username: 'admin', password: '123456' })
  const butler = await call('butler登录', 'POST', '/auth/login', null, { username: 'butler', password: '123456' })
  const at = admin?.data?.token
  const bt = butler?.data?.token
  console.log(`admin role=${admin?.data?.role}, butler role=${butler?.data?.role}`)

  // 2. 此前 500 的接口（验证 @TableName 修复）
  await call('护理级别列表', 'GET', '/admin/nurse-level/list', at)
  await call('护理项目列表', 'GET', '/admin/nurse-content/list', at)

  // 3. 床位/客户
  const details = await call('床位使用详情', 'GET', '/admin/bed/details/list?current=1&size=10', at)
  await call('床位统计', 'GET', '/admin/bed/statistics', at)
  await call('床位地图', 'GET', '/admin/bed/map', at)
  await call('无床位客户', 'GET', '/admin/customer/no-nurse', at)
  await call('房间列表', 'GET', '/admin/bed/room/list', at)
  await call('空闲床位(101房)', 'GET', '/admin/bed/free/101', at)

  // 4. 用户/角色
  await call('用户列表', 'GET', '/admin/user/list?current=1&size=10', at)
  await call('管家列表', 'GET', '/admin/user/nurse-list', at)
  await call('角色列表', 'GET', '/admin/role/list', at)
  await call('菜单树', 'GET', '/admin/menu/tree', at)

  // 5. 审批/记录（空表也应 code 200）
  await call('外出审批列表', 'GET', '/admin/outward/list?current=1&size=10', at)
  await call('退住审批列表', 'GET', '/admin/back-down/list?current=1&size=10', at)
  await call('客户护理记录', 'GET', '/admin/nurse-record/list/1', at)
  await call('客户已购护理项', 'GET', '/admin/customer/nurse-items/1', at)

  // 6. 管家端
  if (bt) {
    const bid = butler?.data?.userId
    await call('管家-我的客户', 'GET', `/nurse/customer/list?pageNum=1&pageSize=10&userId=${bid}`, bt)
    await call('管家-外出列表', 'GET', `/nurse/outward/list?userId=${bid}`, bt)
    await call('管家-退住列表', 'GET', `/nurse/back-down/list?userId=${bid}`, bt)
  }

  // 7. 鉴权校验：无 token 访问管理接口应被拒
  await call('无token访问(应401/403)', 'GET', '/admin/nurse-level/list', null)
}

main()
