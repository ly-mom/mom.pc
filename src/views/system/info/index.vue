<template>
  <div class="app-container">
    <el-form inline ref="queryForm" :model="queryParam" v-show="showSearch">
      <el-form-item :label="$t('system_obj_type')">
        <el-select size="small" v-model.trim="queryParam.ObjectType" :placeholder="$t('usual_choose')" class="input-wid" clearable>
          <el-option :value="dict.DataValue" v-for="dict in ObjectTypeList" :key="dict.DataValue" :label="dict.DataText"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="BG">
        <el-select filterable v-model="queryParam.BgCode" class="input-wid" clearable size="small" :placeholder="$t('usual_choose')" @change="changeFn(1)" @clear="clearFn(1)">
          <el-option v-for="(item, index) in BGList" :key="index" :label="item.BgName" :value="item.BgCode"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="BU">
        <el-select filterable v-model="queryParam.BuCode" class="input-wid" clearable size="small" :placeholder="$t('usual_choose')" @change="changeFn(2)" @clear="clearFn(2)">
          <el-option v-for="(item, index) in BUList" :key="index" :label="item.BuName" :value="item.BuCode"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SBU">
        <el-select filterable v-model="queryParam.SbuCode" class="input-wid" clearable size="small" :placeholder="$t('usual_choose')" @clear="clearFn(3)">
          <el-option v-for="(item, index) in SBUList" :key="index" :label="item.SbuName" :value="item.SbuCode"> </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="search()" :loading="sreaching">{{ $t('usual_search') }}</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="resetFn">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" size="mini" plain icon="el-icon-plus" @click="addFn">{{ $t('usual_add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" size="mini" plain icon="el-icon-document-copy" :disabled="single" @click="copyFn">{{ $t('usual_copy') }}</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getData"></right-toolbar>
    </el-row>

    <base-table :loading="sreaching" :columns="columns" :list="loadData" v-loading="sreaching" :options="options" :operates="obj" @handleSelectionChange="handleSelectionChange">
      <!--插槽位置，放操作按钮-->
      <template slot="action">
        <table-column fixed="right" prop="action" :label="$t('usual_operation')" min-width="120">
          <template slot-scope="scope">
            <el-button @click="editFn(scope.row)" icon="el-icon-edit" type="text" size="mini">{{ $t('usual_update') }}</el-button>
            <el-button @click="deleteFn(scope.row)" icon="el-icon-delete" type="text" size="mini">{{ $t('usual_delete') }}</el-button>
          </template>
        </table-column>
      </template>
    </base-table>

    <pagination :total="pagination.total" :page="pagination.current" :limit="pagination.pageSize" @pagination="getData"> </pagination>
    <add-or-edit-dialog ref="editRef"></add-or-edit-dialog>
  </div>
</template>

<script>
import { getInfoList, deleteInfo, BGListApi, SBUListApi } from '@/api/system/info'
import { BUListApi } from '@/api/base'
import addOrEditDialog from './dialog/addOrEditDialog'
import { mapGetters } from 'vuex'

