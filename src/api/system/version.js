import request from '@/utils/request'

// 获取版本列表
export function getVersionListApi(data) {
  return request({
    url: 'Base/Base_App/Version/List',
    method: 'post',
    data: data,
  })
}

// 设置默认版本
export function setDefaultVersion(versionid) {
  return request({
    url: 'Base/Base_App/Version/Default/' + versionid,
    method: 'put',
  })
}

// 取消默认版本
export function uninstallDefaultVersion(versionid) {
  return request({
    url: 'Base/Base_App/Version/Default/' + versionid,
    method: 'delete',
  })
}

// 根据id获取应用版本信息
export function getVersionApi(versionid) {
  return request({
    url: 'Base/Base_App/Version/' + versionid,
    method: 'get',
  })
}

//新增版本
export function addVersion(data) {
  return request({
    url: 'Base/Base_App/Version',
    method: 'post',
    header: {
      contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    data,
  })
}

// 删除版本
export function delVersion(data) {
  return request({
    url: 'Base/Base_App/Version',
    method: 'delete',
    data: data,
  })
}
