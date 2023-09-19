<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
    <el-dialog title="修改密码" :visible="$store.state.user.needChangePwd" :close-on-click-modal="false" :show-close="false">
      <ResetPwd :isFirst="true" @modifySuccess="modifySuccess"></ResetPwd>
    </el-dialog>
  </div>
</template>

<script>
import ResetPwd from './views/system/user/profile/resetPwd.vue'
import Cookies from 'js-cookie'
export default {
  name: 'App',
  components: {
    ResetPwd,
  },
  data() {
    return {
      isRouterAlive: true,
    }
  },
  // 父组件中返回要传给下级的数据
  provide() {
    return {
      reload: this.reload,
    }
  },
  created() {
    //从cookie获取上次选择的语言
    let language = Cookies.get('app_language')
    if (!language) {
      // 获取浏览器的语言
      const jsSrc = navigator.language || navigator.browserLanguage
      // 系统支持中英文切换 英文作为第二替补语言
      language = jsSrc.indexOf('zh') >= 0 || jsSrc.indexOf('en') >= 0 ? jsSrc : 'en-US'
    }
    console.log('系统语言：' + language)
    this.$loadLanguageAsync(language)
    // 如果是8091则不显示浏览器的favicon.ico,针对部分厂区不能显示logo的问题
    try {
      const port = this.$store.state.settings.hideLogoPort
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
      link.rel = 'icon'
      link.href = location.href.indexOf(port) > -1 ? 'data:;' : 'favicon.ico'
    } catch (error) {
      console.log(error)
    }
  },
  metaInfo() {
    return {
      title: this.$store.state.settings.dynamicTitle && this.$store.state.settings.title,
      titleTemplate: title => (title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE),
    }
  },
  methods: {
    modifySuccess() {
      this.$store.commit('SET_PWDSTATUS', false)
    },
    reload() {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      })
    },
  },
}
</script>
<style>
/*每个页面公共css 阿里巴巴图标*/
.albb_icon {
  width: 12px;
  height: 12px;
  font-size: 54rpx !important;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
