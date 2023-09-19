/**
 * v-dialogDrag 弹窗拖拽
 * Copyright (c) 2019 ruoyi
 */

export default {
  bind(el, binding, vnode, oldVnode) {
    const value = binding.value
    if (value == false) return
    /**
     * @msg: 将vh和vw单位转换成px
     * @param {*} value 带单位的字符串
     * @return {*} 整数的转换结果
     */
    function viewportToPixels(value) {
      const parts = value.match(/([0-9\\.]+)(vh|vw)/)
      const q = Number(parts[1])
      const side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]]
      return parseInt(side * (q / 100))
    }
    // 获取拖拽内容头部
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')
    dialogHeaderEl.style.cursor = 'move'
    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)
    dragDom.style.position = 'absolute'
    dragDom.style.marginTop = 0
    let width = dragDom.style.width
    if (width.includes('%')) {
      width = +document.body.clientWidth * (+width.replace(/\\%/g, '') / 100)
    } else {
      width = +width.replace(/\px/g, '')
    }
    dragDom.style.left = `${(document.body.clientWidth - width) / 2}px`
    // 鼠标按下事件
    dialogHeaderEl.onmousedown = e => {
      // 鼠标按下，计算当前元素距离可视区的距离 (鼠标点击位置距离可视窗口的距离)
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop
      // 弹窗的高度
      const height = dragDom.offsetHeight
      // 获取到的值带px 正则匹配替换
      let styL, styT

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\\%/g, '') / 100)
        styT = +document.body.clientHeight * (+sty.top.replace(/\\%/g, '') / 100)
      } else {
        styL = +sty.left.replace(/\px/g, '')
        styT = +sty.top.replace(/\px/g, '')
      }

      // 鼠标拖拽事件
      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离 （开始拖拽至结束拖拽的距离）
        const l = e.clientX - disX
        const t = e.clientY - disY

        const finallyL = l + styL
        const finallyT = t + styT
        // 弹窗上下的margin
        const modelMargin = viewportToPixels('6vh')
        // 右边边距最小值
        const rightLimit = document.body.clientWidth - width - 1
        // 顶部边距最小值
        const topLimit = document.body.clientHeight - height - modelMargin - 2

        // 移动当前元素
        dragDom.style.left = `${finallyL > 0 ? (finallyL < rightLimit ? finallyL : rightLimit) : 0}px`
        dragDom.style.top = `${finallyT > -modelMargin ? (finallyT < topLimit ? finallyT : topLimit) : -modelMargin}px`
      }

      document.onmouseup = function (e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
}
