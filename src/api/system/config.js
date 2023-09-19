import request from '@/utils/request'

// 查询参数列表
export function listConfig(data) {
  return request({
    url: '/Base/Config/GetPageList',
    method: 'post',
    data: data,
    headers: {
      unDebounce: true,
    },
  })
}

// 查询参数详细
export function getConfig(id) {
  return request({
    url: '/Base/Config/GetConfigById?id=' + id,
    method: 'get',
  })
}

// 根据参数键名查询参数值
export function getConfigKey(data) {
  return request({
    url: '/Base/Config/GetPageList/',
    method: 'post',
    data: data,
    headers: {
      unDebounce: true,
    },
  })
}

// 新增参数配置
export function addConfig(data) {
  return request({
    url: '/Base/Config/SaveData',
    method: 'post',
    data: data,
  })
}

// 修改参数配置
export function updateConfig(data) {
  return request({
    url: '/Base/Config/SaveData',
    method: 'post',
    data: data,
  })
}

// 删除参数配置
export function delConfig(data) {
  return request({
    url: '/Base/Config/DeleteConfigByIds',
    method: 'post',
    data: data,
  })
}

// 刷新参数缓存
export function refreshCache() {
  return request({
    url: '/system/config/refreshCache',
    method: 'delete',
  })
}

// 导出参数
export function exportConfig(query) {
  return request({
    url: '/system/config/export',
    method: 'get',
    params: query,
  })
}

// 配置厂区
export function configToOrgs(data) {
  return request({
    url: '/Base/Config/ConfigToOrgs',
    method: 'put',
    data: data,
  })
}

// 查询配置的厂区
export function getConfigOrgList(params) {
  return request({
    url: '/Base/Config/GetOrgList',
    method: 'get',
    params,
  })
}
