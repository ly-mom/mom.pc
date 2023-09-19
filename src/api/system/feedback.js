import request from '@/utils/request'

// 主页-获取反馈列表
export function listFeedback(data) {
  return request({
    url: '/Base/Home/GetFeedbacks',
    method: 'post',
    data: data,
  })
}

// 主页-查看反馈
export function getFeedback(FeedbackId) {
  return request({
    url: '/Base/Home/GetFeedbackById?id=' + FeedbackId,
    method: 'get',
  })
}

// 主页-添加意见反馈
export function addFeedback(data) {
  return request({
    url: '/Base/Home/Feedback',
    method: 'post',
    data: data,
  })
}
// 主页-删除意见反馈
export function deleteFeedback(data) {
  return request({
    url: '/Base/Home/DelFeedback',
    method: 'DELETE',
    data: data,
  })
}
