import request from '@/utils/request'

// 获取组织架构列表
export function GetDataListOrganization(data) {
  return request({
    url: '/Base/Base_Organization/GetModelList',
    method: 'post',
    data: data,
  })
}
// 获取组织架构删除
export function GetDeleteDataOrganization(data) {
  return request({
    url: '/Base/Base_Organization/DeleteData',
    method: 'post',
    data: data,
  })
}
// 获取组织架构详细信息
export function GetTheDataOrganization(data) {
  return request({
    url: '/Base/Base_Organization/GetTheData',
    method: 'post',
    data: data,
  })
}
// 组织架构详细信息提交修改
export function SaveDataOrganization(data) {
  return request({
    url: '/Base/Base_Organization/SaveData',
    method: 'post',
    data: data,
  })
}
// 获取项目信息列表
export function GetDataListProject(data) {
  return request({
    url: '/Base/Base_Project/GetModelList',
    method: 'post',
    data: data,
  })
}

// 获取项目信息删除
export function DeleteDataProject(data) {
  return request({
    url: '/Base/Base_Project/DeleteData',
    method: 'post',
    data: data,
  })
}

// 获取项目信息详细信息
export function GetTheDataProject(data) {
  return request({
    url: '/Base/Base_Project/GetTheData',
    method: 'post',
    data: data,
  })
}
// 项目信息详细信息提交修改
export function SaveDataProject(data) {
  return request({
    url: '/Base/Base_Project/SaveData',
    method: 'post',
    data: data,
  })
}

// 获取客户代码列表
export function GetDataListClient(data) {
  return request({
    url: '/Base/Base_Client/GetModelList',
    method: 'post',
    data: data,
  })
}

// 获取客户代码删除
export function GetDeleteDataClient(data) {
  return request({
    url: '/Base/Base_Client/DeleteData',
    method: 'post',
    data: data,
  })
}
// 获取客户代码详细信息
export function GetTheDataClient(data) {
  return request({
    url: '/Base/Base_Client/GetTheData',
    method: 'post',
    data: data,
  })
}
// 客户代码详细信息提交修改
export function SaveDataClient(data) {
  return request({
    url: '/Base/Base_Client/SaveData',
    method: 'post',
    data: data,
  })
}

// 获取班次列表
export function GetDataListShift(data) {
  return request({
    url: '/Base/Base_Shift/GetModelList',
    method: 'post',
    data: data,
  })
}

// 获取班次删除
export function GetDeleteDataShift(data) {
  return request({
    url: '/Base/Base_Shift/DeleteData',
    method: 'post',
    data: data,
  })
}
// 获取班次详细信息
export function GetTheDataShift(data) {
  return request({
    url: '/Base/Base_Shift/GetTheData',
    method: 'post',
    data: data,
  })
}
// 客户班次信息提交修改
export function SaveDataShift(data) {
  return request({
    url: '/Base/Base_Shift/SaveData',
    method: 'post',
    data: data,
  })
}

// 获取物料信息列表
export function GetDataListMaterialInfo(data) {
  return request({
    url: '/Base/Base_MaterialInfo/GetModelList',
    method: 'post',
    data: data,
  })
}

// 获取物料信息删除
export function GetDeleteDataMaterialInfo(data) {
  return request({
    url: '/Base/Base_MaterialInfo/DeleteData',
    method: 'post',
    data: data,
  })
}
// 获取物料信息详细信息
export function GetTheDataMaterialInfo(data) {
  return request({
    url: '/Base/Base_MaterialInfo/GetTheData',
    method: 'post',
    data: data,
  })
}
// 客户物料信息提交修改
export function SaveDataMaterialInfo(data) {
  return request({
    url: '/Base/Base_MaterialInfo/SaveData',
    method: 'post',
    data: data,
  })
}
// 获取所属厂区
export function getFactoryList(data) {
  return request({
    url: '/Base/Base_Organization/GetDataList',
    method: 'post',
    data: data,
  })
}

// 获取物料类型下拉选项
export function getMaterialTypeOptions(data) {
  return request({
    url: '/Base/Base_MaterialInfo/GetMaterialTypeList',
    method: 'post',
    data: data,
  })
}
export function exportProjectList(data) {
  //项目信息导出
  return request({
    url: '/Base/Base_Project/ExportList',
    method: 'post',
    data,
    responseType: 'arraybuffer',
  })
}

// 获取文库路径配置列表
export function getLibraryPathList(data) {
  return request({
    url: '/Base/Base_LibraryPathConfig/GetList',
    method: 'post',
    data: data,
  })
}

// 创建文库路径配置
export function createLibraryPath(data) {
  return request({
    url: '/Base/Base_LibraryPathConfig/Create',
    method: 'post',
    data: data,
  })
}

// 更新文库路径配置
export function updateLibraryPath(data) {
  return request({
    url: '/Base/Base_LibraryPathConfig/Update',
    method: 'post',
    data: data,
  })
}

// 删除文库路径配置
export function deleteLibraryPath(data) {
  return request({
    url: '/Base/Base_LibraryPathConfig/Delete',
    method: 'post',
    data: data,
  })
}

// 获取文库项目配置列表
export function getLibraryProjectList(data) {
  return request({
    url: '/Base/Base_LibraryProjectConfig/GetList',
    method: 'post',
    data: data,
  })
}

// 创建文库项目配置
export function createLibraryProject(data) {
  return request({
    url: '/Base/Base_LibraryProjectConfig/Create',
    method: 'post',
    data: data,
  })
}

// 更新文库项目配置
export function updateLibraryProject(data) {
  return request({
    url: '/Base/Base_LibraryProjectConfig/Update',
    method: 'post',
    data: data,
  })
}

// 删除文库项目配置
export function deleteLibraryProject(data) {
  return request({
    url: '/Base/Base_LibraryProjectConfig/Delete',
    method: 'post',
    data: data,
  })
}

// 获取文库浏览记录列表
export function getLibraryViewRecordList(data) {
  return request({
    url: '/Base/Base_LibraryViewRecord/GetList',
    method: 'post',
    data: data,
  })
}

// 创建文库浏览记录
export function createLibraryViewRecord(data) {
  return request({
    url: '/Base/Base_LibraryViewRecord/Create',
    method: 'post',
    data: data,
  })
}
// 创建文库浏览记录IPQC
export function createLibViewRecord(data) {
  return request({
    url: '/Quality/IPQC_Apply/CreateLibraryViewRecord',
    method: 'post',
    data: data,
  })
}

// 查找文库文件
export function searchLibraryFile(data) {
  return request({
    url: '/Base/Base_Library/SearchFile',
    method: 'post',
    data: data,
  })
}

// 必须浏览文库文件检查
export function viewFileCheck(data) {
  return request({
    url: '/Base/Base_Library/MustViewFileCheck',
    method: 'post',
    data: data,
  })
}
// 必须浏览文库文件检查
export function downloadLibraryFile(data) {
  return request({
    url: '/Base/Base_Library/DownloadFile',
    method: 'post',
    data: data,
  })
}
