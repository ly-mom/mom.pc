import request from '@/utils/request'

// 登录方法
export function login(username, password) {
  const data = {
    userCode: username,
    password,
  }
  // url: 'Base/Base/home/SubmitLogin',
  return request({
    // url: 'Base/Base/home/SubmitLogin',
    url: 'Base/home/SubmitLogin',
    method: 'post',
    data: data,
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false,
    },
    method: 'post',
    data: data,
  })
}

// 获取用户详细信息
export function getInfo(params) {
  return request({
    // url: 'Base/Base/home/GetInfo',
    url: 'Base/home/GetInfo',
    method: 'get',
    params,
  })
}

// // 退出方法
export function logout(data) {
  return request({
    // url: '/Base/Base/home/Logout',
    url: '/Base/home/Logout',
    method: 'post',
    data: data,
  })
}

// 获取验证码
export function getCodeImg(params) {
  return request({
    url: '/Base/Home/PushVerifyCode',
    method: 'put',
    params,
  })
}
export function resetPwd(params) {
  return request({
    url: '/Base/Home/ResetPwd',
    method: 'put',
    params,
  })
}
