<template>
  <!-- 授权用户 -->
  <el-dialog title="选择用户" :visible="visible" width="70%" top="5vh" append-to-body>
    <el-form :model="queryParams.Search" ref="queryForm" :inline="true">
      <!-- 用户名称 -->
      <el-form-item :label="$t('system_username')" prop="RealName">
        <!-- placeholder="请输入用户名称" -->
        <el-input v-model="queryParams.Search.RealName" :placeholder="$t('system_input_username')" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- 用户编号 -->
      <el-form-item :label="$t('system_user_id')" prop="UserCode">
        <!-- placeholder="请输入用户编号" -->
        <el-input v-model="queryParams.Search.UserCode" :placeholder="$t('system_input_user_id')" clearable size="small" style="width: 200px" @keyup.enter.native="handleQuery">
          <template slot="append"> <BatchInput :value="queryParams.Search.UserCode"></BatchInput> </template
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('base_ADUser')" prop="ADUser">
        <el-input v-model="queryParams.Search.ADUser" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table size="mini" @row-click="clickRow" ref="table" :data="userList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="50" align="center" />
        <!-- 用户编号 -->
        <el-table-column :label="$t('system_user_id')" align="center" key="UserCode" prop="UserCode" />
        <el-table-column :label="$t('base_ADUser')" align="center" key="ADUser" prop="ADUser" />
        <!-- label="用户名称" -->
        <el-table-column :label="$t('system_username')" align="center" key="RealName" prop="RealName" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('system_department')" align="center" key="OrgName" prop="OrgName" :show-overflow-tooltip="true" />
        <el-table-column label="手机号码" align="center" key="Mobile" prop="Mobile" width="120" />
        <el-table-column :label="$t('usual_status')" align="center" key="Status">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.Status" :active-value="0" :inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSelectUser">{{ $t('usual_confirm') }}</el-button>
      <el-button @click="cancel">{{ $t('usual_cancel') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { unallocatedUserList, authUserSelectAll } from '@/api/system/role'
import BatchInput from '@/components/BatchInput'

export default {
  props: {
    // 角色编号
    roleId: {
      type: String,
    },
  },
  components: {
    BatchInput,
  },
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      userIds: [],
      // 总条数
      total: 0,
      // 未授权用户数据
      userList: [],
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          RoleId: undefined,
          RealName: undefined,
          ADUser: undefined,
          status: undefined,
          UserCode: undefined,
        },
      },
    }
  },
  created() {
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.Data
    })
  },
  methods: {
    // 显示弹框
    show() {
      this.queryParams.Search.RoleId = this.roleId

      // this.getList();
      this.visible = true
    },
    // 取消按钮
    cancel() {
      this.visible = false
      this.resetForm('queryForm')
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.userIds = selection.map(item => item.Id)
    },
    // 查询表数据
    getList() {
      unallocatedUserList(this.queryParams).then(response => {
        this.loading = false
        if (response.Success && response.Data) {
          this.userList = response.Data.PageList
          this.total = response.Data.Total
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 选择授权用户操作 */
    handleSelectUser() {
      const roleId = this.queryParams.Search.RoleId

      // const userIds = this.userIds.join(",");

      const data = { RoleId: roleId, UserIds: this.userIds }
      authUserSelectAll(data).then(response => {
        if (response.Success) {
          if (response.Code === 200) {
            this.msgSuccess(response.Msg)
            this.visible = false
            this.$emit('ok')
          }
        } else {
          this.msgError(response.Msg)
        }
      })
    },
  },
}
</script>
