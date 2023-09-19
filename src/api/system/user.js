import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/ruoyi'
import { data } from 'jquery'

// 查询用户列表
export function listUser(data) {
  return request({
    url: 'Base/Base_User/GetDataList',
    method: 'post',
    data: data,
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: 'Base/Base_User/GetUserInfo?userId=' + praseStrEmpty(userId),
    method: 'get',
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: 'Base/Base_User/Add',
    method: 'post',
    data: data,
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: 'Base/Base_User/Edit',
    method: 'post',
    data: data,
  })
}

// 用户个人修改用户信息
export function updateUserByMysely(data) {
  return request({
    url: 'Base/Base_User/Profile',
    method: 'put',
    data: data,
  })
}

// 删除用户
export function delUser(userId) {
  return request({
    url: 'Base/Base_User/Remove?userIds=' + userId,
    method: 'delete',
  })
}
// 导出用户
export function exportUser(query) {
  return request({
    url: '/system/user/export',
    method: 'get',
    params: query,
  })
}

// 用户密码重置
export function resetUserPwd(userId) {
  return request({
    url: 'Base/Base_User/ResetPwd?userId=' + userId,
    method: 'put',
  })
}

// 用户状态修改
export function changeUserStatus(data) {
  // const data = {
  //   userId,
  //   status
  // }
  return request({
    url: 'Base/Base_User/ChangeStatus',
    method: 'put',
    data: data,
  })
}

// 查询用户个人信息
export function getUserProfile(userId) {
  return request({
    url: 'Base/Base_User/GetUserInfo?userId=' + userId,
    method: 'get',
  })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data,
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword,
  }
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: data,
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: data,
  })
}

// 下载用户导入模板
export function importTemplate() {
  return request({
    url: '/system/user/importTemplate',
    method: 'get',
  })
}

// 查询授权角色
export function getAuthRole(userId) {
  return request({
    url: 'Base/Base_Role/GetRoleInfoByUserId?userId=' + userId,
    method: 'get',
  })
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: 'Base/Base_User/AuthRoles',
    method: 'post',
    data: data,
  })
}
// 查询用户默认部门列表
export function GetOrgListByUser(userCode) {
  return request({
    url: 'Base/Base_User/GetOrgListByUser?userCode=' + userCode,
    method: 'get',
  })
}
// 一键分配检测单位
export function setChkUint(data) {
  return request({
    url: 'Quality/MMS_TestUnit/AssignTestUnit',
    method: 'post',
    data: data,
  })
}

// 校验是否有复制的权限
export function simplyUserList(data) {
  return request({
    url: 'Base/Base_User/Copy/User/list',
    method: 'post',
    data,
  })
}
// 校验是否有复制的权限
export function canCopy(userCode) {
  return request({
    url: 'Base/Base_User/Copy/Check/' + userCode,
    method: 'post',
  })
}
// 获取被拷贝人的权限数据
export function getAllPeriByUserCode(userCode) {
  return request({
    url: 'Base/Base_User/Copy/' + userCode,
    method: 'get',
  })
}
// 获取被拷贝人的权限数据
export function savePermissionCopy(data) {
  return request({
    url: 'Base/Base_User/Copy',
    method: 'post',
    data,
  })
}
