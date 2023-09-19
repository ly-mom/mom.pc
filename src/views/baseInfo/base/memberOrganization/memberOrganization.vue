<template>
  <div class="app-container organizationMain">
    <el-row :gutter="32">
      <el-col :span="24">
        <div class="headerBox">
          <div>
            <el-form inline ref="queryForm" :model="queryParam" @keyup.native.enter="getMemberList" @submit.native.prevent>
              <el-form-item :label="$t('base_UserCode')" prop="UserCode">
                <el-input style="width: 200px" size="small" v-model.trim="queryParam.UserCode" clearable>
                  <template v-slot:append>
                    <BatchInput :value="queryParam.UserCode"></BatchInput>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item :label="$t('base_RealName')" prop="RealName">
                <el-input style="width: 200px" size="small" v-model.trim="queryParam.RealName" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="mini" icon="el-icon-search" @click="getMemberList()" :loading="sreaching">{{ $t('usual_search') }}</el-button>
                <el-button size="mini" icon="el-icon-refresh" @click="reset()">{{ $t('usual_reset') }}</el-button>
                <el-button size="mini" icon="el-icon-delete" :disabled="selecMember.length <= 0" @click="clearSelected">清空已选人员</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div>
            <el-button size="mini" type="primary" :loading="saving" @click="batchSaveData">{{ $t('usual_save') }}</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="9">
        <base-table ref="Table" rowKey="Id" :loading="sreaching" :columns="columns" :list="memberList" :options="options" @handleSelectionChange="tableSelect" @dbrowclick="tableDblclick" />
        <pagination
          ref="memberPagination"
          :pagerCount="5"
          small
          :layout="'sizes, prev, pager, next,total'"
          :total="memberPagination.total"
          :page="memberPagination.current"
          :limit="memberPagination.pageSize"
          @pagination="memberPaginationChange"
        >
        </pagination>
      </el-col>
      <el-col :span="6">
        <base-table ref="Table2" rowKey="Id" :columns="selectedColumns" :list="selecMember" :options="selectedOptions" @dbrowclick="dblclick" />
        <pagination ref="memberPagination" :pagerCount="5" small :layout="'total'" :total="selecMember.length || 0"> </pagination>
      </el-col>
      <el-col :span="9">
        <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" v-model="filterText"> </el-input>
        <el-tree
          :style="{ height: $table.FullViewHeight(206) }"
          ref="orgTree"
          show-checkbox
          :data="treeData"
          node-key="Code"
          :props="defaultProps"
          @current-change="treecurrentchange"
          :filter-node-method="filterNode"
        >
          <span slot-scope="{ data }">
            <div>
              <span>{{ data.Code }}</span>
              <el-divider direction="vertical"></el-divider>
              <span>{{ data.Name }}</span>
            </div>
          </span>
        </el-tree>
      </el-col>
      <!-- <el-col>
        <el-table
          :data="treeData"
          style="width: 100%; margin-bottom: 20px"
          border
          :tree-props="{ children: 'Children', hasChildren: 'hasChildren' }"
        >
          <el-table-column type="selection" width="40"> </el-table-column>
          <el-table-column prop="Name" label="姓名" sortable width="180">
          </el-table-column>
          <el-table-column prop="Code" label="Code"> </el-table-column>
        </el-table>
      </el-col> -->
    </el-row>
  </div>
</template>

