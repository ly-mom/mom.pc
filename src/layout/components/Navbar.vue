<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav" />
    <div class="noticeBox" v-if="!isEmptyValue(scorllNotice)" @click="viewsNotice(scorllNotice.Id)">
      <svg-icon class="icon" icon-class="notice" :style="{ color: theme }" />
      <p class="content" :style="{ color: theme }">
        <span class="scrollBox">
          <span :style="{ background: theme + '2b' }"> {{ $tl('usual_importNotice', '重要通知：') }}{{ scorllNotice.Title }} </span>
        </span>
      </p>
    </div>
    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <!-- <search id="header-search" class="right-menu-item" /> -->
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
      </template>
      <!--      <el-dropdown-->
      <!--        class="right-menu-item hover-effect"-->
      <!--        trigger="click"-->
      <!--      >-->
      <!--        <div class="avatar-wrapper">-->
      <!--          <svg-icon icon-class="i18n"  v-hasPermi="['system:menu:i18n']"/>-->
      <!--        </div>-->

      <!--        <el-dropdown-menu slot="dropdown">-->
      <!--          <el-dropdown-item-->
      <!--            v-for="(item, index) in languageLabels"-->
      <!--            :key="index"-->
      <!--            @click.native="changeLang(item.DataValue)"-->
      <!--            >{{ item.DataText }}</el-dropdown-item-->
      <!--          >-->
      <!--        </el-dropdown-menu>-->
      <!--      </el-dropdown>-->
      <!--      国际化没有完善前 追加的权限判断 v-hasPermi="['system:menu:i18n']"-->
      <el-select
        class="right-menu-item hover-effect"
        filterable
        default-first-option
        collapse-tags
        v-model="lang"
        :placeholder="$t('MOM_InputPlease')"
        :style="{ width: '120px' }"
        @change="changeLang"
      >
        <el-option v-for="item in languageLabels" :key="item.DataValue" :label="item.DataText" :value="item.DataValue"></el-option>
      </el-select>
      <el-select
        class="right-menu-item hover-effect"
        filterable
        default-first-option
        collapse-tags
        v-model="value"
        @change="getList"
        :placeholder="$t('quality_inputFactory')"
        :style="{ width: '200px' }"
      >
        <el-option v-for="item in options" :key="item.OrgCode" :label="checkRole(['Development']) ? `${item.SbuName}(${item.OrgCode})` : item.SbuName" :value="item.OrgCode"> </el-option>
      </el-select>
      <!-- <div  class="right-menu-item hover-effect" v-if="IsSubmit">
        <el-button @click="submitOrg"  type="primary" size="mini" plain>确定厂区</el-button>
      </div> -->

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <!-- <img :src="avatar" class="user-avatar" /> -->
          <div class="userName">{{ name }}</div>
          <i class="el-icon-caret-bottom" />
        </div>

        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile" v-if="!checkRole(['admin'])">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <!-- <el-dropdown-item @click.native="$store.commit('SET_PWDSTATUS', true)">{{$t('usual_update')}}密码</el-dropdown-item> -->
          <el-dropdown-item v-hasRole="['Development', 'admin']" @click.native="showChangeUser">
            <span>切换用户</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog title="切换用户" v-hasRole="['Development', 'admin']" :visible="changeUserVisible" width="340px">
      <el-form :model="form" ref="Form">
        <el-form-item label="切换到" :rules="[{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }]" prop="UserCode">
          <el-select size="small" filterable remote collapse-tags v-model="form.UserCode" clearable ref="input" :placeholder="$t('MOM_InputPlease')" :remote-method="notifySearch" default-first-option>
            <el-option v-for="d in memberList" :key="d.UserCode" :value="d.UserCode" :label="d.RealName" :disabled="d.UserCode == $store.state.user.userCode">
              {{ $tl('usual_user_option1', `${d.RealName}(${d.UserCode})${d.OrgName ? d.OrgName : ''}`, d) }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="changeUserVisible = false">{{ $t('usual_cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="changeUser" :loading="submiting">{{ $t('usual_confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import i18nMixin from '@/store/i18n-mixin'
import { baseSbuInfo, SetDefaultOrg } from '@/api/base'
import { getDicts } from '@/api/system/dict/data'
import Cookies from 'js-cookie'
import { baseUserInfo, changeUser } from '@/api/base.js'
import { setToken } from '@/utils/auth'
import _ from 'lodash'
import { checkRole } from '@/utils/permission'

export default {
  mixins: [i18nMixin],
  //引用vue reload方法
  inject: ['reload'],
  data() {
    return {
      locales: ['zh-CN', 'en-US'],
      lang: '',
      languageLabels: [],
      memberList: [],
      form: {},
      changeUserVisible: false,
      submiting: false,
      // IsSubmit:false,
      // options: this.$store.state.user.OrgCodeList||[],
      value: this.$store.state.user.orgCode || null,
      OrgCode: [],
      SbuName: [],
      queryParams: {
        PageIndex: 1,
        PageRows: 50,
        Search: {
          UserCode: this.$store.state.user.userCode,
        },
      },
    }
  },
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device']),
    theme() {
      return this.$store.state.settings.theme
    },
    scorllNotice() {
      return this.$store.state.settings.scrollNotice
    },
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val,
        })
      },
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      },
    },
    name: {
      get() {
        return this.$store.state.user.name
      },
    },
    options() {
      return this.$store.state.user.OrgCodeList
    },
  },

  created() {
    //初始化数组的值
    //  let code=this.$store.state.user.orgCode;

    //    if(code&&!this.isArray(code)){
    //        code=[code]
    //         }else{
    //           code=Array.from(new Set(code))
    //         }
    //      this.value=code;

    // 2021.10.12 lijinya 请求国际化语言下拉框数据源
    this.getLanguageList()
  },
  mounted() {
    //从cookie获取上次选择的语言
    let language = Cookies.get('app_language')
    if (!language) {
      // 获取浏览器的语言
      const jsSrc = navigator.language || navigator.browserLanguage
      // 系统支持中英文切换 英文作为第二替补语言
      language = jsSrc.indexOf('zh') >= 0 || jsSrc.indexOf('en') >= 0 ? jsSrc : 'en-US'
    }
    this.lang = language
  },
  methods: {
    checkRole,
    async getLanguageList() {
      const res = await getDicts('country_language', false)
      if (res.Success) {
        this.languageLabels = res.Data
      } else {
        this.msgError(res.Msg)
      }
    },
    getList(val) {
      //获取多选的数据

      if (val) {
        //  this.IsSubmit=true;
        this.OrgCode = val
        // this.options.find((item)=>{ //这里的options就是数据源
        //   if(item.OrgCode == val){
        //     this.OrgCode=item.OrgCode //这里的value我改成了id
        //     this.SbuName=item.SbuName //这里的label我改成了SbuName
        //   }
        // });
        this.submitOrg()
      } else {
        //  this.IsSubmit=false
      }
    },
    submitOrg() {
      //确定厂区按钮
      this.$confirm('确认要切换厂区吗？如切换厂区页面数据将会重载', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$store.commit('SET_ORGCODE', this.OrgCode)
          sessionStorage.removeItem('ipqcparam')
          SetDefaultOrg({
            UserId: this.$store.state.user.UserInfo.Id,
            OrgCode: this.OrgCode || undefined,
          }).then(response => {
            if (response.Success) {
              this.msgSuccess(response.Msg)
            } else {
              this.msgError(response.Msg)
            }
          })
          this.reload()
        })
        .catch(() => {
          this.value = this.$store.state.user.orgCode
        })
    },
    isArray(obj) {
      //判断是否为数组
      return typeof obj == 'object' && obj.constructor == Array
    },

    dataFilte() {},
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', this.$t('usual_notice'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$store.dispatch('LogOut').then(() => {
            location.href = '/index'
          })
        })
        .catch(() => {})
    },
    async changeLang(lang) {
      this.$store.dispatch('app/setLang', lang)
      await this.$loadLanguageAsync(lang)
      this.$store.commit('dict/UPDATE_DICT_TEXT')
      this.reload()
    },
    getRemote: _.throttle(
      function (value) {
        this.notifySearch(value)
      },
      500,
      { leading: true },
    ),
    // 人员搜索
    async notifySearch(value, count) {
      const ParmeterData = {
        PageIndex: 0,
        PageRows: 20,
        SortField: 'id',
        SortType: 'asc',
        Search: {
          all: true,
          RealName: value,
        },
      }
      const res = await baseUserInfo(ParmeterData)
      if (res.Success) {
        const list = res.Data.PageList || []
        this.memberList = this.setRemoteOption(list, this.memberList, count)
      } else {
        this.msgError(res.Msg)
      }
    },
    showChangeUser() {
      this.changeUserVisible = true
      this.$nextTick(() => {
        const inputRef = this.$refs.input
        if (inputRef) {
          inputRef.focus()
        }
      })
    },
    changeUser() {
      this.$refs.Form.validate(async valid => {
        if (valid) {
          this.submiting = true
          const res = await changeUser(this.form.UserCode)
          this.submiting = false
          if (res.Success) {
            setToken(res.Data.TokenInfo.Token)
            this.$store.commit('SET_TOKEN', res.Data.TokenInfo.Token)
            this.$router.go(0)
          } else {
            this.msgError(res.Msg)
          }
        }
      })
    },
    viewsNotice(id) {
      this.$router.push('/index/viewsNotice/index/' + id)
    },
  },
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  .userName {
    color: rgb(24 144 255);
    font-size: 14px;
  }

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
  .noticeBox {
    position: absolute;
    bottom: -4px;
    left: 0;
    z-index: 999;
    width: 600px;
    // background-color: #fff;
    align-items: center;
    display: flex;
    height: 24px;
    border-radius: 8px;
    box-sizing: border-box;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 12px;
    color: #353535;
    cursor: pointer;

    .icon {
      font-size: 12px;
      margin-right: 10px;
    }
    // 核心代码
    @keyframes marquee {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-100%);
      }
    }

    .content {
      flex: 1;
      overflow: hidden;

      .scrollBox {
        display: block;
        width: auto;
        white-space: nowrap;
        animation: marquee 12s linear infinite;
        padding-left: 100%;
        padding-right: 110%;
        &:hover {
          animation-play-state: paused;
        }
        span {
          padding: 0 10px;
          border-radius: 4px;
        }
      }
    }
  }
}
</style>
