import store from '@/store'

/* 统一计算高度 */
export const FullViewHeight = otherHeight => {
  switch (typeof otherHeight) {
    case 'number':
      return `calc(100vh - ${store.state.constant.height.pageHeader}px - ${otherHeight}px)`
    case 'string':
      return `calc(100vh - ${store.state.constant.height.pageHeader}px - ${otherHeight})`
    default:
      return otherHeight
  }
}

/**
 *
 * @param tableData     数组列表
 * @param conditionList 筛选条件数组
 * @returns {*}         筛选后的数组
 */
export const filterTableFn = (tableData, conditionList) => {
  if (conditionList.length == 0) return tableData
  conditionList.forEach(item => {
    if (item.type == 'eq') {
      // 等于的情况

      if (item.attributeVal && item.attributeVal.length > 0) {
        let arr = []
        // 下拉框多选场合
        item.attributeVal.forEach(mo => {
          const brr = tableData.filter(to => to[item.attributeName] == mo)
          arr = arr.concat(brr)
        })
        tableData = arr
      }
    }
    if (item.type == 'include') {
      tableData = tableData.filter(
        data => !item.attributeVal || (item.attributeVal && data[item.attributeName] && data[item.attributeName].toString().toLowerCase().includes(item.attributeVal.toLowerCase())),
      )
    }
  })
  return tableData
}

// 表格筛选过滤
export const filterCoulums = (value, row, column) => {
  const property = column['columnKey']
  return row[property] == value
}

/* 排序数字（0->9）->大写字母（A->Z）->小写字母（a->z）->中文拼音（a->z） start */
export const sortChange = (column, list) => {
  const proptype = column.prop
  let order = 1
  // 排序比较函数
  const sortDevName = function (str1, str2) {
    let res = 0
    if (!str1[proptype] && str2[proptype]) {
      //空的先排序
      return -1
    } else if (str1[proptype] && !str2[proptype]) {
      //空的先排序
      return 1
    } else if (isNaN(str1[proptype])) {
      // 非数字场合
      str1[proptype] = String(str1[proptype])
      str2[proptype] = String(str2[proptype])
      // debugger
      if (str1[proptype] !== '' && str2[proptype] === '') {
        return -1
      } else if (str2[proptype] !== '' && str1[proptype] === '') {
        return 1
      } else {
        for (let i = 0; ; i++) {
          if (!str1[proptype][i] || !str2[proptype][i]) {
            res = str1[proptype].length - str2[proptype].length
            break
          }
          const char1 = str1[proptype][i]
          const char1Type = getChartType(char1)
          const char2 = str2[proptype][i]
          const char2Type = getChartType(char2)
          // 类型相同的逐个比较字符
          if (char1Type[0] === char2Type[0]) {
            if (char1 === char2) {
              continue
            } else {
              if (char1Type[0] === 'zh') {
                res = char1.localeCompare(char2)
              } else if (char1Type[0] === 'en') {
                res = char1.charCodeAt(0) - char2.charCodeAt(0)
              } else {
                res = str1[proptype] - str2[proptype]
              }
              break
            }
          } else {
            // 类型不同的，直接用返回的数字相减
            res = char1Type[1] - char2Type[1]
            break
          }
        }
      }
      res = order * res
      return res
    } else {
      // 数字场合
      return str1[proptype] - str2[proptype]
    }
  }

  if (column.order === 'descending') {
    order = 1
    list.sort(sortDevName)
  } else if (column.order === 'ascending') {
    order = -1
    list.sort(sortDevName)
  } else {
    list = JSON.parse(JSON.stringify(list))
  }
  // 解决sort排序后强制转换null为“null”字符串类型，导致页面表格展示null字符串
  for (let i = 0; i < list.length; i++) {
    for (const key in list[i]) {
      if (list[i][key] === 'null') {
        list[i][key] = null
      }
    }
  }
}

function getChartType(char) {
  // 数字（0->9）->大写字母（A->Z）->小写字母（a->z）->中文拼音（a->z）
  if (/^[\u4e00-\u9fa5]$/.test(char)) {
    return ['zh', 300]
  }
  if (/^[a-zA-Z]$/.test(char)) {
    return ['en', 200]
  }
  if (/^[0-9]$/.test(char)) {
    return ['number', 100]
  }
  return ['others', 999]
}

/* 排序数字（0->9）->大写字母（A->Z）->小写字母（a->z）->中文拼音（a->z） end */
