import request from '@/utils/request'

// 查询公告列表
export function listNotice(data) {
  return request({
    url: '/Base/Home/GetNotifyList',
    method: 'post',
    data: data,
  })
}

// 查询公告详细
export function getNotice(noticeId) {
  return request({
    url: '/Base/Home/GetGetNotifyById?id=' + noticeId,
    method: 'get',
  })
}

// 新增公告
export function addNotice(data) {
  return request({
    url: '/Base/Home/AddNotify',
    method: 'post',
    data: data,
  })
}

// 修改公告
export function updateNotice(data) {
  return request({
    url: '/Base/Home/EditdNotify',
    method: 'put',
    data: data,
  })
}

// 删除公告
export function delNotice(data) {
  return request({
    url: '/Base/Home/DelNotify',
    method: 'delete',
    data: data,
  })
}
// 置顶公告
export function topNotice(noticeId) {
  return request({
    url: '/Base/Home/TopNotify?id=' + noticeId,
    method: 'put',
  })
}
// 置顶公告
export function cancelTopNotice(noticeId) {
  return request({
    url: '/Base//Home/TopCancelNotify?id=' + noticeId,
    method: 'put',
  })
}
