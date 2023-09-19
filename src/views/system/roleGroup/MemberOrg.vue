<template>
  <!-- 用户授权厂区 -->
  <el-dialog :title="$tl('system_roleGroup_memberOrg', '用户授权厂区')" :visible="visible" fullscreen class="memberOrgDialog" @close="cancel">
    <el-row :gutter="8" v-loading="loading">
      <el-col :md="8" :sm="24">
        <div class="commonBox">
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
          <pagination
            small
            :pagerCount="5"
            v-show="total > 0"
            :total="total"
            :page="queryParams.PageIndex"
            :limit="queryParams.PageRows"
            @pagination="getList"
            layout="total, sizes, prev, pager, next"
          />
        </div>
      </el-col>
      <el-col :md="8" :sm="24">
        <div class="commonBox">
          <div>
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="isEmptyValue(selection)" @click="removeAllUserFn">{{
              $tl('system_permissionCopy_removeMember', '清空用户')
            }}</el-button>

            <span class="el-pagination__total ml0">{{ $tl('system_perimission_UserTotal', `已选择${selection.length || 0}人`, selection.length) }}</span>
          </div>

          <div class="mt10 userBox linghtGreyBg el-card__body" v-show="!isEmptyValue(selection)">
            <el-tag closable v-for="item in selection" :key="item.UserCode" class="mr10 mb10" @close="removeUserFn(item)">
              <el-tooltip class="item" effect="dark" :open-delay="500" :content="$tl('system_selectUser_tip', `${item.UserCode}`, item)" placement="top">
                <span>
                  {{ $tl('system_selectUser', `${item.RealName}`, item) }}
                </span>
              </el-tooltip>
            </el-tag>
          </div>
        </div>
      </el-col>
      <el-col :md="8" :sm="24">
        <div class="commonBox">
          <div>
            <el-button type="primary" plain icon="el-icon-circle-check" size="mini" :disabled="isEmptyValue(orgTree)" @click="handleCheckedAll">{{
              $tl('system_perimission_checkedAll', '全选/全不选')
            }}</el-button>

            <!-- <span class="el-pagination__total ml0">{{
                  $tl(
                    "system_perimission_UserTotal",
                    `已选择${selectedOrg.length || 0}人`,
                    selectedOrg.length
                  )
                }}</span> -->
          </div>
          <div class="boxContent mt10">
            <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" v-model="orgFilterText" clearable> </el-input>
            <el-tree class="treeBox" ref="orgTree" show-checkbox :data="orgTree" node-key="Code" :props="orgTreeProps" :filter-node-method="orgFilterNode">
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
    <div slot="footer">
      <el-button type="primary" size="mini" :loading="loading" @click="submitMemberOrg">{{ $t('usual_save') }}</el-button>
      <el-button @click="cancel" size="mini">{{ $t('usual_cancel') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { simplyUserList } from '@/api/system/user'
import BatchInput from '@/components/BatchInput'
import { getOrgList, baseSbuInfo, AuthOrgs } from '@/api/base.js'
import _ from 'lodash'

export default {
  name: 'MemberOrg',
  components: {
    BatchInput,
  },
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      selection: [],
      // 总条数
      total: 0,
      // 未授权用户数据
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
        // {
        //   title: this.$tl("base_user_DepartName", "部门"),
        //   dataIndex: "DepartName",
        //   width: "100px",
        //   sortable: true,
        //   ellipsis: true,
        // },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
        keyField: 'Id',
        reserve: true,
      }, // table 的参数

      orgFilterText: '',
      orgTree: [], // 组织架构
      orgTreeProps: { children: 'Children', label: 'Name' },
      loading: false,
    }
  },
  watch: {
    orgFilterText(val) {
      this.$refs.orgTree.filter(val)
    },
    selection(val) {
      this.getMemberOrg()
    },
  },
  methods: {
    // 显示弹框
    show() {
      //   this.getList();
      this.getOrgTree()
      this.visible = true
    },
    // 取消按钮
    cancel() {
      this.dataList = []
      this.selection = []
      this.$refs.memberTable.setCheckboxRow([], false)
      this.resetForm('UserForm')
      this.queryParams.PageIndex = 1
      this.queryParams.PageRows = 100
      this.visible = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection
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
    // 删除人员
    removeUserFn(item) {
      this.selection = _.without(this.selection, item)
      this.$refs.memberTable.setCheckboxRow([item], false)
    },
    // 清空已选人员
    removeAllUserFn() {
      this.$confirm(this.$tl('system_perimission_clearUser', '确定清空所有已选人员'), this.$t('usual_warning'), {
        type: 'warning',
      }).then(async () => {
        this.selection = []
        this.$refs.memberTable.setCheckboxRow([], false)
      })
    },
    orgFilterNode(value, data) {
      if (!value) return true
      return data[this.orgTreeProps.label] && data[this.orgTreeProps.label].toUpperCase().includes(value.toUpperCase())
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
      this.loading = true
      const res = await getOrgList(data)
      this.loading = false
      if (res.Success) {
        this.orgTree = res.Data || []
        // this.getMemberOrg([this.UserCode])
      }
    },
    // 获取已选人员的厂区交集
    async getMemberOrg() {
      if (this.isEmptyValue(this.selection)) {
        this.$refs.orgTree.setCheckedKeys([])
      } else {
        const data = {
          Search: {
            UserCodes: this.selection.map(e => e.UserCode),
          },
        }
        const res = await baseSbuInfo(data)
        if (res.Success) {
          if (_.get(res, 'Data.PageList[0].UserOrgs')) {
            const arr = _.cloneDeep(res.Data.PageList[0].UserOrgs) || []
            if (arr.length) {
              let selectKeys = []
              arr.forEach(element => {
                if (element.SbuCode) {
                  selectKeys.push(element.SbuCode)
                }
              })
              selectKeys = Array.from(new Set(selectKeys))
              this.$refs.orgTree.setCheckedKeys(selectKeys)
            } else {
              this.$refs.orgTree.setCheckedKeys([])
            }
          }
        }
      }
    },
    // 全选/全不选
    handleCheckedAll() {
      const value = this.$refs.orgTree.getCheckedNodes()
      this.$refs.orgTree.setCheckedNodes(value.length < this.orgTree.length ? this.orgTree : [])
    },
    submitMemberOrg() {
      if (this.isEmptyValue(this.selection)) {
        return this.msgInfo(this.$tl('system_perimission_noSelectedMember', '请选择人员'))
      }
      const checkedNodes = this.$refs.orgTree.getCheckedNodes()
      const orgCodeList = checkedNodes.map(e => e.OrgCode).filter(e => !this.isEmptyValue(e)) || []
      const data = {
        UserIds: this.selection.map(e => e.Id),
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
      this.loading = true
      const res = await AuthOrgs(data)
      this.loading = false
      if (res.Success) {
        this.msgSuccess(this.$t('MOM_SaveSuccess'))
        // 如果设置当前登录账户，更新用户信息
        if (data.UserIds.includes(this.$store.state.user.userId)) {
          this.$store.dispatch('GetInfo')
        }
      } else {
        this.msgError(res.Msg)
      }
    },
  },
}
</script>
<style lang="scss">
.memberOrgDialog {
  .el-dialog__body {
    background: #f1f3f4 !important;
    padding: 4px 10px !important;
    max-height: calc(100vh - 112px);
  }
}
</style>
<style lang="scss" scoped>
.memberOrgDialog {
  .commonBox {
    height: calc(100vh - 120px);
    background: #fff;
    padding: 4px 8px;
    border-radius: 10px;
  }
  .userBox {
    overflow: auto;
    max-height: calc(100vh - 180px);
  }

  .treeBox {
    overflow: auto;
    height: calc(100vh - 210px);
  }
}
</style>
