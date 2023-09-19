import request from '@/utils/request'

// 查询字典编码列表
export function listType(data) {
  return request({
    url: '/Base/Dictionary/GetDicTypeList',
    method: 'post',
    data: data,
  })
}

// 查询字典编码详细
export function getType(dictId) {
  return request({
    url: '/Base/Dictionary/GetTypeInfo?id=' + dictId + '&isAll=true',
    method: 'get',
  })
}

// 新增字典编码
export function addType(data) {
  return request({
    url: '/Base/Dictionary/AddDicType',
    method: 'post',
    data: data,
  })
}

// 修改字典编码
export function updateType(data) {
  return request({
    url: '/Base/Dictionary/EditDicType',
    method: 'put',
    data: data,
  })
}

// 删除字典编码
export function delType(data) {
  return request({
    url: '/Base/Dictionary/RemoveDicType',
    method: 'delete',
    data: data,
  })
}

// 刷新字典缓存
export function refreshCache() {
  return request({
    url: '/system/dict/type/refreshCache',
    method: 'delete',
  })
}

// 导出字典编码
export function exportType(query) {
  return request({
    url: '/system/dict/type/export',
    method: 'get',
    params: query,
  })
}

// 获取字典选择框列表
export function optionselect() {
  return request({
    url: '/Quality/Dictionary/GetSelectOptions',
    method: 'get',
  })
}

// 同步生产库和测试库字典数据
export function syncDictionaryData() {
  return request({
    url: '/Base/Dictionary/SyncDictionaryData',
    method: 'post',
  })
}
