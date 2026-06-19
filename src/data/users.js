/**
 * 用户数据 — 对应 users 表
 * 字段: id, username, password, email, avatar, bio, created_at, updated_at
 */

/** 模拟用户表（内存数据库） */
const MOCK_USERS = [
  {
    id: 1,
    username: 'demo',
    password: 'demo123',
    email: 'demo@blog.local',
    avatar: '',
    bio: '这是一个体验账号',
    created_at: '2025-01-01 00:00:00',
    updated_at: '2025-01-01 00:00:00',
  },
]

/** 根据用户名查找用户 */
export function findUserByUsername(username) {
  return MOCK_USERS.find((u) => u.username === username) || null
}

/** 根据 ID 查找用户（去除密码字段） */
export function getUserById(id) {
  const user = MOCK_USERS.find((u) => u.id === id)
  if (!user) return null
  const { password, ...safe } = user
  return safe
}

/** 创建新用户 */
export function createUser({ username, email, password }) {
  const newUser = {
    id: MOCK_USERS.length > 0 ? Math.max(...MOCK_USERS.map((u) => u.id)) + 1 : 1,
    username,
    password,
    email,
    avatar: '',
    bio: '',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }
  MOCK_USERS.push(newUser)
  const { password: _, ...safe } = newUser
  return safe
}

/** 校验用户名是否已存在 */
export function isUsernameTaken(username) {
  return MOCK_USERS.some((u) => u.username === username)
}
