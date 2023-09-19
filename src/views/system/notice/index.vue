<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item :label="$tl('sys_noticeTitle', '公告标题')" prop="Title">
        <el-input
          v-model="queryParams.Search.Title"
          :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_noticeTitle', '公告标题') })"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$tl('sys_noticeSubTitle', '公告副标题')" prop="Subtitle" label-width="80px">
        <el-input
          v-model="queryParams.Search.Subtitle"
          :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_noticeSubTitle', '公告副标题') })"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$tl('sys_noticeType', '公告类型')" prop="InfoType">
        <el-select v-model="queryParams.Search.InfoType" :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_noticeType', '公告类型') })" clearable size="small">
          <el-option v-for="dict in typeOptions" :key="parseInt(dict.DataValue)" :label="dict.DataText" :value="parseInt(dict.DataValue)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$tl('sys_noticeContent', '公告内容')" prop="Content">
        <el-input
          v-model="queryParams.Search.Content"
          :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_noticeContent', '公告内容') })"
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
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:notice:add']">{{ $t('usual_add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate(ids)" v-hasPermi="['system:notice:edit']">{{ $t('usual_update') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete(ids)" v-hasPermi="['system:notice:remove']">{{ $t('usual_delete') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="topNotice()" v-hasPermi="['system:notice:remove']">{{
          $tl('usual_topNotice', '置顶')
        }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-delete" size="mini" :disabled="multiple || isCancelTop" @click="cancelTopNotice()" v-hasPermi="['system:notice:remove']">{{
          $tl('usual_cancelTopNotice', '取消置顶')
        }}</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <base-table
      :columns="columns"
      :list="noticeList"
      :options="options"
      :operates="obj"
      @handleSelectionChange="handleSelectionChange"
      @sort-change="$table.sortChange($event, orgList)"
      v-loading="loading"
    >
      <template slot="action">
        <table-column fixed="right" :label="$t('usual_operation')" min-width="100px">
          <template slot-scope="scope">
            <el-button @click="handleUpdate(scope.row.Id)" type="text" size="small"
              >{{ $t('usual_update') }}
              <!-- 编辑按钮 -->
            </el-button>
            <el-button @click="handleDelete([scope.row.Id])" type="text" size="small">
              {{ $t('usual_delete') }}
              <!-- 删除按钮 -->
            </el-button>
          </template>
        </table-column>
      </template>
      <!-- 是否有置顶 -->
      <template slot="TopNum" slot-scope="scope">
        <span v-if="scope.row.TopNum ? true : false">
          <el-tag size="medium" type="success">{{ $t('usual_yes') }}</el-tag>
        </span>
        <span v-else>
          <el-tag size="medium" type="danger">{{ $t('usual_no') }}</el-tag>
        </span>
      </template>
    </base-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.pageNum" :limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改公告对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="780px" append-to-body @close="cancel">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_noticeTitle', '公告标题')" prop="Title">
              <el-input v-model="form.Title" :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_noticeTitle', '公告标题') })" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_noticeSubTitle', '公告副标题')" prop="Subtitle">
              <el-input v-model="form.Subtitle" :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_noticeSubTitle', '公告副标题') })" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_noticeType', '公告类型')" prop="InfoType">
              <el-select v-model="form.InfoType" :placeholder="$t('usual_choose')" style="width: 100%">
                <el-option v-for="dict in typeOptions" :key="parseInt(dict.DataValue)" :label="dict.DataText" :value="parseInt(dict.DataValue)"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_noticeLevel', '公告级别')" prop="Level">
              <el-select v-model="form.Level" :placeholder="$t('usual_choose')" style="width: 100%">
                <el-option v-for="dict in levelOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$tl('sys_noticeContent', '公告内容')" prop="Content">
              <editor v-model="form.Content" :min-height="192" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$tl('sys_views', '浏览次数')" prop="Views">
              <el-input v-model="form.Views" :placeholder="$tl('usual_please_input', '请输入', { text: $tl('sys_views', '浏览次数') })" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('usual_status')">
              <el-select v-model="form.Status" :placeholder="$t('usual_choose')" clearable size="small" style="width: 100%">
                <el-option v-for="dict in statusOptions" :key="parseInt(dict.DataValue)" :label="dict.DataText" :value="parseInt(dict.DataValue)" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$tl('MMS_Remark', '备注')" prop="Remark">
              <el-input v-model="form.Remark" :placeholder="$tl('usual_please_input', '请输入', { text: $tl('MMS_Remark', '备注') })" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listNotice, getNotice, delNotice, addNotice, updateNotice, topNotice, cancelTopNotice } from '@/api/system/notice'
