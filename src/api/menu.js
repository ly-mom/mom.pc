import request from '@/utils/request'

// 获取路由
export const getRouters = () =>
  // return getRouter

  request({
    url: 'Base/Home/GetRouteInfo?platform=PC',
    method: 'get',
  })
