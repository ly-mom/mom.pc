import request from '@/utils/request'

// 获取版本列表
export function getAppListApi(data) {
  return request({
    url: 'Base/Base_App/App/List',
    method: 'post',
    data: data,
  })
}

//新增版本
export function addApp(data) {
  return request({
    url: 'Base/Base_App/App',
    method: 'post',
    data: data,
  })
}

export function editApp(data) {
  return request({
    url: 'Base/Base_App/App',
    method: 'put',
    data: data,
  })
}

// 删除版本
export function delApp(data) {
  return request({
    url: 'Base/Base_App/App',
    method: 'delete',
    data: data,
  })
}