import { mapGetters } from 'vuex'
export default {
  name: 'Notice',
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
      noticeList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      // statusOptions: [],
      // 状态数据字典
      // typeOptions: [],
      // 查询参数
      queryParams: {
        Search: {
          Title: undefined, //标题
          Subtitle: undefined, //副标题
          InfoType: undefined, //类型
          Content: undefined, //内容
          Status: undefined,
        },
        pageNum: 1,
        pageSize: 100,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        Title: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        InfoType: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'change' }],
        Content: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'change' }],
      },
      columns: [
        { title: this.$tl('sys_topNum', '是否置顶'), dataIndex: 'TopNum', width: '120px', sortable: true, type: '1', slots: true },
        {
          title: this.$tl('sys_noticeLevel', '公告级别'),
          dataIndex: 'Level',
          width: '120px',
          sortable: true,
          dictKey: 'sys_notice_level',
          type: '1',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.Level,
                'dict-key': 'sys_notice_level',
              },
            }),
        },
        {
          title: this.$tl('sys_noticeType', '公告类型'),
          dataIndex: 'InfoType',
          width: '120px',
          sortable: true,
          dictKey: 'sys_notice_type',
          type: '1',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.InfoType,
                'dict-key': 'sys_notice_type',
              },
            }),
        },
        { title: this.$tl('sys_noticeTitle', '公告标题'), dataIndex: 'Title', width: '120px', type: '3', sortable: true },
        { title: this.$tl('sys_noticeSubTitle', '公告副标题'), dataIndex: 'Subtitle', width: '200px', type: '3', sortable: true },
        { title: this.$tl('sys_noticeContent', '公告内容'), dataIndex: 'Content', width: '220px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('sys_views', '浏览次数'), dataIndex: 'Views', width: '220px', type: '3', sortable: true },
        { title: this.$t('MMS_Remark'), dataIndex: 'Remark', sortable: true },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '200px', sortable: true },
        { title: this.$t('usual_creation'), dataIndex: 'CreatorId', width: '200px', sortable: true },
        { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName', width: '200px', sortable: true },
        { title: this.$t('usual_update_time'), dataIndex: 'UpdateTime', width: '160px', sortable: true },
        { title: this.$t('usual_updator'), dataIndex: 'UpdaterId', width: '200px', sortable: true },
        { title: this.$t('usual_update_name'), dataIndex: 'UpdaterName', width: '200px', sortable: true },
        {
          title: this.$t('usual_status'),
          dataIndex: 'Status',
          align: 'center',
          width: '100px',
          dictKey: 'sys_normal_disable',
          type: '1',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.Status,
                'dict-key': 'sys_normal_disable',
              },
            }),
        },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      obj: {},
      isCancelTop: true, //能否取消置顶
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.$EventBus.$on('updateInputList', () => {
      this.researchData()
    })
    if (!this.dictMap['sys_notice_type']) {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: 'sys_notice_type',
      })
    }
    if (!this.dictMap['sys_notice_status']) {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: 'sys_notice_status',
      })
    }
    if (!this.dictMap['sys_notice_level']) {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: 'sys_notice_level',
      })
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    // 当前字典
    typeOptions() {
      return this.dictMap['sys_notice_type'] && this.dictMap['sys_notice_type'].items
    },
    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
    levelOptions() {
      return this.dictMap['sys_notice_level'] && this.dictMap['sys_notice_level'].items
    },
  },
  methods: {
    /** 查询公告列表 */
    async getList() {
      this.loading = true
      const res = await listNotice(this.queryParams)
      this.loading = false
      if (res.Success) {
        this.noticeList = res.Data.PageList || []
        this.total = res.Data.Total
      } else {
        this.msgError(res.Msg)
      }
    },
    // 取消按钮
    cancel() {
      this.ids = []
      this.reset()
      this.open = false
    },
    // 表单重置
    reset() {
      this.form = {}
      // this.$refs.form.resetFields()
      this.$refs.form.clearValidate()
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
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)

      this.single = selection.length != 1
      this.multiple = !selection.length
      this.isCancelTop = !this.single && selection[0].TopNum != null ? false : true
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true
      this.title = this.$tl('usual_add', '新增')
    },
    /** 修改按钮操作 */
    async handleUpdate(Id) {
      const noticeId = Id || this.ids
      const res = await getNotice(noticeId)
      if (res.Success) {
        this.$nextTick(() => {
          this.form = res.Data || {}
          this.form.InfoType = parseInt(this.form.InfoType)
        })
        this.open = true
        this.title = this.$tl('usual_update', '修改')
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          if (this.form.Id != undefined) {
            // 用正则给插入的图片增加宽度样式
            this.form.Content = this.form.Content.replace(/<img/, '<img style="width:100%;height:auto;"')
            const res = await updateNotice(this.form)
            if (res.Success) {
              this.msgSuccess(this.$t('usual_modify_success'))
              this.cancel()
              this.getList()
            } else {
              this.msgError(res.Msg)
            }
          } else {
            const res = await addNotice(this.form)
            if (res.Success) {
              this.msgSuccess(this.$tl('IQC_AddSuccess', '新增成功'))
              this.cancel()
              this.getList()
            } else {
              this.msgError(res.Msg)
            }
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(ids) {
      const noticeIds = ids || this.ids
      this.$confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delNotice(noticeIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$tl('IQC_DeleteSuccess'))
        })
        .catch(e => {
          this.msgError(e)
        })
    },
    async topNotice() {
      //置顶公告
      // let res = await topNotice(ids)
      const noticeIds = this.ids
      this.$confirm('是否确认置顶公告编号为"' + noticeIds + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return topNotice(noticeIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))
        })
        .catch(e => {
          this.msgError(e)
        })
    },
    cancelTopNotice() {
      const noticeIds = this.ids
      this.$confirm('是否确认将公告编号为"' + noticeIds + '"取消置顶?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return cancelTopNotice(noticeIds)
        })
        .then(() => {
          this.getList()
          this.msgSuccess(this.$tl('usual_modify_success', '取消成功'))
        })
        .catch(e => {
          this.msgError(e)
        })
    },
  },
}
</script>
