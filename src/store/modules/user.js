//import { login, logout, getInfo } from '@/api/login'
import { login, logout, getInfo } from '@/api/login'

import { getToken, setToken, removeToken } from '@/utils/auth'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: getToken(),
    name: '',
    userId: '',
    avatar: '',
    isHello: false, // 是否需要弹出欢迎语
    welcome: '',
    roles: [],
    roleGroups: [], // 角色组
    permissions: [],
    orgCode: '', //默认orgCode
    orgName: '', //默认orgName
    userCode: '', //默认userCode
    OrgCodeList: '', //人员厂区列表userCodeList
    subName: '测试sub', //默认subName
    UserInfo: {},
    //iqc
    // attrSamplesNum:'',//性能检测抽样数
    needChangePwd: false, // 需要强制修改密码
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name, welcome) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },

    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_ROLES_GROUPS: (state, roleGroups) => {
      state.roleGroups = roleGroups
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_ORGCODE: (state, orgCode) => {
      state.orgCode = orgCode
    },
    SET_ORGNAME: (state, orgName) => {
      state.orgName = orgName
    },
    SET_USERCODE: (state, userCode) => {
      state.userCode = userCode
    },
    SET_USERID: (state, userId) => {
      state.userId = userId
    },

    SET_SUBNAME: (state, subName) => {
      state.subName = subName
    },
    /* SET_SAMPLESNUM: (state, attrSamplesNum) => {
      state.attrSamplesNum = attrSamplesNum

    }, */

    SET_PWDSTATUS: (state, status) => {
      state.needChangePwd = status
    },
    SET_ORGCODELIST: (state, OrgCodeList) => {
      state.OrgCodeList = OrgCodeList
    },
    SET_USERINFO: (state, UserInfo) => {
      state.UserInfo = UserInfo
    },
    SET_ISHELLO: (state, status) => {
      state.isHello = status
    },
  },

  actions: {
    setToken({ commit }, token) {
      return new Promise((resolve, reject) => {
        if (token) {
          commit('SET_TOKEN', token)
          resolve()
        } else {
          reject()
        }
      })
    },
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      return new Promise((resolve, reject) => {
        login(username, password)
          .then(res => {
            if (res.Success) {
              setToken(res.Data.Token)
              commit('SET_TOKEN', res.Data.Token)
              commit('SET_ISHELLO', true)
            }
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo()
          .then(res => {
            if (res.Success) {
              const user = res.Data.UserInfo
              commit('SET_PERMISSIONS', res.Data.Permissions)
              commit('SET_ORGCODE', user.DefaultOrgCode)
              commit('SET_ORGNAME', user.DefaultOrgName)
              commit('SET_USERID', user.Id)
              commit('SET_USERCODE', user.UserCode)
              commit('SET_ORGCODELIST', res.Data.Organizations)
              commit('SET_USERINFO', user)
              commit('SET_ROLES_GROUPS', res.Data.RoleGroups)
              // const avatar = require("@/assets/images/profile.jpg") ;

              if (res.Data.Roles && res.Data.Roles.length > 0) {
                // 验证返回的roles是否是一个非空数组

                commit('SET_ROLES', res.Data.Roles)

                //  是否首次登陆，需要更改密码
                commit('SET_PWDSTATUS', res.Data.IsFirstLogin)
              } else {
                commit('SET_ROLES', ['ROLE_DEFAULT'])
              }
              commit('SET_NAME', user.RealName)
              // commit('SET_AVATAR', avatar)
              resolve(res)
            } else {
              commit('SET_ISHELLO', false)
              resolve(res)
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // GetInfo({ commit, state }) {
    //   return new Promise((resolve, reject) => {

    //     getInfo().then(res => {
    //       const user = res.Data.UserInfo
    //       const avatar = user.Data.ADUser == "" ? require("@/assets/images/profile.jpg") : process.env.VUE_APP_BASE_API + user.Data.ADUser;
    //       if (res.Data.Roles && res.Data.Roles.length > 0) { // 验证返回的roles是否是一个非空数组
    //         commit('SET_ROLES', res.roles)
    //         commit('SET_PERMISSIONS', res.permissions)
    //       } else {
    //         commit('SET_ROLES', ['ROLE_DEFAULT'])
    //       }
    //       commit('SET_NAME', user.RealName)
    //       commit('SET_AVATAR', avatar)
    //       resolve(res)
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        const list = {
          UserId: state.UserId,
        }
        logout(list)
          .then(() => {
            commit('SET_TOKEN', '')
            commit('SET_ROLES', [])
            commit('SET_PERMISSIONS', [])
            removeToken()
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        // 清除角色，权限，路由等信息，防止权限交叉
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        commit('SET_ROUTES', [])
        removeToken()
        resolve()
      })
    },
  },
}

export default user
