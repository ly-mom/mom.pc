import Vue from 'vue'

import Cookies from 'js-cookie'
import echarts from 'echarts'
import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/media.scss' // media全局样式 css

import '@/assets/styles/ruoyi.scss' // ruoyi css
import App from './App'
import store from './store'

import directive from './directive' //directive
import './utils/filter' // global filter
import { globalMixin } from '@/layout/mixin/globalMixins.js'

import './assets/icons' // icon
import './permission' // permission control
import { getDicts } from '@/api/system/dict/data'
import { getConfigKey } from '@/api/system/config'

import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, download, handleTree } from '@/utils/ruoyi'
import Pagination from '@/components/Pagination'
// 自定义表格工具组件
import RightToolbar from '@/components/RightToolbar'
// 富文本组件
import Editor from '@/components/Editor'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/icon.css'
// 字典标签组件
import DictTag from '@/components/DictTag'
import ColumnSearch from '@/components/ColumnSearch'
import ColumnSelect from '@/components/ColumnSelect'
// 表格组件
import BaseTable from '@/components/BaseTableVxe'
import TableColumn from '@/components/tableColumn'

// 头部标签组件
import VueMeta from 'vue-meta'
import i18n from '@/locales'

import './assets/font/iconfont.js' //引入阿里巴巴图标库js
import './assets/font/iconfont.css' //引入阿里巴巴图标库css

import Axios from './utils/request'
import * as $table from './utils/tableRelation'
import Select from './components/Element/Select'
import router from './router'
import XEUtils from 'xe-utils'
import 'vxe-table/lib/style.css'
import { VXETable, Column, Colgroup, Table, Tooltip, Footer } from 'vxe-table'
import vxe_zhCN from 'vxe-table/lib/locale/lang/zh-CN'
// 按需加载的方式默认是不带国际化的，自定义国际化需要自行解析占位符 '{0}'，例如：
VXETable.setup({
  i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(vxe_zhCN, key), args),
})

Vue.use(Column).use(Colgroup).use(Table).use(Tooltip).use(Footer)
Vue.mixin(globalMixin)
// 全局方法挂载
Vue.prototype.$http = Axios
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.$echarts = echarts
Vue.prototype.$table = $table
Vue.prototype.$tl = (key, defaultValue, props) => {
  if (store.state.settings.showLanKey) {
    return i18n.t(key, props)
  } else {
    if (i18n.t(key) != key) {
      return i18n.t(key, props)
    } else if (defaultValue) {
      return defaultValue
    } else {
      return key.split('_').reverse()[0]
    }
  }
}

Vue.prototype.msgSuccess = function (msg) {
  if (!msg) return
  this.$message({ showClose: true, message: msg, type: 'success' })
}

Vue.prototype.msgError = function (msg) {
  if (!msg) return
  this.$message({ showClose: true, message: msg, type: 'error' })
}

Vue.prototype.msgWarning = function (msg) {
  if (!msg) return
  this.$message({ showClose: true, message: msg, type: 'warning' })
}

Vue.prototype.msgInfo = function (msg) {
  if (!msg) return
  this.$message.info(msg)
}
Vue.prototype.$EventBus = new Vue()

// 全局组件挂载
Vue.component('DictTag', DictTag)
Vue.component('ColumnSearch', ColumnSearch)
Vue.component('ColumnSelect', ColumnSelect)
Vue.component('BaseTable', BaseTable)
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('Editor', Editor)
Vue.component('TableColumn', TableColumn)
Vue.component('el-select', Select)
Vue.use(directive)
Vue.use(VueMeta)

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App),
})
