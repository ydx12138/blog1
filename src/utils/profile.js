export function formatCreatedAt(value) {
  if (!value) return '未知'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未知'

  const pad = (number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function profileRows(profile) {
  const rows = [
    { label: '邮箱', value: profile.email || '未知' },
    { label: '昵称', value: profile.nickname || profile.email || '未知' },
    { label: '账号创建时间', value: formatCreatedAt(profile.created_at) },
  ]

  if (profile.phone) {
    rows.push({ label: '手机号', value: profile.phone })
  }

  return rows
}
