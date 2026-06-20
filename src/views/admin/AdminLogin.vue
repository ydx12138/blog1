<template>
  <div class="admin-login-page">
    <div class="login-card">
      <h1>管理员登录</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-field">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入管理员用户名" required />
        </div>
        <div class="form-field">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" required />
        </div>
        <p class="error" v-if="error">{{ error }}</p>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const router = useRouter()
const { adminLogin } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  if (!username.value || !password.value) { error.value = '请填写用户名和密码'; return }
  loading.value = true
  try {
    await adminLogin(username.value, password.value)
    router.push('/admin')
  } catch (e) {
    error.value = e.message || '登录失败'
  }
  loading.value = false
}
</script>

<style scoped>
.admin-login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
.login-card { width: 100%; max-width: 380px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px 32px; box-shadow: var(--shadow-md); }
.login-card h1 { font-family: var(--font-serif); font-size: 24px; text-align: center; margin-bottom: 28px; color: var(--heading); }
.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-field label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.form-field input { height: 42px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; outline: none; transition: border-color var(--transition); }
.form-field input:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); }
.error { font-size: 13px; color: #dc2626; margin-bottom: 12px; }
.btn { width: 100%; height: 44px; border: none; border-radius: var(--radius-sm); background: var(--accent); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all var(--transition); }
.btn:hover:not(:disabled) { opacity: 0.9; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
