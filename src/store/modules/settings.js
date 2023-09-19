import variables from '@/assets/styles/element-variables.scss'
import defaultSettings from '@/settings'
import { computTime } from '@/utils/util'

const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle, showLanKey, hideLogoPort } = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''
const state = {
  title: '',
  theme: storageSetting.theme || variables.theme,
  sideTheme: storageSetting.sideTheme || sideTheme,
  showSettings: showSettings,
  topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
  tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
  fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
  sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
  dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
  showLanKey: storageSetting.showLanKey === undefined ? showLanKey : storageSetting.showLanKey,
  hideLogoPort: storageSetting.hideLogoPort === undefined ? hideLogoPort : storageSetting.hideLogoPort,
  scrollNotice: {}, // 顶部滚动公告
}
const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      state[key] = value
    }
  },
  SET_NOTICE: (state, data) => {
    state.scrollNotice = data && computTime(data.CreateTime) < 1 ? data : {}
  },
}

const actions = {
  // 修改布局设置
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  // 设置网页标题
  setTitle({ commit }, title) {
    state.title = title
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
