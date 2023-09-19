<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="模块名称" prop="ModuleName">
        <el-input v-model="queryParams.Search.ModuleName" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="业务名称" prop="BizName">
        <el-input v-model="queryParams.Search.BizName" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人名称" prop="CreatorName">
        <el-input v-model="queryParams.Search.CreatorName" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('usual_start_time')">
        <el-date-picker v-model.trim="queryParams.Search.StartTime" clearable size="small" type="date" :placeholder="$t('usual_choose')" valueFormat="yyyy-MM-dd" />
      </el-form-item>
      <el-form-item :label="$t('usual_end_time')" prop="endTime">
        <el-date-picker v-model="queryParams.Search.EndTime" clearable size="small" type="date" :placeholder="$t('usual_choose')" valueFormat="yyyy-MM-dd" />
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
    <base-table :columns="columns" :list="list" v-loading="loading" :options="options" :operates="obj" @dbcellclick="dbCellClick" @handleSelectionChange="handleSelectionChange">
      <!-- <template slot="ParamsText" slot-scope="scope">
            <el-popover
              placement="left-start"
              width="460"
              trigger="hover"
              :content="scope.row.ParamsText">
              <span slot="reference" style="overflow: hidden;text-overflow: ellipsis;-webkit-box-orient: vertical;-webkit-line-clamp: 1;white-space: nowrap;">{{scope.row.ParamsText}}</span>
            </el-popover>
        </template> -->
    </base-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
  </div>
</template>

<script>
import { GetUserLogList } from '@/api/monitor/operlog'

export default {
  name: 'Operlog',
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
        // ViewHeight:200,
      }, // table 的参数
      columns: [
        { title: '模块名称', align: 'center', dataIndex: 'ModuleName', type: '3', width: '180px' },
        { title: '业务名称', align: 'center', dataIndex: 'BizName', type: '3', width: '180px', ellipsis: true },
        { title: '日志内容', align: 'center', dataIndex: 'LogContent', type: '3', ellipsis: true },
        { title: '参数', align: 'center', dataIndex: 'ParamsText', type: '3', ellipsis: true, width: '180px' },
        { title: '响应', align: 'center', dataIndex: 'ReturnData', type: '3', ellipsis: true, width: '180px' },
        { title: '操作时间', align: 'center', dataIndex: 'CreateTime', width: '180px' },
        { title: '操作人工号', align: 'center', dataIndex: 'CreatorId', width: '100px' },
        { title: '操作人名称', align: 'center', dataIndex: 'CreatorName', width: '100px' },
      ],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 双击复制
    dbCellClick({ row, column }) {
      const field = column.field
      const copyField = ['ParamsText', 'ReturnData']
      const text = row[field]
      if (!copyField.includes(field) || !text) return
      const ele = document.createElement('input') //创建一个input标签
      ele.setAttribute('value', text) // 设置改input的value值
      document.body.appendChild(ele) // 将input添加到body
      ele.select() // 获取input的文本内容
      document.execCommand('copy') // 执行copy指令
      document.body.removeChild(ele) // 删除input标签
      this.$notify({
        title: '成功',
        message: '已复制到剪切板，可粘贴。',
        type: 'success',
      })
    },
    /** 查询登录日志 */
    getList() {
      this.loading = true
      GetUserLogList(this.queryParams).then(response => {
        this.loading = false
        if (response.Success) {
          this.list = response.Data.PageList
          this.total = response.Data.Total
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
