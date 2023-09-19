<template>
  <div class="app-container">
    <!-- 基本信息 -->
    <h4 class="form-header h4">{{ $t('usual_basic_info') }}</h4>
    <el-form ref="form" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8" :offset="2">
          <!-- 用户昵称 -->
          <el-form-item :label="$t('system_user_nickname')" prop="RealName">
            <el-input v-model="form.RealName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="2">
          <!-- 登录账号 -->
          <el-form-item :label="$t('system_login_account')" prop="UserCode">
            <el-input v-model="form.UserCode" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 角色信息 -->
    <h4 class="form-header h4">{{ $t('system_role_information') }}</h4>
    <el-table
      size="mini"
      v-loading="loading"
      :row-key="getRowKey"
      @row-click="clickRow"
      ref="table"
      @selection-change="handleSelectionChange"
      :data="roles.slice((PageIndex - 1) * PageRows, PageIndex * PageRows)"
    >
      <!-- 序号 -->
      <el-table-column :label="$t('usual_serial_num')" type="index" align="center">
        <template slot-scope="scope">
          <span>{{ (PageIndex - 1) * PageRows + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column type="selection" :reserve-selection="true" width="55" :selectable="selectable"></el-table-column>
      <!-- 角色名称 -->
      <el-table-column :label="$t('system_role_name')" align="center" prop="RoleName" />
      <!-- 权限字符 -->
      <el-table-column :label="$t('system_permission_character')" align="center" prop="RoleKey" />
      <!-- 创建时间 -->
      <el-table-column :label="$t('usual_create_time')" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page="PageIndex" :limit="PageRows" />

    <el-form label-width="100px">
      <el-form-item style="text-align: center; margin-left: -120px; margin-top: 30px">
        <!-- 提交 -->
        <el-button type="primary" @click="submitForm()">{{ $t('usual_commit') }}</el-button>
        <!-- 返回 -->
        <el-button @click="close()">{{ $t('usual_return') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getAuthRole, updateAuthRole } from '@/api/system/user'
import { checkRole } from '@/utils/permission'

export default {
  name: 'AuthRole',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 分页信息
      total: 0,
      PageIndex: 1,
      PageRows: 100,
      // 选中角色编号
      roleIds: [],
      // 角色信息
      roles: [],
      // 用户信息
      userId: '',
      form: {
        RealName: '',
        UserCode: '',
      },
    }
  },
  created() {
    this.userId = this.$route.query.UserId

    if (this.userId) {
      this.loading = true
      getAuthRole(this.userId).then(response => {
        //  if(response.Success){
        //    console.log(response)
        //     this.form = response.Data.user;
        //      this.loading = false;
        //  }
        this.loading = false
        if (response.Success) {
          // console.log( response,"999999")
          this.form = response.Data.user
          this.roles = response.Data.roles
          this.total = this.roles.length
          this.$nextTick(() => {
            this.roles.forEach(row => {
              if (row.Flag) {
                this.$refs.table.toggleRowSelection(row)
              }
            })
          })
        } else {
          this.msgError(response.Msg)
        }
      })
    }
  },
  methods: {
    /** 单击选中行数据 */
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.roleIds = selection.map(item => item.Id)
    },
    // 保存选中的数据编号
    getRowKey(row) {
      return row.roleId
    },
    /** 提交按钮 */
    submitForm() {
      const userId = this.userId
      const roleIds = this.roleIds

      const data = { UserId: userId, RoleIds: roleIds }

      updateAuthRole(data).then(response => {
        // "授权成功"
        this.msgSuccess(this.$t('system_authorization_succeeded'))
        this.close()
      })
    },
    /** 关闭按钮 */
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/system/user' })
    },
    // 非开发者或超级管理员，不能分配开发者和超级管理员角色
    selectable(row, index) {
      return checkRole(['Development', 'admin']) ? true : row.RoleKey != 'Development' && row.RoleKey != 'admin'
    },
  },
}
</script>
