<template>
  <div class="app-container">
    <el-col :span="24" :xs="24">
      <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch">
        <el-form-item :label="$t('base_code')" prop="Code">
          <el-input v-model="queryParams.Search.Code" :placeholder="$t('base_search_code')" clearable size="small" style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('base_name')" prop="Name">
          <el-input v-model="queryParams.Search.Name" :placeholder="$t('base_search_name')" clearable size="small" style="width: 180px" @keyup.enter="handleQuery" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
        </el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5" v-hasPermi="['baseinfo:organization:add']">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">{{ $t('MMS_New') }}</el-button>
          <!-- 新建按钮 -->
        </el-col>
        <el-col :span="1.5" v-hasPermi="['baseinfo:organization:update']">
          <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate">{{ $t('usual_update') }}</el-button>
        </el-col>

        <el-col :span="1.5" v-hasPermi="['baseinfo:organization:delete']">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">{{ $t('usual_delete') }}</el-button>
          <!-- 批量删除的按钮 -->
        </el-col>
        <right-toolbar :showSearch="showSearch" @queryTable="getDataList"></right-toolbar>
      </el-row>
      <!--        @sort-change="$table.sortChange($event,orgList)"-->
      <base-table :columns="columns" :list="orgList" :options="options" :operates="obj" @handleSelectionChange="handleSelectionChange" @sort-change="$table.sortChange($event, orgList)">
        <template v-slot:action>
          <table-column fixed="right" :label="$t('usual_operation')" min-width="100px">
            <template v-slot="scope">
              <el-button @click="handleUpdate(scope.row)" type="text" size="small" v-hasPermi="['baseinfo:organization:update']"
                >{{ $t('usual_update') }}
                <!-- 编辑按钮 -->
              </el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="small" v-hasPermi="['baseinfo:organization:delete']">
                {{ $t('usual_delete') }}
                <!-- 删除按钮 -->
              </el-button>
            </template>
          </table-column>
        </template>
      </base-table>
      <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getDataList" />
      <edit-form ref="editForm" :parentObj="this"></edit-form>
    </el-col>
  </div>
</template>

<script>
import EditForm from './EditForm'
import { GetDataListOrganization, GetDeleteDataOrganization } from '@/api/base/public_base'

export default {
  components: {
    EditForm,
  },
  name: 'Organization',
  data() {
    return {
      showSearch: true,
      sreaching: false,
      deleteing: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,

      orgList: [],
      filters: {},
      sorter: { field: 'Id', order: 'asc' },
      loading: false,
      columns: [
        { title: this.$t('base_OrgCode'), dataIndex: 'OrgCode', width: '120px' },
        { title: this.$t('base_BgCode'), dataIndex: 'BgCode' },
        { title: this.$t('base_BgName'), dataIndex: 'BgName', type: '1', width: '120px', dictKey: '' },
        { title: this.$t('base_BuCode'), dataIndex: 'BuCode', width: '120px', sortable: true },
        { title: this.$t('base_BuName'), dataIndex: 'BuName', width: '120px', type: '3', sortable: true },
        { title: this.$t('base_SbuCode'), dataIndex: 'SbuCode', width: '120px', sortable: true },
        { title: this.$t('base_SbuName'), dataIndex: 'SbuName', width: '120px', ellipsis: true, sortable: true },
        { title: this.$t('base_Area'), dataIndex: 'Area', width: '140px', sortable: true },
        { title: this.$t('base_SbuAddress'), dataIndex: 'SbuAddress', width: '140px', sortable: true },
        { title: this.$t('base_Sbu'), dataIndex: 'Sbu', width: '140px', sortable: true },
        { title: this.$t('base_FactoryCode'), dataIndex: 'FactoryCode', width: '140px', sortable: true },
        { title: this.$tl('usual_shortCode', '简码'), dataIndex: 'ShortCode', width: '100px', sortable: true },
        { title: this.$t('MMS_Remark'), dataIndex: 'Remark', sortable: true },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '180px', sortable: true },
        { title: this.$t('usual_creation'), dataIndex: 'CreatorId', sortable: true },
        { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName', width: '100px', sortable: true },
        { title: this.$t('usual_update_time'), dataIndex: 'UpdateTime', width: '160px', sortable: true },
        { title: this.$t('usual_updator'), dataIndex: 'UpdaterId', sortable: true },
        { title: this.$t('usual_update_name'), dataIndex: 'UpdaterName', width: '100px', sortable: true },
        {
          title: this.$t('usual_status'),
          dataIndex: 'Status',
          align: 'center',
          width: '100px',
          dictKey: 'sys_normal_disable',
          type: '1',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.Status,
                'dict-key': 'sys_normal_disable',
              },
            }),
        },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      obj: {},
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          Code: undefined,
          Name: undefined,
        },
      },
      multipleSelection: [],
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getDataList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleTableChange(pagination, filters, sorter) {
      this.pagination = { ...pagination }
      this.filters = { ...filters }
      this.sorter = { ...sorter }
      this.getDataList()
    },
    getDataList() {
      this.selectedRowKeys = []
      this.loading = true
      this.options.loading = true
      GetDataListOrganization(this.queryParams).then(response => {
        this.loading = false
        this.options.loading = false
        if (response.Success) {
          this.orgList = response.Data.PageList
          this.total = response.Data.Total
        }
      })
    },
    hasSelected() {
      return this.multipleSelection.length > 0
    },
    handleAdd() {
      this.$refs.editForm.openForm(undefined, this.$t('MMS_New'))
    },
    // 表单重置
    reset() {
      this.resetForm('form')
    },
    handleUpdate(row) {
      const Id = row.Id || this.ids.toString()

      this.$refs.editForm.openForm(Id, this.$t('usual_update'))
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)

      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleDelete(row) {
      //  const userIds = row.Id || this.ids;
      let Ids = []
      if (row.Id) {
        Ids = [row.Id]
      } else {
        Ids = this.ids
      }
      this.$confirm(this.$t('iqc_sure_forever_del'), this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return GetDeleteDataOrganization(Ids)
        })
        .then(response => {
          if (response.Success) {
            this.getDataList()
            this.msgSuccess(this.$t('IQC_DeleteSuccess'))
          } else {
            this.msgError(response.Msg)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('usual_cancel_success'),
          })
        })
    },
  },
}
</script>
