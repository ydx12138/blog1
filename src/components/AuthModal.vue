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
              <div class="label-row">
                <label for="login-password">密码</label>
                <button type="button" class="inline-link" @click="switchToForgot">忘记密码？</button>
              </div>
              <div class="password-wrapper">
                <input id="login-password" v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" placeholder="请输入密码" autocomplete="current-password" required />
                <button type="button" class="eye-btn" @click="showLoginPassword = !showLoginPassword" tabindex="-1">
                  <svg v-if="showLoginPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-field">
              <div class="label-row">
                <label for="login-captcha">图形验证码</label>
                <span class="captcha-hint">点击图片刷新</span>
              </div>
              <div class="captcha-row">
                <input id="login-captcha" v-model.trim="loginForm.captchaCode" type="text" maxlength="4" placeholder="请输入图中字符" autocomplete="off" required />
                <button type="button" class="captcha-image-button" :disabled="captchaLoading" title="点击刷新验证码" aria-label="刷新图形验证码" @click="loadCaptcha">
                  <img v-if="captchaImage" :src="captchaImage" alt="图形验证码" />
                  <span v-else>{{ captchaLoading ? '加载中' : '重新加载' }}</span>
                </button>
              </div>
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

        <template v-else-if="mode === 'register'">
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
                <button type="button" class="btn-code" :disabled="!canSendRegisterCode" @click="handleSendRegisterCode">
                  {{ registerCodeButtonText }}
                </button>
              </div>
            </div>
            <div class="form-field">
              <label for="reg-nickname">昵称</label>
              <input id="reg-nickname" v-model.trim="registerForm.nickname" type="text" placeholder="给自己起个名字" required />
            </div>
            <div class="form-field">
              <label for="reg-password">密码</label>
              <div class="password-wrapper">
                <input id="reg-password" v-model="registerForm.password" :type="showRegPassword ? 'text' : 'password'" placeholder="6-10 位密码" autocomplete="new-password" minlength="6" maxlength="10" required />
                <button type="button" class="eye-btn" @click="showRegPassword = !showRegPassword" tabindex="-1">
                  <svg v-if="showRegPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-field">
              <label for="reg-confirm">确认密码</label>
              <div class="password-wrapper">
                <input id="reg-confirm" v-model="registerForm.confirmPassword" :type="showRegConfirm ? 'text' : 'password'" placeholder="再次输入密码" autocomplete="new-password" required />
                <button type="button" class="eye-btn" @click="showRegConfirm = !showRegConfirm" tabindex="-1">
                  <svg v-if="showRegConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
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

        <template v-else>
          <h2 class="modal-title">重置密码</h2>
          <p class="modal-sub">通过邮箱验证码设置新密码</p>
          <form @submit.prevent="handleResetPassword" class="auth-form">
            <div class="form-field">
              <label for="reset-email">邮箱</label>
              <input id="reset-email" v-model.trim="resetForm.email" type="email" placeholder="请输入绑定邮箱" autocomplete="email" required />
            </div>
            <div class="form-field">
              <label for="reset-code">验证码</label>
              <div class="code-row">
                <input id="reset-code" v-model.trim="resetForm.code" type="text" inputmode="numeric" maxlength="6" placeholder="6 位验证码" autocomplete="one-time-code" required />
                <button type="button" class="btn-code" :disabled="!canSendResetCode" @click="handleSendResetCode">
                  {{ resetCodeButtonText }}
                </button>
              </div>
            </div>
            <div class="form-field">
              <label for="reset-password">新密码</label>
              <div class="password-wrapper">
                <input id="reset-password" v-model="resetForm.password" :type="showResetPassword ? 'text' : 'password'" placeholder="6-10 位新密码" autocomplete="new-password" minlength="6" maxlength="10" required />
                <button type="button" class="eye-btn" @click="showResetPassword = !showResetPassword" tabindex="-1">
                  <svg v-if="showResetPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-field">
              <label for="reset-confirm">确认新密码</label>
              <div class="password-wrapper">
                <input id="reset-confirm" v-model="resetForm.confirmPassword" :type="showResetConfirm ? 'text' : 'password'" placeholder="再次输入新密码" autocomplete="new-password" required />
                <button type="button" class="eye-btn" @click="showResetConfirm = !showResetConfirm" tabindex="-1">
                  <svg v-if="showResetConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <p class="form-notice" v-if="resetNotice">{{ resetNotice }}</p>
            <p class="form-error" v-if="resetError">{{ resetError }}</p>
            <button type="submit" class="btn-submit" :disabled="resetLoading">
              {{ resetLoading ? '提交中...' : '重置密码' }}
            </button>
          </form>
          <p class="switch-mode">
            想起来了？<button class="link-btn" @click="switchToLogin">返回登录</button>
          </p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useAuth } from '../stores/auth.js'
import { siteSettings } from '../data/site.js'
import { showError } from '../composables/useNotice.js'

