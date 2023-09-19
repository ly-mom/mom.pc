<template>
  <div class="app-container">
    <el-result title="" :subTitle="$tl('system_jumping', '跳转中。。。')"> </el-result>
  </div>
</template>

<script>
import { isMobile, getQueryValue, getQuery } from '@/utils/util'
import { setToken } from '@/utils/auth'
import _ from 'lodash'
import router from '@/router'
import { resetRouter } from '@/router'

export default {
  name: 'Transfer',
  data() {
    return {
      routerMap: {
        Matter: 'pages/qms/approve/approve',
        Warehouse: 'pages/wms/home/index',
      },
    }
  },
  mounted() {
    const url = _.cloneDeep(location.href)
    const Domain = url.substring(0, url.lastIndexOf(':'))
    const port = url.split(Domain + ':')[1].split('/')[0]
    const token = getQueryValue(url, 't')
    const routerName = getQueryValue(url, 'n')
    let params = {}
    try {
      params = getQuery(url)
      delete params.t
      delete params.n
    } catch (error) {
      console.log(error)
    }
    console.log(params, token)
    if (!token) {
      let str = ''
      for (const key in params) {
        str = `&${key}=${params[key]}`
      }
      this.$router.replace({ path: `/login?n=${routerName}${str}` })
      return
    }
    if (isMobile()) {
      location.href = (Domain.indexOf('24.63') > -1 ? 'https://mom.lingyiitech.com' : Domain) + ':8094?tk=' + token
    } else {
      setToken(token)
      this.$store.dispatch('setToken', token).then(() => {
        this.$store
          .dispatch('GetInfo')
          .then(() => {
            this.$store.dispatch('GenerateRoutes').then(accessRoutes => {
              resetRouter()
              // 根据roles权限生成可访问的路由表
              router.addRoutes(accessRoutes) // 动态添加可访问路由表

              setTimeout(() => {
                this.$router.replace({ name: routerName, params: params })
              }, 500)
            })
          })
          .catch(() => {
            this.$router.replace({ name: 'login' })
          })
      })
    }
  },
  methods: {},
}
</script>

<style lang="scss" scoped></style>
