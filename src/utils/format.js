/**
 * 展示格式化工具
 * 后端时间格式：java.util.Date → 'yyyy-MM-dd HH:mm:ss'；
 * LocalDateTime → ISO 带 T（'2026-10-10T15:30:00'）；LocalDate → 'yyyy-MM-dd'
 */

/** 去掉 ISO 时间的 T 并截断到分钟；空值返回 '—' */
export function fmtDateTime(value) {
  if (!value) return '—'
  return String(value).replace('T', ' ').slice(0, 16)
}

/** 纯日期展示（LocalDate / Date 字符串），空值返回 '—' */
export function fmtDate(value) {
  if (!value) return '—'
  return String(value).replace('T', ' ').slice(0, 10)
}

/** 任意值空值兜底显示 '—' */
export function fmtOrDash(value) {
  if (value === null || value === undefined || value === '') return '—'
  return value
}

/**
 * el-date-picker（value-format="YYYY-MM-DDTHH:mm:ss"）选择的值直接提交即可。
 * 此函数用于把 Date 对象转成后端 LocalDateTime 可解析的 ISO 字符串（带 T）。
 */
export function toLocalDateTimeString(date) {
  if (!date) return null
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 金额（分/整数元）展示，空值 '—' */
export function fmtPrice(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `¥${value}`
}
