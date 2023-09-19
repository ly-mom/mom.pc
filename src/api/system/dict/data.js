import request from '@/utils/request'
import { data } from 'jquery'

// 查询字典数据列表
export function listData(data) {
  return request({
    url: '/Base/Dictionary/GetDicDataList',
    method: 'post',
    data: data,
  })
}
// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: 'Base/Dictionary/GetDataInfo?id=' + dictCode + '&isAll=true',
    method: 'get',
  })
}
// 根据字典编码查询字典数据信息
export function getDicts(dicKey, isAll = false, time = new Date().getTime()) {
  return request({
    url: '/Base/Dictionary/GetDicDataByKey',
    method: 'get',
    params: {
      dicKey,
      isAll,
      time,
    },
    headers: {
      unDebounce: true,
    },
  })
}

// 获取多个字典数据
export function getMutilDicts(list) {
  return request({
    url: '/Base/Dictionary/GetDicData',
    method: 'post',
    data: { DicKeys: list, time: new Date().getTime() },
    headers: {
      unDebounce: true,
    },
  })
}
// 新增字典数据
export function addData(data) {
  return request({
    url: '/Base/Dictionary/AddDicData',
    method: 'post',
    data: data,
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/Base/Dictionary/EditDicData',
    method: 'put',
    data: data,
  })
}

// 删除字典数据
export function delData(data) {
  return request({
    url: '/Base/Dictionary/RemoveDicData',
    method: 'delete',
    data: data,
  })
}
// 导出字典数据
export function exportData(query) {
  return request({
    url: '/system/dict/data/export',
    method: 'get',
    params: query,
  })
}
