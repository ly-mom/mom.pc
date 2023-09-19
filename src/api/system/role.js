import request from '@/utils/request'
import { data } from 'jquery'

// 查询角色列表
export function listRole(data) {
  return request({
    url: 'Base/Base_Role/GetRoleList',
    method: 'post',
    data: data,
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: 'Base/Base_Role/GetRoleInfo?roleId=' + roleId,
    method: 'get',
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: 'Base/Base_Role/Add',
    method: 'post',
    data: data,
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: 'Base/Base_Role/Edit',
    method: 'post',
    data: data,
  })
}

// 角色数据权限
export function dataScope(data) {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data: data,
  })
}

// 角色状态修改
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status,
  }
  return request({
    url: 'Base/Base_Role/ChangeStatus',
    method: 'POST',
    data: data,
  })
}

// 删除角色
export function delRole(data) {
  return request({
    url: 'Base/Base_Role/Remove',
    method: 'delete',
    data,
  })
}

// 导出角色
export function exportRole(query) {
  return request({
    url: '/system/role/export',
    method: 'get',
    params: query,
  })
}

// 查询角色已授权用户列表
export function allocatedUserList(data) {
  return request({
    url: 'Base/Base_Role/GetAllocatedList',
    method: 'post',
    data: data,
  })
}

// 查询角色未授权用户列表
export function unallocatedUserList(data) {
  return request({
    url: 'Base/Base_Role/GetUnallocatedList',
    method: 'post',
    data: data,
  })
}

// 取消用户授权角色
export function authUserCancel(data) {
  return request({
    url: 'Base/Base_Role/CancelAuthUser',
    method: 'post',
    data: data,
  })
}

// 批量取消用户授权角色
export function authUserCancelAll(data) {
  return request({
    url: 'Base/Base_Role/CancelAuthUserAll',
    method: 'post',
    data: data,
  })
}

// 授权用户选择
export function authUserSelectAll(data) {
  return request({
    url: 'Base/Base_Role/SetAuthUserAll',
    method: 'post',
    data: data,
  })
}

// 添加角色组
export function addRoleGroup(data) {
  return request({
    url: 'Base/Base_Role/Group',
    method: 'post',
    data: data,
  })
}
// 编辑角色组
export function editRoleGroup(data) {
  return request({
    url: 'Base/Base_Role/Group',
    method: 'put',
    data: data,
  })
}
// 删除角色组
export function deleteRoleGroup(data) {
  return request({
    url: 'Base/Base_Role/Group',
    method: 'delete',
    data: data,
  })
}
// 获取角色组列表
export function getRoleGroupList(data) {
  return request({
    url: 'Base/Base_Role/Group/PageList',
    method: 'post',
    data: data,
  })
}
// 获取角色组和角色的树形列表
export function getRoleGroupAndRoleTree(data) {
  return request({
    url: 'Base/Base_Role/Group/GroupAndRole',
    method: 'post',
    data: data,
  })
}
// 角色组授权角色
export function setRoleGroupRole(data) {
  return request({
    url: 'Base/Base_Role/Group/Role',
    method: 'post',
    data: data,
  })
}
// 角色组移除角色
export function removeRoleGroupRole(data) {
  return request({
    url: 'Base/Base_Role/Group/Role',
    method: 'delete',
    data,
  })
}
// 获取角色组已授权的角色
export function getRoleGroupRole(data) {
  return request({
    url: 'Base/Base_Role/Group/Role/PageList',
    method: 'post',
    data: data,
  })
}
// 角色组授权菜单
export function setRoleGroupMenu(data) {
  return request({
    url: 'Base/Base_Role/Group/Menu',
    method: 'post',
    data: data,
  })
}
// 获取角色组已授权的菜单
export function getRoleGroupMenu(data) {
  return request({
    url: 'Base/Base_Role/Group/Menu/PageList',
    method: 'post',
    data: data,
  })
}
// 角色组授权用户
export function setRoleGroupUser(data) {
  return request({
    url: 'Base/Base_Role/Group/User',
    method: 'post',
    data: data,
  })
}
// 角色组批量取消授权用户
export function removeRoleGroupUser(data) {
  return request({
    url: 'Base/Base_Role/Group/User',
    method: 'delete',
    data: data,
  })
}
// 获取角色组已授权的用户
export function getRoleGroupUser(data) {
  return request({
    url: 'Base/Base_Role/Group/User/PageList',
    method: 'post',
    data: data,
  })
}
// 获取当前登录用户已分配的角色组
export function getUserRoleGroup(data) {
  return request({
    url: 'Base/Base_Role/Group/CurrentUser',
    method: 'post',
    data: data,
  })
}
// 移动角色到角色组
export function moveRoleinGroup(data) {
  return request({
    url: 'Base/Base_Role/Group/To/Role',
    method: 'put',
    data,
  })
}
// 角色组角色授权菜单
export function allocatedMenu(data) {
  return request({
    url: 'Base/Base_Role/Group/Role/Menu',
    method: 'post',
    data,
  })
}
// 获取角色组/角色未授权用户
export function getUnallocatedUser(data) {
  return request({
    url: 'Base/Base_Role/Group/User/UnAuthorize/PageList',
    method: 'post',
    data,
  })
}
// 获取角色组/角色已授权的用户
export function getAllocatedUser(data) {
  return request({
    url: 'Base/Base_Role/Group/Role/User/PageList',
    method: 'post',
    data,
  })
}
// 获取用户已授权的角色组/角色
export function getUserRoleAndGroup(UserCode) {
  return request({
    url: 'Base/Base_Role/Group/Tree/' + UserCode,
    method: 'get',
  })
}
// 用户授权角色/角色组
export function setUserRoleAndGroup(data) {
  return request({
    url: 'Base/Base_Role/User/Group/',
    method: 'post',
    data,
  })
}
