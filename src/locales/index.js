import Vue from 'vue'
import VueI18n from 'vue-i18n'
// default lang
import zhCN from './lang/zh-CN'
import enUS from './lang/en-US'
import axios from 'axios'
import { Message } from 'element-ui'
import localeE from 'element-ui/lib/locale'
import Cookies from 'js-cookie'

Vue.use(VueI18n)

/**
 * 请求后台接口获取语言包
 * @param type
 * @returns {AxiosPromise}
 */
function getLang(type) {
  return axios({
    headers: {
      'Accept-Language': type,
    },
    method: 'get',
    url: `${process.env.VUE_APP_BASE_API}/Base/Language/GetLangResource?lang=${type}`,
  })
}

const i18n = new VueI18n({
  silentTranslationWarn: true,
  locale: 'zh-CN',
  messages: {},
})

// lijinya 2022.01.15 start 针对401登录缓存过期的场合，部分语言包写在本地。不请求服务器
//从cookie获取上次选择的语言
let lan = Cookies.get('app_language')
if (!lan) {
  // 获取浏览器的语言
  const jsSrc = navigator.language || navigator.browserLanguage
  // 系统支持中英文切换 英文作为第二替补语言
  lan = jsSrc.indexOf('zh') >= 0 || jsSrc.indexOf('en') >= 0 ? jsSrc : 'en-US'
}
if (lan.indexOf('zh') >= 0) {
  i18n.setLocaleMessage(lan, zhCN)
} else {
  i18n.setLocaleMessage(lan, enUS)
}
i18n.locale = lan
// lijinya 2022.01.15 end 针对401登录缓存过期的场合，部分语言包写在本地。不请求服务器

//兼容element
localeE.i18n((key, value) => i18n.t(key, value))

async function loadLanguageAsync(lang) {
  const res = await getLang(lang)
  if (!res.data.Success) {
    Message({ type: 'error', message: res.data.Msg })
    return
  }
  const obj = res.data.Data
  // 用於匹配elementUI對應語言包的名字
  const ELangName = {
    'zh-CN': 'zh-CN',
    'en-US': 'en',
  }
  try {
    // 引入elementUI語言包
    const elementLang = require(`element-ui/lib/locale/lang/${ELangName[lang] || 'zh-CN'}`).default || {}
    Object.assign(obj, elementLang)
  } catch (error) {
    // 预防取不到elementUI对应的语言包报错导致多语言无效
  }
  i18n.setLocaleMessage(lang, obj)
  i18n.locale = lang
}

Vue.prototype.$loadLanguageAsync = loadLanguageAsync

export default i18n
