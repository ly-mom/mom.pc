let _boundaryCheckingState = true
/**
 * 是否进行边界检查，默认开启
 * @param flag 标记开关，true 为开启，false 为关闭，默认为 true
 */
function enableBoundaryChecking(flag = true) {
  _boundaryCheckingState = flag
}
/**
 * 把错误的数据转正
 * strip(0.09999999999999998)=0.1
 */
function strip(num, precision = 15) {
  return +parseFloat(Number(num).toPrecision(precision))
}
/**
 * 检测数字是否越界，如果越界给出提示
 * @param {*number} num 输入数
 */
function checkBoundary(num) {
  if (_boundaryCheckingState) {
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      console.warn(`${num} is beyond boundary when transfer to integer, the results may not be accurate`)
    }
  }
}
/**
 * Return digits length of a number
 * @param {*number} num Input number
 */
function digitLength(num) {
  // Get digit length of e
  const eSplit = num.toString().split(/[eE]/)
  const len = (eSplit[0].split('.')[1] || '').length - +(eSplit[1] || 0)
  return len > 0 ? len : 0
}
/**
 * 把小数转成整数，支持科学计数法。如果是小数则放大成整数
 * @param {*number} num 输入数
 */
function float2Fixed(num) {
  if (num.toString().indexOf('e') === -1) {
    return Number(num.toString().replace('.', ''))
  }
  const dLen = digitLength(num)
  return dLen > 0 ? strip(Number(num) * Math.pow(10, dLen)) : Number(num)
}

/**
 * 精确乘法
 */
export function times(num1, num2, ...others) {
  if (others.length > 0) {
    return times(times(num1, num2), others[0], ...others.slice(1))
  }
  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)
  const baseNum = digitLength(num1) + digitLength(num2)
  const leftValue = num1Changed * num2Changed

  return leftValue / Math.pow(10, baseNum)
}

/**
 * 精确加法
 */
export function plus(num1, num2, ...others) {
  if (others.length > 0) {
    return plus(plus(num1, num2), others[0], ...others.slice(1))
  }
  const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)))
  return (times(num1, baseNum) + times(num2, baseNum)) / baseNum
}
/**
 * 精确减法
 */
export function minus(num1, num2, ...others) {
  if (others.length > 0) {
    return minus(minus(num1, num2), others[0], ...others.slice(1))
  }
  const baseNum = Math.pow(10, Math.max(digitLength(num1), digitLength(num2)))
  return (times(num1, baseNum) - times(num2, baseNum)) / baseNum
}

/**
 * 精确除法
 */
export function divide(num1, num2, ...others) {
  if (others.length > 0) {
    return divide(divide(num1, num2), others[0], ...others.slice(1))
  }
  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)
  checkBoundary(num1Changed)
  checkBoundary(num2Changed)
  // fix: 类似 10 ** -4 为 0.00009999999999999999，strip 修正
  return times(num1Changed / num2Changed, strip(Math.pow(10, digitLength(num2) - digitLength(num1))))
}