<script>
import { baseUserInfo, baseSbuInfo, getOrgList, AuthOrgs } from '@/api/base.js'
import BatchInput from '@/components/BatchInput'
import _ from 'lodash'
export default {
  name: 'MemberOrganization',
  components: {
    BatchInput,
  },
  data() {
    return {
      defaultProps: {
        children: 'Children',
        label: 'Name',
        // disabled: this.disabledFunction
      },
      queryParam: {
        UserCode: '',
        RealName: '',
      },
      sreaching: false,
      saving: false,
      memberList: [],
      filterText: '',
      memberPagination: {
        current: 1,
        pageSize: 100, // 默认每页显示数量
        total: 0,
      },
      treeData: [],
      selectKeys: [],
      saveOrgList: [],
      selectedRowIndex: undefined, // 当前选中的人员
      UserId: undefined,
      selecMember: [], // 选中人员数据
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
        reserveSelection: true,
        rowClassName: true,
      },
      selectedOptions: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: false, // 是否支持列表项选中功能
        rowClassName: true,
      },
      selectedColumns: [
        {
          title: this.$t('base_choiceMember'),
          align: 'center',
          children: [
            { title: this.$t('base_UserCode'), dataIndex: 'UserCode', align: 'center' },
            { title: this.$t('base_RealName'), dataIndex: 'RealName', align: 'center' },
          ],
        },
      ],
      columns: [
        { title: this.$t('base_UserCode'), dataIndex: 'UserCode', width: '120', sortable: true },
        { title: this.$t('base_RealName'), dataIndex: 'RealName', width: '120', type: '3' },
        {
          title: this.$t('base_Sex'),
          dataIndex: 'Sex',
          width: '120',
          type: '1',
          dictKey: 'sys_user_sex',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.Sex,
                'dict-key': 'sys_user_sex',
              },
            }),
        },
        { title: this.$t('base_SbuName_default'), dataIndex: 'SbuName', width: '160', ellipsis: true, sortable: true },
        { title: this.$t('base_ADUser'), dataIndex: 'ADUser', ellipsis: true, width: '160' },
      ],
    }
  },
  watch: {
    selecMember(nval) {
      // 判断当选选中的人员是否不在选中了，清空当前选中人员的厂区信息
      const resultArr = nval.map(item => item.Id == this.selectedRowIndex)
      if (!resultArr.includes(true)) {
        this.$refs.orgTree.setCheckedKeys([])
      }
      if (nval.length) {
        this.getMemberOrg(nval.map(item => item.UserCode))
      }
    },
    filterText(val) {
      this.$refs.orgTree.filter(val)
    },
  },
  mounted() {
    // this.getMemberList();
    this.getUserOrg()
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return (data.Code && data.Code.toUpperCase().indexOf(value.toUpperCase()) > -1) || (data.Name && data.Name.toUpperCase().indexOf(value.toUpperCase()) > -1)
    },
    async getMemberList() {
      const ParmeterData = {
        PageIndex: this.memberPagination.current,
        PageRows: this.memberPagination.pageSize,
        SortField: 'id',
        SortType: 'asc',
        Search: {
          all: true,
          IsShowOutWork: 0,
          UserCode: this.queryParam.UserCode,
          RealName: this.queryParam.RealName,
        },
      }
      this.sreaching = true
      this.options.loading = true
      const res = await baseUserInfo(ParmeterData)
      this.sreaching = false
      this.options.loading = false
      if (res.Success) {
        this.memberList = res.Data.PageList || []
        this.memberPagination.total = res.Data.Total || 0
      }
    },
    async getUserOrg() {
      // 获取用户组织
      const data = {}
      const res = await getOrgList(data)
      if (res.Success) {
        this.treeData = res.Data || []
      }
    },
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
            this.selectKeys = []
            arr.forEach(element => {
              // if (element.BgCode) {
              //   this.selectKeys.push(element.BgCode);
              // }
              // if (element.BuCode) {
              //   this.selectKeys.push(element.BuCode);
              // }
              if (element.SbuCode) {
                this.selectKeys.push(element.SbuCode)
              }
            })
            this.selectKeys = Array.from(new Set(this.selectKeys))
            this.$refs.orgTree.setCheckedKeys(this.selectKeys)
          } else {
            this.$refs.orgTree.setCheckedKeys([])
          }
        }
        // this.treeData = res.Data || [];
      }
    },
    tableSelect(val) {
      this.selecMember = val
      // if (val.length > 1) {
      //   this.$refs.Table.$refs.mutipleTable.clearSelection();
      //   this.$refs.Table.$refs.mutipleTable.toggleRowSelection(val.pop());
      //   this.$refs.Table.$refs.mutipleTable.setCurrentRow(val.pop());
      // }
    },
    memberPaginationChange({ page }) {
      this.memberPagination.current = page
      this.getMemberList()
    },
    selectedMemberClick(row, column, event) {
      if (this.selectedRowIndex == row.Id) {
        this.selectedRowIndex = undefined
        this.$refs.orgTree.setCheckedKeys([])
      } else {
        this.selectedRowIndex = row.Id
        if (row.UserCode) {
          this.getMemberOrg(row.UserCode)
        }
      }
    },
    disabledFunction() {
      if (this.selecMember && this.selecMember.length) {
        let isInclude = false
        for (let index = 0; index < this.selecMember.length; index++) {
          const element = this.selecMember[index]
          if (element.Id == this.selectedRowIndex) {
            isInclude = true
            break
          }
        }
        return isInclude
      } else {
        return false
      }
    },
    async saveData(data) {
      this.saving = true
      const res = await AuthOrgs(data)
      this.saving = false
      if (res.Success) {
        this.msgSuccess(this.$t('MOM_SaveSuccess'))
        // 如果已选人员中包括当前登录账户，更新用户信息
        for (let i = 0; i < this.selecMember.length; i++) {
          const element = this.selecMember[i]
          if (element.UserCode == this.$store.state.user.userCode) {
            this.$store.dispatch('GetInfo')
            break
          }
        }
      } else {
        this.msgError(res.Msg)
      }
    },
    async batchSaveData() {
      const CheckedNodes = this.$refs.orgTree.getCheckedNodes() || []
      if (this.selecMember.length > 0) {
        this.saveOrgList = []
        if (CheckedNodes && CheckedNodes.length) {
          CheckedNodes.forEach(element => {
            this.findOrgCode(element)
          })
        }
        const userList = this.selecMember.map(item => item.Id)
        const data = {
          UserIds: userList,
          OrgCodes: this.saveOrgList,
        }
        if (this.saveOrgList.length == 0) {
          this.$confirm(`${this.$tl('base_sure_selete_org', '确定清空人员已分配厂区？')}`, this.$t('usual_notice'), {
            confirmButtonText: this.$t('usual_confirm'),
            cancelButtonText: this.$t('usual_cancel'),
            type: 'warning',
          }).then(() => {
            this.saveData(data)
          })
        } else {
          this.saveData(data)
        }
      } else {
        this.msgError('请选择组织人员')
      }
    },
    // findItem(code){
    //   let result = {}
    //   this.treeData.forEach((first) => {
    //     if(code.includes(first.Code)){
    //       let temp = {
    //         BgCode: first.Code,
    //         BgName: first.Name,
    //       }
    //       result = Object.assign(result,temp)
    //     }
    //     if (first.Children&&first.Children.length>0) {
    //       first.Children.forEach((second) => {
    //         if(code.includes(second.Code)){
    //           let temp = {
    //             BuCode: second.Code,
    //             BuName: second.Name,
    //           }
    //           result = Object.assign(result,temp)
    //         }
    //         if (second.Children&&second.Children.length>0) {
    //           second.Children.forEach((three) => {
    //             if(code.includes(three.Code)){
    //               let temp = {
    //                 Id: three.Id,
    //                 OrgCode: three.OrgCode,
    //                 SbuCode: three.Code,
    //                 SbuName: three.Name,
    //                 Status:0
    //               }
    //               result = Object.assign(result,temp)
    //             }
    //           })
    //         }
    //       })
    //     }
    //   })
    // },
    treecheck(item, node) {
      if (node.checkedKeys.length > 0) {
        this.findOrgCode(item)
      } else {
        this.deleteOrgCode(item)
      }
    },

    // 遍历添加选中的orgcode
    findOrgCode(item) {
      if (item.Children && item.Children.length > 0) {
        item.Children.forEach(ele => {
          this.findOrgCode(ele)
        })
      } else {
        if (!this.saveOrgList.includes(item.OrgCode)) {
          this.saveOrgList.push(item.OrgCode)
        }
      }
    },

    // 遍历删除选中的orgcode,备用
    deleteOrgCode(item) {
      if (item.Children && item.Children.length > 0) {
        item.Children.forEach(ele => {
          this.deleteOrgCode(ele)
        })
      } else {
        this.saveOrgList = this.saveOrgList.filter(ele => ele != item.OrgCode)
      }
    },
    treecurrentchange(a, b) {
      // console.log("treecurrentchange");
      // console.log(a, b);
    },
    reset() {
      this.$refs.queryForm.resetFields()
      this.$refs.orgTree.setCheckedKeys([])
      this.$refs.Table.$refs.mutipleTable.setCurrentRow({})
      this.getMemberList()
    },
    rowClassName(row) {
      if (this.selectedRowIndex == row.Id) {
        return 'current-row'
      } else if (row.OrgCode) {
        return 'lightBlue-row'
      } else {
        return ''
      }
    },
    clearSelected() {
      this.selecMember = []
      // this.$refs.Table.clearSelection();
      this.$refs.Table.$refs.mutipleTable.clearSelection()
    },
    computOrg(value) {
      const commonOrg = []
      for (let index = 0; index < value.length; index++) {
        const element = value[index]
        if (!element.UserOrgs || element.UserOrgs.length == 0) {
          this.$refs.orgTree.setCheckedKeys([])
          commonOrg.push([])
          break
        } else {
          const orgCodeList = element.UserOrgs.map(item => item.OrgCode)
          commonOrg.push(orgCodeList)
        }
      }
      console.log(_.intersection(...commonOrg))
      return _.intersection(...commonOrg)
    },
    tableDblclick(row) {
      this.$refs.Table.$refs.mutipleTable.toggleRowSelection(row)
    },
    dblclick(row) {
      this.selecMember = this.selecMember.filter(item => item.Id != row.Id)
      this.$refs.Table.$refs.mutipleTable.toggleRowSelection(row)
    },
  },
  provide() {
    return {
      rowClassName: this.rowClassName,
    }
  },
}
</script>
<style lang="scss" scoped>
.organizationMain {
  .headerBox {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-content: center;
  }
  .el-tree {
    border: 1px solid #ebeef5;
  }
  .el-tree-node {
    margin: 5px 0;
  }
  .el-tree {
    overflow: auto;
  }
  // ::v-deep th .el-checkbox {
  //   display: none;
  // }
  ::v-deep .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    background-color: #409eff !important;
  }
  ::v-deep .el-checkbox__input.is-disabled.is-indeterminate .el-checkbox__inner {
    background-color: #409eff !important;
  }
}
</style>
