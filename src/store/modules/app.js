import Cookies from 'js-cookie'
import { loadLanguageAsync } from '@/locales'
import {
  SIDEBAR_TYPE,
  TOGGLE_MOBILE_TYPE,
  TOGGLE_NAV_THEME,
  TOGGLE_LAYOUT,
  TOGGLE_FIXED_HEADER,
  TOGGLE_FIXED_SIDEBAR,
  TOGGLE_CONTENT_WIDTH,
  TOGGLE_HIDE_HEADER,
  TOGGLE_COLOR,
  TOGGLE_WEAK,
  TOGGLE_MULTI_TAB,
  // i18n
  APP_LANGUAGE,
} from '@/store/mutation-types'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false,
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',
  sideCollapsed: false,
  isMobile: false,
  layout: '',
  contentWidth: '',
  fixedHeader: false,
  fixedSidebar: false,
  autoHideHeader: false,
  color: '',
  weak: false,
  multiTab: true,
  lang: 'zh-CN',
  _antLocale: {},
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  [SIDEBAR_TYPE]: (state, type) => {
    state.sideCollapsed = type
    Cookies.set(SIDEBAR_TYPE, type)
  },
  [TOGGLE_MOBILE_TYPE]: (state, isMobile) => {
    state.isMobile = isMobile
  },
  [TOGGLE_NAV_THEME]: (state, theme) => {
    state.theme = theme
    Cookies.set(TOGGLE_NAV_THEME, theme)
  },
  [TOGGLE_LAYOUT]: (state, mode) => {
    state.layout = mode
    Cookies.set(TOGGLE_LAYOUT, mode)
  },
  [TOGGLE_FIXED_HEADER]: (state, mode) => {
    state.fixedHeader = mode
    Cookies.set(TOGGLE_FIXED_HEADER, mode)
  },
  [TOGGLE_FIXED_SIDEBAR]: (state, mode) => {
    state.fixedSidebar = mode
    Cookies.set(TOGGLE_FIXED_SIDEBAR, mode)
  },
  [TOGGLE_CONTENT_WIDTH]: (state, type) => {
    state.contentWidth = type
    Cookies.set(TOGGLE_CONTENT_WIDTH, type)
  },
  [TOGGLE_HIDE_HEADER]: (state, type) => {
    state.autoHideHeader = type
    Cookies.set(TOGGLE_HIDE_HEADER, type)
  },
  [TOGGLE_COLOR]: (state, color) => {
    state.color = color
    Cookies.set(TOGGLE_COLOR, color)
  },
  [TOGGLE_WEAK]: (state, mode) => {
    state.weak = mode
    Cookies.set(TOGGLE_WEAK, mode)
  },
  [APP_LANGUAGE]: (state, lang) => {
    state.lang = lang
    Cookies.set(APP_LANGUAGE, lang)
  },
  [TOGGLE_MULTI_TAB]: (state, bool) => {
    Cookies.set(TOGGLE_MULTI_TAB, bool)
    state.multiTab = bool
  },
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setLang({ commit }, lang) {
    commit(APP_LANGUAGE, lang)
    return new Promise((resolve, reject) => {
      // loadLanguageAsync(lang)
      // then(() => {
      //   resolve()
      // }).catch((e) => {
      //   reject(e)
      // })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
