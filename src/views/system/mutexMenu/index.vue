<template>
  <div class="app-container">
    <el-form inline ref="queryForm" :model="queryParams.Search" v-show="showSearch">
      <el-form-item :label="$tl('sys_mutexMenu_sourceMenuName', '当遇到 →')" prop="sourceMenuName">
        <el-input v-model="queryParams.Search.sourceMenuName" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$tl('sys_mutexMenu_mutexMenuName', '隐藏 →')" prop="mutexMenuName">
        <el-input v-model="queryParams.Search.mutexMenuName" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" :loading="loading">{{ $t('usual_search') }}</el-button>
        <!-- 查询按钮 -->
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="
            () => {
              this.$refs.queryForm.resetFields()
              this.getDataList()
            }
          "
          >{{ $t('usual_reset') }}</el-button
        >
        <!-- 查询条件重置按钮 -->
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-hasPermi="['system:mutexMenu:add']">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="hanldleAdd">{{ $t('MMS_New') }}</el-button>
        <!-- 新建按钮 -->
      </el-col>
      <el-col :span="1.5" v-hasPermi="['system:mutexMenu:delete']">
        <el-button type="danger" plain :loading="deleteing" icon="el-icon-delete" size="mini" :disabled="multipleSelection.length == 0" @click="handleDelete(multipleSelection)">{{
          $t('usual_delete')
        }}</el-button>
      </el-col>
      <el-col :span="1.5" v-hasPermi="['system:mutexMenu:cancel']">
        <el-button type="warning" plain icon="el-icon-circle-close" size="mini" :loading="canceling" :disabled="multipleSelection.length != 1" @click="handleCancel(multipleSelection)">{{
          $t('usual_cancel')
        }}</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getDataList"></right-toolbar>
    </el-row>
    <base-table :columns="columns" :list="data" :options="options" @handleSelectionChange="handleSelectionChange">
      <template slot="action">
        <table-column prop="action" :label="$t('usual_operation')" min-width="70px" fixed="right">
          <template slot-scope="scope">
            <el-button @click="handleDelete([scope.row])" type="text" size="small" v-hasPermi="['system:mutexMenu:delete']">
              {{ $t('usual_delete') }}
              <!-- 删除按钮 -->
            </el-button>
          </template>
        </table-column>
      </template>
    </base-table>
    <pagination :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getDataList"> </pagination>
    <edit-form ref="editForm" :parentObj="this"></edit-form>
  </div>
</template>

<script>
import { getMutexList, deleteMutexList, cancelMutexList } from '@/api/system/menu'
import EditForm from './EditForm'

export default {
  name: 'MutexMenu',
  components: {
    EditForm,
  },
  data() {
    return {
      showSearch: true,
      sreaching: false,
      canceling: false,
      deleteing: false,
      total: 0,
      data: [],
      loading: false,
      columns: [
        {
          title: this.$tl('sys_SourceMenuName', '当遇到 ↓'),
          dataIndex: 'SourceMenuName',
          width: '160px',
          type: '1',
          sortable: true,
        },
        {
          title: this.$tl('sys_MutexMenuName', '隐藏 ↓'),
          dataIndex: 'MutexMenuName',
          width: '160px',
          sortable: true,
          type: '1',
        },
        {
          title: this.$t('usual_create_time'),
          dataIndex: 'CreateTime',
          width: '180px',
          sortable: true,
        },
        {
          title: this.$t('usual_creation'),
          dataIndex: 'CreatorId',
          width: '140px',
          sortable: true,
          type: '1',
        },
        {
          title: this.$t('usual_creation_name'),
          dataIndex: 'CreatorName',
          width: '140px',
          sortable: true,
          type: '1',
        },
        {
          title: this.$t('usual_update_time'),
          dataIndex: 'UpdateTime',
          width: '160px',
          sortable: true,
        },
        {
          title: this.$t('usual_updator'),
          dataIndex: 'UpdaterId',
          width: '140px',
          sortable: true,
          type: '1',
        },
        {
          title: this.$t('usual_update_name'),
          dataIndex: 'UpdaterName',
          sortable: true,
          type: '1',
        },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      multipleSelection: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          Name: undefined,
        },
      },
    }
  },
  methods: {
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getDataList()
    },
    async getDataList() {
      this.loading = true
      this.options.loading = true
      const resJson = await getMutexList(this.queryParams)
      this.loading = false
      this.options.loading = false
      if (resJson.Success) {
        this.data = resJson.Data.PageList || []
        this.total = resJson.Data.Total || 0
      }
    },
    hanldleAdd() {
      this.$refs.editForm.openForm()
    },
    handleEdit(id) {
      this.$refs.editForm.openForm(id, this.$t('usual_update'))
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => item)
    },
    handleDelete(itemList) {
      this.$confirm(this.$t('iqc_sure_forever_del'), this.$t('usual_warning'), {
        type: 'warning',
      })
        .then(async () => {
          this.deleteing = true
          const ids = itemList.map(e => e.Id)
          const res = await deleteMutexList(ids)
          this.deleteing = false
          if (res.Success) {
            this.msgSuccess(this.$t('usual_operation_success'))
            this.getDataList()
          } else {
            this.msgError(res.Msg)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('usual_cancel_success'),
          })
        })
    },
    handleCancel(itemList) {
      const element = itemList[0]
      this.$confirm(this.$tl('sys_mutexMenu_cancel', `确认取消菜单：（${element.SourceMenuName}）的所有配对菜单？`, element), this.$t('usual_warning'), {
        type: 'warning',
      })
        .then(async () => {
          this.canceling = true
          const res = await cancelMutexList(element.SourceMenuId)
          this.canceling = false
          if (res.Success) {
            this.msgSuccess(this.$t('usual_operation_success'))
            this.getDataList()
          } else {
            this.msgError(res.Msg)
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
