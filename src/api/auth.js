import request from './request'

/** 登录：返回 {userId, username, token, role} */
export const login = (data) => request.post('/auth/login', data)

/** 注册 */
export const register = (data) => request.post('/auth/register', data)

/** 登出 */
export const logout = () => request.post('/auth/logout')
