import request from '@/utils/request'

export function shitInfo(data) {
  // 获取班次信息
  return request({
    url: '/Base/Base_Shift/GetDataList',
    method: 'post',
    data,
  })
}
export function SaveShift(data) {
  // 保存班别信息
  return request({
    url: '/Base/Base_TestUnitUser/SaveData',
    method: 'post',
    data,
  })
}
export function GetShift(data) {
  // 查询班别信息
  return request({
    url: '/Base/Base_TestUnitUser/GetDataList',
    method: 'post',
    data,
  })
}
export function baseUserInfo(data) {
  // 获取人员信息
  return request({
    url: '/Base/Base_User/GetDataList',
    method: 'post',
    data,
  })
}
export function baseSbuInfo(data) {
  // 获取SBU信息
  return request({
    url: '/Base/base_user/GetOrgUserList',
    method: 'post',
    data,
  })
}

export function uploadFileByForm(data) {
  // 文件上传接口_form
  return request({
    url: '/Base/File/UploadByForm',
    method: 'post',
    data,
  })
}

export function getSamplePlan(data) {
  // 检查水平、外观AQL
  return request({
    url: '/Base/Base_SamplePlan/GetDataList',
    method: 'post',
    data,
  })
}

export function baseChkProjectCatList() {
  // 获取检测项目-->测试类型
  return request({
    url: '/Base/Base_ChkProjectCat/GetDataList',
    method: 'post',
    data: {
      PageIndex: 0,
      PageRows: 100000,
      SortField: 'id',
      SortType: 'asc',
    },
  })
}

export function getBaseChkProjectClassList() {
  // 获取检测项目类别
  return request({
    url: '/Base/Base_ChkProjectClass/GetDataList',
    method: 'post',
    data: {
      PageIndex: 0,
      PageRows: 100000,
      SortField: 'id',
      SortType: 'asc',
    },
  })
}
export function getBaseChkProjectList() {
  // 获取检测项目清单
  return request({
    url: '/Base/Base_ChkProjectList/GetDataList',
    method: 'post',
    data: {
      PageIndex: 0,
      PageRows: 100000,
      SortField: 'id',
      SortType: 'asc',
    },
  })
}
export function getBaseChkProjectStageList(data) {
  // 获取检测时间段维度
  return request({
    url: '/Base/Base_ChkProjectStage/GetDataList',
    method: 'post',
    data,
  })
}

export function getBaseSpecialCaseList() {
  // 项目信息表,专案名称
  return request({
    url: '/Base/Base_Project/GetDataList',
    method: 'post',
    data: {
      PageIndex: 0,
      PageRows: 100000,
      SortField: 'id',
      SortType: 'asc',
    },
  })
}

export function getBaseMachineList(data) {
  // 机台列表
  return request({
    url: '/Base/Base_Machine/GetDataList',
    method: 'post',
    data,
  })
}

export function getBaseLineList(data) {
  // 拉别列表
  return request({
    url: '/Base/Base_Line/GetDataSelect',
    method: 'post',
    data,
  })
}

export function getBaseWorkStageList(data) {
  // 工序/线别列表
  return request({
    url: '/Base/Base_Workstage/GetDataList',
    method: 'post',
    data,
  })
}

export function getDevicesDataList(data) {
  // 获取检测设备清单
  return request({
    url: '/Quality/MMS_ChkDeviceList/GetDataList',
    method: 'post',
    data,
  })
}

export function getProjectListByClass(data) {
  // 获取检测清单
  return request({
    url: '/Base/Base_ChkProjectList/GetDataListByClass',
    method: 'post',
    data,
  })
}
// bizId是业务id，可传可不传，目前mms完成检测和报告重传中使用到
export function uploadFile(data, bizId = undefined) {
  // 文件上传接口
  return request({
    url: '/Base/File/Upload' + (bizId ? '?bizId=' + bizId : ''),
    method: 'post',
    headers: {
      unDebounce: true, // 防止批量上传文件被拦截的情况
    },
    data,
  })
}
export function deleteFile(data) {
  // 删除上传接口
  return request({
    url: '/Base/File/Delete',
    method: 'delete',
    data,
  })
}
export function downloadFile(Id) {
  // 文件下载接口
  return request({
    url: 'Base/File/Download/' + Id,
    method: 'get',
    data: '',
    // 如果服务器启用网关，下载文件失败的情况，需要加以下请求头
    // header: {contentType: 'multipart/form-data'},
    responseType: 'arraybuffer',
  })
}
export function getFilesList(data) {
  // 获取文件信息接口
  return request({
    url: '/Base/Upload/GetFilesList',
    method: 'post',
    data,
  })
}
export function getOrgList(data) {
  // 获取组织架构
  return request({
    url: '/Base/Base_Organization/GetOrgList',
    method: 'post',
    data,
  })
}

