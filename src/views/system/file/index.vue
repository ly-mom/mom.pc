<template>
  <div class="app-container">
    <el-col :span="24" :xs="24">
      <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch">
        <el-form-item label="文件名">
          <el-input v-model.trim="queryParams.Search.FileName" style="width: 180px" size="small" clearable :placeholder="$t('MOM_InputPlease')" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <!-- <el-form-item label="文件路径">
          <el-input
            v-model.trim="queryParams.Search.Url"
            style="width: 180px"
            size="small"
            clearable
            :placeholder="$t('MOM_InputPlease')"
          />
        </el-form-item> -->
        <el-form-item label="标题">
          <el-input v-model.trim="queryParams.Search.Title" style="width: 180px" size="small" clearable :placeholder="$t('MOM_InputPlease')" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="queryParams.Search.Tags" size="small" :placeholder="$t('usual_choose')" clearable multiple :multiple-limit="1" style="width: 100%">
            <el-option v-for="dict in tagOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" :loading="loading" @click="handleQuery">{{ $t('usual_search') }}</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
        </el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5" v-hasPermi="['system:file:add']">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="hanldleAdd">{{ $t('MMS_New') }}</el-button>
          <!-- 新建按钮 -->
        </el-col>
        <el-col :span="1.5" v-hasPermi="['system:file:edit']">
          <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="multipleSelection.length != 1" @click="handleUpdate(multipleSelection[0])">{{ $t('usual_update') }}</el-button>
        </el-col>
        <el-col :span="1.5" v-hasPermi="['system:file:deleted']">
          <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multipleSelection.length == 0" @click="handleDelete()">{{ $t('usual_delete') }}</el-button>
        </el-col>
        <el-col :span="1.5" v-hasPermi="['system:file:deletedById']">
          <el-button type="warning" plain icon="el-icon-delete" size="mini" @click="showDeleteFile()">{{ $tl('sys_file_deleteFileById', '根据ID删除文件') }}</el-button>
        </el-col>
        <right-toolbar :showSearch="showSearch" @queryTable="getDataList"></right-toolbar>
      </el-row>
      <base-table :columns="columns" :list="itemList" :options="options" v-loading="loading" @handleSelectionChange="handleSelectionChange">
        <template slot="action">
          <table-column prop="action" fixed="right" width="120" :label="$t('usual_operation')">
            <template slot-scope="scope">
              <el-button v-hasPermi="['system:file:edit']" @click="handleUpdate(scope.row)" type="text" size="small"
                >{{ $t('usual_update') }}
                <!-- 编辑按钮 -->
              </el-button>
              <el-button v-hasPermi="['system:file:deleted']" @click="handleDelete(scope.row.Id)" type="text" size="small">
                {{ $t('usual_delete') }}
                <!-- 删除按钮 -->
              </el-button>
              <el-button v-hasPermi="['system:file:download']" @click="handleDowload(scope.row.Url)" type="text" size="small">
                {{ $t('usual_download') }}
                <!-- 下载按钮 -->
              </el-button>
            </template>
          </table-column>
        </template>
      </base-table>
      <pagination :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getDataList" />
    </el-col>
    <el-dialog width="700px" :visible="visible" v-dialogDrag :show-close="false" :close-on-click-modal="false">
      <div slot="title" class="dialogTitle">
        <div>{{ title }}</div>
        <div>
          <i @click="visible = false" class="el-icon-remove-outline pointer mr10"></i>
          <i @click="handleClose" class="el-icon-circle-close pointer"></i>
        </div>
      </div>
      <el-form ref="form" :model="entity" size="small" :rules="rules" label-width="110px">
        <el-row>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_fileSize', '文件大小')">
              <el-radio-group v-model="FileSize" size="mini">
                <el-radio label="bigSize">大文件(大于等于100M)</el-radio>
                <el-radio label="normalSize">小文件(小于100M)</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_uploadType', '上传类型')">
              <el-cascader
                v-model="FileSize"
                :options="FileTypeOptions"
                style="width: 100%"
                @change="FileTypeChange"
                clearable
              >
              </el-cascader>
            </el-form-item>
          </el-col> -->
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_uploadFile', '上传文件')">
              <LargerFileUpload ref="LargerFileUpload" v-if="FileSize && FileSize.includes('bigSize')" :disabled="FileSize && FileSize.length == 0" @uploadSuccess="uploadSuccess"></LargerFileUpload>
              <el-upload
                v-else
                size="mini"
                :disabled="FileSize && FileSize.length == 0"
                name="file"
                :before-upload="beforeUpload"
                :on-change="handleUploadChange"
                :on-remove="handleUploadRemove"
                ref="upload"
                :limit="1"
                :headers="upload.headers"
                :action="upload.action"
              >
                <el-button type="primary" size="mini" :disabled="FileSize && FileSize.length == 0" style="margin-left: 10px">
                  {{ $t('MOM_Upload') }}
                </el-button>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :md="24" :xs="24" v-if="FileSize == 'normalSize'">
            <el-form-item :label="$tl('sys_file_path', '文件类型/路径')" label-width="140px">
              <span slot="label">
                <el-tooltip placement="top">
                  <div slot="content">
                    选择了文件类型，文件将会上传到对应的文件夹。<br />
                    选择默认，则上传到默认文件夹，与普通上传放同一位置。<br />
                  </div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $tl('sys_file_path', '文件类型/路径') }}
              </span>
              <el-radio-group v-model="FileType" size="mini" @change="FileTypeChange">
                <el-radio v-for="(item, index) in fileTypeList" :key="index" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('mil_file_name', '文件名')" prop="FileName">
              <el-input v-model="entity.FileName" autocomplete="off" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('base_FilePath', '文件路径')" prop="Url">
              <el-input v-model="entity.Url" autocomplete="off" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_title', '标题')" prop="Title">
              <el-input v-model="entity.Title" autocomplete="off" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_sbutitle', '副标题')" prop="Subtitle">
              <el-input v-model="entity.Subtitle" autocomplete="off" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_cover', '封面')" prop="Cover">
              <el-input v-model="entity.Cover" autocomplete="off" clearable />
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_sort', '顺序')" prop="Sort">
              <el-input-number controls-position="right" size="small" v-model.trim="entity.Sort" :min="1" :step="1" :maxLength="500" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_tag', '标签')" prop="Tags">
              <el-select v-model="entity.Tags" :placeholder="$t('usual_choose')" clearable multiple style="width: 100%">
                <el-option v-for="dict in tagOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('sys_Description', '描述')" prop="Description">
              <el-input v-model="entity.Description" autocomplete="off" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$t('usual_status')" prop="Status">
              <el-select v-model="entity.Status" :placeholder="$t('usual_choose')" clearable style="width: 100%">
                <el-option v-for="dict in statusOptions" :key="parseInt(dict.DataValue)" :label="dict.DataText" :value="parseInt(dict.DataValue)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$t('MMS_Remark')" prop="Remark">
              <el-input v-model="entity.Remark" rows="1" type="textarea" autocomplete="off" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="handleClose">{{ $t('usual_cancel') }}</el-button>
        <!-- 取消按钮 -->
        <el-button size="mini" type="primary" @click="handleSubmit">{{ $t('usual_confirm') }}</el-button>
        <!-- 确定按钮 -->
      </div>
    </el-dialog>
    <el-dialog width="700px" :visible="deleteVisible" v-dialogDrag title="删除文件" :close-on-click-modal="false">
      <span class="mr10">{{ $tl('sys_file_deleteFileId', '请输入需要删除的文件ID：') }}</span>
      <el-input style="width: 240px" class="mr10" size="mini" v-model="deleteInput" clearable>
        <template slot="append">
          <BatchInput :value="deleteInput"></BatchInput>
        </template>
      </el-input>
      <el-button size="mini" type="primary" @click="handleDeleteFile">{{ $t('usual_confirm') }}</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="deleteVisible = false">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
    <Suspended></Suspended>
  </div>
