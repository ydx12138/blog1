import { request } from './client.js'

// getCaptcha 获取登录图形验证码；无参数；返回验证码 ID 和可直接显示的 Base64 图片。
export function getCaptcha() {
  return request('GET', '/api/captcha')
}

export function login(email, password, captchaId, captchaCode) {
  return request('POST', '/api/login', {
    email,
    password,
    captcha_id: captchaId,
    captcha_code: captchaCode,
  })
}

export function sendRegisterCode(email) {
  return request('POST', '/api/register/code', { email })
}

export function register(data) {
  return request('POST', '/api/register', {
    email: data.email,
    password: data.password,
    re_password: data.confirmPassword || data.password,
    nickname: data.nickname || data.email.split('@')[0],
    code: data.code,
  })
}

export function sendPasswordResetCode(email) {
  return request('POST', '/api/sendpwdcode', { email })
}

export function updatePasswordByCode(data) {
  return request('POST', '/api/updatePasswordByCode', {
    email: data.email,
    password: data.password,
    re_password: data.confirmPassword || data.password,
    code: data.code,
  })
}

export function getCurrentUser() {
  return request('GET', '/api/users/me')
}

export function adminLogin(username, password) {
  return request('POST', '/api/admin/login', { username, password }, true)
}
