<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true" v-show="showSearch" @submit.native.prevent>
      <el-form-item :label="$tl('system_appName', 'App名称')" prop="appName">
        <el-input size="small" v-model.trim="queryParam.appName" :placeholder="$t('MOM_InputPlease')" clearable style="width: 180px" :maxlength="500" @keyup.enter.native="getListData" />
      </el-form-item>
      <el-form-item :label="$tl('system_version', '版本号')" prop="version">
        <el-input size="small" v-model.trim="queryParam.version" :placeholder="$t('MOM_InputPlease')" clearable style="width: 180px" :maxlength="500" @keyup.enter.native="getListData" />
      </el-form-item>
      <el-form-item :label="$tl('system_title', '标题')" prop="title">
        <el-input size="small" v-model.trim="queryParam.title" :placeholder="$t('MOM_InputPlease')" clearable style="width: 180px" :maxlength="500" @keyup.enter.native="getListData" />
      </el-form-item>
      <el-form-item :label="$tl('sys_content', '内容')" prop="content">
        <el-input size="small" v-model.trim="queryParam.content" :placeholder="$t('MOM_InputPlease')" clearable style="width: 180px" :maxlength="500" @keyup.enter.native="getListData" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="getListData()" :loading="sreaching">{{ $t('usual_search') }}</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="() => this.$refs.queryForm.resetFields()">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:version:developer']">{{ $tl('MMS_New') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:version:developer']" type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">{{ $tl('usual_delete') }}</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getListData"></right-toolbar>
    </el-row>

    <base-table :columns="columns" :list="listData" :options="options" :height="$table.FullViewHeight(150)" @handleSelectionChange="handleSelectionChange">
      <template slot="IsDefault" slot-scope="scope">
        <el-switch
          v-model="scope.row.IsDefault"
          active-color="#13ce66"
          inactive-color="#ff4949"
          v-hasPermi="['system:version:developer']"
          :active-value="true"
          :inactive-value="false"
          @change="changeFn($event, scope.row)"
        ></el-switch>
      </template>
      <template slot="action">
        <table-column prop="action" fixed="right" width="100" :label="$t('usual_operation')" min-width="100">
          <template slot-scope="scope">
            <el-button v-hasPermi="['system:file:download']" @click="handleDowload(scope.row.Url)" type="text" size="small">
              {{ $t('usual_download') }}
              <!-- 下载按钮 -->
            </el-button>
            <el-button v-hasPermi="['system:version:developer']" @click="handleDelete(scope.row)" type="text" size="small">
              {{ $tl('usual_delete') }}
              <!-- 删除按钮 -->
            </el-button>
          </template>
        </table-column>
      </template>
    </base-table>
    <!--新增-->
    <el-dialog v-dialogDrag :title="$tl('usual_add', '新增')" width="400px" :visible="visible" :before-close="handleCancel" @close="visible = false" :close-on-click-modal="false" append-to-body>
      <el-form ref="dataFormRef" :model="dataForm" size="small" label-width="110px" :rules="rules">
        <el-form-item :label="$tl('system_appName', 'App名称')" prop="appId">
          <el-select v-model="dataForm.appId" :placeholder="$t('usual_choose')" clearable style="width: 180px">
            <el-option :label="ele.AppName" :value="ele.Id" v-for="ele in AppList" :key="ele.Id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$tl('system_title', '标题')" prop="title">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.title"></el-input>
        </el-form-item>
        <el-form-item :label="$tl('sys_content', '内容')" prop="content">
          <el-input type="textarea" :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.content"></el-input>
        </el-form-item>
        <el-form-item :label="$tl('system_version', '版本号')" prop="version">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" onkeyup="value=value.replace(/[^0-9.]/g,'')" style="width: 180px" v-model.trim="dataForm.version"></el-input>
        </el-form-item>
        <el-form-item :label="$t('mil_enclosure')">
          <el-upload action="no" :before-upload="beforeUpload" :http-request="uploadOk" :on-change="fileChange" :show-file-list="false">
            <el-button type="primary">{{ $t('MOM_Upload') }}</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button size="mini" @click="handleCancel()">{{ $t('usual_cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="handleOk()" :loading="submitLoading">{{ $t('usual_confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getVersionListApi, addVersion, setDefaultVersion, uninstallDefaultVersion, delVersion } from '@/api/system/version'
import { getAppListApi } from '@/api/system/application'
export default {
  name: 'Version',
  data() {
    return {
      AppList: [],
      multiple: false,
      visible: false,
      submitLoading: false,
      dataForm: {
        file: '',
        appId: '',
        version: '',
        title: '',
        content: '',
      },
      rules: {
        file: [
          {
            required: true,
            message: this.$tl('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
        appId: [
          {
            required: true,
            message: this.$tl('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
        version: [
          {
            required: true,
            message: this.$tl('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
      },
      sreaching: false,
      designTableName: '',
      tableDesignVisible: false,
      showSearch: true,
      queryParam: {
        appName: '',
        version: '',
        title: '',
        content: '',
      },
      listData: [],
      downing: false,
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
      },
      file: null,
      ids: [],
      options: {
        showNum: false, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      columns: [
        { title: 'AppID', dataIndex: 'AppId', width: '160px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('system_appName', 'App名称'), dataIndex: 'AppName', width: '100px', sortable: true, ellipsis: true },
        { title: this.$tl('system_version', '版本号'), dataIndex: 'Version', type: '3', width: '100px', sortable: true, ellipsis: true },
        { title: this.$tl('system_title', '标题'), dataIndex: 'Title', width: '120px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('sys_content', '内容'), dataIndex: 'Content', width: '160px', sortable: true, ellipsis: true },
        { title: this.$tl('mil_file_name', '文件名称'), dataIndex: 'PackageName', width: '160px', sortable: true, ellipsis: true },
        { title: this.$tl('system_isDefault', '是否默认'), dataIndex: 'IsDefault', width: '120px', type: '3', sortable: true, slots: true },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '160px', sortable: true },
        { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName', width: '100px', sortable: true },
      ],
      designList: [],
    }
  },
  created() {
    this.getAppListFn()
  },
  methods: {
    //下载
    async handleDowload(url) {
      if (!url) return
      const elemIF = document.createElement('iframe')
      elemIF.src = url
      elemIF.style.display = 'none'
      document.body.appendChild(elemIF)
    },
    // 修改状态可用、不可用
    async changeFn(val, rowData) {
      this.loading = true
      console.log(rowData.IsDefault)
      const res = rowData.IsDefault ? await setDefaultVersion(rowData.Id) : await uninstallDefaultVersion(rowData.AppId)
      if (res.Success) {
        await this.getListData()
        this.submiting = true
        this.msgSuccess(this.$t('usual_operation_success'))
      } else {
        this.msgError(res.Msg)
      }
      this.loading = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      // this.single = selection.length != 1;
      this.multiple = !selection.length
    },
    handleAdd() {
      // this.submitLoading=true
      this.visible = true
    },
    async getListData() {
      this.options.loading = true
      const res = await getVersionListApi(this.queryParam)
      this.options.loading = false
      this.listData = res.Data || []
    },
    //删除
    handleDelete(row) {
      let Ids = []
      if (row.Id) {
        Ids = [row.Id]
      } else {
        Ids = this.ids
      }
      this.$confirm(this.$tl('iqc_sure_forever_del'), this.$tl('usual_warning'), {
        confirmButtonText: this.$tl('usual_confirm'),
        cancelButtonText: this.$tl('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delVersion(Ids)
        })
        .then(response => {
          if (response.Success) {
            this.getListData()
            this.msgSuccess(this.$tl('IQC_DeleteSuccess'))
          } else {
            this.msgError(response.Msg)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$tl('usual_cancel_success'),
          })
        })
    },
    handleOk() {
      this.$refs.dataFormRef.validate(async valid => {
        if (valid) {
          if (!this.dataForm.file) {
            this.msgError('请上传文件')
            return
          }
          this.submitLoading = true
          const res = await addVersion(this.dataForm)
          if (res.Success) {
            this.msgSuccess(this.$t('MOM_SaveSuccess'))
            await this.getListData()
            this.visible = false
          } else {
            this.msgError(res.Msg)
          }
          this.submitLoading = false
        }
      })
    },
    async getAppListFn() {
      const res = await getAppListApi({})
      this.AppList = res.Data || []
    },
    handleCancel() {
      this.$refs.dataFormRef.clearValidate()
      this.visible = false
    },
    uploadOk(response, file) {
      this.dataForm.file = response.file
    },
    beforeUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 100
      if (!isLt2M) {
        this.$message({ message: this.$t('MOM_UploadFileLimit'), type: 'warning' })
      }

      return isLt2M
    },
    fileChange(file) {
      if (file.status == 'ready') {
        this.msgSuccess(`${file.name} ${this.$t('MOM_UploadSuccess')}！`)
      } else {
        this.msgError(this.$t('MOM_UploadFail'))
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
