import request from '@/utils/request'

// 查询在线用户列表
export function getList(data) {
  return request({
    url: '/Base/System/Online',
    method: 'post',
    data,
  })
}

// 强退用户
export function forceLogout(tokenId) {
  return request({
    url: '/monitor/online/' + tokenId,
    method: 'delete',
  })
}
