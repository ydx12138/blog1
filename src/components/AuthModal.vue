<template>
  <Teleport to="body">
    <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
      <div class="modal-card">
        <!-- 关闭按钮 -->
        <button class="modal-close" @click="$emit('close')" title="关闭">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- 登录表单 -->
        <template v-if="mode === 'login'">
          <h2 class="modal-title">登录</h2>
          <p class="modal-sub">欢迎回来，请登录你的账号</p>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-field">
              <label for="login-username">用户名</label>
              <input
                id="login-username"
                v-model.trim="loginForm.username"
                type="text"
                placeholder="请输入用户名"
                autocomplete="username"
                required
              />
            </div>
            <div class="form-field">
              <label for="login-password">密码</label>
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="current-password"
                required
              />
            </div>
            <p class="form-error" v-if="loginError">{{ loginError }}</p>
            <button type="submit" class="btn-submit" :disabled="loginLoading">
              {{ loginLoading ? '登录中...' : '登录' }}
            </button>
          </form>

          <p class="switch-mode">
            还没有账号？
            <button class="link-btn" @click="switchToRegister">立即注册</button>
          </p>
        </template>

        <!-- 注册表单 -->
        <template v-else>
          <h2 class="modal-title">注册</h2>
          <p class="modal-sub">创建一个新账号，加入我们</p>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-field">
              <label for="reg-username">用户名</label>
              <input
                id="reg-username"
                v-model.trim="registerForm.username"
                type="text"
                placeholder="请输入用户名"
                autocomplete="username"
                minlength="2"
                maxlength="20"
                required
              />
            </div>
            <div class="form-field">
              <label for="reg-email">邮箱</label>
              <input
                id="reg-email"
                v-model.trim="registerForm.email"
                type="email"
                placeholder="请输入邮箱"
                autocomplete="email"
                required
              />
            </div>
            <div class="form-field">
              <label for="reg-password">密码</label>
              <input
                id="reg-password"
                v-model="registerForm.password"
                type="password"
                placeholder="请设置密码（不少于6位）"
                autocomplete="new-password"
                minlength="6"
                required
              />
            </div>
            <div class="form-field">
              <label for="reg-confirm">确认密码</label>
              <input
                id="reg-confirm"
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                autocomplete="new-password"
                required
              />
            </div>
            <p class="form-error" v-if="registerError">{{ registerError }}</p>
            <button type="submit" class="btn-submit" :disabled="registerLoading">
              {{ registerLoading ? '注册中...' : '注册' }}
            </button>
          </form>

          <p class="switch-mode">
            已有账号？
            <button class="link-btn" @click="switchToLogin">去登录</button>
          </p>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuth } from '../stores/auth.js'

const emit = defineEmits(['close'])

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const { login, register } = useAuth()

const mode = ref('login') // 'login' | 'register'
const loginError = ref('')
const registerError = ref('')
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

function switchToRegister() {
  mode.value = 'register'
  loginError.value = ''
  registerError.value = ''
}

function switchToLogin() {
  mode.value = 'login'
  loginError.value = ''
  registerError.value = ''
}

function handleLogin() {
  loginError.value = ''
  if (!loginForm.username || !loginForm.password) {
    loginError.value = '请填写用户名和密码'
    return
  }

  loginLoading.value = true
  // 模拟网络延迟
  setTimeout(() => {
    const result = login(loginForm.username, loginForm.password)
    if (result.success) {
      emit('close')
      loginForm.username = ''
      loginForm.password = ''
    } else {
      loginError.value = result.message
    }
    loginLoading.value = false
  }, 400)
}

function handleRegister() {
  registerError.value = ''
  if (!registerForm.username || !registerForm.email || !registerForm.password) {
    registerError.value = '请填写所有字段'
    return
  }
  if (registerForm.username.length < 2) {
    registerError.value = '用户名至少2个字符'
    return
  }
  if (registerForm.password.length < 6) {
    registerError.value = '密码不少于6位'
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = '两次输入的密码不一致'
    return
  }

  registerLoading.value = true
  setTimeout(() => {
    const result = register(
      registerForm.username,
      registerForm.email,
      registerForm.password
    )
    if (result.success) {
      emit('close')
      registerForm.username = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      registerError.value = result.message
    }
    registerLoading.value = false
  }, 400)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px 32px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.modal-close:hover {
  background: var(--tag-bg);
  color: var(--text);
}

.modal-title {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 700;
  color: var(--heading);
  margin-bottom: 4px;
  text-align: center;
}

.modal-sub {
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 28px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-field input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-sans);
  transition: border-color var(--transition);
  outline: none;
}

.form-field input:focus {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.form-field input::placeholder {
  color: var(--text-muted);
}

.form-error {
  font-size: 13px;
  color: #dc2626;
  margin: 0;
}

.btn-submit {
  height: 44px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  margin-top: 4px;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-mode {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.link-btn {
  border: none;
  background: none;
  color: var(--accent);
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .modal-card {
    padding: 28px 20px 24px;
  }

  .modal-title {
    font-size: 22px;
  }
}
</style>
