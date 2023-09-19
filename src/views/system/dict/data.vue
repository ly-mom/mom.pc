<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="DicKey">
        <el-select v-model="queryParams.Search.DicKey" style="width: 150px" size="small">
          <el-option v-for="item in typeOptions" :key="item.Id" :label="item.DicName" :value="item.DicKey" />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="DataText">
        <el-input v-model="queryParams.Search.DataText" placeholder="请输入字典标签" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('usual_status')" prop="Status">
        <el-select style="width: 130px" v-model="queryParams.Search.Status" placeholder="数据状态" clearable size="small">
          <el-option v-for="dict in StatusOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
        </el-select>
      </el-form-item>
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
      </el-col> -->
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange" size="mini" :height="$table.FullViewHeight(280)">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="字典编码" align="center" prop="DataValue" /> -->
      <el-table-column label="字典键值" align="center" prop="DataValue" />
      <el-table-column label="字典标签" align="center" prop="DataText">
        <template slot-scope="scope">
          <div v-if="scope.row.ListClass == '' || scope.row.ListClass == 'default'">{{ scope.row.DataText }}</div>
          <div v-else class="dict-item" :class="scope.row.ListClass">{{ scope.row.DataText }}</div>
        </template>
      </el-table-column>

      <el-table-column label="字典排序" align="center" prop="Sort" />
      <el-table-column :label="$t('usual_status')" align="center" prop="Status">
        <template slot-scope="scope">
          <dict-tag v-model="scope.row.Status" dict-key="sys_normal_disable" :dict-all="true"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('MMS_Remark')" align="center" prop="Remark" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('usual_create_time')" align="center" prop="CreateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.CreateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('usual_operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" style="cursor: pointer; color: #a4da89" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']">{{
            $t('usual_update')
          }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" style="cursor: pointer; color: #f00" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">{{
            $t('usual_delete')
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典编码">
          <el-input v-model="form.DicKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="字典键值" prop="DataValue">
          <!-- 管理员才有权限 国际化语言设置、多语言平台类型、国际化语言模块-->
          <el-input
            v-model="form.DataValue"
            placeholder="请输入数据键值"
            :disabled="$store.state.user.UserInfo.Id != 'admin' && (form.DicKey == 'country_language' || form.DicKey == 'platform_language' || form.DicKey == 'country_language_module')"
          />
        </el-form-item>
        <el-form-item label="字典标签" prop="DataText">
          <el-input v-model="form.DataText" placeholder="请输入数据标签" />
        </el-form-item>

        <el-form-item label="样式属性" prop="CssClass">
          <el-input v-model="form.CssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item :label="$t('system_display_order')" prop="Sort">
          <el-input-number v-model="form.Sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="ListClass">
          <el-select v-model="form.ListClass" @change="changeFn">
            <el-option v-for="(item, index) in listClassOptions" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <div v-if="elTagItem" class="dict-item" :class="elTagItem" style="margin-left: 4px">xxx</div>
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
import { listData, getData, delData, addData, updateData, exportData } from '@/api/system/dict/data'
import { listType, getType } from '@/api/system/dict/type'
import { mapGetters } from 'vuex'

export default {
  name: 'DictData',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
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
      dataList: [],
      // 默认字典编码
      defaultDicKey: '',
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      elTagItem: null,
      // 数据标签回显样式
      listClassOptions: [
        {
          value: 'default',
          label: '默认',
        },
        {
          value: 'primary',
          label: '主要',
        },
        {
          value: 'success',
          label: '成功',
        },
        {
          value: 'info',
          label: '信息',
        },
        {
          value: 'warning',
          label: this.$t('usual_warning'),
        },
        {
          value: 'danger',
          label: '危险',
        },
        {
          value: 'info-dark',
          label: '自定义1',
        },
        {
          value: 'success-dark',
          label: '自定义2',
        },
        {
          value: 'warning-dark',
          label: '自定义3',
        },
        {
          value: 'danger-dark',
          label: '自定义4',
        },
      ],
      // 状态数据字典
      // StatusOptions: [],
      // 类型数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          DicName: undefined,
          DicKey: undefined,
          DataText: undefined,
          Status: undefined,
          isAll: true,
        },
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        DataText: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
        DataValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
        Sort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
      },
    }
  },
  created() {
    const dictId = this.$route.params && this.$route.params.dictId
    this.getType(dictId)
    this.getTypeList()
    if (!this.dictMap['sys_normal_disable']) {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: 'sys_normal_disable',
        isAll: true,
      })
    }
    for (let i = 0; i < 14; i++) {
      this.listClassOptions.push({
        value: 'colorArr-' + i,
        label: '全局颜色列表' + i,
      })
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    StatusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
  },
  methods: {
    /** 查询字典编码详细 */
    getType(dictId) {
      getType(dictId).then(response => {
        if (response.Success && response.Data != null) {
          // console.log(response.Data,"this.queryParams.DicKey")

          this.queryParams.Search.DicKey = response.Data.DicKey
          this.defaultDicKey = response.Data.DicKey
          this.getList()
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    changeFn(item) {
      this.elTagItem = item
    },

    /** 查询字典编码列表 */
    getTypeList() {
      listType(this.queryParams).then(response => {
        this.typeOptions = response.Data.PageList
      })
    },
    /** 查询字典数据列表 */
    getList() {
      this.loading = true
      listData(this.queryParams).then(response => {
        this.loading = false
        if (response.Success) {
          this.dataList = response.Data.PageList
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
        DicKey: undefined,
        DataText: undefined,
        DataValue: undefined,
        CssClass: undefined,
        ListClass: 'default',
        Sort: 0,
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
      this.resetForm('queryForm')
      this.queryParams.DicKey = this.defaultDicKey
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加字典数据'
      this.form.DicKey = this.queryParams.Search.DicKey
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      this.names = selection.map(item => item.DataText)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()

      const dictCode = row.Id || this.ids

      getData(dictCode).then(response => {
        if (response.Success) {
          this.form = response.Data
          this.form.Status = response.Data.Status.toString()
          this.open = true
          this.title = '修改字典数据'
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
            updateData(this.form).then(response => {
              this.msgSuccess(this.$t('usual_modify_success'))
              this.open = false
              this.getList()
            })
          } else {
            addData(this.form).then(response => {
              this.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      let dictCodes = []
      const names = row.DataText || this.names
      if (row.Id) {
        dictCodes = [row.Id]
      } else {
        dictCodes = this.ids
      }
      this.$confirm('是否确认删除字典名称为"' + names + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delData(dictCodes)
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
      this.$confirm('是否确认导出所有数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.exportLoading = true
          return exportData(queryParams)
        })
        .then(response => {
          this.download(response.msg)
          this.exportLoading = false
        })
        .catch(() => {})
    },
  },
}
</script>
