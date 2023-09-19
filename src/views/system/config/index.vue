<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="参数名称" prop="ModuleName">
        <el-input v-model="queryParams.Search.ModuleName" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="参数键名" prop="KeyName">
        <el-input v-model="queryParams.Search.KeyName" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="系统内置" prop="configType">
        <el-select v-model="queryParams.Search.configType" placeholder="系统内置" clearable size="small">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item> -->
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
        <el-radio-group v-model="queryParams.Search.IgnoreOrgCode" size="mini">
          <el-radio-button :label="false">{{ $tl('usual_self_org', '本厂') }}</el-radio-button>
          <el-radio-button :label="true">{{ $t('usual_all') }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:config:add']">{{ $t('usual_add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:config:edit']">{{ $t('usual_update') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:config:remove']">{{ $t('usual_delete') }}</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['system:config:export']"
        >{{$t('usual_export')}}</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefreshCache"
          v-hasPermi="['system:config:remove']"
        >刷新缓存</el-button>
      </el-col> -->
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <base-table v-loading="loading" :columns="columns" :list="configList" :options="options" :height="$table.FullViewHeight(156)" @handleSelectionChange="handleSelectionChange">
      <template slot="action">
        <table-column fixed="right" :label="$t('usual_operation')" min-width="180">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']">{{ $t('usual_update') }}</el-button>
            <el-button v-hasRole="['Development', 'admin']" size="mini" type="text" icon="el-icon-finished" @click="showAllocate(scope.row)">{{ $tl('iqc_RawMaterRate_SbuName', '厂区') }}</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:config:remove']">{{ $t('usual_delete') }}</el-button>
          </template>
        </table-column>
      </template>
    </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="ModuleName">
          <el-input v-model="form.ModuleName" :placeholder="$t('MOM_InputPlease')" />
        </el-form-item>
        <el-form-item label="参数键名" prop="KeyName">
          <el-input v-model="form.KeyName" :placeholder="$t('MOM_InputPlease')" />
        </el-form-item>
        <el-form-item label="参数键值" prop="Value">
          <el-input v-model="form.Value" :placeholder="$t('MOM_InputPlease')" type="textarea" />
        </el-form-item>
        <el-form-item :label="$t('usual_order')" prop="Sort">
          <el-input v-model="form.Sort" :placeholder="$t('MOM_InputPlease')" />
        </el-form-item>

        <el-form-item :label="$t('MMS_Remark')" prop="Remark">
          <el-input v-model="form.Remark" type="textarea" :placeholder="$t('MOM_InputPlease')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="$tl('system_alloc_orgcode', '分配厂区')" :visible="allocateVisible" width="800px" append-to-body>
      <el-row>
        <el-col :span="12">
          <el-descriptions direction="vertical" :column="2" border>
            <el-descriptions-item label="参数名称" :span="2">{{ detail.ModuleName }}</el-descriptions-item>
            <el-descriptions-item label="参数键名" :span="2">{{ detail.KeyName }}</el-descriptions-item>
            <el-descriptions-item label="参数键值" :span="2">{{ detail.Value }}</el-descriptions-item>
            <el-descriptions-item :label="$tl('MMS_Remark')" :span="2">{{ detail.Remark }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="12">
          <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" v-model="filterText"> </el-input>
          <el-tree ref="orgTree" show-checkbox :data="treeData" node-key="Code" :props="defaultProps" :filter-node-method="filterNode">
            <span slot-scope="{ data }">
              <div>
                <span>{{ data.Code }}</span>
                <el-divider direction="vertical"></el-divider>
                <span>{{ data.Name }}</span>
              </div>
            </span>
          </el-tree>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="allocOrg">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="allocateVisible = false">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listConfig, getConfig, delConfig, addConfig, updateConfig, exportConfig, refreshCache, configToOrgs, getConfigOrgList } from '@/api/system/config'
import { getOrgList } from '@/api/base.js'

