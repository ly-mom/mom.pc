<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" v-show="showSearch" :inline="true">
      <!-- 用户名称 -->
      <el-form-item :label="$t('system_username')" prop="RealName">
        <!-- placeholder="请输入用户名称" -->
        <el-input v-model="queryParams.Search.RealName" :placeholder="$t('system_input_username')" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- 用户编号 -->
      <el-form-item :label="$t('system_user_id')" prop="UserCode">
        <!-- placeholder="请输入用户编号" -->
        <el-input v-model="queryParams.Search.UserCode" :placeholder="$t('system_input_user_id')" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('base_ADUser')" prop="ADUser">
        <el-input v-model="queryParams.Search.ADUser" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openSelectUser" v-hasPermi="['system:authUser:add']">添加用户</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-circle-close" size="mini" :disabled="multiple" @click="cancelAuthUserAll" v-hasPermi="['system:authUser:remove']">{{
          $t('system_all_cancel_authorization')
        }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-close" size="mini" @click="handleClose" v-hasPermi="['system:authUser:close']">{{ $t('usual_close') }}</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange" size="mini" :height="$table.FullViewHeight(206)">
      <el-table-column type="selection" width="50" align="center" />
      <!-- 用户编号 -->
      <el-table-column :label="$t('system_user_id')" align="center" key="UserCode" prop="UserCode" sortable />
      <el-table-column :label="$t('base_ADUser')" align="center" key="ADUser" prop="ADUser" sortable />
      <el-table-column :label="$t('base_RealName')" align="center" key="RealName" prop="RealName" :show-overflow-tooltip="true" sortable />
      <el-table-column :label="$t('system_department')" align="center" key="OrgName" prop="OrgName" :show-overflow-tooltip="true" sortable />
      <el-table-column label="创建时间" align="center" key="CreateTime" prop="CreateTime" width="120" sortable />
      <el-table-column label="创建人工号" align="center" key="CreatorId" prop="CreatorId" width="120" sortable />
      <el-table-column label="创建人" align="center" key="CreatorName" prop="CreatorName" width="120" sortable />

      <el-table-column :label="$t('usual_status')" align="center" prop="Status">
        <template slot-scope="scope">
          <dict-tag v-model="scope.row.Status" dict-key="sys_normal_disable"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('usual_operation')" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-circle-close" @click="cancelAuthUser(scope.row)" v-hasPermi="['system:authUser:remove']">{{ $t('system_cancel_authorization') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
    <select-user ref="select" :roleId="queryParams.Search.RoleId" @ok="handleQuery" />
  </div>
</template>

<script>
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role'
import selectUser from './selectUser'
import { mapGetters } from 'vuex'

export default {
  name: 'AuthUser',
  components: { selectUser },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中用户组
      userIds: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
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
  computed: {
    ...mapGetters(['dictMap']),
    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
  },
  created() {
    const roleId = this.$route.params && this.$route.params.roleId

    if (roleId) {
      this.queryParams.Search.RoleId = roleId

      this.getList()
      if (!this.dictMap['sys_normal_disable']) {
        this.$store.dispatch('dict/getByDictKey', {
          dictKey: 'sys_normal_disable',
        })
      }
    }
  },
  methods: {
    /** 查询授权用户列表 */
    getList() {
      this.loading = true
      allocatedUserList(this.queryParams).then(response => {
        this.loading = false
        if (response.Success && response.Data) {
          this.userList = response.Data.PageList
          this.total = response.Data.Total
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    // 返回按钮
    handleClose() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/system/role' })
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.userIds = selection.map(item => item.Id)
      this.multiple = !selection.length
    },
    /** 打开授权用户表弹窗 */
    openSelectUser() {
      this.$refs.select.show()
    },
    /** 取消授权按钮操作 */
    cancelAuthUser(row) {
      const roleId = this.queryParams.Search.RoleId

      this.$confirm('确认要取消该用户"' + row.RealName + '"角色吗？', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return authUserCancel({ UserId: row.Id, RoleId: roleId })
        })
        .then(response => {
          if (response.Success) {
            this.getList()
            this.msgSuccess('取消授权成功')
          } else {
            this.msgError(response.Msg)
          }
        })
        .catch(() => {})
    },
    /** 批量取消授权按钮操作 */
    cancelAuthUserAll(row) {
      const roleId = this.queryParams.Search.RoleId
      // const userIds = this.userIds.join(",");
      const userIds = this.userIds

      this.$confirm('是否取消选中用户授权数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          const data = { RoleId: roleId, UserIds: this.userIds }
          return authUserCancelAll(data)
        })
        .then(response => {
          if (response.Success) {
            this.getList()
            this.msgSuccess('取消授权成功')
          } else {
            this.msgError(response.Msg)
          }
        })
        .catch(() => {})
    },
  },
}
</script>
