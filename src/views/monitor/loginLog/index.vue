<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="工号" prop="UserCode">
        <el-input v-model="queryParams.Search.UserCode" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- 用户名称 -->
      <el-form-item :label="$t('system_username')" prop="RealName">
        <!-- placeholder="请输入用户名称" -->
        <el-input v-model="queryParams.Search.RealName" :placeholder="$t('system_input_username')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$tl('system_loginIp', '登录IP')" prop="LoginIp">
        <el-input v-model="queryParams.Search.LoginIp" :placeholder="$tl('system_loginIp', '登录IP')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$tl('system_userAgent', 'UA')" prop="UserAgent">
        <el-input v-model="queryParams.Search.UserAgent" :placeholder="$tl('system_userAgent', 'UA')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch="showSearch" @queryTable="getLogList"></right-toolbar>
    </el-row>
    <base-table :cutheight="140" :columns="columns" :list="list" :options="options" v-loading="loading"> </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getLogList" />
  </div>
</template>

<script>
import { getLoginLogList } from '@/api/monitor/server'

export default {
  name: 'LoginLog',
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
        Search: {
          UserCode: undefined,
          RealName: undefined,
          LoginIp: undefined,
          UserAgent: undefined,
        },
      },
      columns: [
        {
          title: this.$t('system_username'),
          dataIndex: 'RealName',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
          fixed: 'left',
        },
        {
          title: this.$t('system_user_id'),
          dataIndex: 'UserCode',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        /* {
          title: this.$tl("system_sessionId",'SessionId'),
          dataIndex: "SessionId",
          width: "140px",
          type: "3",
          sortable: true,
          ellipsis: true,
        }, */
        {
          title: this.$tl('loginlog_loginIp', '登录IP'),
          dataIndex: 'LoginIp',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('loginTime', '登录时间'),
          dataIndex: 'LoginTime',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        /* {
          title: this.$tl("platForm",'平台'),
          dataIndex: "PlatForm",
          width: "140px",
          type: "3",
          sortable: true,
          ellipsis: true,
        }, */
        {
          title: this.$tl('userAgent', '浏览器标识'),
          dataIndex: 'UserAgent',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        // { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: "180px", type:'3',sortable: true},
        // { title: this.$t('usual_creation'), dataIndex: 'CreatorId', width: "150px", type:'3',sortable: true},
        // { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName',width: "150px" , type:'3',sortable: true},
      ],
    }
  },
  created() {
    this.getLogList()
  },
  methods: {
    /** 查询登录日志列表 */
    async getLogList() {
      this.loading = true
      const res = await getLoginLogList(this.queryParams)
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
  },
}
</script>
