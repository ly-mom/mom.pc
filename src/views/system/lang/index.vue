<template>
  <!-- 销售报价 -->
  <div class="app-container calendar-list-container">
    <el-form inline ref="queryForm" size="small" :model="listQuery.Search" v-show="showSearch">
      <el-form-item :label="$t('mrb_module_name')">
        <el-select size="small" v-model="listQuery.Search.ModuleCode" @change="handleQuery" @clear="handleQuery" clearable>
          <el-option v-for="(item, index) in languageModuleList" :key="index" :label="item.DataText" :value="item.DataValue"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="代码">
        <el-input clearable v-model="listQuery.Search.TagCode" placeholder="请输入代码" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="显示文本">
        <el-input clearable v-model="listQuery.Search.TagText" placeholder="请输入显示文本" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!--      <el-form-item label="语言" >-->
      <!--        <el-select-->
      <!--          size="small"-->
      <!--          v-model="listQuery.Search.Lang"-->
      <!--          @change="handleQuery"-->
      <!--          @clear="handleQuery"-->
      <!--          clearable-->
      <!--        >-->
      <!--          <el-option-->
      <!--            v-for="(item, index) in languageList"-->
      <!--            :key="index"-->
      <!--            :label="item.DataText"-->
      <!--            :value="item.DataValue"-->
      <!--          >-->
      <!--          </el-option>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->

      <el-form-item label="平台">
        <el-select size="small" v-model="listQuery.Search.TypeName" @change="handleQuery" @clear="handleQuery" clearable>
          <el-option v-for="(item, index) in platformList" :key="index" :label="item.DataText" :value="item.DataValue"> </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }} </el-button>
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
          >{{ $t('usual_reset') }}
        </el-button>
        <!-- 查询条件重置按钮 -->
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">{{ $t('MMS_New') }} </el-button>
        <!-- 新建按钮 -->
      </el-col>
      <el-col :span="1.5">
        <!-- v-hasPermi="['system:user:edit']" -->
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleEdit">{{ $t('usual_update') }} </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button type="danger" plain size="mini" icon="el-icon-delete" @click="handleDel">{{ $t('usual_delete') }} </el-button>

        <!-- 批量删除的按钮 -->
      </el-col>

      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="handleImport">{{ $t('usual_import') }} </el-button>
      </el-col>
      <!-- 导出 -->
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" plain :loading="exporting" @click="exportData">{{ $t('usual_export') }}</el-button>
      </el-col>

      <right-toolbar :showSearch="showSearch" @queryTable="getDataList"></right-toolbar>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div>
          <base-table :list="list" @dbrowclick="handleEdit" @handleSelectionChange="handleSelectionChange" :options="options" :columns="columns" :operates="operates" ref="Table"> </base-table>

          <div class="pagination-container">
            <pagination v-show="total > 0" :total="total" :page="listQuery.PageIndex" :limit="listQuery.PageRows" @pagination="getDataList" />
          </div>
        </div>
      </el-col>
    </el-row>
    <edit-form ref="editForm" :parentObj="this"></edit-form>
  </div>
</template>
<script>
import EditForm from './edit'
import { listLang, deleteLang, ExportLanguageApi } from '@/api/system/lang'
import { getDicts } from '@/api/system/dict/data'
import { mapGetters } from 'vuex'
import { createFileDownload } from '@/utils/util'

