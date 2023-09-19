import Vue from 'vue'
import dayjs from 'dayjs'
dayjs.locale('zh-cn')

// 格式化时间
Vue.filter('formatDate', (date, type = 1) => {
  if (!date) return ''
  let dateStr = ''
  switch (type) {
    case 1:
      dateStr = dayjs(date).format('YYYY-MM-DD')
      break
    case 2:
      dateStr = dayjs(date).format('YYYY-MM-DD HH:mm')
      break
    case 3:
      dateStr = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
      break
    case 4:
      dateStr = dayjs(date).format('YYYY年MM月DD日 HH:mm')
      break
    case 5:
      dateStr = dayjs(date).format('YYYY.MM.DD HH:mm:ss')
      break
    case 6:
      dateStr = dayjs(date).format('YYYY/MM/DD')
      break
    case 7:
      dateStr = dayjs(date).format('YYYY年MM月DD日')
      break
    case 8:
      dateStr = dayjs(date).format('YYYY.MM.DD')
      break
    case 9:
      dateStr = dayjs(date).format('YYYY.MM.DD HH:mm')
      break
    case 10:
      dateStr = dayjs(date).format('MM-DD HH:mm')
      break
    default:
      dateStr = dayjs(date).format('YYYY-MM-DD')
      break
  }
  return dateStr !== 'Invalid Date' ? dateStr : ''
})

/**
 * @msg: 金额转换千分位
 * @precise：精度，保留几位小数
 * @return {*}
 */
Vue.filter('setThousandth', (val, precise = 2) => {
  if (!val || null === val || undefined === val) {
    return '0' + (precise > 0 ? '.'.padEnd(precise + 1, 0) : '')
  }
  return (
    (val &&
      Number(val)
        .toFixed(precise)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')) ||
    0
  )
})
