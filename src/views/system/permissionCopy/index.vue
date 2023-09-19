<template>
  <div class="app-container permissionCopyMain">
    <div class="headerBox">
      <el-timeline>
        <el-timeline-item size="large" color="#319CFF" :timestamp="$tl('system_perission_stepTitle1', '选择拷贝源')" placement="top">
          <div class="stepBox">
            <el-form :model="copyForm" ref="queryForm" :rules="rules" inline>
              <el-form-item :label="$tl('system_permissionCopy_select', '作为拷贝源的人员')" prop="member">
                <el-select
                  size="small"
                  filterable
                  remote
                  collapse-tags
                  v-model="copyForm.member"
                  clearable
                  @focus="searchTimes = 0"
                  @change="selectMemberChange"
                  :placeholder="$t('base_keyword_search')"
                  :remote-method="memberSearch"
                >
                  <el-option v-for="d in memberList" :key="d.UserCode" :value="d.UserCode" :label="d.RealName" :disabled="$store.state.user.userCode == d.UserCode">
                    {{ $tl('usual_user_option', `${d.RealName}(${d.UserCode})`, d) }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </el-timeline-item>
        <el-timeline-item size="large" color="#319CFF" :timestamp="$tl('system_perission_stepTitle2', '确认拷贝的权限')" placement="top">
          <div class="stepBox">
            <el-row>
              <el-col :md="12" :sm="24">
                <div class="perimissionContent">
                  <el-row>
                    <el-col :md="12" :sm="24" class="pd16">
                      <div class="titleContent">
                        <div>
                          <span class="bottom">{{ $tl('system_role', '角色') }}</span>
                          <el-tooltip placement="top">
                            <div slot="content">
                              <div>
                                {{ $tl('system_perimission_help1', '展示的角色是属于当前登录用户和拷贝源用户，两者之间共同拥有的角色') }}<br />
                                {{ $tl('system_perimission_help2', '只有当前登录用户和拷贝源用户共同拥有的角色才能拷贝') }}<br />
                                <span v-hasRole="['Development', 'admin']">{{
                                  $tl('system_perimission_help3', '管理员和开发用户除外，管理员和开发用户展示的是拷贝源用户的所有角色，而非两者角色的交集')
                                }}</span>
                              </div>
                            </div>
                            <i class="el-icon-question" color="#a8b6bb"></i>
                          </el-tooltip>
                        </div>
                      </div>
                      <div>
                        <el-button size="mini" type="text" :disabled="isEmptyValue(roleData)" @click="handleCheckedTreeNodeAll('role')">
                          {{ $tl('system_perimission_checkedAll', '全选/全不选') }}
                        </el-button>
                        <el-tree class="treeBox" node-key="RoleKey" ref="roleTree" :data="roleData" :props="roleTreeProps" @check-change="getMenuByRoles" show-checkbox> </el-tree>
                      </div>
                    </el-col>
                    <el-col :md="12" :sm="24">
                      <div class="menuBox">
                        <div class="menuTitle">
                          <span class="verticalLineTitle"
                            >{{ $tl('system_perimission_MenuByRole', '菜单预览') }}
                            <el-tooltip placement="top">
                              <div slot="content">
                                <div>{{ $tl('system_perimission_help4', '菜单预览展示的是已勾选角色所拥有的菜单权限') }}<br /></div>
                              </div>
                              <i class="el-icon-question" color="#a8b6bb"></i>
                            </el-tooltip>
                          </span>
                          <el-radio-group v-model="menuPlatForm" size="mini" :disabled="isEmptyValue(roleData)" @change="getMenuByRoles">
                            <el-radio-button v-for="dict in platformList" :label="dict.DataValue" :key="dict.DataValue">{{ dict.DataText }}</el-radio-button>
                          </el-radio-group>
                        </div>
                        <div>
                          <el-tree
                            class="treeBox"
                            node-key="Id"
                            ref="menuTree"
                            :data="menuData"
                            :default-expand-all="false"
                            :props="{ children: 'children', label: 'menuName' }"
                            v-loading="loading.menu"
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
                                <span>{{ data.menuName }}</span>
                              </div>
                            </div>
                          </el-tree>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-col>
              <el-col :md="6" :sm="24">
                <div class="perimissionContent pd16">
                  <div class="titleContent">
                    <div>
                      <span class="bottom">{{ $tl('system_factory', '厂区') }}</span>

                      <el-tooltip placement="top">
                        <div slot="content">
                          <div>
                            {{ $tl('system_perimission_help5', '展示的厂区是属于当前登录用户和拷贝源用户，两者之间共同拥有的厂区') }}<br />
                            {{ $tl('system_perimission_help6', '只有当前登录用户和拷贝源用户共同拥有的厂区才能拷贝') }}<br />
                            {{ $tl('system_perimission_help7', '拷贝厂区的同时可拷贝默认工厂，如果分配的人员已有默认工厂则不拷贝，如无则拷贝') }}<br />
                            {{ $tl('system_perimission_help8', '默认工厂在右侧选择(可空)，只能选择下方已勾选厂区的其一作为默认工厂') }}<br />
                            <span v-hasRole="['Development', 'admin']">{{
                              $tl('system_perimission_help9', '管理员和开发用户除外，管理员和开发用户展示的是拷贝源用户的所有厂区，而非两者厂区的交集')
                            }}</span>
                          </div>
                        </div>
                        <i class="el-icon-question" color="#a8b6bb"></i>
                      </el-tooltip>
                    </div>
                    <el-select
                      size="mini"
                      filterable
                      v-model="copyForm.defaultOrgCode"
                      style="width: 120px"
                      @focus="defaultOrgList = $refs.orgcodeTree.getCheckedNodes()"
                      clearable
                      :placeholder="$t('system_default_department')"
                    >
                      <el-option v-for="d in defaultOrgList" :key="d.OrgCode" :value="d.OrgCode" :label="d.OrgName"></el-option>
                    </el-select>
                  </div>
                  <div>
                    <el-button size="mini" type="text" :disabled="isEmptyValue(orgData)" @click="handleCheckedTreeNodeAll('orgcode')">
                      {{ $tl('system_perimission_checkedAll', '全选/全不选') }}
                    </el-button>
                    <el-tree class="treeBox" node-key="OrgCode" ref="orgcodeTree" :data="orgData" show-checkbox @check-change="orgcodeCheckChange" :props="{ children: 'Children', label: 'OrgName' }">
                    </el-tree>
                  </div>
                </div>
              </el-col>
              <el-col :md="6" :sm="24">
                <div class="perimissionContent pd16">
                  <div class="titleContent">
                    <div>
                      <span class="bottom">{{ $tl('system_perimissionCopr_testUnit', '检测单位') }}</span>

                      <el-tooltip placement="top">
                        <div slot="content">
                          <div>
                            {{ $tl('system_perimission_help10', '展示的检测单位是属于拷贝源用户的MMS测量室') }}<br />
                            <!-- {{$tl('system_perimission_help11','只有分配了权限的人员才能进行检测单位的拷贝')}}<br> -->
                            {{ $tl('system_perimission_help12', '下方选中检测单位则拷贝，不选中则不拷贝') }}<br />
                            {{ $tl('system_perimission_help13', '如果选择了检测单位进行拷贝，分配的人员中已有检测单位则不拷贝，如无则拷贝') }}
                          </div>
                        </div>
                        <i class="el-icon-question" color="#a8b6bb"></i>
                      </el-tooltip>
                    </div>
                  </div>
                  <div>
                    <!-- <el-select
                      size="mini"
                      filterable
                      v-model="copyForm.testUnit"
                      style="width: 100%"
                      clearable
                      value-key="Id"
                      :placeholder="$t('system_default_department')"
                    >
                      <el-option
                        v-for="d in testUnitData"
                        :key="d.Id"
                        :value="d"
                        :label="d.TestUnitName"
                      ></el-option>
                    </el-select> -->
                    <template v-if="!isEmptyValue(testUnitData)">
                      <div class="testUnitCheckbox pointer" :class="[!!copyForm.testUnit ? 'checked' : '']" @click="testUnitChange">
                        <svg-icon icon-class="testUnit" />
                        <div>
                          {{ testUnitData.QCDeptName }}
                        </div>
                      </div>
                    </template>
                    <el-empty v-else :description="$tl('system_perimission_noTestUnit', '无检测单位')" :image-size="30"></el-empty>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-timeline-item>
        <el-timeline-item size="large" color="#319CFF" :timestamp="$tl('system_perission_stepTitle3', '选择分配的人员')" placement="top">
          <el-row :gutter="10">
            <el-col :md="12" :sm="24">
              <el-form :model="queryParams.Search" ref="UserForm" inline>
                <el-form-item :label="$t('system_user_id')" prop="UserCodes">
                  <el-input v-model="queryParams.Search.UserCodes" :placeholder="$t('system_input_user_id')" clearable size="mini" style="width: 200px" @keyup.enter.native="handleQuery">
                    <template slot="append"> <BatchInput :value="queryParams.Search.UserCodes"></BatchInput> </template
                  ></el-input>
                </el-form-item>
                <el-form-item :label="$t('system_username')" prop="RealNames">
                  <el-input v-model="queryParams.Search.RealNames" :placeholder="$t('system_input_username')" clearable size="mini" style="width: 200px" @keyup.enter.native="handleQuery"
                    ><template slot="append">
                      <BatchInput :value="queryParams.Search.RealNames"></BatchInput>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
                  <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
                </el-form-item>
              </el-form>
              <base-table ref="memberTable" :columns="columns" :list="dataList" :options="options" @handleSelectionChange="handleSelectionChange"> </base-table>
              <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" layout="total, sizes, prev, pager, next" />
              <div class="dialog-footer"></div>
            </el-col>
            <el-col :md="12" :sm="24">
              <div>
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="isEmptyValue(allocateUserList)" @click="removeAllUserFn">{{
                  $tl('system_permissionCopy_removeMember', '清空用户')
                }}</el-button>

                <span class="el-pagination__total ml0">{{ $tl('system_perimission_UserTotal', `已选择${allocateUserList.length || 0}人`, allocateUserList.length) }}</span>
              </div>

              <div class="mt10 userBox linghtGreyBg el-card__body" v-show="!isEmptyValue(allocateUserList)">
                <el-tag closable v-for="item in allocateUserList" :key="item.UserCode" class="mr10 mb10" @close="removeUserFn(item)">
                  <el-tooltip class="item" effect="dark" :open-delay="500" :content="$tl('system_selectUser_tip', `${item.UserCode}`, item)" placement="top">
                    <span>
                      {{ $tl('system_selectUser', `${item.RealName}`, item) }}
                    </span>
                  </el-tooltip>
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </el-timeline-item>
      </el-timeline>
      <el-divider></el-divider>
      <el-button type="primary" icon="el-icon-save" size="mini" :loading="loading.normal" @click="handleSave">{{ $tl('system_permissionCopy_copy', '确认复制') }}</el-button>
    </div>
    <!-- <select-user
      ref="SelectUser"
      :parentObj="this"
      @confirm="handleAllocateUser"
    ></select-user> -->
  </div>
</template>

<script>
import { simplyUserList, canCopy, getAllPeriByUserCode, savePermissionCopy } from '@/api/system/user'
import { getMenuTreeByRoles } from '@/api/system/menu'
import { getTestUnitDataList } from '@/api/base.js'
import { mapGetters } from 'vuex'
import BatchInput from '@/components/BatchInput'
import _ from 'lodash'

export default {
  name: 'PermissionCopy',
  data() {
    return {
      copyForm: {
        member: '',
        testUnit: undefined,
        defaultOrgCode: undefined,
      },
      memberList: [],
      rules: {
        member: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
      },
      roleData: [],
      menuData: [],
      menuPlatForm: 'PC',
      orgData: [],
      testUnitData: {},
      roleTreeProps: { children: 'Children', label: 'RoleName' },
      defaultOrgList: [],
      allocateUserList: [],
      loading: {
        normal: false,
        menu: false,
      },
      total: 0,
      dataList: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          GroupCode: undefined,
          RoleKey: undefined,
          RealNames: undefined,
          UserCodes: undefined,
        },
      },
      columns: [
        {
          title: this.$tl('system_user_id'),
          dataIndex: 'UserCode',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('system_username'),
          dataIndex: 'RealName',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('base_Sex'),
          dataIndex: 'Sex',
          sortable: true,
          dictKey: 'sys_user_sex',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.Sex,
                'dict-key': 'sys_user_sex',
              },
            }),
        },
        {
          title: this.$tl('base_user_DepartName', '部门'),
          dataIndex: 'DepartName',
          width: '100px',
          sortable: true,
          ellipsis: true,
        },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
        keyField: 'Id',
        reserve: true,
        height: '300px',
      }, // table 的参数
    }
  },
  components: {
    BatchInput,
  },
  computed: {
    ...mapGetters(['dictMap']),
    platformList() {
      return this.dictMap['system_platform'] && this.dictMap['system_platform'].items
    },
  },
  mounted() {
    this.$store.dispatch('dict/getByDictKeys', ['system_platform'])
  },
  methods: {
    // 人员搜索
    async memberSearch(value, count) {
      const ParmeterData = {
        PageIndex: 0,
        PageRows: 20,
        SortField: 'id',
        SortType: 'asc',
        Search: {
          Keyword: value,
        },
      }
      const res = await simplyUserList(ParmeterData)
      if (res.Success) {
        const list = res.Data.PageList || []
        this.memberList = this.setRemoteOption(list, this.memberList, count)
      }
    },

    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(type) {
      if (type == 'role') {
        const value = this.$refs.roleTree.getCheckedNodes()
        this.$refs.roleTree.setCheckedNodes(value.length < this.roleData.length ? this.roleData : [])
        this.getMenuByRoles()
      } else if (type == 'orgcode') {
        const value = this.$refs.orgcodeTree.getCheckedNodes()
        this.$refs.orgcodeTree.setCheckedNodes(value.length < this.orgData.length ? this.orgData : [])
      }
    },
    async selectMemberChange(value) {
      if (this.isEmptyValue(value)) {
        // 清空权限列表数据
        this.clearPerimissionData()
      } else {
        const res = await this.checkCopySource(this.copyForm.member)
        if (res.IsAllowCopy) {
          this.getPermissionList()
        } else {
          this.msgError(res.Tips)
        }
      }
    },
    // 清空权限列表数据
    clearPerimissionData() {
      this.initRoleData()
      this.initOrgData()
      this.initTestUnit()
    },
    // 校验权限
    async checkCopySource(UserCode) {
      this.getMenuByRoles()
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        const res = await canCopy(UserCode)
        if (res.Success) {
          resolve(res.Data)
        } else {
          this.msgError(res.Msg)
          reject(res)
        }
      })
    },
    // 查询所选用户的所有权限
    async getPermissionList() {
      const res = await getAllPeriByUserCode(this.copyForm.member)
      if (res.Success) {
        this.initRoleData(_.get(res, 'Data.Roles', []))
        this.initOrgData(_.get(res, 'Data.Orgs', []))
        this.initTestUnit(_.get(res, 'Data.TestUnit', {}))
      } else {
        this.msgError(res.Msg)
      }
    },
    // 初始化检测单位
    initTestUnit(data) {
      if (this.isEmptyValue(data.Id)) {
        this.testUnitData = {}
        this.copyForm.testUnit = undefined
      } else {
        this.testUnitData = data
        this.copyForm.testUnit = data.Id
        this.getTestUnit(data.Id)
      }
    },
    // 初始化厂区数据
    initOrgData(data) {
      if (this.isEmptyValue(data)) {
        this.orgData = []
        this.copyForm.defaultOrgCode = undefined
      } else {
        this.orgData = data
        const DefaultOrg = this.orgData.find(e => !!e.IsDefaultOrg)
        this.copyForm.defaultOrgCode = DefaultOrg?.OrgCode
        setTimeout(() => {
          this.handleCheckedTreeNodeAll('orgcode')
          this.defaultOrgList = this.$refs.orgcodeTree.getCheckedNodes()
        }, 500)
      }
    },
    // 初始化角色数据
    initRoleData(data) {
      if (this.isEmptyValue(data)) {
        this.roleData = []
        this.menuData = []
      } else {
        this.roleData = data
        setTimeout(() => {
          this.handleCheckedTreeNodeAll('role')
        }, 500)
      }
    },
    // 根据角色获取菜单
    async getMenuByRoles() {
      const roleKeys = this.$refs.roleTree.getCheckedKeys()
      if (this.isEmptyValue(roleKeys)) {
        this.menuData = []
      } else {
        const data = {
          platForm: this.menuPlatForm,
          roleKeys: roleKeys,
        }
        this.loading.menu = true
        const res = await getMenuTreeByRoles(data)
        this.loading.menu = false
        if (res.Success) {
          this.menuData = res.Data
        } else {
          this.msgError(res.Msg)
        }
      }
    },
    // 检测单位的勾选
    testUnitChange() {
      this.$set(this.copyForm, 'testUnit', this.isEmptyValue(this.copyForm.testUnit) ? this.testUnitData.Id : undefined)
    },
    // 添加用户
    handleAddUser() {
      this.$refs.SelectUser.show(this.copyForm.member)
    },
    // 选择人员
    handleAllocateUser(list) {
      const completeList = _.cloneDeep(this.allocateUserList).concat(list)
      // 去重
      this.allocateUserList = _.uniqWith(completeList, _.isEqual)
      // this.$refs.SelectUser.cancel();
    },
    // 删除人员
    removeUserFn(item) {
      this.allocateUserList = _.without(this.allocateUserList, item)
      this.$refs.memberTable.setCheckboxRow([item], false)
    },
    // 清空已选人员
    removeAllUserFn() {
      this.$confirm(this.$tl('system_perimission_clearUser', '确定清空所有已选人员'), this.$t('usual_warning'), {
        type: 'warning',
      })
        .then(async () => {
          this.allocateUserList = []
          this.$refs.memberTable.setCheckboxRow([], false)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('usual_cancel_success'),
          })
        })
    },
    // 确定保存
    async handleSave() {
      const fromUserCode = this.copyForm.member
      const roleKeys = this.$refs.roleTree.getCheckedKeys()
      const orgCodes = this.$refs.orgcodeTree.getCheckedKeys()
      const userCodes = this.allocateUserList.map(e => e.UserCode)
      const testUnitId = this.copyForm.testUnit
      const defaultOrgCode = this.copyForm.defaultOrgCode
      if (this.isEmptyValue(fromUserCode)) {
        return this.msgError(this.$tl('system_perimission_saveTip1', '请选择拷贝来源'))
      } else if (this.isEmptyValue(roleKeys) && this.isEmptyValue(orgCodes) && this.isEmptyValue(testUnitId) && this.isEmptyValue(defaultOrgCode)) {
        return this.msgError(this.$tl('system_perimission_saveTip2', '请至少选择一项需要拷贝的权限'))
      } else if (this.isEmptyValue(this.allocateUserList)) {
        return this.msgError(this.$tl('system_perimission_saveTip3', '请至少选择一位需要分配的人员'))
      }
      let html = `<div>${this.$tl('system_perimission_saveConfirm1', `确定针对`)}`
      html += `<span class="text-blues">${this.$tl('system_perimission_saveConfirm2', `${userCodes.length}个`, { number: userCodes.length })}</span>`
      html += `${this.$tl('system_roleGroup_Title3', `人员`)}`
      if (!this.isEmptyValue(roleKeys)) {
        html += `，`
        html += `${this.$tl('system_perimission_saveConfirm4', `追加`)}`
        html += `<span class="text-blues">${this.$tl('system_perimission_saveConfirm2', `${roleKeys.length}个`, { number: roleKeys.length })}</span>`
        html += `${this.$tl('system_role', `角色`)}`
      }
      if (!this.isEmptyValue(orgCodes)) {
        html += `，`
        html += `${this.$tl('system_perimission_saveConfirm4', `追加`)}`
        html += `<span class="text-blues">${this.$tl('system_perimission_saveConfirm2', `${orgCodes.length}个`, { number: roleKeys.length })}</span>`
        html += `${this.$tl('system_factory', `厂区`)}`
      }
      if (!this.isEmptyValue(defaultOrgCode)) {
        html += `，`
        html += `${this.$tl('system_perimission_saveConfirm7', `设置默认厂区`)}`
      }
      if (!this.isEmptyValue(testUnitId)) {
        html += `，`
        html += `${this.$tl('system_perimission_saveConfirm8', `设置检测单位`)}</div>`
      }
      this.$confirm(html, this.$t('usual_notice'), {
        dangerouslyUseHTMLString: true,
        type: 'info',
      }).then(async () => {
        const data = {
          fromUserCode,
          roleKeys,
          orgCodes,
          userCodes,
          testUnitId,
          defaultOrgCode,
        }
        // console.log(data);
        this.loading.normal = true
        const res = await savePermissionCopy(data)
        this.loading.normal = false
        if (res.Success) {
          this.saveSuccess(res.Data)
        } else {
          this.msgError(res.Msg)
        }
      })
    },
    // 保存成功的提示
    saveSuccess(msg = null) {
      this.$confirm(msg + '<br><span style="color: #0067FF">' + this.$tl('system_perimission_saveSuccess', '是否重置页面数据？') + '</span>', this.$t('IQC_SubmitOK'), {
        confirmButtonText: this.$tl('usual_reset', '重置'),
        cancelButtonText: this.$t('usual_cancel'),
        dangerouslyUseHTMLString: true,
        type: 'success',
      }).then(async () => {
        this.allocateUserList = []
        this.selectMemberChange(null)
        this.resetForm()
        this.resetQuery()
        this.$refs.memberTable.setCheckboxRow([], false)
      })
    },
    // 厂区的勾选
    orgcodeCheckChange(data, state) {
      if (data.IsDefaultOrg) {
        // 如果取消选中了已选择的默认工厂，则清空已选的默认工厂
        this.copyForm.defaultOrgCode = state ? data.OrgCode : undefined
      }
    },
    // 重置表单
    resetForm() {
      this.copyForm.member = undefined
      this.copyForm.testUnit = undefined
      this.copyForm.defaultOrgCode = undefined
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
        this.testUnitData = _.get(res, 'Data.PageList[0]', {})
      }
    },
    // 多选框选中数据
    handleSelectionChange(records, row, { checkboxAll, checked }) {
      // console.log("records,checked}");
      // console.log(records, row, checkboxAll, checked);
      // if (checked) {
      this.allocateUserList = []
      this.handleAllocateUser(records)
      // } else {
      //   if (row) {
      //     this.removeUserFn(row)
      //   } else {
      //     this.dataList.forEach(ele => {
      //       this.removeUserFn(ele)
      //     })
      //   }
      // }
    },
    // 查询表数据
    async getList() {
      const data = _.cloneDeep(this.queryParams)
      _.set(data, 'Search.RealNames', data.Search.RealNames ? data.Search.RealNames.split(',') : undefined)
      _.set(data, 'Search.UserCodes', data.Search.UserCodes ? data.Search.UserCodes.split(',') : undefined)
      const res = await simplyUserList(data)
      if (res.Success) {
        this.dataList = res.Data.PageList
        this.total = res.Data.Total
      } else {
        this.msgError(res.Msg)
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.UserForm.resetFields()
      this.queryParams.PageIndex = 1
      this.dataList = []
      this.total = 0
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
.permissionCopyMain {
  background-color: #f4f7fb;
  .headerBox {
    // height: 120px;
    background: #fff;
    box-shadow: 2px 2px 40px #e1e5ea4d;
    border-radius: 14px;
    padding: 12px;
    // overflow: hidden;
    .stepBox {
      // box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    }
    @mixin contentShadow {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
      margin: 10px 5px;
    }
    .pd16 {
      padding: 16px;
    }
    .menuBox {
      @include contentShadow();
      margin: 10px;
      padding: 8px;
      .menuTitle {
        color: $lightBlueBlack;
        font-weight: bold;
        font-size: 14px;
        @include flex-justify(space-between, row, wrap);
        .verticalLineTitle {
          margin: 0;
        }
        i {
          margin-left: 4px;
          color: #a8b6bb;
        }
      }
    }
    .perimissionContent {
      @include contentShadow();
      //   border-left: 1px solid #e5e5e5;
      //   @include flex-justify(space-around, row, wrap, space-around);
      .titleContent {
        color: #313b46;
        font-weight: bold;
        font-size: 16px;
        // margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 28px;
        i {
          margin-left: 4px;
          color: #a8b6bb;
        }
        .bottom {
          border-bottom: 3px solid #9ce268;
        }
      }
    }

    .treeBox {
      overflow: auto;
      max-height: 260px;
    }
    .testUnitCheckbox {
      svg {
        font-size: 40px;
        margin-right: 8px;
      }
      @include flex-justify(flex-start, row, nowrap);
      background: #f9f9f9;
      box-shadow: 0px 2px 12px rgb(220 218 214 / 60%);
      border-radius: 10px;
      margin-top: 8px;
      padding: 8px;
      color: #909399;
      line-height: 30px;
      font-size: 18px;
      &.checked {
        svg {
          font-size: 40px;
          color: $lightBlue;
        }
        color: #313b46;
        box-shadow: 0px 2px 12px rgba(49, 156, 255, 0.6);
      }
    }
    .userBox {
      overflow: auto;
      max-height: 400px;
    }
  }
}
/* @keyframes show {
  0% {
    opacity: 0;
    left: 32px;
  }
  100% {
    opacity: 1;
    left: 0;
  }
}
@keyframes hide {
  0% {
    opacity: 1;
    left: 0;
  }
  100% {
    opacity: 0;
    left: -32px;
  }
}
.show-enter-active {
  animation: show 1.2s;
}
.show-leave-active {
  animation: hide 1.2s;
}
.show-enter,
.show-leave-to {
  opacity: 0;
} */
</style>
