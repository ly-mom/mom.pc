import request from '@/utils/request'

// 查询列表
export function getInfoList(data) {
  return request({
    url: '/Base/Base_PushMessageInfo/GetPageDataList',
    method: 'post',
    data: data,
  })
}

export function editOrAddInfo(data) {
  return request({
    url: '/Base/Base_PushMessageInfo/SaveForm',
    method: 'post',
    data: data,
  })
}

export function deleteInfo(id) {
  return request({
    url: `/Base/Base_PushMessageInfo/DeleteForm/${id}`,
    method: 'get',
  })
}

export function getInfo(id) {
  return request({
    url: `/Base/Base_PushMessageInfo/GetTheData/${id}`,
    method: 'get',
  })
}

export function BGListApi(data) {
  return request({
    url: `Base/Base_Organization/GetBgDataList`,
    method: 'post',
    data: data,
  })
}

export function SBUListApi(data) {
  return request({
    url: `Base/Base_Organization/GetSbuDataList`,
    method: 'post',
    data: data,
  })
}

export function BUListApi(data) {
  return request({
    url: '/Base/Base_Organization/GetBuDataList',
    method: 'post',
    data,
  })
}