export default {
  name: 'Quotations',
  components: {
    EditForm,
  },
  computed: {
    ...mapGetters(['dictMap']),
    platformList() {
      return this.dictMap['platform_language'] && this.dictMap['platform_language'].items
    },
    languageModuleList() {
      return this.dictMap['country_language_module'] && this.dictMap['country_language_module'].items
    },
  },
  data() {
    return {
      languageList: [],
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      list: [], // table数据
      showSearch: true,
      exporting: false,
      listQuery: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          // CreatorId: this.$store.state.user.userCode || undefined,
          // isSelf: 0,
          Lang: '',
          ModuleCode: '',
          ModuleName: '',
          TagCode: '',
          TagText: '',
          TypeName: '', //平台
        },
      },

      total: 0,
      options: {
        stripe: false, // 是否为斑马纹 table
        loading: true, // 是否添加表格loading加载动画
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数

      columns: [
        { title: '模板代码', dataIndex: 'ModuleCode', align: 'center', width: '120px' },
        { title: this.$t('mrb_module_name'), dataIndex: 'ModuleName', align: 'center', width: '100px' },
        { title: '代码', dataIndex: 'TagCode', align: 'center', width: '200px' },
        { title: '来源', dataIndex: 'Source', align: 'center', width: '120px' },
        {
          title: '平台',
          dataIndex: 'TypeName',
          align: 'center',
          width: '80px',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.TypeName,
                'dict-key': 'platform_language',
              },
            }),
        },
      ],
      operates: {
        width: '150px',
        fixed: 'right',
        PageId: 'lang',
        list: [
          {
            id: '1',
            label: this.$t('usual_update'),
            style: 'cursor:pointer;color: #a4da89;',
            show: true,
            class: 'el-icon-edit',
            plain: true,
            method: (scope, row) => {
              this.handleEdit(row)
            },
          },

          {
            id: '3',
            label: this.$t('usual_delete'),
            style: 'cursor:pointer;color: #f00;',
            class: 'el-icon-delete',
            show: true,
            plain: false,
            method: (index, row) => {
              this.handleDel(row)
            },
          },
        ],
      }, // 列操作按钮

      file: [], //文件类型
      NameList: null, //删除等提示信息
      RowList: [], //多选的表格数据
    }
  },
  async created() {
    // 先请求字典语言，根据字典动态生成列（表格用）
    await this.getLanguageList()
    this.getDataList()
    this.getDictList()
  },
  provide() {
    return {
      getDataList: this.getDataList,
    }
  },
  methods: {
    handleQuery() {
      this.listQuery.PageIndex = 1
      this.getDataList()
    },

    // 选中行
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      this.single = selection.length != 1
      this.multiple = !selection.length
      this.NameList = selection.map(item => item.Pro)
      this.RowList = selection
    },

    handleAdd() {
      //新建
      this.$refs.editForm.openForm(undefined, '新建', 'add')
    },
    // 编辑
    handleEdit(row) {
      const Id = row.Id || this.ids.toString()
      this.$refs.editForm.openForm(Id, this.$t('usual_update'), 'edit')
    },
    // 删除
    handleDel(row) {
      if (!row.Id && this.ids.length == 0) {
        this.$message.warning('请选择删除数据')
        return
      }

      const Id = row.Id ? [row.Id] : this.ids

      // 菜单级别语言埋点，管理员才有资格删除
      const arrId = this.list.map(item => {
        if (item.TypeName == 'pc_menu') {
          return item.Id
        }
      })
      let flag = false
      for (let i = 0; i < Id.length; i++) {
        const index = arrId.find(item => item == Id[i])
        if (index) {
          flag = true
          break
        }
      }
      if (flag && this.$store.state.user.UserInfo.Id != 'admin') {
        this.$message.warning('请联系管理员操作删除菜单级别语言埋点')
        return
      }

      //lijinya
      this.$confirm('是否确认删除项目?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return deleteLang(Id)
        })
        .then(res => {
          if (res.Success) {
            this.msgSuccess(this.$t('IQC_DeleteSuccess'))
            this.getDataList()
          } else {
            this.msgError(res.Msg)
          }
        })
        .catch(() => {})
    },
    handleImport() {
      //导入
      this.$router.push('/system/import-data/index/')
    },

    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    // 列表请求
    async getDataList() {
      this.options.loading = true
      const res = await listLang(this.listQuery)
      this.options.loading = false
      if (res.Success) {
        const array = []
        // 把Cultures对象的属性 解析成 数组属性
        res.Data.PageList.forEach(item => {
          const obj = { ...item, ...item.Cultures }
          array.push(obj)
        })

        // 保持与后台返回顺序一致
        this.list = array.reverse()
        this.total = res.Data.Total
      } else {
        this.msgError(res.Msg)
      }
    },
    async getLanguageList() {
      const res = await getDicts('country_language', false)
      if (res.Success) {
        this.languageList = res.Data
        // 处理动态列（根据字典返回语言生成列）
        this.languageList.forEach(obj => {
          const item = { title: '', dataIndex: '', align: 'center', width: '300px' }
          item.title = obj.DataText
          item.dataIndex = obj.DataValue
          this.columns.push(item)
        })
      } else {
        this.msgError(res.Msg)
      }
    },
    getDictList() {
      // 多国语言平台
      if (!this.dictMap['platform_language']) {
        this.$store.dispatch('dict/getByDictKey', {
          dictKey: 'platform_language',
        })
      }
      // 多国语言模块
      if (!this.dictMap['country_language_module']) {
        this.$store.dispatch('dict/getByDictKey', {
          dictKey: 'country_language_module',
        })
      }
    },

    // 导出数据
    async exportData() {
      const data = JSON.parse(JSON.stringify(this.listQuery.Search))
      this.exporting = true
      const res = await ExportLanguageApi(data)
      this.exporting = false
      if (res.status == 200) {
        createFileDownload(res)
      } else {
        this.msgError(res.statusText)
      }
    },
  },
}
</script>
