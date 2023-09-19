import request from '@/utils/request'

//  查询列表
export function listLang(data) {
  return request({
    url: '/Base/Language/GetPageList',
    method: 'post',
    data: data,
  })
}

//新增
export function addLang(data) {
  return request({
    url: '/Base/Language/Add',
    method: 'post',
    data: data,
  })
}

//编辑
export function editLang(data) {
  return request({
    url: '/Base/Language/Edit',
    // headers: {'Accept-Language': data.Lang},
    method: 'post',
    data: data,
  })
}

//删除
export function deleteLang(data) {
  return request({
    url: '/Base/Language/Remove',
    method: 'delete',
    data,
  })
}

//id查询
export function getLangById(id) {
  return request({
    url: `/Base/Language/GetLang?id=${id}`,
    method: 'get',
  })
}

// 校验数据
export function VerifyUploadLanguageApi(data) {
  return request({
    url: `Base/Language/VerifyUpload`,
    method: 'post',
    data: data,
  })
}

// 导入数据
export function ImportLanguageApi(data) {
  return request({
    url: `Base/Language/Import`,
    method: 'post',
    data: data,
  })
}

// 导出数据
export function ExportLanguageApi(data) {
  return request({
    url: `Base/Language/ExportStreamPageList`,
    method: 'post',
    responseType: 'arraybuffer',
    data,
  })
}

//上传文件记录列表
export function GetUploadFilesLogApi(data) {
  return request({
    url: `Base/Language/GetUploadFilesLog`,
    method: 'post',
    data: data,
  })
}
