import Vue from 'vue'
import dayjs from 'dayjs'
import { getFilePageList } from '@/api/system/fileManage.js'
import { downloadFile } from '@/api/base.js'

export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

export function welcome() {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

export function handleScrollHeader(callback) {
  let timer = 0

  let beforeScrollTop = window.pageYOffset
  callback = callback || function () {}
  window.addEventListener(
    'scroll',
    event => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let direction = 'up'
        const afterScrollTop = window.pageYOffset
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) {
          return false
        }
        direction = delta > 0 ? 'down' : 'up'
        callback(direction)
        beforeScrollTop = afterScrollTop
      }, 50)
    },
    false,
  )
}

export function isIE() {
  const bw = window.navigator.userAgent
  const compare = s => bw.indexOf(s) >= 0
  const ie11 = (() => 'ActiveXObject' in window)()
  return compare('MSIE') || ie11
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate(id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}
export function scorePassword(pass) {
  let score = 0
  if (!pass) {
    return score
  }
  // award every unique letter until 5 repetitions
  const letters = {}
  for (let i = 0; i < pass.length; i++) {
    letters[pass[i]] = (letters[pass[i]] || 0) + 1
    score += 5.0 / letters[pass[i]]
  }

  // bonus points for mixing it up
  const variations = {
    digits: /\d/.test(pass),
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    nonWords: /\W/.test(pass),
  }

  let variationCount = 0
  for (const check in variations) {
    variationCount += variations[check] === true ? 1 : 0
  }
  score += (variationCount - 1) * 10

  return parseInt(score)
}
// 开始时间的限制
export function disabledStartDate(start, end) {
  if (end) {
    return start.getTime() > new Date(end).getTime()
  }
  /* 注释限制选择未来时间的限制
  else {
    return start.getTime() > Date.now();
  } */
}
// 结束时间的限制
export function disabledEndDate(end, start) {
  if (start) {
    return dayjs(end).format('YYYY-MM-DD') < dayjs(start).format('YYYY-MM-DD')
  }
}

// 文件流形式的文件导出
export function createFileDownload(res) {
  if (res.headers && res.headers['content-disposition']) {
    // 判断是否有文件名的拓展字段
    const isExtra = res.headers['content-disposition'].includes('filename*')
    const tempFilename = isExtra ? res.headers['content-disposition'].split("filename*=UTF-8''")[1] : res.headers['content-disposition'].split('filename=')[1]
    let fileName = isExtra ? decodeURI(tempFilename) : tempFilename
    fileName = fileName.replace(/"/g, '')
    const content = res.data // 文件流
    const blob = new Blob([content], { type: res.headers['content-type'] })
    if ('download' in document.createElement('a')) {
      // 非IE下载
      const link = document.createElement('a')
      link.download = fileName
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)
      document.body.appendChild(link)
      link.click()
      URL.revokeObjectURL(link.href) // 释放URL 对象
      document.body.removeChild(link)
    } else {
      // IE10+下载
      window.navigator.msSaveOrOpenBlob(blob, fileName)
    }
  } else {
    if (res.config && res.config.responseType == 'arraybuffer') {
      const enc = new TextDecoder('utf-8')
      // String.fromCharCode.apply(null, new Uint8Array(res.data))
      const uint8 = new Uint8Array(res.data)
      const response = JSON.parse(enc.decode(uint8))
      Vue.prototype.$message.error(response.Msg)
    } else {
      const fileReader = new FileReader()
      fileReader.onload = e => {
        const errData = JSON.parse(e.target.result)
        Vue.prototype.$message.error(errData.Msg)
      }
      fileReader.readAsText(res.data)
    }
  }
}

// pdf文件流自动打印
export function blobPDFPrintFn(res) {
  // console.log(res.data)
  const content = res.data // 文件流
  const blob = new Blob([content], { type: res.headers['content-type'] })
  const urlPdf = window.URL.createObjectURL(blob)
  const newWindow = window.open(urlPdf, '_blank')
  newWindow.document.close() //关闭document的输出流, 显示选定的数据
  newWindow.print() //打印当前窗口
}

// 获取当前时间+1天
export function getTomorrowTimeFull() {
  const myDate = new Date()
  const year = myDate.getFullYear() //获取当前年
  const mon = myDate.getMonth() + 1 < 10 ? '0' + (myDate.getMonth() + 1) : myDate.getMonth() + 1 //获取当前月
  const date = myDate.getDate() + 1 < 10 ? '0' + (myDate.getDate() + 1) : myDate.getDate() + 1 //获取当前日
  return year + '-' + mon + '-' + date + ' ' + '23:59:59'
}

// 获取前X个月时间
export function getLastXMoth(val) {
  val = val ? val : 0
  const today = new Date() // 获取当前时间
  const tYear = today.getFullYear() // 年
  let tMonth = today.getMonth() - val // 前X个月
  let tDate = today.getDate() // 日

  if (tMonth.toString().length == 1) {
    tMonth = '0' + tMonth
  }
  if (tDate.toString().length == 1) {
    tDate = '0' + tDate
  }

  return tYear + '-' + tMonth + '-' + tDate
}

// 获取前两个月时间间隔的数组
export function getLastTwoMoth() {
  return [dayjs(new Date()).subtract(1, 'month').format('YYYY-MM-01'), dayjs(new Date()).format('YYYY-MM-DD')]
}

// 获取一周时间间隔的数组
export function getLastWeek() {
  return [dayjs(new Date()).subtract(6, 'day').format('YYYY-MM-DD'), dayjs(new Date()).format('YYYY-MM-DD')]
}

// 获取最近2周时间间隔的数组
export function getTwoLastWeek() {
  return [dayjs(new Date()).subtract(13, 'day').format('YYYY-MM-DD'), dayjs(new Date()).format('YYYY-MM-DD')]
}

// 计算字符数量
export function getBLen(str) {
  if (!str) return 0
  let len = 0
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    //单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len += 1.5
    } else {
      len += 2
    }
  }
  return len
}

