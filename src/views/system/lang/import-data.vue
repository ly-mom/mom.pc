<template>
  <!-- 导入 -->
  <div class="app-container calendar-list-container">
    <el-form inline ref="queryForm" size="small" :model="listQuery.Search" v-show="showSearch">
      <el-form-item :label="$t('mil_file_name')" prop="Pro">
        <el-input v-model.trim="listQuery.Search.FileName" style="width: 180px" size="small" clearable :placeholder="$t('MOM_InputPlease')" @keyup.enter.native="getDataList" />
      </el-form-item>
      <el-form-item label=" ">
        <el-button type="primary" icon="el-icon-search" size="mini" :loading="loading" @click="getDataList">{{ $t('usual_search') }}</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="UploadTemplate">下载模板 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport">数据上传 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-circle-check" size="mini" @click="validateData">数据验证 </el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getDataList"></right-toolbar>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div>
          <base-table :columns="columns" :list="list" v-loading="loading" :loading="loading" :options="options" :operates="obj"></base-table>
          <div class="pagination-container">
            <pagination v-show="total > 0" :total="total" :page="listQuery.PageIndex" :limit="listQuery.PageRows" @pagination="getDataList" />
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 用户导入对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="upload.title" :visible="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{ $t('dataM_DownloadDesc') }}<em>{{ $t('MOM_Upload') }}</em>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="upload.open = false">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getToken } from '@/utils/auth'
import { downloadTemplate } from '@/utils/util'
import { VerifyUploadLanguageApi, ImportLanguageApi, GetUploadFilesLogApi } from '@/api/system/lang'

export default {
  name: 'import-data',
  data() {
    return {
      loading: false,
      columns: [
        { title: 'ID', dataIndex: 'Id', sortable: true },
        { title: '文件', dataIndex: 'FileName', sortable: true },
        { title: '导入时间', dataIndex: 'CreateTime', sortable: true },
        { title: '操作者', dataIndex: 'CreatorName', sortable: true },
      ],
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/Base/Language/Upload',
      },
      list: [], // table数据
      showSearch: true,
      listQuery: {
        PageIndex: 1,
        PageRows: 100,
        // this.$store.state.user.userCode || undefined,
        Search: {
          UserCode: '',
          RealName: '',
          FileName: '',
        },
      },
      total: 0,
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: false, // 是否支持列表项选中功能
      }, // table 的参数
      obj: {},
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      if (response.Success) {
        this.upload.open = false
        this.$alert(response.Msg, '导入结果', { dangerouslyUseHTMLString: true })
      } else {
        this.msgError(response.Msg)
      }
    },
    UploadTemplate() {
      // window.location.href = process.env.VUE_APP_DOWNLOAD_API  + '/Templates/多语言维护模板.xls'
      downloadTemplate('多语言维护模板')
    },
    // 校验数据
    async validateData() {
      // 先校验
      const res = await VerifyUploadLanguageApi()
      if (res.Success) {
        // 确认导入
        const res2 = await ImportLanguageApi()
        if (res2.Success) {
          this.msgSuccess('校验成功')
        } else {
          this.msgError(res2.Msg)
        }
      } else {
        this.msgError(res.Msg)
      }
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    getDataList() {
      this.loading = true
      GetUploadFilesLogApi(this.listQuery).then(response => {
        if (response.Success) {
          this.loading = false
          this.list = response.Data.PageList
          this.total = response.Data.Total
        }
      })
    },
  },
}
</script>
