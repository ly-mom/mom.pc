<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="DicName">
        <el-input v-model="queryParams.Search.DicName" placeholder="请输入字典名称" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="字典编码" prop="DicKey">
        <el-input v-model="queryParams.Search.DicKey" placeholder="请输入字典编码" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('usual_status')" prop="Status">
        <el-select v-model="queryParams.Search.Status" placeholder="字典状态" clearable size="small" style="width: 130px">
          <el-option v-for="dict in StatusOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:dict:add']">{{ $t('usual_add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:dict:edit']">{{ $t('usual_update') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:dict:remove']">{{ $t('usual_delete') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-refresh" size="mini" :loading="megerLoading" @click="handleMeger" v-hasRole="['Development']">{{ $tl('base_meger', '同步字典数据') }}</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['system:dict:export']"
        >{{$t('usual_export')}}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefreshCache"
          v-hasPermi="['system:dict:remove']"
        >刷新缓存</el-button>
      </el-col> -->
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <base-table v-loading="loading" :columns="columns" :list="typeList" :options="options" @handleSelectionChange="handleSelectionChange">
      <template slot="DicKey" slot-scope="scope">
        <router-link :to="'/system/dict-data/index/' + scope.row.Id" class="link-type">
          <span>{{ scope.row.DicKey }}</span>
        </router-link>
      </template>
      <template slot="action">
        <table-column fixed="right" width="200" :label="$t('usual_operation')">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" style="cursor: pointer; color: #a4da89" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']">{{
              $t('usual_update')
            }}</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" style="cursor: pointer; color: #f00" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">{{
              $t('usual_delete')
            }}</el-button>
          </template>
        </table-column>
      </template>
    </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="DicName">
          <el-input v-model="form.DicName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="DicKey">
          <el-input v-model="form.DicKey" placeholder="请输入字典编码" />
        </el-form-item>
        <el-form-item label="字典类型" prop="DataType">
          <el-select v-model="form.DataType" :placeholder="$t('usual_choose')" clearable size="small" style="width: 100%">
            <el-option v-for="dict in dataTypeOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('usual_status')" prop="Status">
          <el-radio-group v-model="form.Status">
            <el-radio v-for="dict in StatusOptions" :key="dict.DataValue" :label="dict.DataValue">{{ dict.DataText }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('MMS_Remark')" prop="Remark">
          <el-input v-model="form.Remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listType, getType, delType, addType, updateType, exportType, refreshCache, syncDictionaryData } from '@/api/system/dict/type'
import { mapGetters } from 'vuex'

export default {
  name: 'Dict',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      megerLoading: false,
      // 选中数组
      ids: [],
      names: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 字典表格数据
      typeList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          DicName: undefined,
          DicKey: undefined,
          Status: undefined,
        },
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        DicName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
        DicKey: [{ required: true, message: '字典编码不能为空', trigger: 'blur' }],
      },
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      columns: [
        {
          title: this.$tl('system_dict_DicName', '字典名称'),
          dataIndex: 'DicName',
          width: '200px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$tl('system_dict_DicKey', '字典编码'),
          dataIndex: 'DicKey',
          width: '200px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
          slots: true,
        },
        {
          title: this.$t('usual_status'),
          dataIndex: 'Status',
          type: '1',
          sortable: true,
          dictKey: 'sys_normal_disable',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.Status,
                'dict-key': 'sys_normal_disable',
              },
            }),
        },
        {
          title: this.$tl('system_dict_DataType', '字典类型'),
          dataIndex: 'DataType',
          type: '1',
          sortable: true,
          dictKey: 'dictmap_type',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.DataType,
                'dict-key': 'dictmap_type',
              },
            }),
        },
        {
          title: this.$t('MMS_Remark'),
          dataIndex: 'Remark',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
      ],
    }
  },
  created() {
    this.getList()
    this.$store.dispatch('dict/getByDictKeys', ['sys_normal_disable', 'dictmap_type'])
  },
  computed: {
    ...mapGetters(['dictMap']),
    StatusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
    dataTypeOptions() {
      return this.dictMap['dictmap_type'] && this.dictMap['dictmap_type'].items
    },
  },
  methods: {
    /** 查询字典编码列表 */
    getList() {
      this.loading = true

      listType(this.queryParams).then(response => {
        this.loading = false
        if (response.Success) {
          this.typeList = response.Data.PageList
          this.total = response.Data.Total
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        Id: undefined,
        DicName: undefined,
        DicKey: undefined,
        Status: '0',
        Remark: undefined,
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加字典编码'
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      this.names = selection.map(item => item.DicName)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const Id = row.Id || this.ids
      // 后台用到 country_language字符串， 禁止编辑该字符串（国际化语言设置）
      const findObj = this.typeList.find(item => item.Id == Id && (item.DicKey == 'country_language' || item.DicKey == 'platform_language' || item.DicKey == 'country_language_module'))
      if (findObj && this.$store.state.user.UserInfo.Id != 'admin') {
        this.$message.warning('请联系管理员修改')
        return
      }
      getType(Id).then(response => {
        if (response.Success) {
          this.form = response.Data
          this.form.Status = response.Data.Status.toString()
          this.open = true
          this.title = '修改字典编码'
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.Id != undefined) {
            updateType(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess(this.$t('usual_modify_success'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.Msg)
              }
            })
          } else {
            addType(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.Msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let Ids = []
      const names = row.DicName || this.names
      if (row.Id) {
        Ids = [row.Id]
      } else {
        Ids = this.ids
      }

      const arrId = this.typeList.map(item => {
        if (item.DicKey == 'country_language' || item.DicKey == 'platform_language' || item.DicKey == 'country_language_module') {
          return item.Id
        }
      })
      let flag = false
      for (let i = 0; i < Ids.length; i++) {
        const index = arrId.find(item => item == Ids[i])
        if (index) {
          flag = true
          break
        }
      }
      if (flag && this.$store.state.user.UserInfo.Id != 'admin') {
        this.$message.warning('请联系管理员操作删除国际化语言设置、多语言平台类型、国际化语言模块')
        return
      }

      this.$confirm('是否确认删除字典名称为"' + names + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delType(Ids)
        })
        .then(response => {
          if (response.Success) {
            this.getList()
            this.msgSuccess(this.$t('IQC_DeleteSuccess'))
          } else {
            this.msgError(response.Msg)
          }
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有类型数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.exportLoading = true
          return exportType(queryParams)
        })
        .then(response => {
          this.download(response.msg)
          this.exportLoading = false
        })
        .catch(() => {})
    },
    /** 刷新缓存按钮操作 */
    handleRefreshCache() {
      refreshCache().then(() => {
        this.msgSuccess('刷新成功')
      })
    },
    // 同步字典数据
    handleMeger() {
      this.$confirm('是否确认同步生产库和测试库所有字典数据?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(async () => {
          this.megerLoading = true
          const res = await syncDictionaryData()
          this.megerLoading = false
          if (res.Success) {
            this.msgSuccess(res.Data)
          } else {
            this.msgError(res.Msg)
          }
        })
        .catch(response => {
          this.msgInfo(this.$tl('usual_cancel_success', '已取消'))
        })
    },
  },
}
</script>
