<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true" v-show="showSearch" @submit.native.prevent>
      <el-form-item :label="$tl('system_appName', 'App名称')" prop="AppName">
        <el-input size="small" v-model.trim="queryParam.AppName" :placeholder="$t('MOM_InputPlease')" clearable style="width: 180px" :maxlength="500" @keyup.enter.native="getListData" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="getListData()">{{ $t('usual_search') }}</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="() => this.$refs.queryForm.resetFields()">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:application:developer']">{{ $tl('MMS_New') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:application:developer']">{{ $tl('usual_delete') }}</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getListData"></right-toolbar>
    </el-row>

    <base-table :columns="columns" :list="listData" :options="options" :height="$table.FullViewHeight(150)" @handleSelectionChange="handleSelectionChange">
      <template slot="action">
        <table-column prop="action" fixed="right" width="220" :label="$t('usual_operation')" min-width="220">
          <template slot-scope="scope">
            <el-button @click="handleUpdate(scope.row)" type="text" size="small" v-hasPermi="['system:application:developer']"
              >{{ $tl('usual_update') }}
              <!-- 编辑按钮 -->
            </el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="small" v-hasPermi="['system:application:developer']">
              {{ $tl('usual_delete') }}
              <!-- 删除按钮 -->
            </el-button>
          </template>
        </table-column>
      </template>
    </base-table>
    <!--新增/编辑-->
    <el-dialog
      v-dialogDrag
      :title="!dataForm.Id ? $t('usual_add') : $t('usual_update')"
      width="400px"
      :visible="visible"
      :before-close="handleCancel"
      @close="visible = false"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="dataFormRef" :model="dataForm" size="small" label-width="110px" :rules="rules">
        <el-form-item :label="$tl('system_appName', 'App名称')" prop="AppName">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.AppName"></el-input>
        </el-form-item>
        <el-form-item label="APPKey" prop="AppKey">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.AppKey" :readonly="dataForm.Id ? true : false"></el-input>
        </el-form-item>
        <el-form-item :label="$tl('system_appEnName', 'App英文名称')" prop="AppEnName">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.AppEnName"></el-input>
        </el-form-item>
        <el-form-item :label="$tl('sys_DataType', '类型')" prop="AppType">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.AppType"></el-input>
        </el-form-item>
        <el-form-item :label="$tl('wms_menu_Platform', '平台')" prop="Platform">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.Platform"></el-input>
        </el-form-item>
        <el-form-item :label="$tl('MMS_Remark', '备注')" prop="Remark">
          <el-input :placeholder="$tl('MOM_InputPlease', '请输入')" style="width: 180px" v-model.trim="dataForm.Remark"></el-input>
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
import { getAppListApi, addApp, editApp, delApp } from '@/api/system/application'
export default {
  name: 'Application',
  data() {
    return {
      multiple: false,
      visible: false,
      submitLoading: false,
      dataForm: {
        AppName: '',
        AppKey: '',
        AppEnName: '',
        AppType: '',
        Platform: '',
        Remark: '',
        Id: '',
      },
      rules: {
        AppName: [
          {
            required: true,
            message: this.$tl('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
        AppKey: [
          {
            required: true,
            message: this.$tl('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
        Platform: [
          {
            required: true,
            message: this.$tl('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
      },
      showSearch: true,
      queryParam: {
        AppName: '',
      },
      listData: [],
      ids: [],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      columns: [
        { title: 'AppKey', dataIndex: 'AppKey', width: '140px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('system_appName', 'App名称'), dataIndex: 'AppName', width: '100px', sortable: true, ellipsis: true },
        { title: this.$tl('system_appType', 'App类型'), dataIndex: 'AppType', type: '3', width: '120px', sortable: true, ellipsis: true },
        { title: this.$tl('system_platform', '平台'), dataIndex: 'Platform', width: '120px', type: '3', sortable: true, ellipsis: true },
        { title: this.$tl('MMS_Remark', '备注'), dataIndex: 'Remark', width: '160px', sortable: true, ellipsis: true },
        { title: this.$t('usual_create_time'), dataIndex: 'CreateTime', width: '160px', sortable: true },
        { title: this.$t('usual_creation_name'), dataIndex: 'CreatorName', width: '100px', sortable: true },
        { title: this.$t('usual_update_time'), dataIndex: 'UpdateTime', width: '160px', sortable: true },
        { title: this.$t('usual_update_name'), dataIndex: 'UpdaterName', width: '100px', sortable: true },
      ],
    }
  },
  mounted() {},
  methods: {
    handleUpdate(row) {
      this.dataForm = JSON.parse(JSON.stringify(row))
      this.dataForm.AppName = row.AppName
      this.visible = true
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      // this.single = selection.length != 1;
      this.multiple = !selection.length
    },
    handleAdd() {
      this.dataForm.Id = ''
      this.dataForm.AppName = ''
      this.dataForm.AppKey = ''
      this.dataForm.AppEnName = ''
      this.dataForm.Platform = ''
      this.dataForm.AppType = ''
      this.dataForm.Remark = ''
      this.visible = true
    },
    async getListData() {
      this.options.loading = true
      const res = await getAppListApi(this.queryParam)
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
          return delApp(Ids)
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
          this.submitLoading = true
          const res = this.dataForm.Id ? await editApp(this.dataForm) : await addApp(this.dataForm)
          if (res.Success) {
            this.msgSuccess(this.$t('MOM_SaveSuccess'))
            this.visible = false
            await this.getListData()
          } else {
            this.msgError(res.Msg)
          }
          this.submitLoading = false
        }
      })
    },
    handleCancel() {
      this.$refs.dataFormRef.clearValidate()
      this.visible = false
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
