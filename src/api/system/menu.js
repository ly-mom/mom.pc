import request from '@/utils/request'
//基础模块

// const URL='/Base'

// 查询菜单列表
export function listMenu(data) {
  return request({
    url: 'Base/Base_Menu/GetMenuList',
    method: 'post',
    data: data,
  })
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: 'Base/Base_Menu/GetMenu?menuId=' + menuId,
    method: 'get',
  })
}

// 查询菜单下拉树结构
export function treeselect(data) {
  return request({
    url: 'Base/Base_Menu/GetSelectTree',
    method: 'post',
    data: data,
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: 'Base/Base_Menu/GetRoleMenuTreeSelect?roleId=' + roleId,
    method: 'get',
  })
}

// 根据角色/角色组查询菜单下拉树结构
export function getMenuTree(data) {
  return request({
    url: 'Base/Base_Menu/Role/MenuTree',
    method: 'post',
    data,
  })
}

// 根据单个/多个角色查询菜单树结构
export function getMenuTreeByRoles(data) {
  return request({
    url: 'Base/Base_Menu/Role/List/MenuTree',
    method: 'post',
    data,
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: 'Base/Base_Menu/Add',
    method: 'post',
    data: data,
  })
}

// VerifyUploadLanguageApi
export function updateMenu(data) {
  return request({
    url: 'Base/Base_Menu/Edit',
    method: 'put',
    data: data,
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: 'Base/Base_Menu/Remove?menuId=' + menuId,
    method: 'delete',
  })
}

// 查询互斥菜单列表
export function getMutexList(data) {
  return request({
    url: 'Base/Base_Menu/Mutex/PageList',
    method: 'post',
    data,
  })
}

// 添加互斥菜单
export function addMutexList(data) {
  return request({
    url: 'Base/Base_Menu/Mutex',
    method: 'post',
    data,
  })
}
// 删除互斥菜单
export function deleteMutexList(data) {
  return request({
    url: 'Base/Base_Menu/Mutex',
    method: 'delete',
    data,
  })
}
// 取消互斥菜单
export function cancelMutexList(menuid) {
  if (!menuid) return
  return request({
    url: 'Base/Base_Menu/Mutex/' + menuid,
    method: 'delete',
  })
}

// 根据菜单获取用户列表
export function getUserListByMenu(menuid) {
  if (!menuid) return
  return request({
    url: 'Base/Base_Menu/UserList/' + menuid,
    method: 'get',
  })
}

// 根据菜单获取角色列表
export function getRoleListByMenu(menuid) {
  if (!menuid) return
  return request({
    url: 'Base/Base_Menu/RoleList/' + menuid,
    method: 'get',
  })
}

// 根据角色/角色组的KEY获取对应的PC/MOBLIE菜单
export function getMenuByRoleAndGroup(data) {
  return request({
    url: 'Base/Base_Menu/User/Role/MenuTree/',
    method: 'post',
    data,
  })
}