</template>

<script>
import { getFilePageList, addFile, editFile, deleteFile } from '@/api/system/fileManage.js'
import { deleteFile as deleteCommonFile, downloadFile } from '@/api/base.js'
import { mapGetters } from 'vuex'
import { disabledStartDate, disabledEndDate } from '@/utils/util'
import LargerFileUpload from '@/components/LargerFileUpload'
import { getToken } from '@/utils/auth'
import _ from 'lodash'
import Suspended from '@/components/LargerFileUpload/suspended.vue'
import { createFileDownload } from '@/utils/util'
import BatchInput from '@/components/BatchInput'

export default {
  name: 'FileManage',
  mounted() {
    this.getDataList()
    this.$store.dispatch('dict/getByDictKeys', ['sys_normal_disable', 'system_file_tag'])
  },
  components: {
    LargerFileUpload,
    Suspended,
    BatchInput,
  },
  computed: {
    ...mapGetters(['dictMap']),
    // 当前字典
    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
    tagOptions() {
      return this.dictMap['system_file_tag'] && this.dictMap['system_file_tag'].items
    },
  },
  data() {
    return {
      showSearch: true,
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      itemList: [],
      multipleSelection: [],
      loading: false,
      visible: false,
      title: '文件管理',
      upload: {
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        action: process.env.VUE_APP_BASE_API + '/Base/File/Upload',
        actionUrl: process.env.VUE_APP_BASE_API + '/Base/File/UploadByForm',
      },
      FileSize: 'normalSize',
      FileType: '',
      entity: {
        Id: '',
        FileName: '',
        FileId: '',
        Url: '',
        Title: '',
        Subtitle: '',
        Cover: '',
        Tags: [],
        Sort: undefined,
        Description: '',
        Status: 0,
        Remark: '',
      },
      rules: {
        FileName: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'blur',
          },
        ],
        Url: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'blur',
          },
        ],
        Title: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'blur',
          },
        ],
      },
      fileTypeList: [
        { value: 'images', label: '图片' },
        { value: 'document', label: '文档' },
        { value: 'template', label: '模板' },
        { value: 'other', label: '其他' },
        { value: '', label: '默认' },
      ],
      FileTypeOptions: [
        {
          value: 'bigSize',
          label: this.$tl('FileTypeOptions_bigSize', '文件大于100M'),
          children: [
            {
              value: 'url',
              label: this.$tl('FileTypeOptions_url', '文件服务器'),
            },
          ],
        },
        {
          value: 'normalSize',
          label: this.$tl('FileTypeOptions_normalSize', '文件小于100M'),
          children: [
            {
              value: 'url',
              label: this.$tl('FileTypeOptions_url', '文件服务器'),
              children: [
                { value: 'images', label: '图片' },
                { value: 'document', label: '文档' },
                { value: 'template', label: '模板' },
                { value: 'other', label: '其他' },
              ],
            },
            {
              value: 'arraybuffer',
              label: this.$tl('FileTypeOptions_arraybuffer', 'MangoDB'),
            },
          ],
        },
      ],
      columns: [
        {
          title: this.$tl('mil_file_name', '文件名'),
          dataIndex: 'FileName',
          width: '160px',
          type: '3',
          ellipsis: true,
          fixed: 'left',
        },
        { title: '文件路径', dataIndex: 'Url', width: '180px', type: '3', ellipsis: true },
        { title: '标题', dataIndex: 'Title', width: '180px', type: '3', ellipsis: true },
        {
          title: '副标题',
          dataIndex: 'Subtitle',
          width: '180px',
          ellipsis: true,
        },
        { title: '封面', dataIndex: 'Cover', width: '180px', ellipsis: true },
        {
          title: '标签',
          width: '180px',
          type: '2',
          ellipsis: true,
          render: (h, params) => {
            if (params.row.Tags && params.row.Tags.length) {
              return h(
                'span',
                params.row.Tags.map(item =>
                  h('dict-tag', {
                    props: {
                      value: item,
                      'dict-key': 'system_file_tag',
                    },
                  }),
                ),
              )
            } else {
              return ''
            }
          },
        },
        { title: '顺序', dataIndex: 'Sort', width: '180px', ellipsis: true },
        {
          title: '描述',
          dataIndex: 'Description',
          width: '180px',
          ellipsis: true,
        },
        {
          title: this.$t('MMS_Remark'),
          dataIndex: 'Remark',
          width: '180px',
          ellipsis: true,
        },
        {
          title: this.$t('usual_status'),
          dataIndex: 'Status',
          width: '140px',
          dictKey: 'sys_normal_disable',
          type: '1',
          sortable: true,
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.Status,
                'dict-key': 'sys_normal_disable',
              },
            }),
        },
      ],
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        SortField: 'CreateTime',
        SortType: 'desc',
        Search: {},
      },
      deleteVisible: false,
      deleteInput: '', // 删除文件弹窗的输入框
    }
  },
  methods: {
    // 开始时间的限制
    disabledStartDate(startValue) {
      return disabledStartDate(startValue, this.queryParams.Search.endTime)
    },
    // 结束时间的限制
    disabledEndDate(endValue) {
      return disabledEndDate(endValue, this.queryParams.Search.startTime)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 列表查询
    async getDataList() {
      this.loading = true
      const param = JSON.parse(JSON.stringify(this.queryParams))
      const res = await getFilePageList(param)
      if (res.Success) {
        this.itemList = res.Data.PageList
        this.total = res.Data.Total
      } else {
        this.msgError(res.Msg)
      }
      this.loading = false
    },
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getDataList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    async handleCheck(row) {
      this.$refs.DetailReportRef.init({ ChkNo: row.IPQCChkNo })
    },
    handleUpdate(row) {
      // console.log(row);
      this.visible = true
      this.$nextTick(() => {
        this.entity = _.pick(row, Object.keys(this.entity))
        if (this.entity.Url.includes('big_file')) {
          this.FileSize = 'bigSize'
        } else {
          this.FileSize = 'normalSize'
        }
        // 判断该文件的路径
        const temp = _.find(_.tail(_.cloneDeep(this.fileTypeList).reverse()), element => this.entity.Url.includes(element.value))
        this.FileType = temp ? temp.value : ''
        this.FileTypeChange(this.FileType)
      })
    },
    handleClose() {
      this.$refs['form'].resetFields()
      this.entity.Id = ''
      this.visible = false
      this.FileSize = 'normalSize'
    },
    hanldleAdd() {
      this.visible = true
      this.$nextTick(() => {
        if (this.entity.Id) {
          this.$refs['form'].resetFields()
          this.entity.Id = ''
        }
      })
      this.FileSize = 'normalSize'
    },
    FileTypeChange(value) {
      if (value) {
        const action = process.env.VUE_APP_BASE_API + '/Base/File/UploadByPath?path=' + value
        this.$set(this.upload, 'action', action)
      } else {
        this.$set(this.upload, 'action', process.env.VUE_APP_BASE_API + '/Base/File/Upload')
      }
    },

    beforeUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 100

      if (!isLt2M) {
        this.$message({
          message: this.$t('MOM_UploadFileLimit'),
          type: 'warning',
        })
      }
      return isLt2M
    },
    handleUploadChange(file, fileList) {
      if (file.status == 'success') {
        const url = !!this.FileType ? _.get(file, 'response.Data.Url', '') : _.get(file, 'response.Data.Files[0].Url', '')
        const FileId = !!this.FileType ? _.get(file, 'response.Data.FileId', '') : _.get(file, 'response.Data.Files[0].FileId', '')
        const name = _.get(file, 'name', '')
        this.entity.Url = url
        this.entity.FileName = name
        this.entity.FileId = FileId
      }
    },
    uploadSuccess(res) {
      console.log(res)
      if (res.Success) {
        const url = _.get(res, 'Data.Url', '')
        const FileId = _.get(res, 'Data.FileId', '')
        const name = _.get(res, 'Data.FileName', '')
        this.entity.Url = url
        this.entity.FileId = FileId
        this.entity.FileName = name
      }
    },
    async handleUploadRemove(file, fileList) {
      this.entity.Url = ''
      this.entity.FileName = ''
      const id = _.get(file, 'response.Data.Files[0].FileId')
      if (id) {
        const res = await deleteCommonFile([id])
      }
    },
    handleSubmit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.loading = true
          const data = this.entity
          let res
          this.loading = false
          if (!!this.entity.Id) {
            res = await editFile(data)
          } else {
            res = await addFile(data)
          }
          if (res.Success) {
            this.msgSuccess(this.$t('usual_operation_success'))
            if (!!this.entity.Id) {
              this.visible = false
            }
            if (this.FileSize.includes('bigSize')) {
              this.$refs.LargerFileUpload.clearCache()
            } else {
              this.$refs.upload.clearFiles()
            }
            this.$refs['form'].resetFields()
            this.getDataList()
          } else {
            this.msgError(res.Msg)
            this.$refs['form'].resetFields()
          }
        }
      })
    },
    handleDelete(id) {
      const ids = id ? [id] : this.multipleSelection.map(item => item.Id)
      this.$confirm(this.$t('iqc_sure_forever_del'), this.$t('usual_warning'), {
        type: 'warning',
      })
        .then(async () => {
          this.deleteing = true
          const res = await deleteFile(ids)
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
    async handleDowload(url) {
      if (url.indexOf('http') > -1) {
        this.toDownload(url)
      } else {
        if (url.indexOf('/') > -1) {
          this.toDownload(process.env.VUE_APP_BASE_API + '/' + url)
        } else {
          const res = await downloadFile(url)
          if (res) {
            createFileDownload(res)
          }
        }
      }
    },
    toDownload(url) {
      if (!url) return
      const elemIF = document.createElement('iframe')
      elemIF.src = url
      elemIF.style.display = 'none'
      document.body.appendChild(elemIF)
    },
    showDeleteFile() {
      this.deleteVisible = true
      this.deleteInput = ''
    },
    async handleDeleteFile() {
      if (!!this.deleteInput) {
        const ids = this.deleteInput.split(',')
        const res = await deleteCommonFile(ids)
        if (res.Success) {
          this.msgSuccess(res.Msg)
        } else {
          this.msgError(res.Msg)
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.dialogTitle {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}
</style>
