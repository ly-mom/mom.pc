<template>
  <!-- 授权用户 -->
  <el-dialog :title="$tl('system_roleGroup_selectUser', '选择用户')" :visible="visible" width="70%" v-dialogDrag top="5vh" append-to-body>
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true">
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
    <base-table :columns="columns" :list="dataList" :options="options" @handleSelectionChange="handleSelectionChange"> </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="handleSelectUser">{{ $t('usual_confirm') }}</el-button>
      <el-button @click="cancel" size="mini">{{ $t('usual_cancel') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getUnallocatedUser } from '@/api/system/role'
import BatchInput from '@/components/BatchInput'
import _ from 'lodash'

export default {
  name: 'SelectUser',
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
      }, // table 的参数
    }
  },
  methods: {
    // 显示弹框
    show(RoleKey, GroupCode) {
      this.queryParams.Search.GroupCode = GroupCode
      this.queryParams.Search.RoleKey = RoleKey
      this.getList()
      this.visible = true
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
      _.set(data, 'Search.RealNames', data.Search.RealNames ? data.Search.RealNames.split(',') : undefined)
      _.set(data, 'Search.UserCodes', data.Search.UserCodes ? data.Search.UserCodes.split(',') : undefined)
      const res = await getUnallocatedUser(data)
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