const emit = defineEmits(['close'])
const props = defineProps({ visible: { type: Boolean, default: false } })

const {
  login,
  getCaptcha,
  register,
  sendRegisterCode,
  sendPasswordResetCode,
  updatePasswordByCode,
} = useAuth()

const mode = ref('login')
const loginError = ref('')
const registerError = ref('')
const registerNotice = ref('')
const resetError = ref('')
const resetNotice = ref('')
const loginLoading = ref(false)
const captchaLoading = ref(false)
const captchaId = ref('')
const captchaImage = ref('')
const registerLoading = ref(false)
const resetLoading = ref(false)
const registerCodeSending = ref(false)
const resetCodeSending = ref(false)
const registerCodeCountdown = ref(0)
const resetCodeCountdown = ref(0)
let registerCodeTimer = null
let resetCodeTimer = null

const loginForm = reactive({ email: '', password: '', captchaCode: '' })
const registerForm = reactive({ email: '', code: '', nickname: '', password: '', confirmPassword: '' })
const resetForm = reactive({ email: '', code: '', password: '', confirmPassword: '' })
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 密码可见性状态
const showLoginPassword = ref(false)
const showRegPassword = ref(false)
const showRegConfirm = ref(false)
const showResetPassword = ref(false)
const showResetConfirm = ref(false)

const canSendRegisterCode = computed(() => emailPattern.test(registerForm.email) && !registerCodeSending.value && registerCodeCountdown.value === 0)
const canSendResetCode = computed(() => emailPattern.test(resetForm.email) && !resetCodeSending.value && resetCodeCountdown.value === 0)
const registerCodeButtonText = computed(() => codeButtonText(registerCodeSending.value, registerCodeCountdown.value))
const resetCodeButtonText = computed(() => codeButtonText(resetCodeSending.value, resetCodeCountdown.value))

function codeButtonText(sending, countdown) {
  if (sending) return '发送中...'
  if (countdown > 0) return `${countdown}s`
  return '发送验证码'
}

function switchToRegister() {
  if (!siteSettings.registerEnabled) {
    showError('功能升级中')
    return
  }
  mode.value = 'register'
  clearMessages()
}

function switchToLogin() {
  mode.value = 'login'
  clearMessages()
  loadCaptcha()
}

function switchToForgot() {
  mode.value = 'forgot'
  clearMessages()
  resetForm.email = loginForm.email
}

function clearMessages() {
  loginError.value = ''
  registerError.value = ''
  registerNotice.value = ''
  resetError.value = ''
  resetNotice.value = ''
}

function startCountdown(kind) {
  const isRegister = kind === 'register'
  clearCountdown(kind)
  if (isRegister) {
    registerCodeCountdown.value = 60
    registerCodeTimer = window.setInterval(() => {
      registerCodeCountdown.value -= 1
      if (registerCodeCountdown.value <= 0) clearCountdown('register')
    }, 1000)
    return
  }
  resetCodeCountdown.value = 60
  resetCodeTimer = window.setInterval(() => {
    resetCodeCountdown.value -= 1
    if (resetCodeCountdown.value <= 0) clearCountdown('reset')
  }, 1000)
}

function clearCountdown(kind) {
  if (kind === 'register' || !kind) {
    if (registerCodeTimer) {
      window.clearInterval(registerCodeTimer)
      registerCodeTimer = null
    }
    if (registerCodeCountdown.value < 0) registerCodeCountdown.value = 0
  }
  if (kind === 'reset' || !kind) {
    if (resetCodeTimer) {
      window.clearInterval(resetCodeTimer)
      resetCodeTimer = null
    }
    if (resetCodeCountdown.value < 0) resetCodeCountdown.value = 0
  }
}

function resetRegisterForm() {
  registerForm.email = ''
  registerForm.code = ''
  registerForm.nickname = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerCodeCountdown.value = 0
  clearCountdown('register')
}

function resetPasswordForm() {
  resetForm.email = ''
  resetForm.code = ''
  resetForm.password = ''
  resetForm.confirmPassword = ''
  resetCodeCountdown.value = 0
  clearCountdown('reset')
}

function validatePasswordPair(form, setError) {
  if (form.password.length < 6) {
    setError('密码不少于 6 位')
    return false
  }
  if (form.password.length > 10) {
    setError('密码不能超过 10 位')
    return false
  }
  if (form.password !== form.confirmPassword) {
    setError('两次输入的密码不一致')
    return false
  }
  return true
}

async function handleLogin() {
  loginError.value = ''
  if (!loginForm.email || !loginForm.password || !loginForm.captchaCode) {
    loginError.value = '请填写邮箱、密码和图形验证码'
    return
  }
  if (loginForm.captchaCode.length !== 4 || !captchaId.value) {
    loginError.value = '请输入 4 位图形验证码'
    return
  }
  loginLoading.value = true
  try {
    const result = await login(loginForm.email, loginForm.password, captchaId.value, loginForm.captchaCode)
    if (result.success) {
      emit('close')
      loginForm.email = ''
      loginForm.password = ''
      loginForm.captchaCode = ''
    }
  } catch (e) {
    loginError.value = e.message || '登录失败'
    await loadCaptcha()
  } finally {
    loginLoading.value = false
  }
}

