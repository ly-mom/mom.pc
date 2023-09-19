<template>
  <div class="app-container authRoleMain">
    <div class="headerInfo">
      <div class="titleBox">
        <div class="el-descriptions__title">
          {{ $t('usual_basic_info') }}
        </div>
        <div>
          <el-button size="mini" class="headerButton" plain icon="el-icon-refresh" @click="globalRefresh">{{ $tl('usual_refresh') }}</el-button>
          <!-- <el-button
            v-hasPermi="['system:user:newallocation']"
            size="mini"
            class="headerButton"
            :disabled="isEmptyValue(roleTree)"
            :loading="loading.saveRole"
            icon="el-icon-s-claim"
            @click="submitForm()"
          >{{$tl('usual_save')}}</el-button> -->
        </div>
      </div>
      <el-row>
        <el-col :md="8" :sm="24">
          <div class="el-descriptions-item__container">
            <span class="el-descriptions-item__label has-colon">{{ $t('system_user_id') }}</span
            ><span class="el-descriptions-item__content">{{ userInfo.UserCode }}</span>
          </div>
        </el-col>
        <el-col :md="8" :sm="24">
          <div class="el-descriptions-item__container">
            <span class="el-descriptions-item__label has-colon">{{ $t('system_username') }}</span
            ><span class="el-descriptions-item__content">{{ userInfo.RealName }}</span>
          </div>
        </el-col>
        <el-col :md="8" :sm="24">
          <div class="el-descriptions-item__container">
            <span class="el-descriptions-item__label has-colon">{{ $tl('base_user_DepartName', '部门') }}</span
            ><span class="el-descriptions-item__content">
              {{ userInfo.DepartmentName }}
            </span>
          </div>
        </el-col>
      </el-row>
      <!-- <el-descriptions :title="$t('usual_basic_info')">
        <el-descriptions-item :label="$t('system_user_id')">{{
          userInfo.RealName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system_username')">{{
          userInfo.UserCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$tl('system_user_gender')">
          <dict-tag
            v-model="userInfo.Sex"
            dict-key="sys_user_sex"
            istag="no"
          ></dict-tag>
        </el-descriptions-item>
      </el-descriptions> -->
    </div>
    <el-row :gutter="10">
      <el-col :md="8" :sm="24">
        <div class="roleBox">
          <div class="boxTitle role">
            <div class="boxTitleLeft">
              <el-popover placement="right" width="380" trigger="hover">
                <span slot="reference" @click="$refs.checkedRoleTree.filter()">
                  {{ $tl('system_role', '角色') }}
                  {{ `(${$tl('system_userRole_checkedNum', '已勾选')}${checkedNodes.length}个)` }}
                </span>
                <div style="max-height: 300px; overflow: auto">
                  <div v-for="(item, index) in checkedNodes" :key="item.Code + index" class="checkedRoleItem">
                    <svg-icon
                      v-if="item.IsGroup"
                      icon-class="roleGroup"
                      :style="{
                        width: '16px',
                        height: '16px',
                        color: '#5D7092',
                      }"
                    />
                    <svg-icon
                      v-if="!item.IsGroup"
                      icon-class="role"
                      :style="{
                        width: '16px',
                        height: '16px',
                        color: '#319CFF',
                      }"
                    />
                    <span>{{ item.Name }}</span>
                    <span v-hasRole="topRole">({{ item.Code }})</span>
                  </div>
                </div>
              </el-popover>
            </div>
            <div class="boxTitleAciton">
              <el-tooltip v-hasPermi="['system:user:newallocation']" class="item" effect="dark" :content="$t('usual_save')" placement="top">
                <el-button size="mini" circle :disabled="isEmptyValue(roleTree)" :loading="loading.saveRole" icon="el-icon-s-claim" @click="submitForm()" />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                :content="!roleFilterChecked ? $tl('system_user_changeRoleTree1', '仅显示已勾选的') : $tl('system_user_changeRoleTree2', '显示全部')"
                placement="top"
              >
                <el-button size="mini" circle :disabled="isEmptyValue(roleTree)" :icon="roleFilterChecked ? 'el-icon-folder' : 'el-icon-folder-checked'" @click="changeRoleFilterChecked" />
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('usual_refresh')" placement="top">
                <el-button size="mini" circle icon="el-icon-refresh" @click="getRoleList()" />
              </el-tooltip>
            </div>
          </div>
          <div class="boxContent">
            <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" v-model="roleFilterText" clearable> </el-input>
            <el-tree
              class="treeBox"
              v-loading="loading.role"
              node-key="Code"
              ref="roleTree"
              :data="roleTree"
              :props="groupTreeProps"
              :check-strictly="true"
              show-checkbox
              @check="getMenuByRoles"
              default-expand-all
              :filter-node-method="roleFilterNode"
            >
              <div slot-scope="{ data }" class="treeItem">
                <div style="display: flex; justify-content: flex-start" :class="[data.Status == 1 ? 'text-reds' : '']">
                  <svg-icon v-if="data.IsGroup" icon-class="roleGroup" :style="{ width: '16px', height: '16px', color: '#5D7092' }" />
                  <svg-icon v-if="!data.IsGroup" icon-class="role" :style="{ width: '16px', height: '16px', color: '#319CFF' }" />
                  <span>{{ data.Name }}</span>
                  <span v-hasRole="topRole">({{ data.Code }})</span>
                </div>
              </div>
            </el-tree>
          </div>
        </div>
      </el-col>
      <el-col :md="8" :sm="24">
        <div class="roleBox" :key="showMenuPlatformIndex">
          <div class="boxTitle pcMenu">
            <div class="boxTitleLeft mr10">
              {{ $tl('system_pcMenu', `${platformList[showMenuPlatformIndex].DataText}菜单`, { name: platformList[showMenuPlatformIndex].DataText }) }}
            </div>
            <div class="boxTitleAciton">
              <el-tooltip class="item" effect="dark" :content="$tl('system_changeMenus', '切换菜单')" placement="top">
                <el-button size="mini" circle :disabled="isEmptyValue(roleTree)" icon="el-icon-guide" @click="changeMenuPlatform" />
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('usual_refresh')" placement="top">
                <el-button size="mini" circle icon="el-icon-refresh" @click="getMenuByRoles()" />
              </el-tooltip>
            </div>
          </div>

          <div class="boxContent">
            <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" v-model="pcMenuFilterText" clearable> </el-input>
            <el-tree
              class="treeBox"
              v-loading="loading.menu"
              node-key="Id"
              ref="pcMenuTree"
              :data="menuTreeData[platformList[showMenuPlatformIndex].DataValue] || []"
              :props="menuTreeProps"
              :filter-node-method="pcMenuFilterNode"
            >
              <div slot-scope="{ data }" class="treeItem">
                <div>
                  <span>
                    <template v-if="data.platform == 'PC'">
                      <svg-icon :style="data.menuType == 'F' ? { fontSize: '20px' } : ''" :icon-class="data.menuType == 'F' ? 'plainButton' : data.icon" />
                    </template>
                    <template v-else>
                      <!--移动端选的图标-->
                      <i :class="['albb_icon', 'iconfont', data.icon]"></i>
                    </template>
                  </span>
                  <el-tooltip :disabled="!checkRole(topRole)" placement="top" :open-delay="500">
                    <div slot="content">
                      <div>{{ 'id：' + data.id }}</div>
                      <div v-if="data.menuType == 'C'">{{ 'componentPath：' + data.componentPath }}</div>
                    </div>
                    <span>{{ data.menuName }}{{ data.menuType == 'F' && checkRole(topRole) ? `(${data.permissions})` : '' }}</span>
                  </el-tooltip>
                </div>
              </div>
            </el-tree>
          </div>
        </div>
      </el-col>
      <el-col :md="8" :sm="24">
        <div class="roleBox">
          <div class="boxTitle orgMenu">
            <div class="boxTitleLeft">
              {{ $tl('system_orgTree', '厂区') }}
            </div>
            <div class="boxTitleAciton">
              <el-tooltip v-hasPermi="['system:user:orgcode']" class="item" effect="dark" :content="$t('usual_save')" placement="top">
                <el-button size="mini" circle :disabled="isEmptyValue(orgTree)" :loading="loading.saveOrg" icon="el-icon-s-claim" @click="submitOrgForm()" />
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('usual_refresh')" placement="top">
                <el-button size="mini" circle icon="el-icon-refresh" @click="getOrgTree()" />
              </el-tooltip>
            </div>
          </div>
          <div class="boxContent">
            <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" v-model="orgFilterText" clearable> </el-input>
            <el-tree class="treeBox" v-loading="loading.org" ref="orgTree" show-checkbox :data="orgTree" node-key="Code" :props="orgTreeProps" :filter-node-method="orgFilterNode">
              <div slot-scope="{ data }" class="treeItem">
                <div>
                  <span>{{ data.Code }}</span>
                  <el-divider direction="vertical"></el-divider>
                  <span>{{ data.Name }}</span>
                </div>
              </div>
            </el-tree>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getAuthRole, updateAuthRole } from '@/api/system/user'
