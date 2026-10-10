import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

/**
 * Axios 统一封装
 * - baseURL=/api，由 Vite 代理转发到 http://localhost:8080/ElderHub
 * - 请求拦截：自动携带 Authorization: Bearer <token>（登录/注册除外）
 * - 响应拦截：code===200 直接返回 data；否则 ElMessage 报错并 reject
 * - 401：清除登录态并跳转 /login?redirect=xxx
 *
 * 注意：后端 Result 结构为 { code, message, data }（message 不是 msg）
 */

// 不需要携带 token 的接口
const WHITE_URLS = ['/auth/login', '/auth/register']

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
})

// 请求拦截器
request.interceptors.request.use((config) => {
  const url = config.url || ''
  const isWhite = WHITE_URLS.some((u) => url.includes(u))
  if (!isWhite) {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
  }
  return config
})

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 二进制等非标准结构直接透传
    if (res === null || typeof res !== 'object' || !('code' in res)) {
      return res
    }
    if (res.code === 200) {
      return res.data
    }
    // 业务错误（code !== 200）
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || 'Error'))
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      const userStore = useUserStore()
      userStore.clearLocal()
      ElMessage.error('登录已失效，请重新登录')
      const current = router.currentRoute.value.fullPath
      if (current !== '/login') {
        router.push(`/login?redirect=${encodeURIComponent(current)}`)
      }
    } else {
      ElMessage.error(error.response?.data?.message || error.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

/**
 * 分页结构归一化：兼容 IPage{records,total,...} 与 PageResult{records,total,pageNum,pageSize}
 * @param {Object} data 后端分页数据
 * @returns {{list: Array, total: number}}
 */
export function normalizePage(data) {
  if (!data) return { list: [], total: 0 }
  return {
    list: Array.isArray(data.records) ? data.records : [],
    total: Number(data.total) || 0,
  }
}

export default request