export function modifyPwd(data) {
  // 修改用户密码
  return request({
    url: '/Base/Home/ChangePwd',
    method: 'post',
    data,
  })
}
export function AuthOrgs(data) {
  // 用户-授权厂区
  return request({
    url: '/Base/Base_User/AuthOrgs',
    method: 'post',
    data: data,
  })
}
export function SetDefaultOrg(data) {
  // 用户-切换厂区
  return request({
    url: '/Base/Base_User/SetDefaultOrg',
    method: 'put',
    data: data,
  })
}
export function getTypeOfWorkList(data) {
  // 获取字典配置之工种
  return request({
    url: '/Base/Base_User/GetTypeOfWorkList',
    method: 'post',
    data,
  })
}
export function DownloadByBizId(id) {
  // 文件-单据号下载文件
  return request({
    url: '/Base/File/DownloadByBizId/' + id,
    method: 'get',
    header: {
      contentType: 'multipart/form-data',
    },
    responseType: 'arraybuffer',
  })
}

export function getSysTableList(data) {
  // 通用导入-查询所有表名
  return request({
    url: '/Base/Table/GetList',
    method: 'post',
    data,
  })
}

export function getTableInfo(params) {
  // 通用导入-查询表设计
  return request({
    url: '/Base/Table/GetTableInfo',
    method: 'get',
    params,
  })
}

export function downSysTableImportTemp(data) {
  // 通用导入-下载模板
  return request({
    url: '/Base/Table/DownloadTemplate',
    method: 'get',
    params: data,
    header: {
      contentType: 'multipart/form-data',
    },
    responseType: 'blob',
  })
}

export function importSysTableImportTemp(data, tablename) {
  // 通用导入-导入
  return request({
    url: '/Base/Table/Import?tablename=' + tablename,
    method: 'post',
    header: {
      contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    data,
  })
}

export function exportTableInfo(data) {
  // 通用导入-导出表结构
  return request({
    url: '/Base/Table/ExportTableInfo',
    method: 'post',
    data: data,
    // header: {
    //   contentType: 'multipart/form-data'
    // },
    timeout: 120000,
    responseType: 'arraybuffer',
  })
}
// 获取供应商下拉值
export function getVendorData(data) {
  return request({
    url: '/Base/Base_Vendor/GetVendorDataList',
    method: 'post',
    data,
  })
}

// 同步钉钉人员信息
export function getUserData(data) {
  return request({
    url: '/DataTools/UserData/SyncDingTalk',
    method: 'post',
    data,
  })
}

// 切换用户
export function changeUser(userCode) {
  return request({
    url: '/Base/Home/ChangeUser?userCode=' + userCode,
    method: 'post',
  })
}

// 大文件上传-设置文件信息
export function setChunkInfo(data) {
  return request({
    url: '/Base/File/ChunkInfo',
    method: 'post',
    data,
  })
}

// 大文件上传-获取进度（文件块索引）
export function getUploadPr(params) {
  return request({
    url: '/Base/File/GetUploadChunk',
    method: 'get',
    params,
  })
}

// 大文件上传-上传文件块
export function chunkUpload(data, params) {
  return request({
    url: '/Base/File/ChunkUpload',
    method: 'post',
    headers: {
      unDebounce: true,
    },
    header: {
      contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    data,
    params,
  })
}

// 大文件上传-合并文件
export function mergeFiles(params) {
  return request({
    url: '/Base/File/MergeFiles',
    method: 'post',
    params,
  })
}

// 根据项目和工序获取线体名称
export function getLineDataList(data) {
  return request({
    url: '/Base/Base_Line/GetLineDataList',
    method: 'post',
    data,
  })
}

//料号成本维护查询
export function getItemCost(data) {
  return request({
    url: '/Base/Base_CostMaintenance/GetModelList',
    method: 'post',
    data,
  })
}

//料号成本维护新增/修改
export function updatItemCost(data) {
  return request({
    url: '/Base/Base_CostMaintenance/SaveData',
    method: 'post',
    data,
  })
}

//料号成本维护删除
export function deleteItemCost(data) {
  return request({
    url: '/Base/Base_CostMaintenance/DeleteData',
    method: 'post',
    data,
  })
}

//新建检测计划
export function SavePlanMaintenance(data) {
  return request({
    url: '/Quality/MMS_TestPlanMaintenance/SaveData',
    method: 'post',
    data,
  })
}
//查询检验计划
export function GetPlanMaintenance(data) {
  return request({
    url: '/Quality/MMS_TestPlanMaintenance/GetTesrPlan',
    method: 'post',
    data,
  })
}

//删除校验计划
export function DeletelanMaintenance(data) {
  return request({
    url: '/Quality/MMS_TestPlanMaintenance/DeleteData',
    method: 'post',
    data,
  })
}
//料号成本维护导出
export function exportItemCost(data) {
  return request({
    url: '/Base/Base_CostMaintenance/ExportList',
    method: 'post',
    data,
    responseType: 'arraybuffer',
  })
}

//料号厂区下拉
export function getFactoryDataList(data) {
  return request({
    url: '/Base/Base_CostMaintenance/GetFactoryDataList',
    method: 'post',
    data,
  })
}

// 获取可选的检测清单，按检测类别分层
export function getSelectableTestItem(data) {
  return request({
    url: '/Base/Base_TestItem/GetSelectableTestItem',
    method: 'post',
    data,
  })
}

export function getTestUnitDataList(data) {
  // 检测单位数据查询
  return request({
    url: '/Quality/MMS_TestUnit/GetTestUnitDataList',
    method: 'post',
    data,
  })
}

export function BUListApi(data) {
  return request({
    url: '/Base/Base_Organization/GetBuDataList',
    method: 'post',
    data,
  })
}