import { baseSbuInfo, getOrgList, AuthOrgs } from '@/api/base.js'
import { getUserRoleAndGroup, setUserRoleAndGroup } from '@/api/system/role'
import { checkRole, checkPermi } from '@/utils/permission'
import { getMenuTreeByRoles, getMenuByRoleAndGroup } from '@/api/system/menu'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'UserRole',
  data() {
    return {
      roleTree: [],
      // 用户信息
      userId: '',
      UserCode: '',
      userInfo: {},
      // 最高权限的角色
      topRole: ['Development', 'admin'],
      groupTreeProps: { children: 'Children', label: 'Name' },
      menuTreeProps: { children: 'children', label: 'menuName' },
      orgTreeProps: { children: 'Children', label: 'Name' },
      roleFilterText: '',
      pcMenuFilterText: '',
      orgFilterText: '',
      orgTree: [], // 组织架构
      loading: {
        saveRole: false,
        menu: false,
        role: false,
        org: false,
        saveOrg: false,
      },
      originChecked: [], // 原始已选择的角色/角色组
      checkedNodes: [], // 已选角色/角色组
      showMenuPlatformIndex: 0, // 当前显示菜单平台的索引
      menuTreeData: {}, // 各平台菜单树形数据
      roleFilterChecked: false, // 角色树形组件，是否只显示已选项
    }
  },

  watch: {
    roleFilterText(val) {
      this.$refs.roleTree.filter(val)
      // 如果当前是仅显示已勾选数据的状态，筛选已勾选的数据
      if (this.isEmptyValue(val) && this.roleFilterChecked) {
        this.$refs.roleTree.filter('showChecked')
      }
    },
    pcMenuFilterText(val) {
      this.$refs.pcMenuTree.filter(val)
    },
    orgFilterText(val) {
      this.$refs.orgTree.filter(val)
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
    platformList() {
      return this.dictMap['system_platform'] && this.dictMap['system_platform'].items
    },
  },
  created() {
    this.UserCode = this.$route.params.UserCode
    this.$store.dispatch('dict/getByDictKeys', ['system_platform'])
    this.getRoleList()
    this.getOrgTree()
  },
  methods: {
    checkRole,
    /** 提交按钮 */
    async submitForm() {
      const checkedKeys = this.$refs.roleTree.getCheckedKeys()
      if (_.isEqual(this.originChecked.sort(), checkedKeys.sort())) {
        return this.msgInfo(this.$tl('system_role_noChange', '角色配置没变化，无需保存！'))
      }
      const Groups = this.getCheckedRoleAndGroup()
      if (this.isEmptyValue(Groups)) {
        this.$confirm(this.$tl('system_clear_role', '确认清除该用户的所有角色？'), this.$t('usual_warning'), {
          confirmButtonText: this.$t('usual_confirm'),
          cancelButtonText: this.$t('usual_cancel'),
          type: 'warning',
        }).then(() => {
          this.setRoleGroupData(Groups)
        })
      } else {
        this.setRoleGroupData(Groups)
      }
    },
    async setRoleGroupData(Groups) {
      const data = { UserCode: this.UserCode, Groups: Groups }
      this.loading.saveRole = true
      const res = await setUserRoleAndGroup(data)
      this.loading.saveRole = false
      if (res.Success) {
        this.getRoleList()
        this.msgSuccess(this.$t('system_authorization_succeeded'))
        // this.close();
      } else {
        this.msgError(res.Msg)
      }
    },
    /** 关闭按钮 */
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/system/user' })
    },
    // 获取角色列表
    async getRoleList() {
      // if (checkRole(this.topRole)) {
      this.loading.role = true
      const res = await getUserRoleAndGroup(this.UserCode)
      this.loading.role = false
      if (res.Success) {
        this.roleTree = _.get(res, 'Data.Tree', [])
        this.userInfo = _.get(res, 'Data.UserInfo', {})
        let checkedKeys = _.get(res, 'Data.SelectGroups', []).concat(_.get(res, 'Data.SelectRoles', []))
        checkedKeys = Array.from(new Set(checkedKeys))
        this.originChecked = checkedKeys
        this.$nextTick(() => {
          checkedKeys.forEach(item => {
            this.$refs.roleTree.setChecked(item, true)
          })
          // 如果操作用户切换了只显示已勾选时，刷新完要同步筛选已勾选的数据
          if (this.roleFilterChecked) {
            this.$refs.roleTree.filter('showChecked')
          }
          // 下方一起设置已选节点的方法有问题，选中不对应的选项，改用上方循环的方法设置选中值
          // this.$refs.roleTree.setCheckedKeys(checkedKeys);
          this.getMenuByRoles()
        })
      } else {
        this.msgError(res.Msg)
      }
      // } else {
      //   this.$confirm(
      //     this.$tl("system_noPerimission", "Sorry, 您暂无权限操作"),
      //     this.$t("usual_notice"),
      //     {
      //       cancelButtonText: this.$t("usual_close"),
      //       showConfirmButton: false,
      //       type: "warning",
      //     }
      //   );
      // }
    },
    roleFilterNode(value, data) {
      if (!value) return true
      if (value === 'showChecked') {
        const checkedNodeKeys = this.$refs.roleTree.getCheckedKeys()
        return this.roleFilterChecked ? checkedNodeKeys.includes(data['Code']) : !this.roleFilterChecked
      } else {
        return data[this.groupTreeProps.label] && data[this.groupTreeProps.label].toUpperCase().includes(value.toUpperCase())
      }
    },
    pcMenuFilterNode(value, data) {
      if (!value) return true
      return data[this.menuTreeProps.label] && data[this.menuTreeProps.label].toUpperCase().includes(value.toUpperCase())
    },
    moblieMenuFilterNode(value, data) {
      if (!value) return true
      return data[this.menuTreeProps.label] && data[this.menuTreeProps.label].toUpperCase().includes(value.toUpperCase())
    },
    orgFilterNode(value, data) {
      if (!value) return true
      return data[this.orgTreeProps.label] && data[this.orgTreeProps.label].toUpperCase().includes(value.toUpperCase())
    },
    // 根据角色获取菜单
    async getMenuByRoles() {
      const roleKeys = this.getCheckedRoleAndGroup()
      this.checkedNodes = this.$refs.roleTree.getCheckedNodes()
      if (this.isEmptyValue(roleKeys)) {
        this.menuTreeData = {}
        this.platformList.forEach(e => {
          _.set(this.menuTreeData, e.DataValue, [])
        })
      } else {
        const data = {
          Groups: roleKeys,
        }
        this.loading.menu = true
        const res = await getMenuByRoleAndGroup(data)
        this.loading.menu = false
        if (res.Success) {
          this.menuTreeData = _.get(res, 'Data.Menus', {})
        } else {
          this.msgError(res.Msg)
        }
      }
    },
    // 获取勾选的节点，一个角色或一个角色组为一个对象的形式
    getCheckedRoleAndGroup() {
      const checkedNodes = this.$refs.roleTree.getCheckedNodes()
      const result = checkedNodes.map(item => {
        if (item.IsGroup) {
          return { GroupCode: item.Code, RoleKey: '' }
        } else {
          const node = this.$refs.roleTree.getNode(item.Code)
          return {
            GroupCode: _.get(node, 'parent.data.Code', ''),
            RoleKey: item.Code,
          }
        }
      })
      return result || []
    },
    // 获取组织架构树形数据
    async getOrgTree() {
      const permissions = this.$store.state.user.permissions || []
      const roleGroups = this.$store.state.user.roleGroups || []
      // 权限校验，只有角色组管理员级别以上的才能分配厂区
      if (!permissions.includes('*:*:*') && this.isEmptyValue(roleGroups)) {
        return
      }
      // 获取组织树形数据
      const data = {}
      this.loading.org = true
      const res = await getOrgList(data)
      this.loading.org = false
      if (res.Success) {
        this.orgTree = res.Data || []
        this.getMemberOrg([this.UserCode])
      }
    },
    // 切换菜单平台
    changeMenuPlatform() {
      if (this.showMenuPlatformIndex + 1 < this.platformList.length) {
        this.showMenuPlatformIndex += 1
      } else {
        this.showMenuPlatformIndex = 0
      }
      this.pcMenuFilterText = ''
    },
    // 获取用户已分配厂区
    async getMemberOrg(UserCodeList) {
      if (!UserCodeList || UserCodeList.length == 0) return
      const data = {
        Search: {
          UserCodes: UserCodeList,
        },
      }
      const res = await baseSbuInfo(data)
      if (res.Success) {
        if (_.get(res, 'Data.PageList[0].UserOrgs')) {
          const arr = _.cloneDeep(res.Data.PageList[0].UserOrgs) || []
          if (arr.length) {
            arr.forEach(element => {
              if (element.SbuCode) {
                this.$refs.orgTree.setChecked(element.SbuCode, true)
              }
            })
          } else {
            this.$refs.orgTree.setCheckedKeys([])
          }
        }
      }
    },
    submitOrgForm() {
      const checkedNodes = this.$refs.orgTree.getCheckedNodes()
      const orgCodeList = checkedNodes.map(e => e.OrgCode).filter(e => !this.isEmptyValue(e)) || []
      const data = {
        UserIds: [this.userInfo.Id],
        OrgCodes: orgCodeList,
      }
      if (orgCodeList.length == 0) {
        this.$confirm(`${this.$tl('base_sure_selete_org', '确定清空人员已分配厂区？')}`, this.$t('usual_notice'), {
          confirmButtonText: this.$t('usual_confirm'),
          cancelButtonText: this.$t('usual_cancel'),
          type: 'warning',
        }).then(() => {
          this.saveOrgData(data)
        })
      } else {
        this.saveOrgData(data)
      }
    },
    // 保存厂区设置
    async saveOrgData(data) {
      this.loading.saveOrg = true
      const res = await AuthOrgs(data)
      this.loading.saveOrg = false
      if (res.Success) {
        this.msgSuccess(this.$t('MOM_SaveSuccess'))
        // 如果设置当前登录账户，更新用户信息
        if (this.userInfo.UserCode == this.$store.state.user.userCode) {
          this.$store.dispatch('GetInfo')
        }
      } else {
        this.msgError(res.Msg)
      }
    },
    // 全局刷新
    globalRefresh() {
      this.getRoleList()
      this.getOrgTree()
    },
    // 切换显示全部或已勾选的角色
    changeRoleFilterChecked() {
      this.roleFilterChecked = !this.roleFilterChecked
      this.$refs.roleTree.filter('showChecked')
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/styles/variables';
.authRoleMain {
  background-color: #f4f7fb;
  padding-top: 14px;
  ::v-deep .el-descriptions__header {
    padding: 10px 8px;
    margin: 0;
  }
  .titleBox {
    @include flex-justify(space-between);
  }
  .el-descriptions__title {
    margin-bottom: 8px;
    transition: text-shadow 0.2s ease-out;
  }
  .el-descriptions-item__label {
    color: #444;
    transition: text-shadow 0.2s ease-out;
  }
  ::v-deep .el-descriptions-item__content {
    font-weight: bold;
    color: $lightBlue;
  }
  .base_title {
    font-weight: 700;
    font-size: 24px;
    line-height: 30px;
    color: #313b46;
    margin-bottom: 5px;
  }
  .headerInfo {
    padding: 15px 10px;
    border-radius: 10px;
    margin-bottom: 9px;
    // background: #f4f7fb;
    // 凹陷
    box-shadow: 4px 4px 4px 0px #d1d9e6 inset, -4px -4px 4px 0px #ffffff inset;
    // 凸起
    // box-shadow: 18px 18px 30px rgba(0,0,0,0.1), -18px -18px 30px rgba(255,255,255,1);
    // transition: box-shadow .2s ease-out;
    /* &:hover {
      box-shadow: 0 0 0 rgba(0,0,0,0.1), 0 0 0 rgba(255,255,255,1), inset 18px 18px 30px rgba(0,0,0,0.1), inset -18px -18px 30px rgba(255,255,255,1);
      transition: box-shadow .2s ease-out;
    } */
  }
  .headerButton {
    background: #f4f7fb;
    border: none;
    box-shadow: 9px 9px 15px rgba(0, 0, 0, 0.1), -9px -9px 15px rgba(255, 255, 255, 1);
    transition: box-shadow 0.2s ease-out;
    &:hover {
      box-shadow: 0 0 0 rgba(0, 0, 0, 0.1), 0 0 0 rgba(255, 255, 255, 1), inset 9px 9px 15px rgba(0, 0, 0, 0.1), inset -9px -9px 15px rgba(255, 255, 255, 1);
      transition: box-shadow 0.2s ease-out;
    }
  }

  .roleBox {
    height: calc(100vh - 195px);
    background: #fff;
    box-shadow: 2px 2px 40px #e1e5ea4d;
    border-radius: 10px;
    overflow: hidden;
    .boxTitle {
      //   position: fixed;
      line-height: 20px;
      margin-bottom: 10px;
      padding: 0 10px;
      width: 100%;
      @include flex-justify(space-between);
      .boxTitleLeft {
        @include flex-justify(flex-start);
        @include ellipsis(1);
        max-width: 100%;
        font-style: normal;
        font-size: 16px;
        color: #fff;
      }
      .boxTitleAciton {
        @include flex-justify(flex-start);
      }
      .checkedRoleItem {
        @include flex-justify(center);
      }
      line-height: 34px;
      text-align: center;
      border-radius: 10px 10px 0px 10px;
      &.role {
        background: $lightBlue;
      }
      &.pcMenu {
        background: $pink;
      }
      &.moblieMenu {
        background: $grassGreen;
      }
      &.orgMenu {
        background: $voliet;
      }
    }

    .boxContent {
      // margin-top: 46px;
      overflow: auto;
      border-bottom: 10px solid #fff;
      margin: 0 10px;
      height: calc(100% - 46px); /* 46px == boxTitle.height */
    }
    .actionHeader {
      display: none;
    }
    .treeItem {
      width: 100%;
      @include flex-justify(space-between);
    }
    .treeBox {
      overflow: auto;
      height: calc(100% - 30px);
    }
  }
}
</style>
