import request from '@/utils/request'

// 查询良率列表
export function getYieldList(data) {
  return request({
    url: '/BI/BI_YieldExportData/GetYieldList',
    method: 'post',
    data: data,
  })
}
//良率下拉数据源（BG/BU/成品出货料号/制程名称）
export function GetSelectList(data) {
  return request({
    url: '/BI/BI_YieldExportData/GetSelectList',
    method: 'post',
    data: data,
  })
}
//良率下拉数据源（BG/BU/成品出货料号/制程名称）
export function GetChartDataList(data) {
  return request({
    url: '/BI/BI_YieldExportData/GetChartData',
    method: 'post',
    data: data,
  })
}
//删除良率Excel
export function DelExcel(data) {
  return request({
    url: '/BI/BI_YieldExportData/DeleteForm',
    method: 'post',
    data: data,
  })
}
//BI良率明细导入
export function ExportData(data) {
  return request({
    url: '/BI/BI_YieldExportData/ExportData',
    method: 'post',
    data: data,
  })
}
//下载模板
export function ExportDown(query) {
  return request({
    url: '/Base/Upload/Download/6110cd55ff3f0000eb001434',
    method: 'get',
    params: query,
  })
}

//导出
export function ExportBI(data) {
  return request({
    url: '/BI/BI_YieldExportData/Export',
    method: 'post',
    data,
  })
}
