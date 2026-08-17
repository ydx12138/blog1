import { ref } from 'vue'

const NOTICE_DURATION = 3500
let nextNoticeId = 0
const timers = new Map()

export const notices = ref([])

// showError 添加一条错误提示并启动自动关闭计时。
// 参数：message 为展示给用户的错误文本；返回值：新提示的唯一 ID。
export function showError(message) {
  const notice = {
    id: ++nextNoticeId,
    message: String(message || '').trim() || '操作失败',
    remaining: NOTICE_DURATION,
    startedAt: Date.now(),
  }
  notices.value = [...notices.value, notice]
  startTimer(notice)
  return notice.id
}

// removeNotice 移除指定提示并清除对应的自动关闭计时器。
// 参数：noticeId 为提示唯一 ID；返回值：无。
export function removeNotice(noticeId) {
  clearTimer(noticeId)
  notices.value = notices.value.filter((notice) => notice.id !== noticeId)
}

// pauseNotice 暂停指定提示的自动关闭倒计时。
// 参数：noticeId 为提示唯一 ID；返回值：无。
export function pauseNotice(noticeId) {
  const notice = notices.value.find((item) => item.id === noticeId)
  if (!notice) return
  notice.remaining = Math.max(0, notice.remaining - (Date.now() - notice.startedAt))
  clearTimer(noticeId)
}

// resumeNotice 恢复指定提示的自动关闭倒计时。
// 参数：noticeId 为提示唯一 ID；返回值：无。
export function resumeNotice(noticeId) {
  const notice = notices.value.find((item) => item.id === noticeId)
  if (!notice || timers.has(noticeId)) return
  startTimer(notice)
}

// startTimer 为一条提示启动剩余时间的自动关闭计时器。
// 参数：notice 为要计时的提示对象；返回值：无。
function startTimer(notice) {
  notice.startedAt = Date.now()
  const timer = globalThis.setTimeout(() => removeNotice(notice.id), notice.remaining)
  timers.set(notice.id, timer)
}

// clearTimer 停止并移除指定提示的自动关闭计时器。
// 参数：noticeId 为提示唯一 ID；返回值：无。
function clearTimer(noticeId) {
  const timer = timers.get(noticeId)
  if (timer !== undefined) {
    globalThis.clearTimeout(timer)
    timers.delete(noticeId)
  }
}
