<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关键字" prop="KeyWord">
        <el-input v-model="queryParams.Search.KeyWord" placeholder="请输入关键字" clearable style="width: 180px" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请求链接" prop="Url">
        <el-input v-model="queryParams.Search.Url" placeholder="请输入请求链接" clearable style="width: 180px" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="内容" prop="Content">
        <el-input v-model="queryParams.Search.Content" placeholder="请求内容或响应内容" clearable style="width: 180px" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="错误码" prop="Errcode">
        <el-input v-model="queryParams.Search.Errcode" placeholder="请输入错误码" clearable style="width: 180px" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!--
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['monitor:operlog:remove']"
        >{{$t('usual_delete')}}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-hasPermi="['monitor:operlog:remove']"
        >清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['monitor:operlog:export']"
        >{{$t('usual_export')}}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row> -->
    <base-table :columns="columns" :list="list" v-if="!loading" :options="options" :operates="obj" @handleSelectionChange="handleSelectionChange"> </base-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
  </div>
</template>

<script>
import { GetPushMsgList } from '@/api/monitor/dinglog'

export default {
  name: 'Dinglog',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 类型数据字典
      statusOptions: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'operTime', order: 'descending' },
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        SortField: 'CreateTime',
        SortType: 'DESC',
        Search: {
          KeyWord: undefined,
          Url: undefined,
          Content: undefined,
          Errcode: undefined,
        },
      },
      obj: {},
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
        ViewHeight: 200,
      }, // table 的参数
      columns: [
        { title: '关键词', dataIndex: 'KeyWord', sortable: true, width: '180px' },
        { title: '请求地址', dataIndex: 'Url', type: '3', width: '280px', ellipsis: true },
        { title: '推送用户', dataIndex: 'UserIds', type: '3', width: '180px', ellipsis: true },
        { title: '请求内容', dataIndex: 'RequestContent', width: '380px', ellipsis: true },
        { title: '响应内容', dataIndex: 'ResponseContent', width: '280px', ellipsis: true },
        { title: '错误码', dataIndex: 'Errcode', width: '180px', ellipsis: true },
        { title: '错误消息', dataIndex: 'ErrMsg', width: '380px', ellipsis: true },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '180px' },
        { title: this.$t('usual_creation'), dataIndex: 'CreatorId', width: '180px' },
        { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName', width: '100px' },
      ],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询登录日志 */
    getList() {
      this.loading = true
      GetPushMsgList(this.queryParams).then(response => {
        if (response.Success) {
          this.list = response.Data.PageList
          this.total = response.Data.Total
          this.loading = false
        } else {
          this.msgError(response.Msg)
          this.loading = false
        }
      })
    },
    // 操作日志状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 操作日志类型字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.businessType)
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
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.operId)
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order
      this.getList()
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true
      this.form = row
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.operId || this.ids
      this.$confirm('是否确认删除日志编号为"' + operIds + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delOperlog(operIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('IQC_DeleteSuccess'))
        })
        .catch(() => {})
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$confirm('是否确认清空所有操作日志数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return cleanOperlog()
        })
        .then(() => {
          this.getList()
          this.msgSuccess('清空成功')
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有操作日志数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.exportLoading = true
          return exportOperlog(queryParams)
        })
        .then(response => {
          this.download(response.msg)
          this.exportLoading = false
        })
        .catch(() => {})
    },
  },
}
</script>