/**
 * @msg: 根据参数名获取get请求url中对应的参数值
 * @param {*} url url
 * @param {*} queryName 参数名
 * @return {*} 参数值
 */
export function getQueryValue(url, queryName) {
  const query = url.split('?')[1]
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] == queryName) {
      return pair[1]
    }
  }
  return null
}

/**
 * @msg: 将url参数转换成object
 * @param {*} url
 * @return {*} JSON对象
 */
export function getQuery(url) {
  const obj = {}
  let keyvalue = []
  let key = '',
    value = ''
  const paraString = url.substring(url.indexOf('?') + 1, url.length).split('&')
  for (const i in paraString) {
    keyvalue = paraString[i].split('=')
    key = keyvalue[0]
    value = keyvalue[1]
    obj[key] = value
  }
  return obj

  // const index = url.indexOf('?');
  // console.log("index");
  // console.log(index);
  // const obj = {};
  // if(index === -1) return obj;
  // const queryStr = url.slice(index + 1);
  // const arr = queryStr.split('&');
  // if (arr&&arr.length) {
  //   for(let item of arr) {
  //     const keyValue = item.split('=');
  //     obj[keyValue[0]] = keyValue[1]
  //   }
  // }
  // return obj;
}

// 判断是否是移动端
export function isMobile() {
  if (
    navigator.userAgent.match(
      /(phone|pod|iPhone|iPod|ios|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
      //   /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
  ) {
    return true // 手机端
  } else {
    return false // alert('PC端')
  }
}

// 计算时间差（天数）
export function computTime(endTime, startTime = new Date()) {
  if (!endTime) return 0
  const eTime = dayjs(endTime).format('YYYY-MM-DD HH:mm:ss')
  const sTime = dayjs(startTime).format('YYYY-MM-DD HH:mm:ss')
  return eTime !== 'Invalid Date' ? dayjs(sTime).diff(dayjs(eTime), 'days') : 0
}

/**
 * @msg:
 * @param {*} origin 目前下拉数据源
 * @param {*} source 需要更新的下拉数据源
 * @param {*} reset 是否重置
 * @return {*} 返回设置的数据
 */
export function setOption(origin, source, reset = false) {
  if (source && source.length) {
    if (origin.length == 0 || origin.length >= source.length || source.length == 0 || reset) {
      return source
    } else {
      return origin
    }
  } else {
    return []
  }
}

/**
 * @msg: 直接下载图片，不预览
 * @param {*} url 图片访问地址，图片base64编码
 */
export function downloadImgByBase64(url) {
  const img = new Image()
  img.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    // 将img中的内容画到画布上
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    // 将画布内容转换为base64
    const base64 = canvas.toDataURL()
    // 创建a链接
    const a = document.createElement('a')
    a.href = base64
    a.download = ''
    // 触发a链接点击事件，浏览器开始下载文件
    a.click()
  }
  img.src = url
  // 必须设置，否则canvas中的内容无法转换为base64
  img.setAttribute('crossOrigin', 'Anonymous')
}

/**
 * @msg: 在文件管理页面上传模板后，下载模板方法
 * @param {*} name 文件管理页面的标题内容
 * @param {*} SearchData 模板列表接口拓展搜索参数
 */
export async function downloadTemplate(name, SearchData = {}) {
  const res = await getFilePageList({
    Search: {
      Title: name,
      ...SearchData,
    },
  })
  if (res.Success) {
    // 只取第一条
    const data = res.Data.PageList[0] || {}
    if (data.FileId) {
      // 有文件ID，采用文件流形式下载
      const response = await downloadFile(data.FileId)
      if (response) {
        createFileDownload(response)
      }
    } else {
      // 否则用url直接下载
      if (!data.Url) return
      const url = data.Url.includes('http') ? data.Url : process.env.VUE_APP_BASE_API + data.Url
      Vue.prototype.download(url)
    }
  } else {
    Vue.prototype.msgError(res.Msg)
  }
}
