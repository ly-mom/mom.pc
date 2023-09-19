import request from '@/utils/request'

// 主页-获取文件分页
export function getFilePageList(data) {
  return request({
    url: '/Base/Home/GetFilePageList',
    method: 'post',
    data: data,
  })
}

// 主页-添加文件记录
export function addFile(data) {
  return request({
    url: '/Base/Home/AddFile',
    method: 'post',
    data: data,
  })
}

// 主页-修改文件记录
export function editFile(data) {
  return request({
    url: '/Base/Home/EditFile',
    method: 'post',
    data: data,
  })
}

// 主页-删除文件记录
export function deleteFile(data) {
  return request({
    url: '/Base/Home/DeleteFile',
    method: 'delete',
    data: data,
  })
}
