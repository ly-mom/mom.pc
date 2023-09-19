<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item :label="$tl('system_ServerName', '服务')" prop="ServerName">
        <!-- <el-input
          v-model="queryParams.Search.ServerName"
          :placeholder="$t('MOM_InputPlease')"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        /> -->
        <el-select v-model="queryParams.Search.ServerName" :placeholder="$t('usual_choose')" clearable size="small">
          <el-option label="Base" value="Base" />
          <el-option label="Quality" value="Quality" />
          <el-option label="WMS" value="WMS" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$tl('system_ErrorMessage', '错误信息')" prop="ErrorMessage">
        <el-input v-model="queryParams.Search.ErrorMessage" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$tl('system_SourceFile', '错误文件')" prop="SourceFile">
        <el-input v-model="queryParams.Search.SourceFile" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$tl('system_ErrorTag', '错误标识')" prop="ErrorTag">
        <el-input v-model="queryParams.Search.ErrorTag" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- <el-form-item :label="$tl('system_StackTraceStr','堆栈信息')" prop="StackTraceStr">
        <el-input
          v-model="queryParams.Search.StackTraceStr"
          :placeholder="$t('MOM_InputPlease')"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item :label="$tl('system_DealWithUserName', '处理人')" prop="DealWithUserName">
        <el-input v-model="queryParams.Search.DealWithUserName" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('usual_start_time')" prop="StartTime">
        <el-date-picker
          size="small"
          v-model.trim="queryParams.Search.StartTime"
          :picker-options="{ disabledDate: disabledStartDate }"
          style="width: 180px"
          type="datetime"
          valueFormat="yyyy-MM-dd HH:mm:ss"
          default-time="00:00:00"
          :placeholder="$t('usual_choose')"
        />
      </el-form-item>
      <el-form-item :label="$t('usual_end_time')" prop="EndTime">
        <el-date-picker
          size="small"
          v-model.trim="queryParams.Search.EndTime"
          type="datetime"
          valueFormat="yyyy-MM-dd HH:mm:ss"
          default-time="23:59:59"
          style="width: 180px"
          :picker-options="{ disabledDate: disabledEndDate }"
          :placeholder="$t('usual_choose')"
        />
      </el-form-item>
      <el-form-item>
        <el-radio-group v-model="queryParams.Search.hasDeal" size="mini">
          <el-radio-button :label="undefined">{{ $t('usual_all') }}</el-radio-button>
          <el-radio-button :label="true">{{ $tl('usual_hasDeal', '已处理') }}</el-radio-button>
          <el-radio-button :label="false">{{ $tl('usual_noDeal', '未处理') }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch="showSearch" @queryTable="getLogList"></right-toolbar>
    </el-row>
    <base-table :cutheight="140" :columns="columns" :list="list" :options="options" v-loading="loading" @dbcellclick="dbCellClick">
      <template slot="action">
        <table-column prop="action" fixed="right" width="100" :label="$t('usual_operation')" min-width="250">
          <template slot-scope="scope">
            <el-button v-if="!scope.row.DealWithUser" @click="startDeal(scope.row.Id)" icon="el-icon-video-play" type="text" size="mini">{{ $tl('system_startDeal', '开始处理') }} </el-button>
            <el-button
              v-if="scope.row.DealWithUser && !scope.row.DealWithTime && scope.row.DealWithUser == $store.state.user.userCode"
              @click="finishDeal(scope.row.Id)"
              icon="el-icon-finished"
              type="text"
              size="mini"
              >{{ $tl('system_finishDeal', '完成处理') }}
            </el-button>
          </template>
        </table-column>
      </template>
      <template slot="StackTraceStr" slot-scope="scope">
        <el-tooltip class="item" effect="dark" :content="scope.row.StackTraceStr" placement="left-start">
          <template slot="content">
            <div style="max-width: 500px; max-height: 200px; overflow: auto; white-space: pre-line">{{ scope.row.StackTraceStr }}</div>
          </template>
          <span>{{ scope.row.StackTraceStr }}</span>
        </el-tooltip>
      </template>
    </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getLogList" />
  </div>
</template>

<script>
import { getExceptionLogList, setExceptionDealWithUser, dealWithException } from '@/api/monitor/server'
import { disabledStartDate, disabledEndDate } from '@/utils/util'

export default {
  name: 'ExceptionLog',
  data() {
    return {
      showSearch: true,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: false, // 是否支持列表项选中功能
      }, // table 的参数
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        SortField: 'CreateTime',
        SortType: 'desc',
        Search: {
          UserCode: undefined,
          RealName: undefined,
          LoginIp: undefined,
          UserAgent: undefined,
          EndTime: undefined,
          StartTime: undefined,
          hasDeal: undefined,
        },
      },
      columns: [
        {
          title: this.$tl('system_ServerName', '服务'),
          dataIndex: 'ServerName',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
          fixed: 'left',
        },
        {
          title: this.$tl('system_ErrorTag', '错误标识'),
          dataIndex: 'ErrorTag',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('system_ErrorMessage', '错误信息'),
          dataIndex: 'ErrorMessage',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('system_SourceFile', '错误文件'),
          dataIndex: 'SourceFile',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('system_LineNum', '行数'),
          dataIndex: 'LineNum',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('system_StackTraceStr', '堆栈信息'),
          dataIndex: 'StackTraceStr',
          width: '140px',
          type: '3',
          sortable: true,
          // ellipsis: true,
          slots: true,
        },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '180px', type: '3', sortable: true },
        {
          title: this.$tl('system_HasDeal', '处理状态'),
          dataIndex: 'HasDeal',
          width: '180px',
          sortable: true,
          render: (h, params) => h('span', {}, params.row.HasDeal ? this.$tl('usual_hasDeal', '已处理') : params.row.HasDeal === false ? this.$tl('usual_noDeal', '未处理') : ''),
        },
        { title: this.$tl('system_DealWithUserName', '处理人'), dataIndex: 'DealWithUserName', width: '180px', type: '3', sortable: true },
        { title: this.$tl('system_DealWithTime', '处理时间'), dataIndex: 'DealWithTime', width: '180px', type: '3', sortable: true },
        // { title: this.$t('usual_creation'), dataIndex: 'CreatorId', width: "150px", type:'3',sortable: true},
        // { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName',width: "150px" , type:'3',sortable: true},
      ],
    }
  },
  created() {
    this.getLogList()
  },
  methods: {
    // 开始时间的限制
    disabledStartDate(startValue) {
      return disabledStartDate(startValue, this.queryParams.Search.EndTime)
    },
    // 结束时间的限制
    disabledEndDate(endValue) {
      return disabledEndDate(endValue, this.queryParams.Search.StartTime)
    },
    /** 查询登录日志列表 */
    async getLogList() {
      this.loading = true
      const res = await getExceptionLogList(this.queryParams)
      this.loading = false
      if (res.Success) {
        this.list = res.Data.PageList || []
        this.total = res.Data.Total
      } else {
        this.msgError(res.Msg)
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getLogList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.Search = {}
      this.handleQuery()
    },
    // 双击复制
    dbCellClick({ row, column }) {
      const field = column.field
      const copyField = ['StackTraceStr', 'ErrorMessage', 'SourceFile']
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
    // 开始处理
    async startDeal(Id) {
      const res = await setExceptionDealWithUser({ Id })
      if (res.Success) {
        this.msgSuccess(res.Msg)
        this.handleQuery()
      } else {
        this.msgError(res.Msg)
      }
    },
    // 处理完成
    async finishDeal(Id) {
      const res = await dealWithException({ Id })
      if (res.Success) {
        this.msgSuccess(res.Msg)
        this.handleQuery()
      } else {
        this.msgError(res.Msg)
      }
    },
  },
}
</script>
