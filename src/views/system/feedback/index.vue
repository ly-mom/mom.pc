<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item :label="$tl('system_factory', '厂区')" prop="OrgName">
        <el-input
          v-model="queryParams.Search.OrgName"
          :placeholder="$tl('usual_please_input', '请输入', { text: $tl('system_factory', '厂区') })"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$tl('sys_feedbackName', '反馈人')" prop="CreatorName">
        <el-input
          v-model="queryParams.Search.CreatorName"
          :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_content', '内容') })"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$tl('sys_content', '内容')" prop="Content">
        <el-input
          v-model="queryParams.Search.Content"
          :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_content', '内容') })"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-hasPermi="['home:delete']">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">{{ $t('usual_delete') }}</el-button>
        <!-- 批量删除的按钮 -->
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <base-table
      :columns="columns"
      :list="tableList"
      :options="options"
      :operates="obj"
      @sort-change="$table.sortChange($event, orgList)"
      v-loading="loading"
      @handleSelectionChange="handleSelectionChange"
    >
      <template slot="action">
        <table-column fixed="right" :label="$t('usual_operation')" min-width="110px">
          <template slot-scope="scope">
            <el-button @click="handleView(scope.row.Id)" type="text" size="small">
              {{ $tl('usual_detail', '查看') }}
              <!-- 查看按钮 -->
            </el-button>
            <el-button @click="viewReport([scope.row])" type="text" size="small">
              {{ $tl('MMS_DownloadReport', '下载报告') }}
              <!-- 下载报告按钮 -->
            </el-button>
          </template>
        </table-column>
      </template>
      <!-- 是否有报告 -->
      <template slot="FileKey" slot-scope="scope">
        <span v-if="scope.row.FileKey ? true : false">
          <el-tag size="medium" type="success">{{ $t('usual_yes') }}</el-tag>
        </span>
        <span v-else>
          <el-tag size="medium" type="danger">{{ $t('usual_no') }}</el-tag>
        </span>
      </template>
    </base-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @pagination="getList" />
    <detail ref="detail" />
  </div>
</template>

<script>
import { listFeedback, deleteFeedback } from '@/api/system/feedback'
import { downloadFile } from '@/api/base'
import { createFileDownload, blobPDFPrintFn } from '@/utils/util'
import detail from './detail'

export default {
  name: 'Feedback',
  components: {
    detail,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 公告表格数据
      tableList: [],
      // 查询参数
      queryParams: {
        Search: {
          Content: '', //内容
          CreatorName: '',
          OrgName: '',
        },
        pageNum: 1,
        pageSize: 100,
      },
      columns: [
        { title: this.$tl('system_factory', '厂区'), dataIndex: 'OrgName', width: '200px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('sys_content', '内容'), dataIndex: 'Content', width: '220px', type: '3', sortable: true },
        { title: this.$tl('sys_feedbackId', '反馈人工号'), dataIndex: 'CreatorId', width: '130px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('sys_feedbackName', '反馈人姓名'), dataIndex: 'CreatorName', width: '130px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('sys_feedbackTime', '反馈时间'), dataIndex: 'CreateTime', width: '130px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('IQC_ExistsReport', '是否有报告'), dataIndex: 'FileKey', width: '90px', type: '3', sortable: true, ellipsis: true, slots: true },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      obj: {},
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    async getList() {
      this.loading = true
      const res = await listFeedback(this.queryParams)
      this.loading = false
      if (res.Success) {
        this.tableList = res.Data.PageList || []
        this.total = res.Data.Total
      } else {
        this.msgError(res.Msg)
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        Search: {},
      }
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    /** 查看按钮操作 */
    async handleView(Id) {
      this.$refs.detail.init(Id)
    },
    async viewReport(row) {
      //查看报告
      const Id = row[0].FileKey
      if (Id) {
        const res = await downloadFile(Id)
        if (res) {
          createFileDownload(res)
        } else {
          this.msgError(res.Data)
        }
      } else {
        this.msgError(this.$t('IQC_NoReport'))
      }
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
          return deleteFeedback(Ids)
        })
        .then(response => {
          if (response.Success) {
            this.getList()
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)

      // this.single = selection.length != 1;
      this.multiple = !selection.length
    },
  },
}
</script>
