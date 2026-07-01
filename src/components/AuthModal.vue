<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
      <div class="modal-card">
        <button class="modal-close" @click="$emit('close')" title="关闭" aria-label="关闭">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <template v-if="mode === 'login'">
          <h2 class="modal-title">欢迎回来</h2>
          <p class="modal-sub">登录你的账号</p>
          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-field">
              <label for="login-email">邮箱</label>
              <input id="login-email" v-model.trim="loginForm.email" type="email" placeholder="请输入邮箱" autocomplete="email" required />
            </div>
            <div class="form-field">
              <label for="login-password">密码</label>
              <input id="login-password" v-model="loginForm.password" type="password" placeholder="请输入密码" autocomplete="current-password" required />
            </div>
            <p class="form-error" v-if="loginError">{{ loginError }}</p>
            <button type="submit" class="btn-submit" :disabled="loginLoading">
              {{ loginLoading ? '登录中...' : '登 录' }}
            </button>
          </form>
          <p class="switch-mode">
            还没有账号？<button class="link-btn" @click="switchToRegister">立即注册</button>
          </p>
        </template>

        <template v-else>
          <h2 class="modal-title">加入我们</h2>
          <p class="modal-sub">用邮箱验证码创建新账号</p>
          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-field">
              <label for="reg-email">邮箱</label>
              <input id="reg-email" v-model.trim="registerForm.email" type="email" placeholder="请输入邮箱" autocomplete="email" required />
            </div>
            <div class="form-field">
              <label for="reg-code">验证码</label>
              <div class="code-row">
                <input id="reg-code" v-model.trim="registerForm.code" type="text" inputmode="numeric" maxlength="6" placeholder="6 位验证码" autocomplete="one-time-code" required />
                <button type="button" class="btn-code" :disabled="!canSendCode" @click="handleSendRegisterCode">
                  {{ codeButtonText }}
                </button>
              </div>
            </div>
            <div class="form-field">
              <label for="reg-nickname">昵称</label>
              <input id="reg-nickname" v-model.trim="registerForm.nickname" type="text" placeholder="给自己起个名字" required />
            </div>
            <div class="form-field">
              <label for="reg-password">密码</label>
              <input id="reg-password" v-model="registerForm.password" type="password" placeholder="6-10 位密码" autocomplete="new-password" minlength="6" maxlength="10" required />
            </div>
            <div class="form-field">
              <label for="reg-confirm">确认密码</label>
              <input id="reg-confirm" v-model="registerForm.confirmPassword" type="password" placeholder="再次输入密码" autocomplete="new-password" required />
            </div>
            <p class="form-notice" v-if="registerNotice">{{ registerNotice }}</p>
            <p class="form-error" v-if="registerError">{{ registerError }}</p>
            <button type="submit" class="btn-submit" :disabled="registerLoading">
              {{ registerLoading ? '注册中...' : '注 册' }}
            </button>
          </form>
          <p class="switch-mode">
            已有账号？<button class="link-btn" @click="switchToLogin">去登录</button>
          </p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useAuth } from '../stores/auth.js'

const emit = defineEmits(['close'])
defineProps({ visible: { type: Boolean, default: false } })

const { login, register, sendRegisterCode } = useAuth()

const mode = ref('login')
const loginError = ref('')
const registerError = ref('')
const registerNotice = ref('')
const loginLoading = ref(false)
const registerLoading = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)
let codeTimer = null

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ email: '', code: '', nickname: '', password: '', confirmPassword: '' })
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const canSendCode = computed(() => emailPattern.test(registerForm.email) && !codeSending.value && codeCountdown.value === 0)
const codeButtonText = computed(() => {
  if (codeSending.value) return '发送中...'
  if (codeCountdown.value > 0) return `${codeCountdown.value}s`
  return '发送验证码'
})

function switchToRegister() {
  mode.value = 'register'
  loginError.value = ''
  registerError.value = ''
  registerNotice.value = ''
}

function switchToLogin() {
  mode.value = 'login'
  loginError.value = ''
  registerError.value = ''
  registerNotice.value = ''
}

function startCodeCountdown() {
  clearCodeTimer()
  codeCountdown.value = 60
  codeTimer = window.setInterval(() => {
    codeCountdown.value -= 1
    if (codeCountdown.value <= 0) clearCodeTimer()
  }, 1000)
}