// loadCaptcha 获取新的图形验证码；无参数；返回验证码加载 Promise，并更新登录表单使用的验证码 ID 与图片。
async function loadCaptcha() {
  if (captchaLoading.value) return
  captchaLoading.value = true
  loginForm.captchaCode = ''
  try {
    const data = await getCaptcha()
    captchaId.value = data.captchaId
    captchaImage.value = data.picBase64
  } catch (e) {
    captchaId.value = ''
    captchaImage.value = ''
    loginError.value = e.message || '图形验证码加载失败'
  } finally {
    captchaLoading.value = false
  }
}

async function handleSendRegisterCode() {
  registerError.value = ''
  registerNotice.value = ''
  if (!emailPattern.test(registerForm.email)) {
    registerError.value = '请先填写正确的邮箱'
    return
  }
  registerCodeSending.value = true
  try {
    await sendRegisterCode(registerForm.email)
    registerNotice.value = '验证码已发送，请在 60 秒内完成注册'
    startCountdown('register')
  } catch (e) {
    registerError.value = e.message || '验证码发送失败'
  } finally {
    registerCodeSending.value = false
  }
}

async function handleSendResetCode() {
  resetError.value = ''
  resetNotice.value = ''
  if (!emailPattern.test(resetForm.email)) {
    resetError.value = '请先填写正确的邮箱'
    return
  }
  resetCodeSending.value = true
  try {
    await sendPasswordResetCode(resetForm.email)
    resetNotice.value = '验证码已发送，请在 60 秒内完成重置'
    startCountdown('reset')
  } catch (e) {
    resetError.value = e.message || '验证码发送失败'
  } finally {
    resetCodeSending.value = false
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
  if (!validatePasswordPair(registerForm, (msg) => { registerError.value = msg })) return
  registerLoading.value = true
  try {
    await register(registerForm)
    emit('close')
    resetRegisterForm()
    mode.value = 'login'
  } catch (e) {
    if (e.code === 1009) {
      showError('功能升级中')
    } else {
      registerError.value = e.message || '注册失败'
    }
  } finally {
    registerLoading.value = false
  }
}

async function handleResetPassword() {
  resetError.value = ''
  if (!resetForm.email || !resetForm.code || !resetForm.password) {
    resetError.value = '请填写所有字段'
    return
  }
  if (resetForm.code.length !== 6) {
    resetError.value = '请输入 6 位验证码'
    return
  }
  if (!validatePasswordPair(resetForm, (msg) => { resetError.value = msg })) return
  resetLoading.value = true
  try {
    await updatePasswordByCode(resetForm)
    resetNotice.value = '密码已重置，请使用新密码登录'
    loginForm.email = resetForm.email
    loginForm.password = ''
    resetPasswordForm()
    mode.value = 'login'
  } catch (e) {
    resetError.value = e.message || '密码重置失败'
  } finally {
    resetLoading.value = false
  }
}

watch(() => props.visible, (visible) => {
  if (visible && mode.value === 'login') loadCaptcha()
})

onBeforeUnmount(() => clearCountdown())
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
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
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

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrapper input {
  flex: 1;
  padding-right: 40px;
}
/* 隐藏浏览器自带的密码眼睛图标 */
.password-wrapper input::-ms-reveal,
.password-wrapper input::-webkit-credentials-auto-fill-button {
  display: none !important;
}
.eye-btn {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  border-radius: var(--radius-sm);
  transition: color var(--transition);
}
.eye-btn:hover {
  color: var(--text);
}

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  gap: 8px;
}
.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 116px;
  gap: 8px;
}
.captcha-hint {
  color: var(--text-muted);
  font-size: 12px;
}
.captcha-image-button {
  width: 116px;
  height: 42px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-muted);
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.captcha-image-button:hover:not(:disabled) {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.captcha-image-button:disabled {
  cursor: wait;
  opacity: 0.7;
}
.captcha-image-button img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.captcha-image-button span {
  font-size: 12px;
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
.link-btn,
.inline-link {
  border: none; background: none;
  color: var(--accent); font-size: 13px;
  font-weight: 500; cursor: pointer; padding: 0;
}
.link-btn:hover,
.inline-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .modal-card { padding: 28px 20px 24px; }
  .modal-title { font-size: 22px; }
}

@media (max-width: 420px) {
  .code-row { grid-template-columns: 1fr; }
  .btn-code { width: 100%; }
  .captcha-row { grid-template-columns: minmax(0, 1fr) 108px; }
  .captcha-image-button { width: 108px; }
}
</style>
