<template>
  <div class="admin-login-page">
    <button class="admin-theme-toggle" type="button" :title="isDark ? '切换亮色模式' : '切换暗色模式'" @click="toggleTheme">
      {{ isDark ? '亮色模式' : '暗色模式' }}
    </button>
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
        <div class="form-field">
          <label>图形验证码</label>
          <div class="captcha-row">
            <input v-model.trim="captchaCode" type="text" inputmode="text" maxlength="4" autocomplete="off" placeholder="请输入验证码" required />
            <button class="captcha-image" type="button" title="点击刷新验证码" :disabled="captchaLoading" @click="loadCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="图形验证码，点击刷新" />
              <span v-else>{{ captchaLoading ? '加载中' : '刷新' }}</span>
            </button>
          </div>
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'
import { useTheme } from '../../composables/useTheme.js'

const router = useRouter()
const { adminLogin, getCaptcha } = useAuth()
const { isDark, toggleTheme } = useTheme('blog-admin-theme')

const username = ref('')
const password = ref('')
const captchaId = ref('')
const captchaCode = ref('')
const captchaImage = ref('')
const captchaLoading = ref(false)
const error = ref('')
const loading = ref(false)

// loadCaptcha 获取管理员登录图形验证码；无参数；成功后更新验证码 ID 和图片，失败时显示错误信息。
async function loadCaptcha() {
  captchaLoading.value = true
  try {
    const data = await getCaptcha()
    captchaId.value = data.captchaId || ''
    captchaImage.value = data.picBase64 || ''
    captchaCode.value = ''
  } catch (requestError) {
    captchaId.value = ''
    captchaImage.value = ''
    error.value = requestError.message || '验证码加载失败'
  } finally {
    captchaLoading.value = false
  }
}

async function handleLogin() {
  error.value = ''
  if (!username.value || !password.value || !captchaCode.value || !captchaId.value) { error.value = '请填写用户名、密码和验证码'; return }
  loading.value = true
  try {
    await adminLogin(username.value, password.value, captchaId.value, captchaCode.value)
    router.push('/admin')
  } catch (e) {
    error.value = e.message || '登录失败'
    loadCaptcha()
  }
  loading.value = false
}

onMounted(loadCaptcha)
</script>

<style scoped>
.admin-login-page { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
.admin-theme-toggle { position: absolute; top: 24px; right: 28px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); cursor: pointer; font: inherit; font-size: 12px; padding: 7px 11px; transition: all var(--transition); }
.admin-theme-toggle:hover { border-color: var(--accent-border); color: var(--accent); background: var(--accent-light); }
.login-card { width: 100%; max-width: 380px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px 32px; box-shadow: var(--shadow-md); }
.login-card h1 { font-family: var(--font-serif); font-size: 24px; text-align: center; margin-bottom: 28px; color: var(--heading); }
.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-field label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.form-field input { height: 42px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; outline: none; transition: border-color var(--transition); }
.form-field input:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); }
.captcha-row { display: grid; grid-template-columns: minmax(0, 1fr) 112px; gap: 10px; }
.captcha-image { display: grid; height: 42px; overflow: hidden; place-items: center; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text-muted); cursor: pointer; }
.captcha-image:hover:not(:disabled) { border-color: var(--accent-border); }
.captcha-image:disabled { cursor: wait; opacity: .7; }
.captcha-image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.error { font-size: 13px; color: #dc2626; margin-bottom: 12px; }
.btn { width: 100%; height: 44px; border: none; border-radius: var(--radius-sm); background: var(--accent); color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: all var(--transition); }
.btn:hover:not(:disabled) { opacity: 0.9; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
