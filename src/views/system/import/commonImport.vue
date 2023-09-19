<template>
  <div class="app-container">
    <div ref="searchBox" v-show="showSearch">
      <el-form inline ref="queryForm" :model="queryParam" :label-width="'50px'" @keyup.native.enter="getMemberList" @submit.native.prevent>
        <el-form-item :label="$tl('base_service', '服务')" prop="Service" :rules="[{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }]">
          <RequestService v-model="queryParam.Service"></RequestService>
        </el-form-item>
        <el-form-item :label="$t('base_name')" prop="Name">
          <el-input size="small" v-model.trim="queryParam.Name" :placeholder="$t('MOM_InputPlease')" clearable style="width: 180px" :maxlength="500" @keyup.enter.native="getListData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" icon="el-icon-search" @click="getListData()" :loading="sreaching">{{ $t('usual_search') }}</el-button>
          <el-button size="mini" icon="el-icon-refresh" @click="() => this.$refs.queryForm.resetFields()">{{ $t('usual_reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" plain :loading="exporting" @click="exportData">{{ $tl('usual_export_table', '导出表结构') }}</el-button>
      </el-col>
      <right-toolbar @queryTable="getListData" :showSearch="showSearch"></right-toolbar>
    </el-row>
    <base-table :columns="columns" :list="listData" :options="options" @handleSelectionChange="handleSelectionChange" :height="$table.FullViewHeight(150)">
      <template slot="action">
        <table-column prop="action" fixed="right" width="220" :label="$t('usual_operation')" min-width="220">
          <template slot-scope="scope">
            <el-button @click="downTemplate(scope.row)" icon="el-icon-download" type="text" size="mini" :loading="downing">{{ $t('dataM_downloadModule') }} </el-button>
            <el-button @click="showDesign(scope.row)" icon="el-icon-info" type="text" size="mini">{{ $tl('sys_tableDesign', '表设计') }} </el-button>
            <el-button @click="handleImport(scope.row)" icon="el-icon-upload" type="text" size="mini">{{ $tl('usual_import', '导入') }} </el-button>
          </template>
        </table-column>
      </template>
    </base-table>
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="upload.title + $tl('usual_import', '导入')" :visible="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" action="no" :http-request="handleFileSuccess" :on-remove="handleUploadRemove" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{ $t('dataM_DownloadDesc') }}<em>{{ $t('MOM_Upload') }}</em>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="importData">{{ $t('usual_confirm') }}</el-button>
        <el-button size="small" @click="closeUpload">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="designTableName + $tl('sys_tableDesign', '表设计')" :visible="tableDesignVisible" width="60%" append-to-body>
      <base-table :columns="designListColumns" :list="designList" :options="Object.assign(JSON.parse(JSON.stringify(options)), { autoHeight: true, mutiSelect: false })"> </base-table>
    </el-dialog>
  </div>
</template>

<script>
import { getSysTableList, downSysTableImportTemp, importSysTableImportTemp, getTableInfo, exportTableInfo } from '@/api/base'
import { createFileDownload } from '@/utils/util'
import RequestService from '@/components/RequestService'
export default {
  name: 'ComonImport',
  components: {
    RequestService,
  },
  data() {
    return {
      sreaching: false,
      designTableName: '',
      tableDesignVisible: false,
      exporting: false,
      showSearch: true,
      queryParam: {
        Name: undefined,
      },
      multipleSelection: [],
      listData: [],
      SeiviceOptions: ['Base', 'Quality', 'WMS', 'SDManage', 'BI', 'Interface'],
      downing: false,
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
      },
      file: null,
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      columns: [
        {
          title: this.$t('base_name'),
          dataIndex: 'Name',
          ellipsis: true,
          type: '3',
          align: 'left',
          sortable: true,
        },
        {
          title: this.$tl('sys_tableOrView', '数据表/视图'),
          dataIndex: 'DbObjectType',
          ellipsis: true,
          sortable: true,
          render: (h, params) => h('span', params.row.DbObjectType == 0 ? this.$tl('sys_table', '数据表') : this.$tl('sys_view', '视图')),
        },
        {
          title: this.$tl('sys_Description', '描述'),
          dataIndex: 'Description',
          ellipsis: true,
          type: '3',
          sortable: true,
        },
      ],
      designListColumns: [
        {
          title: this.$tl('sys_DbColumnName', '字段名'),
          dataIndex: 'DbColumnName',
          ellipsis: true,
          width: '120px',
        },
        {
          title: this.$tl('sys_DataType', '类型'),
          dataIndex: 'DataType',
          ellipsis: true,
        },
        {
          title: this.$tl('sys_Length', '长度'),
          dataIndex: 'Length',
          ellipsis: true,
        },
        {
          title: this.$tl('sys_DecimalDigits', '小数点'),
          dataIndex: 'DecimalDigits',
          ellipsis: true,
        },
        {
          title: this.$tl('sys_IsNullable', '不可为null'),
          dataIndex: 'IsNullable',
          ellipsis: true,
          render: (h, params) => h('el-checkbox', { props: { value: params.row.IsPrimarykey, disabled: true } }),
        },
        {
          title: this.$tl('sys_IsPrimarykey', '是否主键'),
          dataIndex: 'IsPrimarykey',
          ellipsis: true,
          center: true,
          render: (h, params) => h('el-checkbox', { props: { value: params.row.IsPrimarykey, disabled: true } }),
        },
        {
          title: this.$tl('sys_DefaultValue', '默认'),
          dataIndex: 'DefaultValue',
          ellipsis: true,
          width: '180px',
        },
        {
          title: this.$tl('sys_ColumnDescription', '注释'),
          dataIndex: 'ColumnDescription',
          ellipsis: true,
          width: '120px',
        },
      ],
      designList: [],
    }
  },
  mounted() {
    // this.getListData();
  },
  methods: {
    async getListData() {
      this.$refs.queryForm.validate(async valid => {
        if (valid) {
          this.options.loading = true
          const res = await getSysTableList(this.queryParam)
          this.options.loading = false
          this.listData = res.Data || []
        }
      })
    },
    async downTemplate(data) {
      if (!data.Name) return
      this.$refs.queryForm.validate(async valid => {
        if (valid) {
          this.downing = true
          const res = await downSysTableImportTemp({
            tablename: data.Name,
            Service: this.queryParam.Service,
          })
          this.downing = false
          if (res) {
            createFileDownload(res)
          } else {
            this.msgError(res.Msg)
          }
        } else {
          this.msgError(this.$tl('base_chose_seivice', '请选择服务模块'))
        }
      })
    },
    async importData() {
      if (!this.file) return this.msgError(this.$tl('sys_choice_file', '请选择文件'))
      this.options.loading = true
      const res = await importSysTableImportTemp({ file: this.file, Service: this.queryParam.Service }, this.upload.title)
      this.options.loading = false
      if (res.Success) {
        this.file = null
        this.msgSuccess(this.$t('usual_operation_success'))
        this.upload.open = false
        this.$refs.upload.clearFiles()
      } else {
        this.msgError(res.Msg)
      }
    },
    handleImport(row) {
      this.$refs.queryForm.validate(async valid => {
        if (valid) {
          this.upload.title = row.Name
          this.upload.open = true
        } else {
          this.msgError(this.$tl('base_chose_seivice', '请选择服务模块'))
        }
      })
    },
    // 文件上传成功处理
    handleFileSuccess(response) {
      this.file = response.file
    },
    handleUploadRemove(file) {
      this.file = null
    },
    closeUpload() {
      this.$refs.upload.clearFiles()
      this.upload.open = false
    },
    async showDesign(row) {
      const data = {
        tablename: row.Name,
      }
      this.designTableName = row.Name
      const res = await getTableInfo(data)
      if (res.Success) {
        this.designList = res.Data || []
        this.tableDesignVisible = true
      } else {
        this.msgError(res.Msg)
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 导出表结构
    async exportData() {
      const data = this.multipleSelection.map(e => e.Name) || []
      this.exporting = true
      const res = await exportTableInfo(data)
      this.exporting = false
      if (res) {
        createFileDownload(res)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep .el-checkbox__input.is-disabled .el-checkbox__inner {
  border-color: #333333;
}
::v-deep .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #333333;
}
</style>
