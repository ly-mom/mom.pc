<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <!-- <div class="text-center">
              <userAvatar :user="user" />
            </div> -->
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />{{ this.$t('system_username') }}
                <!-- 用户名称 -->
                <div class="pull-right">{{ user.RealName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="wechat" />{{ this.$t('base_UserCode') }}
                <div class="pull-right">{{ user.UserCode }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ user.Mobile }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">{{ user.Email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属部门
                <div class="pull-right" v-if="user.DepartName">{{ user.DepartName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="logininfor" />AD账号
                <div class="pull-right" v-if="user.ADUser">{{ user.ADUser }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="testUnit" />检测单位
                <div class="pull-right" v-if="user.TestUnitName">{{ user.TestUnitName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />性别
                <dict-tag class="pull-right" style="display: inline-block" v-model="user.Sex" dict-key="sys_user_sex" istag="no"></dict-tag>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="star" />生日
                <div class="pull-right" v-if="user.Birthday">{{ user.Birthday | formatDate }}</div>
              </li>
              <!-- <li class="list-group-item">
                <svg-icon icon-class="peoples" />所属角色
                <div class="pull-right">{{ roleGroup }}</div>
              </li> -->
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">{{ user.CreateTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" :TestUnitName="user.TestUnitName" @updateInfo="getUserInfo" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import { getUser } from '@/api/system/user'
import { getTestUnitDataList } from '@/api/base.js'
import _ from 'lodash'

export default {
  name: 'Profile',
  components: { userInfo, resetPwd },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTab: 'userinfo',
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    async getUserInfo() {
      const res = await getUser(this.userId)
      this.user = res.Data.UserInfo || {}
      if (!this.isEmptyValue(this.user.TestUnitId)) {
        this.getTestUnit(this.user.TestUnitId)
      }
    },
    // 检测单位选项请求
    async getTestUnit(Id) {
      const ParmeterData = {
        PageIndex: 0,
        PageRows: 10,
        Search: { Id },
      }
      const res = await getTestUnitDataList(ParmeterData)
      if (res.Success) {
        this.user['TestUnitName'] = _.get(res, 'Data.PageList[0].QCDeptName', '')
      }
    },
  },
  computed: {
    userId() {
      return this.$store.state.user.userId
    },
  },
}
</script>
