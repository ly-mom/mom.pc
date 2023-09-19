import request from '@/utils/request'

// 查询定时任务调度列表
export function listJob(query) {
  return request({
    url: '/monitor/job/list',
    method: 'get',
    params: query,
  })
}

// 查询定时任务调度详细
export function getJob(jobId) {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'get',
  })
}

// 新增定时任务调度
export function addJob(data) {
  return request({
    url: '/monitor/job',
    method: 'post',
    data: data,
  })
}

// 修改定时任务调度
export function updateJob(data) {
  return request({
    url: '/monitor/job',
    method: 'put',
    data: data,
  })
}

// 删除定时任务调度
export function delJob(jobId) {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'delete',
  })
}

// 导出定时任务调度
export function exportJob(query) {
  return request({
    url: '/monitor/job/export',
    method: 'get',
    params: query,
  })
}

// 任务状态修改
export function changeJobStatus(jobId, status) {
  const data = {
    jobId,
    status,
  }
  return request({
    url: '/monitor/job/changeStatus',
    method: 'put',
    data: data,
  })
}

// 定时任务立即执行一次
export function runJob(jobId, jobGroup) {
  const data = {
    jobId,
    jobGroup,
  }
  return request({
    url: '/monitor/job/run',
    method: 'put',
    data: data,
  })
}

export function getScheduleJob(data) {
  // 定时任务-查询所有任务
  return request({
    url: '/Quality/ScheduleJob/GetList',
    method: 'post',
    data,
  })
}

export function getScheduleJobList(params) {
  // 定时任务-查询所有在运行的任务
  return request({
    url: '/Quality/ScheduleJob/GetJobList',
    method: 'get',
    params,
  })
}

export function getJobSources(params) {
  // 定时任务-获取任务源
  return request({
    url: '/Base/ScheduleJob/GetJobSources',
    method: 'get',
    params,
  })
}

export function getScheduleType(params) {
  // 定时任务-获取任务类型
  return request({
    url: '/Base/ScheduleJob/GetScheduleType',
    method: 'get',
    params,
  })
}

export function saveSchedule(data) {
  // 定时任务-新增修改
  return request({
    url: '/Base/ScheduleJob/Save',
    method: 'post',
    data,
  })
}

export function deleteSchedule(data) {
  // 定时任务-删除
  return request({
    url: `/${data.Service ? data.Service : 'Base'}/ScheduleJob/Delete`,
    method: 'delete',
    data: data.data,
  })
}

export function loadSchedule(data) {
  // 定时任务-重载所有任务
  return request({
    url: `/${data.Service ? data.Service : 'Base'}/ScheduleJob/Load`,
    method: 'post',
    data: data.data,
  })
}

export function runSchedule(data) {
  // 定时任务-立即执行指定任务
  return request({
    url: '/Base/ScheduleJob/Run?key=' + data.key,
    method: 'post',
    data,
  })
}

export function startSchedule(data) {
  // 定时任务-开始指定任务
  return request({
    url: '/Base/ScheduleJob/Start?key=' + data.key,
    method: 'post',
    data,
  })
}

export function pauseSchedule(data) {
  // 定时任务-暂停指定任务
  return request({
    url: '/Base/ScheduleJob/Pause?key=' + data.key,
    method: 'post',
    data,
  })
}

export function resumeSchedule(data) {
  // 定时任务-恢复指定任务
  return request({
    url: '/Base/ScheduleJob/Resume?key=' + data.key,
    method: 'post',
    data,
  })
}

export function stopSchedule(data) {
  // 定时任务-停止指定任务
  return request({
    url: '/Base/ScheduleJob/Stop?key=' + data.key,
    method: 'post',
    data,
  })
}

export function getExcuteLog(data) {
  // 定时任务执行记录
  return request({
    url: '/Base/ScheduleJob/GetExcuteLog',
    method: 'post',
    data,
  })
}