function clearCodeTimer() {
  if (codeTimer) {
    window.clearInterval(codeTimer)
    codeTimer = null
  }
  if (codeCountdown.value < 0) codeCountdown.value = 0
}

function resetRegisterForm() {
  registerForm.email = ''
  registerForm.code = ''
  registerForm.nickname = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerNotice.value = ''
  registerError.value = ''
  codeCountdown.value = 0
  clearCodeTimer()
}

async function handleLogin() {
  loginError.value = ''
  if (!loginForm.email || !loginForm.password) {
    loginError.value = '请填写邮箱和密码'
    return
  }
  loginLoading.value = true
  try {
    const result = await login(loginForm.email, loginForm.password)
    if (result.success) {
      emit('close')
      loginForm.email = ''
      loginForm.password = ''
    }
  } catch (e) {
    loginError.value = e.message || '登录失败'
  } finally {
    loginLoading.value = false
  }
}

async function handleSendRegisterCode() {
  registerError.value = ''
  registerNotice.value = ''
  if (!emailPattern.test(registerForm.email)) {
    registerError.value = '请先填写正确的邮箱'
    return
  }
  codeSending.value = true
  try {
    await sendRegisterCode(registerForm.email)
    registerNotice.value = '验证码已发送，请在 60 秒内完成注册'
    startCodeCountdown()
  } catch (e) {
    registerError.value = e.message || '验证码发送失败'
  } finally {
    codeSending.value = false
  }
}

async function handleRegister() {
  registerError.value = ''
  if (!registerForm.email || !registerForm.code || !registerForm.password || !registerForm.nickname) {
    registerError.value = '请填写所有字段'
    return
  }
  if (registerForm.code.length !== 6) {
    registerError.value = '请输入 6 位验证码'
    return
  }
  if (registerForm.password.length < 6) {
    registerError.value = '密码不少于 6 位'
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = '两次输入的密码不一致'
    return
  }
  registerLoading.value = true
  try {
    await register(registerForm)
    emit('close')
    resetRegisterForm()
    mode.value = 'login'
  } catch (e) {
    registerError.value = e.message || '注册失败'
  } finally {
    registerLoading.value = false
  }
}

onBeforeUnmount(clearCodeTimer)
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-card {
  position: relative;
  width: 100%; max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px 32px 32px;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

.modal-close {
  position: absolute; top: 14px; right: 14px;
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  border: none; background: transparent;
  color: var(--text-muted); cursor: pointer;
  border-radius: var(--radius-sm); transition: all var(--transition);
}
.modal-close:hover { background: var(--tag-bg); color: var(--text); }

.modal-title {
  font-family: var(--font-serif);
  font-size: 24px; font-weight: 700;
  color: var(--heading); text-align: center;
  margin-bottom: 6px;
}
.modal-sub {
  font-size: 14px; color: var(--text-muted);
  text-align: center; margin-bottom: 28px;
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field label {
  font-size: 13px; font-weight: 500;
  color: var(--text-secondary);
}
.form-field input {
  height: 42px; padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg); color: var(--text);
  font-size: 14px; font-family: var(--font-sans);
  transition: border-color var(--transition); outline: none;
  min-width: 0;
}
.form-field input:focus {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.form-field input::placeholder { color: var(--text-muted); }

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  gap: 8px;
}
.btn-code {
  height: 42px;
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-sm);
  background: var(--accent-light);
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition);
}
.btn-code:hover:not(:disabled) {
  background: var(--accent);
  color: #fff;
}
.btn-code:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.form-error,
.form-notice {
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}
.form-error { color: var(--danger); }
.form-notice { color: var(--accent); }

.btn-submit {
  height: 44px; margin-top: 4px;
  border: none; border-radius: var(--radius-sm);
  background: var(--accent); color: #fff;
  font-size: 15px; font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition);
}
.btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.switch-mode {
  margin-top: 22px; text-align: center;
  font-size: 13px; color: var(--text-secondary);
}
.link-btn {
  border: none; background: none;
  color: var(--accent); font-size: 13px;
  font-weight: 500; cursor: pointer; padding: 0;
}
.link-btn:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .modal-card { padding: 28px 20px 24px; }
  .modal-title { font-size: 22px; }
}

@media (max-width: 420px) {
  .code-row {
    grid-template-columns: 1fr;
  }
  .btn-code {
    width: 100%;
  }
}
</style>
