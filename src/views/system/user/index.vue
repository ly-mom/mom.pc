<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div>
          <!-- 请输入部门名称 -->
          <el-input v-model="deptName" :placeholder="$t('system_input_department_name')" clearable size="mini" prefix-icon="el-icon-search" style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="deptOptions" :props="defaultProps" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" :default-expand-all="false" @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams.Search" ref="queryForm" :inline="true" v-show="showSearch">
          <!-- 用户名称 -->
          <el-form-item :label="$t('system_username')" prop="RealName">
            <!-- 请输入用户名称 -->
            <el-input v-model="queryParams.Search.RealName" :placeholder="$t('system_input_username')" clearable size="small" style="width: 140px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <!-- 用户编号 -->
          <el-form-item :label="$t('system_user_id')" prop="UserCode">
            <!-- placeholder="请输入用户编号" -->
            <el-input v-model="queryParams.Search.UserCode" :placeholder="$t('system_input_user_id')" clearable size="small" style="width: 200px" @keyup.enter.native="handleQuery">
              <template slot="append">
                <BatchInput :value="queryParams.Search.UserCode"></BatchInput>
              </template>
            </el-input>
          </el-form-item>
          <!-- AD账号 -->
          <el-form-item :label="$t('system_ad_account')" prop="ADUser">
            <!-- 请输入AD账号 -->
            <el-input v-model="queryParams.Search.ADUser" :placeholder="$t('system_input_ad_account')" clearable size="small" style="width: 150px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <!-- 状态 -->
          <el-form-item :label="$t('usual_status')" prop="Status">
            <!-- 用户状态 -->
            <el-select v-model="queryParams.Search.Status" :placeholder="$t('system_user_status')" clearable size="small" style="width: 130px">
              <el-option v-for="dict in statusOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" :loading="searchLoading">{{ $t('usual_search') }}</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
            <!-- <el-button
              v-hasRole="['Development']"
              type="primary"
              icon="el-icon-refresh"
              size="mini"
              @click="getUserData"
              :loading="bottonLoading"
              >同步钉钉人员</el-button> -->
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <!-- 新增 -->
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" v-hasPermi="['system:user:add']" @click="handleAdd">{{ $t('usual_add') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <!-- 修改 -->
            <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" v-hasPermi="['system:user:edit']" @click="handleUpdate">{{ $t('usual_update') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <!-- v-hasPermi="['system:user:remove']" -->
            <!-- 删除 -->
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" v-hasPermi="['system:user:remove']" @click="handleDelete">{{ $t('usual_delete') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <!-- v-hasPermi="['system:user:remove']" -->
            <!-- 一键分配检测单位 -->
            <el-button type="plain" icon="circle-check" size="mini" :disabled="multiple" v-hasPermi="['system:user:setchkunit']" @click="handleSetChkUnit">一键分配检测单位</el-button>
          </el-col>

          <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <base-table v-loading="loading" :columns="columns" :list="userList" :options="options" :cutheight="140" @handleSelectionChange="handleSelectionChange">
          <template slot="action">
            <table-column fixed="right" width="200" :label="$t('usual_operation')">
              <template slot-scope="scope" v-if="scope.row.Id !== 'admin'">
                <!-- 修改 -->
                <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']">{{ $t('usual_update') }}</el-button>
                <!-- 删除 -->
                <el-button size="mini" type="text" icon="el-icon-delete" style="cursor: pointer; color: #f00" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']">{{
                  $t('usual_delete')
                }}</el-button>
                <el-dropdown size="mini" @command="command => handleCommand(command, scope.row)">
                  <span style="cursor: pointer; color: #1890ff; margin-left: 5px; font-size: 12px">
                    <!-- 更多 -->
                    <i class="el-icon-d-arrow-right el-icon--right"></i>{{ $t('usual_more') }}
                  </span>

                  <el-dropdown-menu slot="dropdown">
                    <!-- 重置密码 -->
                    <el-dropdown-item command="handleResetPwd" icon="el-icon-key" v-hasPermi="['system:user:resetPwd']">{{ $t('system_reset_password') }}</el-dropdown-item>
                    <!-- 分配角色 -->
                    <!-- <el-dropdown-item
                      command="handleAuthRole"
                      icon="el-icon-circle-check"
                      v-hasPermi="['system:user:allocation']"
                      >{{$t('system_assigning_roles')}}</el-dropdown-item
                    > -->
                    <el-dropdown-item command="handleUserRole" icon="el-icon-user" v-hasPermi="['system:user:newallocation']">{{
                      $tl('system_assigning_permissionsConfig', '权限配置')
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </table-column>
          </template>
        </base-table>
        <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="50%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col :span="12">
            <!-- label="用户名称"  -->
            <el-form-item :label="$t('system_username')" prop="RealName">
              <!-- placeholder="请输入用户名称" -->
              <el-input v-model="form.RealName" :placeholder="$t('system_input_username')" maxlength="30" :disabled="isDisabel" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 用户编号 -->
            <el-form-item :label="$t('system_user_id')" prop="UserCode">
              <!-- placeholder="请输入用户编号" -->

              <el-input v-model="form.UserCode" :disabled="isDisabel" :placeholder="$t('system_input_user_id')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <!-- 手机号码 -->
            <el-form-item :label="$t('system_phone_num')" prop="Mobile">
              <!-- placeholder="请输入手机号码" -->
              <el-input v-model="form.Mobile" :placeholder="$t('system_input_phone_num')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 用户性别 -->
            <el-form-item :label="$t('system_user_gender')">
              <el-select v-model="form.Sex" :style="{ width: '100%' }" :placeholder="$t('usual_choose')">
                <el-option v-for="dict in sexOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <!-- 工种 -->
            <el-form-item :label="$t('system_type_work')">
              <el-select v-model="form.TypeOfWork" :style="{ width: '100%' }" clearable :placeholder="$t('usual_choose')">
                <el-option v-for="item in TypeOfWorkOptions" :key="item.Id" :label="item.DataText" :value="item.Id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 检测单位 -->
            <el-form-item :label="$t('system_testing_unit')">
              <el-select :style="{ width: '100%' }" v-model="form.TestUnitId" clearable :placeholder="$t('usual_choose')" filterable>
                <el-option v-for="item in TestUnitOptions" :key="item.Id" :label="item.QCDeptName" :value="item.Id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$tl('gts_email', '邮箱')" prop="Email" :rules="[{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]">
              <el-input v-model.trim="form.Email" :placeholder="$t('system_input_content')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('system_JobStatusText', '在职状态')">
              <el-select v-model="form.JobStatus" :style="{ width: '100%' }" :placeholder="$t('usual_choose')" value-key="form.JobStatus">
                <el-option v-for="dict in jobStatusOptions" :key="dict.DataValue" :label="dict.DataText" :value="parseInt(dict.DataValue)">
                  {{ dict.DataText }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <!-- 角色 -->
            <!-- <el-form-item :label="$t('system_role')">
              <el-select v-model="form.RoleIds" :style="{width:'100%'}" clearable multiple :placeholder="$t('usual_choose')">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.Id"
                  :label="item.RoleName"
                  :value="item.Id"
                  :disabled="checkRoles(['Development','admin']) ? false : item.RoleKey == 'Development'"
                ></el-option>
              </el-select>
            </el-form-item> -->
            <!-- 默认部门 -->
            <el-form-item :label="$t('system_default_department')" prop="OrgCode">
              <el-select :style="{ width: '100%' }" v-model="form.OrgCode" clearable filterable default-first-option :placeholder="$t('usual_choose')" :disabled="!form.UserCode">
                <el-option v-for="item in optionsOrgList" :key="item.OrgCode" :label="item.OrgName" :value="item.OrgCode"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 备注 -->
            <el-form-item :label="$t('MMS_Remark')">
              <el-input v-model="form.Remark" type="textarea" :label="$t('system_input_content')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$tl('usual_dingtalkid', '钉钉ID')" prop="DingTalkId">
              <el-input v-model.trim="form.DingTalkId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 状态 -->
            <el-form-item :label="$t('usual_status')">
              <el-radio-group v-model="form.Status">
                <el-radio v-for="dict in statusOptions" :key="dict.DataValue" :label="dict.DataValue">{{ dict.DataText }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 分配检测单位 -->
    <setChkUint ref="setchkunit" @refreshPageOne="handleQuery" />
  </div>
</template>

<script>
import { listUser, getUser, delUser, addUser, updateUser, exportUser, resetUserPwd, changeUserStatus, importTemplate, GetOrgListByUser } from '@/api/system/user'
import { getTestUnitDataList } from '@/api/base.js'
import { getTypeOfWorkList, getUserData } from '@/api/base.js'
import { getToken } from '@/utils/auth'
import { treeselect } from '@/api/system/dept'
// import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import BatchInput from '@/components/BatchInput'
import SetChkUint from './profile/setchkunit'
import { checkRole } from '@/utils/permission'
import { mapGetters } from 'vuex'

export default {
  name: 'User',
  components: { BatchInput, SetChkUint },
  data() {
    return {
      bottonLoading: false, //按钮加载
      searchLoading: false, //按钮加载
      conditionList: [],
      // 遮罩层
      loading: false,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      names: [],
      UserCodes: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: '',
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: '123456',
      isDisabel: false,
      // 日期范围
      dateRange: [],
      //默认部门
      optionsOrgList: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 工种选项
      TypeOfWorkOptions: [],
      // 检测单位选项
      TestUnitOptions: [],
      // 表单参数
      form: {
        JobStatus: undefined,
      },
      defaultProps: {
        children: 'Children',
        label: 'Name',
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData',
      },
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        SortField: 'id',
        SortType: 'desc',
        Search: {
          RealName: undefined,
          UserCode: undefined,
          Status: undefined,
          ADUser: undefined,
          OrgCode: undefined,
        },
      },
      // 表单校验
      rules: {
        RealName: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '用户名称长度必须介于 2 和 20 之间',
            trigger: 'blur',
          },
        ],
        UserCode: [
          { required: true, message: '用户编号不能为空', trigger: 'blur' },
          // {
          //   message: this.$t("IQC_EnterNum"),
          //   trigger: "blur",
          //   type: "number",
          //   transform(value) {
          //     if (value) {
          //       return Number(value);
          //     }
          //   }
          // },
        ],
        password: [
          { required: true, message: '用户密码不能为空', trigger: 'blur' },
          {
            min: 5,
            max: 20,
            message: '用户密码长度必须介于 5 和 20 之间',
            trigger: 'blur',
          },
        ],

        Mobile: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur',
          },
        ],
      },
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      columns: [
        {
          title: this.$tl('system_user_id'),
          dataIndex: 'UserCode',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$tl('system_ad_account'),
          dataIndex: 'ADUser',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$tl('system_username'),
          dataIndex: 'RealName',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$tl('system_factory'),
          dataIndex: 'OrgName',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$tl('system_phone_num'),
          dataIndex: 'Mobile',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$tl('system_email', '邮箱'),
          dataIndex: 'Email',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$tl('system_JobStatusText', '在职状态'),
          dataIndex: 'JobStatus',
          width: '80px',
          type: '1',
          sortable: true,
          ellipsis: true,
          dictKey: 'job_status',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.JobStatus,
                'dict-key': 'job_status',
              },
            }),
        },
        {
          title: this.$tl('base_user_DepartName', '部门'),
          dataIndex: 'DepartName',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
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
          title: this.$t('MMS_Remark'),
          dataIndex: 'Remark',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    // 当前字典
    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
    sexOptions() {
      return this.dictMap['sys_user_sex'] && this.dictMap['sys_user_sex'].items
    },
    jobStatusOptions() {
      return this.dictMap['job_status'] && this.dictMap['job_status'].items
    },
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val)
    },
  },
  created() {
    // this.getList();
    this.getTreeselect()
    this.$store.dispatch('dict/getByDictKeys', ['sys_normal_disable', 'sys_user_sex', 'job_status'])
    const data = {
      PageIndex: 1,
      PageRows: 100,
      Search: {
        ModuleName: '用户管理-账号初始密码',
        KeyName: 'sys_user_initPassword',
      },
    }
    this.getConfigKey(data).then(response => {
      if (response.Data.PageList.length > 0) {
        this.initPassword = response.Data.PageList[0].Value
      }
    })
    this.getTestUnit()
    this.getTypeOfWork()
  },
  methods: {
    // 检验角色
    checkRoles(value) {
      return checkRole(value)
    },
    /** 查询用户列表 */
    async getList() {
      this.searchLoading = true
      this.loading = true
      const data = this.queryParams
      // IsShowOutWork：0 查全部，1或不传：过滤已离职人员
      data.Search = Object.assign(data.Search, { IsShowOutWork: 0 })
      const response = await listUser(data)
      this.searchLoading = false
      this.loading = false
      if (response.Success) {
        this.userList = response.Data.PageList
        this.total = response.Data.Total
      } else {
        this.msgError(response.Msg)
      }
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect({}).then(response => {
        this.deptOptions = response.Data
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.Search.Code = data.Code
      this.getList()
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row.Status === 0 ? '启用' : '停用'

      this.$confirm('确认要"' + text + '""' + row.RealName + '"用户吗?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          const data = {
            Id: row.Id,
            Status: row.Status,
          }
          return changeUserStatus(data)
        })
        .then(res => {
          if (res.Success) {
            this.msgSuccess(text + '成功')
          } else {
            this.msgError(res.Msg)
          }
        })
        .catch(function () {
          row.Status = row.Status === '0' ? '1' : '0'
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
        JobStatus: 1,
        RealName: undefined,
        UserCode: undefined,
        Mobile: undefined,
        OrgName: undefined,
        Sex: undefined,
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
      this.queryParams.Search.Code = ''
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      this.names = selection.map(item => item.RealName)
      this.UserCodes = selection.map(item => item.UserCode)

      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleResetPwd':
          this.handleResetPwd(row)
          break
        case 'handleAuthRole':
          this.handleAuthRole(row)
          break
        case 'handleUserRole':
          this.$router.push({
            path: '/system/userAuth/role/' + row.UserCode,
          })
          break
        default:
          break
      }
    },
    GetOrgListByUser(id) {
      GetOrgListByUser(id).then(response => {
        if (response.Success) {
          this.optionsOrgList = response.Data || []
        }
      })
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getTreeselect()
      getUser().then(response => {
        const arr = response.Data.Roles || []
        this.roleOptions = arr.filter(item => parseInt(item.Status) == 0)
        this.open = true
        this.isDisabel = false
        this.title = this.$t('system_add_user')
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()

      const userId = row.Id || this.ids
      this.GetOrgListByUser(row.UserCode)

      getUser(userId).then(response => {
        this.form = response.Data.UserInfo
        // this.roleOptions =response.Data.Roles || []
        //  let arr = response.Data.Roles || []
        // this.roleOptions = arr.filter(item =>{
        //   return parseInt(item.Status) == 0
        // });
        // this.form.RoleIds = response.Data.RoleIds;
        this.form.Status = this.form.Status.toString()

        this.isDisabel = true
        this.open = true
        // this.title = "修改用户";
        this.title = this.$t('system_user_update')
        this.form.password = ''
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      // this.$prompt('请输入"' + row.RealName + '"的新密码', this.$t("usual_notice"), {
      //   confirmButtonText: this.$t('usual_confirm'),
      //   cancelButtonText: this.$t('usual_cancel'),
      //   closeOnClickModal: false,
      //   inputPattern: /^.{5,20}$/,
      //   inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
      // })
      //   .then(({ value }) => {
      //     let data={
      //        "UserId": "Admin",
      //       "OldPwd": "123456",
      //       "NewPwd": "234242"
      //     }
      //     resetUserPwd(row.Id, value).then((response) => {
      //       this.msgSuccess("修改成功，新密码是：" + value);
      //     });
      //   })
      //   .catch(() => {});
      // '确认要重置该用户"' + row.RealName + '"密码为初始密码吗？',
      this.$confirm(this.$t('system_reset_user') + ' ' + row.RealName + ' ' + this.$t('system_password_initial') + '"？', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return resetUserPwd(row.Id)
        })
        .then(response => {
          if (response.Success) {
            this.msgSuccess(this.$t('usual_modify_success'))
          } else {
            this.msgError(response.Msg)
          }
        })
        .catch(() => {})
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.Id
      this.$router.push({
        path: '/system/user-auth/role',
        query: {
          UserId: row.Id,
        },
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.Id != undefined) {
            updateUser(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess(this.$t('usual_modify_success'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.Msg)
              }
            })
          } else {
            addUser(this.form).then(response => {
              this.msgSuccess('新增成功')
              // this.open = false;
              this.reset()
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.Id || this.ids
      const userNames = row.RealName || this.names

      this.$confirm('是否确认删除用户名称为"' + userNames + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delUser(userIds)
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
      this.$confirm('是否确认导出所有用户数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.exportLoading = true
          return exportUser(queryParams)
        })
        .then(response => {
          this.download(response.msg)
          this.exportLoading = false
        })
        .catch(() => {})
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.msg)
      })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    // 检测单位选项请求
    async getTestUnit() {
      const res = await getTestUnitDataList({})
      if (res.Success) {
        this.TestUnitOptions = res.Data.PageList || []
      }
    },
    // 工种选项请求
    async getTypeOfWork() {
      const res = await getTypeOfWorkList({ Search: { DicKey: 'type_of_work' } })
      if (res.Success) {
        this.TypeOfWorkOptions = res.Data.PageList || []
      }
    },
    async getUserData() {
      //同步钉钉人员信息
      this.bottonLoading = true
      const res = await getUserData({})
      this.bottonLoading = false
      if (res.Success) {
        this.msgSuccess(res.Data)
        this.getList()
      } else {
        this.msgError(res.Msg)
      }
    },
    handleSetChkUnit() {
      this.$refs.setchkunit.init(this.UserCodes)
    },
  },
}
</script>
<style scoped lang="scss">
::v-deep .el-form-item__content .tree-border {
  max-height: 150px;
  overflow: scroll;
}
.head-container {
  max-height: 78vh;
  overflow: auto;
}
</style>
