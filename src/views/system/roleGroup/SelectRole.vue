<template>
  <!-- 授权角色 -->
  <el-dialog :title="$tl('system_roleGroup_selectRole', '选择角色')" :visible="visible" width="70%" top="5vh" append-to-body>
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true">
      <el-form-item :label="$t('system_permission_character')" prop="RoleKey">
        <el-input v-model="queryParams.Search.RoleKey" :placeholder="$t('system_input_user_id')" clearable size="mini" style="width: 200px" @keyup.enter.native="handleQuery">
          <template slot="append"> <BatchInput :value="queryParams.Search.RoleKey"></BatchInput></template
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('system_role_name')" prop="RoleName">
        <el-input v-model="queryParams.Search.RoleName" :placeholder="$t('system_input_username')" clearable size="mini" style="width: 200px" @keyup.enter.native="handleQuery"
          ><template slot="append">
            <BatchInput :value="queryParams.Search.RoleName"></BatchInput>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <base-table :columns="columns" :list="dataList" :options="options" @handleSelectionChange="handleSelectionChange"> </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="handleSelectUser">{{ $t('usual_confirm') }}</el-button>
      <el-button @click="cancel" size="mini">{{ $t('usual_cancel') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listRole } from '@/api/system/role'
import BatchInput from '@/components/BatchInput'
import _ from 'lodash'

export default {
  name: 'SelectRole',
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
          RoleName: undefined,
        },
      },

      columns: [
        {
          title: this.$t('system_roleId'),
          dataIndex: 'Id',
          width: '200px',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$t('system_role_name'),
          dataIndex: 'RoleName',
          width: '200px',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$t('system_permission_character'),
          dataIndex: 'RoleKey',
          width: '200px',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$t('system_sort'),
          dataIndex: 'RoleSort',
          width: '100px',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$t('usual_status'),
          dataIndex: 'status',
          type: '1',
          sortable: true,
          dictKey: 'sys_normal_disable',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.status,
                'dict-key': 'sys_normal_disable',
              },
            }),
        },
        {
          title: this.$t('MMS_Remark'),
          dataIndex: 'Remark',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      GroupData: undefined, // 当前角色组数据
    }
  },
  methods: {
    // 显示弹框
    show(GroupData) {
      this.visible = true
      this.GroupData = GroupData
    },
    // 取消按钮
    cancel() {
      this.dataList = []
      this.resetForm('queryForm')
      this.queryParams.PageIndex = 1
      this.queryParams.PageRows = 100
      this.visible = false
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection
    },
    // 查询表数据
    async getList() {
      const data = _.cloneDeep(this.queryParams)
      const res = await listRole(data)
      if (res.Success) {
        this.dataList = res.Data.PageList
        const filterData = this.GroupData.Children.map(e => e.Code) || []
        console.log(this.GroupData)
        console.log(filterData)
        this.dataList = this.dataList.filter(e => !filterData.concat(['admin', 'Development']).includes(e.RoleKey))
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
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 选择用户操作 */
    handleSelectUser() {
      this.$emit('confirm', this.selection)
    },
  },
}
</script>
