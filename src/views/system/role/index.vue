<template>
  <div class="app-container">
    <el-form :model="queryParams.Search" ref="queryForm" v-show="showSearch" :inline="true">
      <el-form-item :label="$t('system_role_name')" prop="RoleName">
        <el-input v-model="queryParams.Search.RoleName" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('system_permission_character')" prop="RoleKey">
        <el-input v-model="queryParams.Search.RoleKey" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="width: 180px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('usual_status')" prop="Status">
        <el-select v-model="queryParams.Search.Status" :placeholder="$t('usual_choose')" clearable size="small" style="width: 130px">
          <el-option v-for="dict in statusOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
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
        <!-- v-hasPermi="['system:role:add']" -->
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:role:add']">{{ $t('usual_add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <!-- v-hasPermi="['system:role:edit']" -->
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:role:edit']">{{ $t('usual_update') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <!-- v-hasPermi="['system:role:remove']" -->
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:role:remove']">{{ $t('usual_delete') }}</el-button>
      </el-col>
      <!-- <el-col :span="1.5">

        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
         v-hasPermi="['system:role:export']"
        >{{$t('usual_export')}}</el-button>
      </el-col> -->
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <base-table v-loading="loading" :columns="columns" :list="roleList" :options="options" @handleSelectionChange="handleSelectionChange">
      <template slot="action">
        <table-column fixed="right" width="200" :label="$t('usual_operation')">
          <template slot-scope="scope" v-if="scope.row.Id != 'admin'">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']">{{ $t('usual_update') }}</el-button>

            <el-button size="mini" type="text" icon="el-icon-delete" style="cursor: pointer; color: #f00" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']">{{
              $t('usual_delete')
            }}</el-button>
            <el-dropdown size="mini" @command="command => handleCommand(command, scope.row)">
              <span style="cursor: pointer; color: #1890ff; margin-left: 5px; font-size: 12px"> <i class="el-icon-d-arrow-right el-icon--right"></i>{{ $t('usual_more') }} </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="handleAuthUser" icon="el-icon-user" v-hasPermi="['system:role:allocation']">分配用户</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </table-column>
      </template>
    </base-table>
    <pagination v-show="total > 0" :total="total" :page="queryParams.PageIndex" :limit="queryParams.PageRows" @pagination="getList" />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('system_role_name')" prop="RoleName">
          <el-input v-model="form.RoleName" :placeholder="$t('MOM_InputPlease')" />
        </el-form-item>
        <el-form-item prop="RoleKey">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            {{ $t('system_permission_character') }}
          </span>
          <el-input v-model="form.RoleKey" :placeholder="$t('MOM_InputPlease')" />
        </el-form-item>
        <el-form-item :label="$t('system_role_order')" prop="RoleSort">
          <el-input-number v-model="form.RoleSort" controls-position="right" :min="0" />
        </el-form-item>

        <el-form-item :label="$t('usual_status')">
          <el-radio-group v-model="form.Status">
            <el-radio v-for="dict in statusOptions" :key="dict.DataValue" :label="dict.DataValue">{{ dict.DataText }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('system_menu_permissions')">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.MenuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menu" node-key="Id" :check-strictly="!form.MenuCheckStrictly" empty-text="加载中，请稍后" :props="defaultProps"></el-tree>
        </el-form-item>
        <el-form-item :label="$t('MMS_Remark')">
          <el-input v-model="form.Remark" type="textarea" :placeholder="$t('MOM_InputPlease')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色数据权限对话框 -->
    <el-dialog :title="title" :visible="openDataScope" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item :label="$t('system_role_name')">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('system_permission_character')">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" v-show="form.dataScope == 2">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            ref="dept"
            node-key="id"
            :check-strictly="form.deptCheckStrictly"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancelDataScope">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, getRole, delRole, addRole, updateRole, exportRole, dataScope, changeRoleStatus } from '@/api/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'
import { treeselect as deptTreeselect, roleDeptTreeselect } from '@/api/system/dept'
import { mapGetters } from 'vuex'

export default {
  name: 'Role',
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
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      menuExpand: false,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      // 日期范围
      dateRange: [],

      // 数据范围选项
      dataScopeOptions: [
        {
          value: '1',
          label: '全部数据权限',
        },
        {
          value: '2',
          label: '自定数据权限',
        },
        {
          value: '3',
          label: '本部门数据权限',
        },
        {
          value: '4',
          label: '本部门及以下数据权限',
        },
        {
          value: '5',
          label: '仅本人数据权限',
        },
      ],
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        PageIndex: 1,
        PageRows: 100,
        Search: {
          roleName: undefined,
          roleKey: undefined,
          status: undefined,
        },
      },
      // 表单参数
      form: {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        Status: '0',
        MenuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined,
      },
      defaultProps: {
        children: 'Children',
        label: 'Label',
      },
      // 表单校验
      rules: {
        RoleName: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        RoleKey: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        RoleSort: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
      },
      columns: [
        {
          title: this.$t('system_roleId'),
          dataIndex: 'Id',
          width: '200px',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$t('system_role_name'),
          dataIndex: 'RoleName',
          width: '200px',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$t('system_permission_character'),
          dataIndex: 'RoleKey',
          width: '200px',
          sortable: true,
          ellipsis: true,
          align: 'left',
        },
        {
          title: this.$t('system_sort'),
          dataIndex: 'RoleSort',
          width: '100px',
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
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
  },
  created() {
    this.getList()
    if (!this.dictMap['sys_normal_disable']) {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: 'sys_normal_disable',
      })
    }
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true
      // this.addDateRange(this.queryParams, this.dateRange)
      const list = {}
      listRole(this.queryParams).then(response => {
        this.loading = false
        if (response.Success) {
          this.roleList = response.Data.PageList
          this.total = response.Data.Total
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    /** 查询菜单树结构 */
    getMenuTreeselect() {
      const list = {}
      menuTreeselect(list).then(response => {
        if (response.Success) {
          this.menuOptions = response.Data
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    /** 查询部门树结构 */
    getDeptTreeselect() {
      deptTreeselect().then(response => {
        if (response.Success) {
          this.deptOptions = response.data
        } else {
          this.msgError(response.Msg)
        }
      })
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      const checkedKeys = this.$refs.menu.getCheckedKeys()
      // 半选中的菜单节点
      const halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)

      return checkedKeys
    },
    // 所有部门节点数据
    getDeptAllCheckedKeys() {
      // 目前被选中的部门节点
      const checkedKeys = this.$refs.dept.getCheckedKeys()
      // 半选中的部门节点
      const halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
      return checkedKeys
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then(response => {
        this.menuOptions = response.Data.menus
        return response
      })
    },
    /** 根据角色ID查询部门树结构 */
    getRoleDeptTreeselect(roleId) {
      return roleDeptTreeselect(roleId).then(response => {
        this.deptOptions = response.depts
        return response
      })
    },
    // 角色状态修改
    handleStatusChange(row) {
      const text = row.Status === '0' ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row.RoleName + '"角色吗?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return changeRoleStatus(row.Id, row.Status)
        })
        .then(response => {
          if (response.Success) {
            this.msgSuccess(text + '成功')
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
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false
      this.reset()
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([])
      }
      this.menuExpand = false
      this.menuNodeAll = false
      this.deptExpand = true
      this.deptNodeAll = false
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '0',
        MenuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined,
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.Id)
      this.names = selection.map(item => item.RoleName)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleDataScope':
          this.handleDataScope(row)
          break
        case 'handleAuthUser':
          this.handleAuthUser(row)
          break
        default:
          break
      }
    },
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == 'menu') {
        const treeList = this.menuOptions

        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].Id].expanded = value
        }
      } else if (type == 'dept') {
        const treeList = this.deptOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].Id].expanded = value
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : [])
      } else if (type == 'dept') {
        this.$refs.dept.setCheckedNodes(value ? this.deptOptions : [])
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type == 'menu') {
        this.form.menuCheckStrictly = value ? true : false
      } else if (type == 'dept') {
        this.form.deptCheckStrictly = value ? true : false
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      //lijinya 2022.05.11
      this.$router.push({ name: 'updateRole', params: { roleId: '' } })
      // this.reset();
      // this.getMenuTreeselect();
      // this.open = true;
      // this.title = "添加角色";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      //lijinya 2022.05.11
      const roleId = row.Id || this.ids
      this.$router.push({ name: 'updateRole', params: { roleId: roleId } })
      // this.reset();
      // const roleId = row.Id || this.ids
      // const roleMenu = this.getRoleMenuTreeselect(roleId);
      // getRole(roleId).then(response => {
      //   this.form = response.Data;
      //   this.form.Status=this.form.Status.toString();
      //   console.log(this.form,"this.form")
      //   this.open = true;
      //   this.$nextTick(() => {
      //     roleMenu.then(res => {
      //       let checkedKeys = res.Data.checkedKeys
      //       checkedKeys.forEach((v) => {
      //           this.$nextTick(()=>{
      //               this.$refs.menu.setChecked(v, true ,false);
      //           })
      //       })
      //     });
      //   });
      //   this.title = "修改角色";
      // });
    },
    /** 选择角色权限范围触发 */
    dataScopeSelectChange(value) {
      if (value !== '2') {
        this.$refs.dept.setCheckedKeys([])
      }
    },
    /** 分配数据权限操作 */
    handleDataScope(row) {
      this.reset()
      const roleDeptTreeselect = this.getRoleDeptTreeselect(row.roleId)
      getRole(row.roleId).then(response => {
        this.form = response.Data
        this.openDataScope = true
        this.$nextTick(() => {
          roleDeptTreeselect.then(res => {
            this.$refs.dept.setCheckedKeys(res.checkedKeys)
          })
        })
        this.title = '分配数据权限'
      })
    },
    /** 分配用户操作 */
    handleAuthUser: function (row) {
      // console.log(row,"9999")
      const roleId = row.Id
      this.$router.push('/system/role-auth/user/' + roleId)
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.Id != undefined) {
            this.form.MenuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess(this.$t('usual_modify_success'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.Msg)
              }
            })
          } else {
            this.form.MenuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(response => {
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
    /** 提交按钮（数据权限） */
    submitDataScope: function () {
      if (this.form.roleId != undefined) {
        this.form.deptIds = this.getDeptAllCheckedKeys()
        dataScope(this.form).then(response => {
          this.msgSuccess(this.$t('usual_modify_success'))
          this.openDataScope = false
          this.getList()
        })
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = row.Id ? [row.Id] : this.ids
      const userNames = row.RoleName || this.names

      this.$confirm(this.$t('iqc_sure_forever_del'), this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delRole(roleIds)
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
      this.$confirm('是否确认导出所有角色数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(() => {
          this.exportLoading = true
          return exportRole(queryParams)
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
