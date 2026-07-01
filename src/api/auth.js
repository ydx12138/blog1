import { request } from './client.js'

export function login(email, password) {
  return request('POST', '/api/login', { email, password })
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

export function adminLogin(username, password) {
  return request('POST', '/api/admin/login', { username, password }, true)
}