export default {
  name: 'Info',
  components: {
    addOrEditDialog,
  },
  data() {
    return {
      columns: [
        {
          title: this.$t('system_obj_type'),
          dataIndex: 'ObjectType',
          dictKey: 'base_push_message_type',
          type: '1',
          sortable: true,
          width: 140,
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.ObjectType,
                'dict-key': 'base_push_message_type',
              },
            }),
        },
        { title: 'BG', dataIndex: 'BgName', dictKey: '', type: '1', sortable: true, width: 100, ellipsis: true },
        { title: 'BU', dataIndex: 'BuName', dictKey: '', type: '1', sortable: true, width: 100, ellipsis: true },
        { title: 'SBU', dataIndex: 'SbuName', dictKey: '', type: '1', sortable: true, width: 160, ellipsis: true },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '180px', sortable: true, ellipsis: true, type: '1' },
        { title: this.$t('usual_creation'), dataIndex: 'CreatorId', ellipsis: true, type: '1' },
        { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName', width: '100px', ellipsis: true, type: '1' },
        { title: this.$t('usual_update_time'), dataIndex: 'UpdateTime', width: '160px', sortable: true, ellipsis: true, type: '1' },
        { title: this.$t('usual_updator'), dataIndex: 'UpdaterId', ellipsis: true, type: '1' },
        { title: this.$t('usual_update_name'), dataIndex: 'UpdaterName', width: '100px', ellipsis: true, type: '1' },
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
        mutiSelect: true, // 是否支持列表项选中
        stripe: false, // 是否为斑马纹
        highlightCurrentRow: false, // 是否支持当前行高亮显示
      },
      obj: {},
      BUList: [],
      BGList: [],
      SBUList: [],
      showSearch: true,
      queryParam: {
        BgCode: undefined,
        BuCode: undefined,
        SbuCode: undefined,
        ObjectType: undefined,
      },
      advanced: true,
      sreaching: false,
      pagination: {
        current: 1,
        pageSize: 100, // 默认每页显示数量
        total: 0,
      },
      loadData: [],
      ids: [],
      single: true,
    }
  },
  computed: {
    ...mapGetters({
      dictMap: 'dictMap',
    }),
    ObjectTypeList() {
      return this.dictMap['base_push_message_type'] && this.dictMap['base_push_message_type'].items
    },
  },
  created() {
    this.getBGListFn()
    this.getBUListFn()
    this.getSBUListFn()
    this.getObjectTypeList()
    this.search()
  },
  provide() {
    return {
      getData: this.getData,
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      this.single = selection.length != 1
    },
    search() {
      this.pagination.current = 1
      this.getData()
    },
    async getData() {
      // 获取列表
      const data = {
        Search: {
          BgCode: this.queryParam.BgCode,
          BuCode: this.queryParam.BuCode,
          SbuCode: this.queryParam.SbuCode,
          ObjectType: this.queryParam.ObjectType,
        },
        SortField: 'CreateTime',
        SortType: 'desc',
        PageIndex: this.pagination.current,
        PageRows: this.pagination.pageSize,
      }
      this.sreaching = true
      const res = await getInfoList(data)
      this.sreaching = false
      if (res.Success) {
        this.loadData = res.Data.PageList
        this.$set(this.pagination, 'total', res.Data.Total)
      } else {
        this.msgError(res.Msg)
      }
    },
    // 新增
    async addFn() {
      this.$refs.editRef.init({ type: 'add' })
    },
    // 編輯
    async editFn(row) {
      this.$refs.editRef.init({ type: 'edit', id: row.Id })
    },
    // 复制
    copyFn() {
      const id = this.ids.toString()
      this.$refs.editRef.init({ type: 'copy', id: id })
    },
    async deleteFn(row) {
      this.$confirm(`确定删除该数据吗？`, this.$t('usual_notice'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(async () => {
          const res = await deleteInfo(row.Id)
          if (res.Success) {
            this.msgSuccess(this.$t('IQC_DeleteSuccess'))
            this.getData()
          } else {
            this.msgError(res.Msg)
          }
        })
        .catch(() => {})
    },
    changeFn(type) {
      if (type == 1) {
        this.getBUListFn()
        this.getSBUListFn()
      } else if (type == 2) {
        this.getSBUListFn()
      }
    },
    clearFn(type) {
      if (type == 1) {
        this.queryParam.BuCode = ''
        this.queryParam.SbuCode = ''
        this.getBGListFn() //查询自身即可，clear事件会触发changeFn
      } else if (type == 2) {
        this.queryParam.SbuCode = ''
        this.getBUListFn()
      } else if (type == 3) {
        this.getSBUListFn()
      }
    },
    resetFn() {
      this.queryParam.SbuCode = ''
      this.queryParam.BgCode = ''
      this.queryParam.BuCode = ''
      this.queryParam.ObjectType = ''
      this.search()
    },
    // 字典查询
    async getObjectTypeList() {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: 'base_push_message_type',
      })
    },
    async getBUListFn() {
      const data = {
        Search: {
          BgCode: this.queryParam.BgCode,
        },
      }
      const res = await BUListApi(data)
      if (res.Success) {
        this.BUList = res.Data.PageList
      } else {
        this.msgError(res.Msg)
      }
    },
    async getBGListFn() {
      const res = await BGListApi({})
      if (res.Success) {
        this.BGList = res.Data.PageList
      } else {
        this.msgError(res.Msg)
      }
    },
    async getSBUListFn() {
      const data = {
        Search: {
          BgCode: this.queryParam.BgCode,
          BuCode: this.queryParam.BuCode,
        },
      }
      const res = await SBUListApi(data)
      if (res.Success) {
        this.SBUList = res.Data.PageList
      } else {
        this.msgError(res.Msg)
      }
    },
  },
}
</script>
<style scoped lang="scss">
.input-wid {
  width: 180px;
}
</style>