export default {
  name: 'Config',
  data() {
    return {
      filterText: '',
      detail: {},
      treeData: [],
      saveOrgList: [],
      defaultProps: {
        children: 'Children',
        label: 'Name',
      },
      allocateVisible: false,
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
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
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          ModuleName: undefined,
          KeyName: undefined,
          configType: undefined,
          OrgCode: this.$store.state.user.OrgCode,
          IgnoreOrgCode: true,
        },
      },
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      columns: [
        { title: '参数名称', dataIndex: 'ModuleName', type: '1', width: '100px', sortable: true, ellipsis: true, align: 'left' },
        { title: '参数键名', dataIndex: 'KeyName', type: '1', width: '100px', sortable: true, ellipsis: true, align: 'left' },
        { title: '参数键值', dataIndex: 'Value', type: '3', width: '400px', sortable: true, align: 'left', ellipsis: true },
        { title: this.$t('usual_order'), dataIndex: 'Sort', width: '50px', sortable: true, ellipsis: true, align: 'left' },
        { title: this.$t('MMS_Remark'), dataIndex: 'Remark', type: '3', sortable: true, ellipsis: true, align: 'left' },
      ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        ModuleName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
        KeyName: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
        Value: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }],
      },
    }
  },
  computed: {
    OrgCode() {
      return this.$store.state.user.OrgCode
    },
  },
  watch: {
    filterText(val) {
      this.$refs.orgTree.filter(val)
    },
  },
  created() {
    this.getList()
    const response = {
      msg: '操作成功',
      code: 200,
      data: [
        {
          searchValue: null,
          createBy: 'admin',
          createTime: '2021-08-03 13:55:33',
          updateBy: null,
          updateTime: null,
          Remark: '系统默认是',
          params: {},
          dictCode: 12,
          dictSort: 1,
          dictLabel: '是',
          dictValue: 'Y',
          dictType: 'sys_yes_no',
          cssClass: '',
          listClass: 'primary',
          isDefault: 'Y',
          status: '0',
          default: true,
        },
        {
          searchValue: null,
          createBy: 'admin',
          createTime: '2021-08-03 13:55:33',
          updateBy: null,
          updateTime: null,
          Remark: '系统默认否',
          params: {},
          dictCode: 13,
          dictSort: 2,
          dictLabel: '否',
          dictValue: 'N',
          dictType: 'sys_yes_no',
          cssClass: '',
          listClass: 'danger',
          isDefault: 'N',
          status: '0',
          default: false,
        },
      ],
    }
    this.typeOptions = response.data
    // this.getDicts("sys_yes_no").then(response => {

    // });
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      // this.addDateRange(this.queryParams, this.dateRange)

      listConfig(this.queryParams).then(response => {
        this.loading = false
        if (response.Success) {
          this.configList = response.Data.PageList
          this.total = response.Data.Total
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    // 参数系统内置字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.configType)
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
        ModuleName: undefined,
        KeyName: undefined,
        Value: undefined,
        configType: 'Y',
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
      this.title = '添加参数'
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const Id = row.Id || this.ids

      getConfig(Id).then(response => {
        if (response.Data) {
          this.form = response.Data
          this.open = true
          this.title = '修改参数'
        } else {
          this.msgInfo('请切换到该参数已分配的厂区进行修改')
        }
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.OrgCode = this.OrgCode
          console.log(this.form)
          if (this.form.Id != undefined) {
            updateConfig(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess(this.$t('usual_modify_success'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.Msg)
              }
            })
          } else {
            addConfig(this.form).then(response => {
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
      let Ids = []
      if (row.Id) {
        Ids = [row.Id]
      } else {
        Ids = this.ids
      }
      this.$confirm('是否确认删除参数编号为"' + Ids + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delConfig(Ids)
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
      this.$confirm('是否确认导出所有参数数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.exportLoading = true
          return exportConfig(queryParams)
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
    async getUserOrg() {
      // 获取用户组织
      const data = {}
      const res = await getOrgList(data)
      if (res.Success) {
        this.treeData = res.Data || []
        this.setSelectedOrg(this.detail.Id)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return (data.Code && data.Code.toUpperCase().indexOf(value.toUpperCase()) > -1) || (data.Name && data.Name.toUpperCase().indexOf(value.toUpperCase()) > -1)
    },
    showAllocate(row) {
      this.getUserOrg()
      this.allocateVisible = true
      this.detail = row
    },
    async allocOrg() {
      const CheckedNodes = this.$refs.orgTree.getCheckedNodes() || []
      this.saveOrgList = []
      CheckedNodes.forEach(element => {
        this.findOrgCode(element)
      })
      const data = {
        ConfigId: this.detail.Id,
        OrgCodes: this.saveOrgList,
      }
      const res = await configToOrgs(data)
      if (res.Success) {
        this.msgSuccess(this.$t('usual_operation_success'))
        this.allocateVisible = false
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    // 遍历添加选中的orgcode
    findOrgCode(item) {
      if (item.Children && item.Children.length > 0) {
        item.Children.forEach(ele => {
          this.findOrgCode(ele)
        })
      } else {
        if (!this.saveOrgList.includes(item.OrgCode)) {
          this.saveOrgList.push(item.OrgCode)
        }
      }
    },
    // 查询已配置的厂区
    async setSelectedOrg(Id) {
      const res = await getConfigOrgList({ configid: Id })
      if (res.Success) {
        const list = res.Data || []
        const checked = list.map(item => item.SbuCode) || []
        this.$nextTick(() => {
          this.$refs.orgTree.setCheckedKeys(checked)
        })
      } else {
        this.msgError(res.Msg)
      }
    },
  },
}
</script>
