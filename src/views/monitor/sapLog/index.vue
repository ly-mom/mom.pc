<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="单号" prop="FormNo">
        <el-input v-model.trim="queryParams.Search.FormNo" placeholder="请输入单号" clearable style="width: 180px" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="批次号" prop="LotNo">
        <el-input v-model.trim="queryParams.Search.LotNo" placeholder="请输入批次号" clearable style="width: 180px" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <base-table :columns="columns" :list="list" :options="options" :height="$table.FullViewHeight(156)"> </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
  </div>
</template>

<script>
import { getSAPData } from '@/api/monitor/operlog'

export default {
  name: 'Saplog',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 类型数据字典
      typeOptions: [],
      // 类型数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        SortField: 'CreateTime',
        SortType: 'DESC',
        Search: {
          FormNo: undefined,
          LotNo: undefined,
        },
      },
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: false, // 是否支持列表项选中功能
      }, // table 的参数
      columns: [
        { title: '单号 ', dataIndex: 'FormNO', sortable: true, width: '180px', ellipsis: true, fixed: 'left' },
        { title: '批次号', dataIndex: 'SAPLotNO', type: '3', width: '180px', ellipsis: true, fixed: 'left' },
        { title: '操作人', dataIndex: 'OperaName', type: '3', width: '180px', ellipsis: true },
        { title: '操作结果', dataIndex: 'OperaResult', width: '80px', ellipsis: true },
        { title: '响应信息', dataIndex: 'OperaMsg', width: '280px', ellipsis: true },
        { title: '响应内容', dataIndex: 'OperaContent', width: '180px', ellipsis: true },
        { title: '节点描述', dataIndex: 'NodeDescr', width: '380px', ellipsis: true },
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
    async getList() {
      this.loading = true
      const data = this.queryParams.Search
      const res = await getSAPData(this.queryParams)
      this.loading = false
      if (res.Success) {
        this.list = res.Data.PageList || []
        this.total = res.Data.Total || 0
      } else {
        this.msgError(res.Msg)
      }
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
  },
}
</script>
