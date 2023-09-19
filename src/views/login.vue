<template>
  <div class="login">
    <!-- 头部 -->
    <div class="login-header">
      <div class="logo-title">
        <img v-if="hideLogo" @dblclick="showTestLogin = !showTestLogin" src="../assets/login/icon_logo.png" alt="" />
        <span class="title">{{ !hideLogo ? $tl('base_loginTitle_hideLogo', 'QMS&WMS管理系统') : $tl('base_loginTitle', '领益智造QMS&WMS管理系统') }}</span>
      </div>
      <p class="sub-title">
        {{ !hideLogo ? $tl('base_loginSubTitle_hideLogo', 'QUALITY AND WAREHOUSE MANAGEMENT SYSTEM') : $tl('base_loginSubTitle', 'LY iTECH QUALITY AND WAREHOUSE MANAGEMENT SYSTEM') }}
      </p>
    </div>
    <!-- 内容 -->
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <span class="login-title">{{ $tl('base_login', '登录') }}</span>
      <p class="welcome-title">{{ $tl('base_loginWelcome', '欢迎登录QMS&WMS管理系统') }}</p>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" auto-complete="off" :placeholder="$tl('base_login_placeholder_name', '请输入用户工号')" @keyup.enter.native="handleLogin">
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" auto-complete="off" :placeholder="$tl('base_login_placeholder_pwd', '请输入密码')" @keyup.enter.native="handleLogin">
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <div class="login-setting-box" :style="{ justifyContent: !isProduct ? 'space-between' : 'flex-end' }">
        <!-- 根据信息安全认证要求，注释记住密码 -->
        <el-checkbox v-if="!isProduct" v-model="loginForm.rememberMe" class="remenber-password">{{ $tl('base_login_remember_pwd', '记住密码') }}</el-checkbox>
        <div class="pointer" @click="resetPwdVisible = true">{{ $tl('base_reset_login_password', '重置密码') }}</div>
      </div>
      <!-- <el-form-item style="width:100%;"> -->
      <el-button :loading="loading" size="medium" type="primary" style="width: 100%" @click.native.prevent="handleLogin" class="login-button">
        <span v-if="!loading">{{ $tl('base_login_button', '登 录') }}</span>
        <span v-else>{{ $tl('base_login_buttonloading', '登 录 中...') }}</span>
      </el-button>

      <!-- </el-form-item> -->
      <div class="login-Button-bottom" v-if="showTestLogin">
        <div class="login-other-login">
          <span>
            {{ $tl('base_login_other_method', '第三方登录：') }}
          </span>
          <el-tooltip content="钉钉登录" placement="top" :open-delay="500">
            <svg t="1645516363662" class="icon pointer" @click="initDingLogin" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1605" width="20" height="20">
              <path
                d="M512 2C230.2 2 2 230.2 2 512s228.2 510 510 510 510-228.2 510-510S793.3 2 512 2z m235.9 442c-1 4.6-3.6 10.8-7.2 19.1l-0.5 0.5c-21.6 45.8-77.3 135.5-77.3 135.5l-0.5-0.5-16.5 28.3h78.8L574.3 826.8l34-136h-61.8l21.6-90.2c-17.5 4.1-38.1 9.8-62.3 18 0 0-33 19.1-94.8-37.1 0 0-41.7-37.1-17.5-45.8 10.3-4.1 50-8.8 81.4-12.9 42.2-5.7 68.5-8.8 68.5-8.8s-130.3 2.1-161.2-3.1c-30.9-4.6-70.1-56.7-78.3-102 0 0-12.9-24.7 27.8-12.9 40.2 11.8 209.2 45.8 209.2 45.8S321.4 375 307 358.5c-14.4-16.5-42.8-89.6-39.2-134.5 0 0 1.5-11.3 12.9-8.2 0 0 161.8 74.2 272.5 114.4C664.5 371.4 760.8 392 747.9 444z"
                fill="#3296FA"
                p-id="1606"
              ></path>
            </svg>
          </el-tooltip>
        </div>
        <div class="login-recommend-box">
          <span>
            {{ $tl('base_login_browser', '推荐使用浏览器：') }}
          </span>
          <a style="display: flex" target="_blank" :href="browser.url" v-for="(browser, index) in browserList" :key="index">
            <el-tooltip :content="browser.name" placement="bottom" :open-delay="500">
              <el-image class="browser-icon" :src="browser.icon" fit="fill"></el-image>
            </el-tooltip>
          </a>
        </div>
      </div>
      <div class="login-recommend-box" v-else>
        <span>
          {{ $tl('base_login_browser', '推荐使用浏览器：') }}
        </span>
        <a style="display: flex" target="_blank" :href="browser.url" v-for="(browser, index) in browserList" :key="index">
          <el-tooltip :content="browser.name" placement="bottom" :open-delay="500">
            <el-image class="browser-icon" :src="browser.icon" fit="fill"></el-image>
          </el-tooltip>
        </a>
      </div>
    </el-form>
    <div id="login_container" v-show="showDingLogin" style="position: absolute; z-index: 20"></div>
    <div :style="{ zIndex: '19', display: !showDingLogin ? 'none' : 'block' }" class="el-dialog__wrapper" @click="showDingLogin = false"></div>
    <!--  底部  -->
    <div class="el-login-footer" v-if="hideLogo">
      <span>{{ $tl('base_login_footer', '广东领益智造股份有限公司—002600') }}</span>
    </div>
    <el-dialog v-dialogDrag :title="$tl('base_reset_login_password', '重置密码')" width="400px" :visible="resetPwdVisible">
      <el-form ref="resetPwdForm" :model="resetPwdForm" :rules="resetRules">
        <el-form-item prop="UserCode">
          <el-input v-model="resetPwdForm.UserCode" type="text" auto-complete="off" placeholder="请输入用户工号" @keyup.enter.native="handleLogin">
            <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="VerificationCode">
          <el-input v-model="resetPwdForm.VerificationCode" type="text" auto-complete="off" :placeholder="$tl('base_input_login_verification', '请输入验证码')">
            <i slot="prefix" class="el-icon-key"></i>
            <el-button slot="suffix" :loading="loading" :disabled="!canClick" type="primary" style="width: 105%" @click="sendCode">
              {{ codeButtonText }}
            </el-button>
          </el-input>
        </el-form-item>
        <div class="noGetCode">
          <el-tooltip :content="$tl('base_login_canont_receied_tip', '验证码将通过钉钉的工作通知发送给对应用户，如果收不到验证码，请联系管理员！')" placement="top">
            <span>
              <i class="el-icon-question"></i>
              {{ $tl('base_login_cannot_receied_code', '收不到验证码') }}
            </span>
          </el-tooltip>
        </div>
        <el-form-item>
          <el-button type="primary" :loading="resetting" @click="submitReset">{{ $tl('base_login_sure_reset', '确认重置') }}</el-button>
          <el-button @click="closeReset">{{ $t('usual_close') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import '@/assets/styles/login.scss'
import { getCodeImg, resetPwd } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { timeFix, isIE } from '@/utils/util'
import _ from 'lodash'
import { getQuery } from '@/utils/util'
export default {
  name: 'Login',
  data() {
    return {
      showTestLogin: false,
      showDingLogin: false,
      resetPwdVisible: false,
      codeUrl: '',
      cookiePassword: '',
      resetPwdForm: {},
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        code: '',
        uuid: '',
      },
      resetRules: {
        UserCode: [{ required: true, trigger: 'blur', message: this.$tl('base_input_login_usercode', '请输入您的用户工号') }],
        VerificationCode: [{ required: true, trigger: 'blur', message: this.$tl('base_input_login_verification', '请输入验证码') }],
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: this.$tl('base_input_login_name', '请输入您的用户工号/AD账户') }],
        password: [{ required: true, trigger: 'blur', message: this.$tl('base_input_password', '请输入您的密码') }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }],
      },
      resetting: false,
      loading: false,
      // 验证码开关
      captchaOnOff: true,
      // 注册开关
      register: false,
      redirect: undefined,
      redirectRouteName: undefined,
      redirectParam: undefined,
      browserList: [
        { name: '谷歌浏览器', icon: require('../assets/images/chrome.png'), url: 'https://www.google.cn/intl/zh-CN/chrome/' },
        { name: '火狐浏览器', icon: require('../assets/images/firefox.png'), url: 'https://www.firefox.com.cn/' },
      ],
      appid: 'dingbvccj3bamymdem3d', //自己申请的appid
      appsecret: '9JkANut9LAzdCgSODTKwtju_xLdJjPJViouRXQJiea0Ftfrac3rnad6vWZySDDxy', //自己申请的appsecret
      redirectUrl: 'http://mom.lingyiitech.com:8092/login', //这里是扫码成功后跳转的回调地址
      dingCodeConfig: {
        id: 'login_container', //匹配到设置的html的id
        style: 'border:none;background-color:#FFFFFF;',
        width: '400',
        height: '300',
      }, //生成二维码样式的配置
      canClick: true, // 验证码按钮是否可点击
      totalTime: 60, // 倒计时时间
      codeButtonText: this.$tl('base_login_send_code', '发送验证码'), // 验证码按钮文本
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
        this.redirectRouteName = route.query && route.query.n
      },
      immediate: true,
    },
  },
  computed: {
    getRedirectUrl() {
      return encodeURIComponent(this.redirectUrl)
    },
    getAuthUrl() {
      return `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${this.appid}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${this.getRedirectUrl}`
    },
    getGoto() {
      return encodeURIComponent(this.getAuthUrl)
    },
    getDingCodeConfig() {
      return { ...this.dingCodeConfig, goto: this.getGoto }
    },
    // 是否为生产环境
    isProduct() {
      return process.env.NODE_ENV === 'production'
    },
    // 特殊端口不显示logo
    hideLogo() {
      const port = this.$store.state.settings.hideLogoPort
      return location.href.indexOf(port) == -1
    },
  },
  created() {
    if (!this.isProduct) {
      this.getCookie()
    }
    // this.dingLogin();
    // 初始化钉钉的二维码加载
    this.initDingJs()
  },
  mounted() {
    const url = _.cloneDeep(location.href)
    let params = {}
    try {
      params = getQuery(url)
      delete params.t
      delete params.n
      this.redirectParam = params
    } catch (error) {
      console.log(error)
    }

    this.addDingListener()
    // this.initDingLogin();
    if (this.$route.query.code) {
      const code = this.$route.query.code
      console.log(code)
    }
  },
  methods: {
    initDingJs() {
      !(function (window, document) {
        function d(a) {
          let e
          const c = document.createElement('iframe')
          let d = 'https://login.dingtalk.com/login/qrcode.htm?goto=' + a.goto
          ;(d += a.style ? '&style=' + encodeURIComponent(a.style) : ''),
            (d += a.href ? '&href=' + a.href : ''),
            (c.src = d),
            (c.frameBorder = '0'),
            (c.allowTransparency = 'true'),
            (c.scrolling = 'no'),
            (c.width = a.width ? a.width + 'px' : '400px'),
            (c.height = a.height ? a.height + 'px' : '400px'),
            (e = document.getElementById(a.id)),
            (e.innerHTML = ''),
            e.appendChild(c)
        }
        window.DDLogin = d
      })(window, document)
    },
    addDingListener() {
      const self = this
      const handleLoginTmpCode = loginTmpCode => {
        window.location.href = self.getAuthUrl + `&loginTmpCode=${loginTmpCode}`
      }
      const handleMessage = event => {
        if (event.origin == 'https://login.dingtalk.com') {
          handleLoginTmpCode(event.data)
        }
      }

      if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', handleMessage, false)
      } else if (typeof window.attachEvent != 'undefined') {
        window.attachEvent('onmessage', handleMessage)
      }
    },
    initDingLogin() {
      window.DDLogin(this.getDingCodeConfig)
      this.showDingLogin = true
    },
    getCookie() {
      const username = Cookies.get('username')
      const password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          if (isIE()) {
            return this.msgInfo(this.$tl('no_support_ie', '系统不支持使用IE浏览器'))
          } else {
            this.loading = true
            if (this.loginForm.rememberMe) {
              Cookies.set('username', this.loginForm.username, { expires: 30 })
              Cookies.set('password', encrypt(this.loginForm.password), { expires: 30 })
              Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 })
            } else {
              Cookies.remove('username')
              Cookies.remove('password')
              Cookies.remove('rememberMe')
            }
            this.$store
              .dispatch('Login', this.loginForm)
              .then(res => {
                this.loading = false
                if (res.Success) {
                  //  setTimeout(() => {
                  if (this.$store.state.user.isHello) {
                    this.msgSuccess(`${timeFix()},欢迎回来`)
                  }
                  // }, 1000)
                  // 登录后跳回原本打开的页面，报错则跳首页
                  try {
                    //重定向路由名字 和 transfer跳转页面 结合使用
                    if (this.redirectRouteName) {
                      this.$router.push({ name: this.redirectRouteName || '/', query: this.redirectParam })
                    } else {
                      //重定向路由URL
                      this.$router.push({ path: this.redirect || '/' })
                    }
                  } catch (error) {
                    this.$router.push({ path: '/' })
                  }
                } else {
                  this.msgError(res.Msg)
                }
              })
              .catch(err => {
                this.loading = false
                // this.msgError(err);
              })
          }
        }
      })
    },
    dingLogin: function () {
      const self = this
      let dd
      // console.log(dd.ios,dd.android,dd.pc,"dd.pc");
      if (dd.ios || dd.android || dd.pc) {
        ///如果是钉钉客户端 进入钉钉免登
        //try {
        //app.ddform.fadeIn(100);
        dd.biz.navigation.setRight({
          show: false, //控制按钮显示， true 显示， false 隐藏， 默认true
          onSuccess() {
            //如果control为true，则onSuccess将在发生按钮点击事件被回调
            dd.biz.util.share({
              type: 0, //分享类型，0:全部组件 默认； 1:只能分享到钉钉；2:不能分享，只有刷新按钮
            })
          },
        })
        // var returnUrl = "";
        // $.post('../../DD/SignInfoGet', null, function (r) {

        //     //alert(r,r.corpId, "通过免登码获取用户信息")
        //     dd.ready(function () {
        //         dd.runtime.permission.requestAuthCode({
        //             corpId: r.corpId,
        //             onSuccess: function (info) {//成功获得code值,code值在info中
        //                 //通过免登码获取用户信息
        //                 $.post('../../DD/UserInfoGet', { code: info.code }, function (r) {
        //                     var user = JSON.parse(r.userInfo);
        //                     // alert(user, user.jobnumber,"通过免登码获取用户信息")
        //                     //console.log(user)
        //                     //cookie.set('u_id', user.jobnumber);
        //                     self.disabledName = true;
        //                     self.username = user.jobnumber;
        //                     self.modify.Account = user.jobnumber;
        //                 }, 'json');
        //             },
        //             onFail: function (err) {
        //                 console.log(false, err);
        //                 alert('fail')
        //             }
        //         });
        //     });
        //     dd.error(function (e) {
        //         app.ddform.hide();
        //         app.login.fadeIn(200);
        //         console.log(e);
        //         err = e;
        //     });
        // }, 'json');
      }
    },
    closeReset() {
      this.$refs.resetPwdForm.resetFields()
      this.resetPwdVisible = false
    },
    // 发送验证码
    sendCode() {
      this.$refs.resetPwdForm.validateField('UserCode', async valid => {
        if (!valid) {
          const data = {
            UserCode: this.resetPwdForm.UserCode,
          }
          const res = await getCodeImg(data)
          if (res.Success) {
            this.$confirm(this.$tl('base_login_sendCode_success', '验证码发送成功，请留意钉钉工作通知，验证码1分钟内有效！'), this.$t('usual_notice'), {
              showCancelButton: false,
              type: 'info',
            })
            this.countDown()
          } else {
            this.msgError(res.Msg)
          }
        }
      })
    },
    submitReset() {
      this.$refs.resetPwdForm.validate(async valid => {
        if (valid) {
          const data = {
            UserCode: this.resetPwdForm.UserCode,
            code: this.resetPwdForm.VerificationCode,
          }
          this.resetting = true
          const res = await resetPwd(data)
          this.resetting = false
          if (res.Success) {
            this.closeReset()
            this.$confirm(this.$tl('base_login_resetPwd_success', '密码已成功重置为：123456'), this.$t('usual_notice'), {
              showCancelButton: false,
              type: 'info',
            })
          } else {
            this.msgError(res.Msg)
          }
        }
      })
    },
    // 开始倒计时
    countDown() {
      if (!this.canClick) return
      this.canClick = false
      this.codeButtonText = this.$tl('base_login_sendcode_coundown', `${this.totalTime}s后重新发送`, { second: this.totalTime })
      const clock = setInterval(() => {
        this.totalTime--
        this.codeButtonText = this.$tl('base_login_sendcode_coundown', `${this.totalTime}s后重新发送`, { second: this.totalTime })
        if (this.totalTime < 0) {
          clearInterval(clock)
          this.codeButtonText = this.$tl('base_login_send_code', '发送验证码')
          this.totalTime = 60
          this.canClick = true
        }
      }, 1000)
    },
  },
}
</script>

<style scoped lang="scss">
.login {
  ::v-deep .el-form-item {
    margin-bottom: 22px !important;
  }
}
</style>
