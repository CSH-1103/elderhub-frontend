import { defineStore } from 'pinia'

const STORAGE_KEY = 'eh_user'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY)
  }
  return { token: '', userId: null, username: '', role: '' }
}

/**
 * 登录用户状态（localStorage 持久化，刷新不丢失）
 * 后端 login 返回的 role 可能为 'ADMIN'/'USER'，也可能被 role 表中文名覆盖（如 '管理员'/'健康管家'），
 * 这里统一归一化：管理员判定只认 'ADMIN' 或 '管理员'，其余一律按健康管家（'USER'）处理
 */
function normalizeRole(raw) {
  if (raw === 'ADMIN' || raw === '管理员') return 'ADMIN'
  return 'USER'
}

export const useUserStore = defineStore('user', {
  state: () => loadFromStorage(),
  getters: {
    isAdmin: (state) => state.role === 'ADMIN',
    isLogin: (state) => !!state.token,
  },
  actions: {
    /** 登录成功后写入（data 为 /auth/login 返回的 {userId, username, token, role}） */
    setLogin(data) {
      this.token = data.token || ''
      this.userId = data.userId ?? null
      this.username = data.username || ''
      this.role = normalizeRole(data.role)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: this.token, userId: this.userId, username: this.username, role: this.role })
      )
    },
    /** 仅清除本地状态（不调接口），供 401 拦截器使用 */
    clearLocal() {
      this.token = ''
      this.userId = null
      this.username = ''
      this.role = ''
      localStorage.removeItem(STORAGE_KEY)
    },
    /** 退出登录：调后端 logout（无论成败）后清本地状态 */
    async logout() {
      try {
        const { default: request } = await import('@/api/request')
        await request.post('/auth/logout')
      } catch (e) {
        // JWT 无状态，后端失败也继续本地登出
      }
      this.clearLocal()
    },
  },
})
