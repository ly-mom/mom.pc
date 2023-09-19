import request from '@/utils/request'

// 查询操作日志列表
export function GetPushMsgList(data) {
  return request({
    url: '/Interface/DingTalk/GetPushMsgList',
    method: 'post',
    data: data,
  })
}
