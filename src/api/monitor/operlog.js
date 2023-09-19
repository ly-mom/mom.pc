import request from '@/utils/request'

// 查询操作日志列表
export function GetUserLogList(data) {
  return request({
    url: '/Base/System/GetUserLogList',
    method: 'post',
    data: data,
  })
}

// 回写sap的日志接口
export function getSAPData(data) {
  return request({
    url: '/Quality/SAP/GetSAPData',
    method: 'post',
    data: data,
  })
}
