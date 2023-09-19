<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="工号" prop="UserCode">
        <el-input v-model="queryParams.Search.UserCode" :placeholder="$t('MOM_InputPlease')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- 用户名称 -->
      <el-form-item :label="$t('system_username')" prop="RealName">
        <!-- placeholder="请输入用户名称" -->
        <el-input v-model="queryParams.Search.RealName" :placeholder="$t('system_input_username')" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <base-table :cutheight="100" :columns="columns" :list="list" :options="options" v-loading="loading"> </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
  </div>
</template>

<script>
import { getList, forceLogout } from '@/api/monitor/online'

export default {
  name: 'Online',
  data() {
    return {
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
          ipaddr: undefined,
          userName: undefined,
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
        {
          title: this.$tl('DepartName', '部门'),
          dataIndex: 'DepartName',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('DefaultOrgName', '工厂名称'),
          dataIndex: 'DefaultOrgName',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('DefaultOrgCode', 'OrgCode'),
          dataIndex: 'DefaultOrgCode',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('FactoryCode', '工厂代码'),
          dataIndex: 'FactoryCode',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('LoginTime', '登录时间'),
          dataIndex: 'LoginTime',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('LoginIp', '登录IP'),
          dataIndex: 'LoginIp',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$tl('ExpiresTime', '过期时间'),
          dataIndex: 'ExpiresTime',
          width: '140px',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
      ],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询登录日志列表 */
    async getList() {
      this.loading = true
      const res = await getList(this.queryParams)
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
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.Search = {}
      this.handleQuery()
    },
    /** 强退按钮操作 */
    handleForceLogout(row) {
      this.$confirm(this.$t('sc_msg5', { userName: row.userName }), this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return forceLogout(row.tokenId)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$t('usual_operation_success'))
        })
        .catch(() => {})
    },
  },
}
</script>
