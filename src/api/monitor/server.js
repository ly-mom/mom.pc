import request from '@/utils/request'

// 查询服务器详细
export function getServer() {
  return request({
    url: '/monitor/server',
    method: 'get',
  })
}

// 查询登录日志
export function getLoginLogList(data) {
  return request({
    url: '/Base/System/GetLoginLogList',
    method: 'post',
    data,
  })
}

// 查询错误日志
export function getExceptionLogList(data) {
  return request({
    url: '/Base/System/GetExceptionLogList',
    method: 'post',
    data,
  })
}

// 开始处理错误信息
export function setExceptionDealWithUser(params) {
  return request({
    url: '/Base/System/SetExceptionDealWithUser',
    method: 'put',
    params,
  })
}

// 解决错误信息
export function dealWithException(params) {
  return request({
    url: '/Base/System/DealWithException',
    method: 'put',
    params,
  })
}
