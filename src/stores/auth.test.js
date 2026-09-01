import assert from 'node:assert/strict'
import test from 'node:test'

// createStorage 构造测试用本地存储；参数为初始键值；返回兼容 localStorage 的内存对象。
function createStorage(values = {}) {
  const entries = new Map(Object.entries(values))
  return {
    getItem(key) { return entries.get(key) || null },
    setItem(key, value) { entries.set(key, String(value)) },
    removeItem(key) { entries.delete(key) },
  }
}

test('setUserAvatar updates reactive user state and local cache', async () => {
  const storage = createStorage({
    'blog-user': JSON.stringify({ id: 1, email: 'user@example.com', avatar: 'old.png' }),
  })
  globalThis.localStorage = storage
  globalThis.window = { addEventListener() {} }
  const { useAuth } = await import(`./auth.js?avatar-test=${Date.now()}`)
  const auth = useAuth()

  auth.setUserAvatar('https://cdn.example.com/new-avatar.png')

  assert.equal(auth.user.value.avatar, 'https://cdn.example.com/new-avatar.png')
  assert.equal(JSON.parse(storage.getItem('blog-user')).avatar, 'https://cdn.example.com/new-avatar.png')
})
