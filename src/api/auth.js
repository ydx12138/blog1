import { request, uploadRequest } from './client.js'

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

// uploadUserAvatar 上传当前用户裁剪后的头像文件；参数为图片文件；返回头像 URL 数据。
export function uploadUserAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return uploadRequest('/api/users/avatar/upload', formData, false)
}

// updateUserAvatar 保存当前用户头像地址；参数为头像 URL；返回服务端保存结果。
export function updateUserAvatar(avatar) {
  return request('PUT', '/api/users/avatar', { avatar })
}

export function adminLogin(username, password) {
  return request('POST', '/api/admin/login', { username, password }, true)
}
