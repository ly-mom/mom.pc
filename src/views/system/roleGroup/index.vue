<template>
  <div class="app-container roleGroupMain">
    <el-row :gutter="10" type="flex" style="flex-wrap: wrap">
      <el-col :md="8" :xs="24">
        <div class="roleBox">
          <div class="boxTitle group">
            <div class="boxTitleLeft">
              {{ $tl('system_roleGroup_Title', '角色组') }}
            </div>
          </div>
          <div class="boxContent">
            <div slot="reference" class="actionHeader mb10">
              <el-tooltip class="item" effect="dark" :content="$t('usual_refresh')" placement="top">
                <el-button size="mini" circle icon="el-icon-refresh" @click="refreshGroup()" />
              </el-tooltip>
              <template v-if="OperationType != 'User'">
                <el-tooltip class="item" effect="dark" :content="$tl('system_roleGroup_addRoleGroup', '新建角色组')" placement="top">
                  <el-button size="mini" circle icon="el-icon-folder-add" @click="hanldleGroupAdd()" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="$tl('system_roleGroup_addRole', '新建角色')" placement="top">
                  <el-button size="mini" circle icon="el-icon-document-add" @click="hanldleRoleAdd()" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="$tl('system_roleGroup_batchDelete', '批量删除')" placement="top">
                  <el-button size="mini" circle icon="el-icon-delete" @click="handleBatchDelete()" />
                </el-tooltip>
              </template>
            </div>
            <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" :disabled="isEmptyValue(roleGroupData)" v-model="groupFilterText"> </el-input>
            <el-tree
              class="treeBox groupTree"
              v-loading="loading.group"
              node-key="Id"
              ref="groupTree"
              :data="roleGroupData"
              :props="groupTreeProps"
              :check-strictly="true"
              :show-checkbox="OperationType != 'User'"
              :draggable="OperationType == 'Admin'"
              highlight-current
              @node-contextmenu="rightClick"
              @node-click="roleGroupNodeClick"
              @node-drag-start="nodeDragStart"
              @node-drag-end="nodeDragEnter"
              :allow-drag="allowDrag"
              :allow-drop="allowDrop"
              :filter-node-method="groupFilterNode"
            >
              <div slot-scope="{ data }" class="treeItem">
                <div style="display: flex; justify-content: flex-start" :class="[data.Status == 1 ? 'text-reds' : '']">
                  <svg-icon v-if="data.IsGroup" icon-class="roleGroup" :style="{ width: '16px', height: '16px', color: '#5D7092' }" />
                  <svg-icon v-if="!data.IsGroup" icon-class="role" :style="{ width: '16px', height: '16px', color: '#319CFF' }" />
                  <span>{{ data.Name }}</span>
                  <span v-hasRole="topRole">({{ data.Code }})</span>
                </div>
              </div>
            </el-tree>
            <div id="menu" v-show="menuVisible" @mouseleave="menuVisible = false">
              <ul class="el-dropdown-menu el-popper el-dropdown-menu--medium rightClickCard">
                <li v-for="(item, index) in contextmenuListActual" :key="index" class="el-dropdown-menu__item" @click="handleCommand(item.command, currentNodeRight.data)">
                  <i v-if="item.icon" :class="item.icon"></i>
                  {{ item.text }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :md="8" :xs="24">
        <div class="roleBox">
          <div class="boxTitle menu">
            <div class="boxTitleLeft">
              {{ $tl('system_roleGroup_Title2', '菜单') }}
              <template v-if="!isEmptyValue(currentData)">
                ：
                <svg-icon v-if="currentDataType == 1" icon-class="roleGroup" :style="{ width: '20px', height: '20px', color: '#fff' }" />
                <svg-icon v-if="currentDataType == 2" icon-class="role" :style="{ width: '20px', height: '20px', color: '#fff' }" />
                {{ currentData.data.Name }}
              </template>
            </div>
          </div>
          <div class="boxContent">
            <div class="actionHeader mb10">
              <el-tooltip class="item" effect="dark" :content="$t('usual_refresh')" placement="top">
                <el-button size="mini" circle :disabled="isEmptyValue(currentData)" icon="el-icon-refresh" @click="getMenuList()" />
              </el-tooltip>
              <template v-if="hasPerimission">
                <el-tooltip class="item" effect="dark" :content="$tl('system_perimission_check_strictly', '父子联动')" placement="top" v-hasPermi="['system:roleAndGroup:checkStrictly']">
                  <el-button size="mini" circle :disabled="isEmptyValue(currentData)" icon="el-icon-attract" @click="menuCheckStrictly = !menuCheckStrictly" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="$tl('system_roleGroup_saveMenu', '保存菜单配置')" placement="top" v-hasPermi="['system:roleGroup:setMenu']">
                  <el-button size="mini" circle :disabled="isEmptyValue(currentData)" :loading="loading.saveMenu" icon="el-icon-document" @click="hanldleSetMenu()" />
                </el-tooltip>
              </template>
            </div>
            <el-input size="mini" :placeholder="$tl('base_keyword_search', '请输入关键字搜素')" v-model="menuFilterText" :disabled="isEmptyValue(currentData)" class="input-with-select">
              <el-select slot="prepend" filterable :placeholder="$t('MOM_InputPlease')" style="width: 90px" v-model="menuPlatform" :disabled="isEmptyValue(currentData)" @change="getMenuList">
                <el-option v-for="dict in platformList" :value="dict.DataValue" :key="dict.DataValue" :label="dict.DataText"> </el-option>
              </el-select>
            </el-input>
            <el-tree
              class="treeBox menuTree"
              v-loading="loading.menu"
              node-key="id"
              ref="menuTree"
              :data="menuList"
              :check-strictly="menuCheckStrictly"
              :props="menuTreeProps"
              :show-checkbox="hasPerimission"
              :filter-node-method="menuFilterNode"
            >
              <div slot-scope="{ data }" class="treeItem">
                <div>
                  <span>
                    <template v-if="data.platform == 'PC'">
                      <svg-icon :style="data.menuType == 'F' ? { fontSize: '20px' } : ''" :icon-class="data.menuType == 'F' ? 'plainButton' : data.icon" />
                    </template>
                    <template v-else>
                      <!--移动端选的图标-->
                      <i :class="['albb_icon', 'iconfont', data.icon]"></i>
                    </template>
                  </span>
                  <el-tooltip :disabled="!checkRole(topRole)" placement="top" :open-delay="500">
                    <div slot="content">
                      <div>{{ 'id：' + data.id }}</div>
                      <div v-if="data.menuType == 'C'">{{ 'componentPath：' + data.componentPath }}</div>
                    </div>
                    <span>{{ data.menuName }}{{ data.menuType == 'F' && checkRole(topRole) ? `(${data.permissions})` : '' }}</span>
                  </el-tooltip>
                </div>
              </div>
            </el-tree>
          </div>
        </div>
      </el-col>
      <el-col :md="8" :xs="24">
        <div class="roleBox">
          <div class="boxTitle member">
            <div class="boxTitleLeft">
              {{ $tl('system_roleGroup_Title3', '人员') }}
              <template v-if="!isEmptyValue(currentData)">
                ：
                <svg-icon v-if="currentDataType == 1" icon-class="roleGroup" :style="{ width: '20px', height: '20px', color: '#fff' }" />
                <svg-icon v-if="currentDataType == 2" icon-class="role" :style="{ width: '20px', height: '20px', color: '#fff' }" />
                {{ currentData.data.Name }}
              </template>
            </div>
          </div>
          <div class="boxContent">
            <div class="actionHeader mb10">
              <el-tooltip class="item" effect="dark" :content="$t('usual_refresh')" placement="top">
                <el-button size="mini" circle :disabled="isEmptyValue(currentData)" icon="el-icon-refresh" @click="getMemberList()" />
              </el-tooltip>
              <template v-if="hasPerimission">
                <el-tooltip class="item" effect="dark" :content="$tl('system_roleGroup_addUserTo', '授权用户')" placement="top" v-hasPermi="['system:roleAndGroup:allocation']">
                  <el-button size="mini" circle :disabled="isEmptyValue(currentData)" icon="el-icon-s-check" @click="allocateUser" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="$tl('system_roleGroup_removeUserTo', '取消授权')" placement="top" v-hasPermi="['system:roleAndGroup:unallocation']">
                  <el-button size="mini" circle :disabled="isEmptyValue(currentData)" :loading="loading.removeUser" icon="el-icon-s-release" @click="removeUser()" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" :content="$tl('system_perimission_checkedAll', '全选/全不选')" placement="top" v-hasPermi="['system:roleAndGroup:unallocation']">
                  <el-button size="mini" circle :disabled="isEmptyValue(currentData)" icon="el-icon-success" @click="handleCheckedAll()" />
                </el-tooltip>
              </template>
              <span v-hasPermi="['system:roleAndGroup:memberOrg']">
                <el-divider direction="vertical"></el-divider>
              </span>
              <el-tooltip class="item" effect="dark" :content="$tl('system_roleGroup_memberOrg', '用户授权厂区')" placement="top" v-hasPermi="['system:roleAndGroup:memberOrg']">
                <el-button size="mini" circle icon="el-icon-office-building" @click="$refs.MemberOrg.show()" />
              </el-tooltip>
            </div>
            <el-input
              size="mini"
              :placeholder="$tl('base_keyword_search', '请输入关键字搜素')"
              v-model="memberFilterText"
              :disabled="isEmptyValue(currentData)"
              @keyup.enter.native="handleMemberQuery"
            >
              <template slot="append">
                <BatchInput :value="memberFilterText" :disabled="isEmptyValue(currentData)"></BatchInput>
              </template>
            </el-input>
            <el-tree class="treeBox memberTree" v-loading="loading.member" node-key="UserCode" ref="memberTree" :data="memberData" :show-checkbox="hasPerimission" :props="memberTreeProps">
              <div slot-scope="{ data }" class="treeItem">
                <div>
                  <span>{{ data.UserCode }}</span>
                  <el-divider direction="vertical"></el-divider>
                  <span>{{ data.RealName }}</span>
                  <el-divider direction="vertical"></el-divider>
                  <span>{{ data.DepartName }}</span>
                </div>
              </div>
            </el-tree>
            <pagination layout="total, prev, pager, next" small :total="memberQueryParams.Total" :page="memberQueryParams.PageIndex" :limit="memberQueryParams.PageRows" @pagination="getMemberList">
            </pagination>
          </div>
        </div>
      </el-col>
    </el-row>
    <edit-form ref="editForm" :parentObj="this"></edit-form>
    <member-org ref="MemberOrg" v-hasPermi="['system:roleAndGroup:memberOrg']" :parentObj="this"></member-org>
    <select-user ref="SelectUser" :parentObj="this" @confirm="handleAllocateUser"></select-user>
    <select-role ref="SelectRole" :parentObj="this" @confirm="handleSetRoleInGroup"></select-role>
    <role-edit-form ref="roleEditForm" :parentObj="this"></role-edit-form>
    <el-dialog :title="$tl('system_roleGroup_title4', '给角色组分配角色')" width="700px" :visible="groupSetRoleVisible" @close="groupSetRoleVisible = false" v-dialogDrag :close-on-click-modal="false">
      <div>{{ currentNodeRight.GroupName }}</div>
      <el-select v-model="alloctRoleIds" :style="{ width: '100%' }" clearable multiple :placeholder="$t('usual_choose')">
        <el-option v-for="item in roleOptions" :key="item.RoleKey" :label="item.RoleName" :value="item.RoleKey" :disabled="checkRole(topRole) ? false : item.RoleKey == 'Development'"></el-option>
      </el-select>
      <el-button size="mini" type="primary" @click="handleSetRoleInGroup">{{ $t('usual_confirm') }}</el-button>
    </el-dialog>
  </div>
</template>

<script>
import EditForm from './EditForm'
import RoleEditForm from './RoleEditForm'
import SelectUser from './SelectUser'
import SelectRole from './SelectRole'
import MemberOrg from './MemberOrg'
import { listMenu, getMenuTree } from '@/api/system/menu'
import {
  getRoleGroupAndRoleTree,
  getRoleGroupList,
  getRoleGroupRole,
  listRole,
  deleteRoleGroup,
  setRoleGroupRole,
  setRoleGroupMenu,
  getRoleGroupMenu,
  setRoleGroupUser,
  removeRoleGroupUser,
  getRoleGroupUser,
  addRoleGroup,
  editRoleGroup,
  exportRole,
  dataScope,
  changeRoleStatus,
  allocatedUserList,
  updateRole,
  authUserSelectAll,
  delRole,
  moveRoleinGroup,
  removeRoleGroupRole,
  allocatedMenu,
  authUserCancelAll,
  getAllocatedUser,
} from '@/api/system/role'
import _ from 'lodash'
import { checkRole, checkPermi } from '@/utils/permission'
import { mapGetters } from 'vuex'
import BatchInput from '@/components/BatchInput'

export default {
  name: 'RoleGroup',
  data() {
    return {
      loading: {
        group: false,
        menu: false,
        member: false,
        batchDelGroup: false,
        saveMenu: false,
        removeUser: false,
      },
      menuPlatform: 'PC',
      roleGroupData: [],
      OperationType: '', // 当前用户的级别
      currentNodeRight: {},
      currentData: {},
      currentDataType: null, // 1是角色组，2是角色
      roleOptions: [],
      alloctRoleIds: [],
      contextmenuListActual: [],
      // 最高权限的角色
      topRole: ['Development', 'admin'],
      contextmenuList: [
        {
          IsGroup: true,
          miniLevel: 0,
          icon: 'el-icon-edit',
          text: this.$tl('system_roleGroup_editRoleGroup', '修改角色组'),
          permi: undefined,
          command: 'editRoleGroup',
        },
        {
          IsGroup: true,
          miniLevel: 0,
          icon: 'el-icon-delete',
          text: this.$tl('system_roleGroup_deleteRoleGroup', '删除角色组'),
          permi: undefined,
          command: 'deleteRoleGroup',
        },
        {
          IsGroup: true,
          miniLevel: 0,
          icon: 'el-icon-document-checked',
          text: this.$tl('system_roleGroup_alloctRole', '分配角色'),
          permi: undefined,
          command: 'allocatRole',
        },
        {
          IsGroup: true,
          miniLevel: 0,
          icon: 'el-icon-document-add',
          text: this.$tl('system_roleGroup_editRoleGroup', '新增角色'),
          permi: undefined,
          command: 'addRoleFromGroup',
        },
        {
          IsGroup: true,
          miniLevel: 0,
          icon: 'el-icon-folder-add',
          text: this.$tl('system_roleGroup_addRoleGroup', '新建角色组'),
          permi: undefined,
          command: 'hanldleGroupAdd',
        },
        {
          IsGroup: false,
          miniLevel: 0,
          icon: 'el-icon-edit',
          text: this.$tl('system_roleGroup_editRole', '修改角色'),
          permi: undefined,
          command: 'editRole',
        },
        {
          IsGroup: false,
          miniLevel: 0,
          icon: 'el-icon-delete',
          text: this.$tl('system_roleGroup_deleteRole', '删除角色'),
          permi: undefined,
          command: 'deleteRole',
        },
        {
          IsGroup: false,
          miniLevel: 1,
          icon: 'el-icon-news',
          text: this.$tl('system_roleGroup_deleteRoleFromGroup', '移出该角色组'),
          permi: undefined,
          command: 'removeRoleFromGroup',
        },
      ],
      contextmenuVisible: false,
      groupSetRoleVisible: false,
      menuVisible: false,
      memberTreeProps: {
        children: 'children',
        label: 'Name',
      },
      menuTreeProps: { children: 'children', label: 'menuName' },
      groupTreeProps: { children: 'Children', label: 'Name' },
      memberColumns: [
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
          title: this.$tl('system_username'),
          dataIndex: 'RealName',
          width: '100px',
          type: '2',
          sortable: true,
          ellipsis: true,
          align: 'left',
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
      ],
      memberData: [],
      menuList: [],
      menuFilterText: '',
      groupFilterText: '',
      memberFilterText: '',
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: true, // 是否支持列表项选中功能
      }, // table 的参数
      memberQueryParams: {
        Total: 1,
        PageIndex: 1,
        PageRows: 100,
        Search: {
          groupId: undefined,
          RoleId: undefined,
          UserCode: undefined,
        },
      },
      draggingNode: null, // 开始拖拽的节点， 包括父节点的信息
      groupList: [], // 所属角色组的下拉列表
      menuCheckStrictly: false, //菜单是否父子联动
    }
  },
  components: {
    EditForm,
    RoleEditForm,
    SelectUser,
    SelectRole,
    BatchInput,
    MemberOrg,
  },
  mounted() {
    this.$store.dispatch('dict/getByDictKeys', ['system_platform'])
    this.getRoleGroupList()
    // this.getMenuList();
  },
  computed: {
    ...mapGetters(['dictMap']),
    platformList() {
      return this.dictMap['system_platform'] && this.dictMap['system_platform'].items
    },
    hasPerimission: {
      get() {
        return (
          // 开发者和管理员
          this.OperationType == 'Admin' ||
          // 角色组管理员的非根角色组
          (this.OperationType == 'GroupAdmin' && this.hasParentNode(this.currentData, false) && this.currentDataType == 1) ||
          // 角色组管理员的角色
          (this.OperationType == 'GroupAdmin' && this.currentDataType == 2)
        )
      },
      set(newValue) {
        return newValue
      },
    },
  },
  watch: {
    menuFilterText(val) {
      this.$refs.menuTree.filter(val)
    },
    groupFilterText(val) {
      this.$refs.groupTree.filter(val)
    },
  },
  methods: {
    checkRole,
    checkPermi,
    /**
     * @msg: 判断当前角色/角色组 是否有角色组（父节点）
     * @param {*} currentData 当前节点数据：角色/角色组
     * @param {*} IsGroup 查询的节点是否为角色组
     * @return {*} 是否有父节点
     */
    hasParentNode(currentData, IsGroup = true) {
      // 最顶层也存在parent，但是其data是数组而不是object，所以需要条件：!Array.isArray(currentData.parent.data)
      return IsGroup
        ? !this.isEmptyValue(currentData) && !currentData.data.IsGroup && !this.isEmptyValue(currentData.parent) && !Array.isArray(currentData.parent.data)
        : !this.isEmptyValue(currentData) && !this.isEmptyValue(currentData.parent) && !Array.isArray(currentData.parent.data)
    },
    roleGroupNodeClick(data, Node) {
      console.log(data, Node)
      this.currentData = Node
      this.currentDataType = data.IsGroup ? 1 : 2
      this.getMenuList()
      this.getMemberList()
    },
    /* 角色组操作 start */
    async getRoleGroupList() {
      this.loading.group = true
      const res = await getRoleGroupAndRoleTree({})
      this.loading.group = false
      if (res.Success) {
        this.roleGroupData = _.get(res, 'Data.Data', [])
        // this.roleGroupData = this.sortTreeRoleGroup(this.roleGroupData)
        this.OperationType = _.get(res, 'Data.OperationType')
        this.groupList = []
        this.findGroup(this.roleGroupData)
      } else {
        this.msgError(res.Msg)
      }
      // 去重
      this.groupList = _.uniqWith(this.groupList, (a, b) => a.Code == b.Code)
    },
    // 递归排序
    sortTreeRoleGroup(list) {
      if (this.isEmptyValue(list)) return []
      let result = this.sortRoleGroup(list)
      result = result.map(element => {
        if (!this.isEmptyValue(element.Children)) {
          element.Children = this.sortTreeRoleGroup(element.Children)
        }
        return element
      })
      return result
    },
    // 一层排序
    sortRoleGroup(list) {
      if (this.isEmptyValue(list)) return []
      let group = list.filter(e => e.IsGroup)
      let role = list.filter(e => !e.IsGroup)
      group = group.sort((a, b) => a.Sort - b.Sort)
      role = role.sort((a, b) => a.Sort - b.Sort)
      return group.concat(role)
    },
    async treeGetRole(node, resolve) {
      console.log(node, resolve)
      if (node.level > 1) {
        return resolve([])
      } else {
        const res = await getRoleGroupRole({ Search: { groupId: node.data.Id } })
        if (res.Success) {
          return resolve(res.Data.PageList)
        } else {
          this.msgError(res.Msg)
          return resolve()
        }
      }
    },
    rightClick(MouseEvent, object, Node, element) {
      if (this.OperationType == 'User') return
      // 非开发者或管理员，不允许修改最高层级角色组
      if (!checkRole(this.topRole) && !this.hasParentNode(Node, false)) return
      this.currentNodeRight = _.cloneDeep(Node)
      this.contextmenuListActual = this.contextmenuList.filter(
        e => this.currentNodeRight.data && this.currentNodeRight.data.IsGroup == e.IsGroup && e.miniLevel < this.currentNodeRight.level && checkPermi(e.permi),
      )
      console.log(this.contextmenuListActual)
      if (!this.isEmptyValue(this.contextmenuListActual)) {
        this.menuVisible = !this.isEmptyValue(this.contextmenuListActual)
        const menu = document.querySelector('#menu')
        const screenHei = document.body.clientHeight || window.screen.height
        const menuHeight = 22 + this.contextmenuListActual.length * 30
        if (MouseEvent.clientY + menuHeight > screenHei) {
          menu.style.cssText = 'position: fixed; left: ' + (MouseEvent.clientX - 10) + 'px' + '; top: ' + (MouseEvent.clientY - menuHeight + 20) + 'px; z-index: 999; cursor:pointer;'
        } else {
          menu.style.cssText = 'position: fixed; left: ' + (MouseEvent.clientX - 10) + 'px' + '; top: ' + (MouseEvent.clientY - 25) + 'px; z-index: 999; cursor:pointer;'
        }
      }
    },
    // 新增角色组
    hanldleGroupAdd(group) {
      this.$refs.editForm.openForm(undefined, this.$tl('system_roleGroup_addRoleGroup', '新建角色组'), group)
    },
    // 遍历筛出角色组
    findGroup(list) {
      list.forEach(item => {
        if (item.IsGroup) {
          this.groupList.push(item)
        }
        if (!this.isEmptyValue(item.Children)) {
          this.findGroup(item.Children)
        }
      })
    },
    // 编辑角色组
    handleEdit() {
      let group = null
      if (this.hasParentNode(this.currentNodeRight)) {
        group = this.currentNodeRight.parent.data
      }
      this.$refs.editForm.openForm(this.currentNodeRight.data.Id, this.$tl('system_roleGroup_editRoleGroup', '修改角色组'), group)
    },
    // 新增角色
    hanldleRoleAdd(group = null) {
      this.$refs.roleEditForm.openForm(undefined, this.$tl('system_roleGroup_addRole', '新建角色'), group)
    },
    // 编辑角色
    handleRoleEdit() {
      let group = null
      if (this.hasParentNode(this.currentNodeRight)) {
        group = this.currentNodeRight.parent.data
      }
      this.$refs.roleEditForm.openForm(this.currentNodeRight.data?.Id, this.$tl('system_roleGroup_editRole', '修改角色'), group)
    },
    // 批量删除
    handleBatchDelete() {
      const checkedNode = this.$refs.groupTree.getCheckedNodes()
      const check = this.checkedNodeIsSameLevel(checkedNode)
      if (check === 0) return
      if (!!check) {
        // 角色组的批量操作
        this.hanldleGroupDel()
      } else {
        // 角色的批量操作
        this.handleDeleteRole()
      }
    },
    // 删除角色组
    async hanldleGroupDel(code) {
      let data
      if (this.isEmptyValue(code)) {
        const checkedNode = this.$refs.groupTree.getCheckedNodes()
        data = checkedNode.map(e => e.Code)
      } else {
        data = [code]
      }
      this.$confirm(this.$t('iqc_sure_forever_del'), this.$t('usual_warning'), {
        type: 'warning',
      })
        .then(async () => {
          this.loading.batchDelGroup = true
          const res = await deleteRoleGroup(data)
          this.loading.batchDelGroup = false
          if (res.Success) {
            // 刷新列表
            this.refreshGroup()
            this.msgSuccess(this.$t('usual_operation_success'))
          } else {
            this.msgError(res.Msg)
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('usual_cancel_success'),
          })
        })
    },
    handleSelectionChange() {},
    handleCommand(command, row) {
      switch (command) {
        case 'allocatRole':
          this.$refs.SelectRole.show(row)
          // this.allocatRoleFn();
          break
        case 'editRoleGroup':
          this.handleEdit()
          break
        case 'deleteRoleGroup':
          this.hanldleGroupDel(row.Code)
          break
        case 'removeRoleFromGroup':
          this.hanldleRemoveRoleFromGroup(row)
          break
        case 'deleteRole':
          this.handleDeleteRole(row)
          break
        case 'addRoleFromGroup':
          this.hanldleRoleAdd(row)
          break
        case 'editRole':
          this.handleRoleEdit()
          break
        case 'hanldleGroupAdd':
          this.hanldleGroupAdd(row)
          break

        default:
          break
      }
      this.menuVisible = false
    },
    allocatRoleFn() {
      this.getAllRoleList()
      this.groupSetRoleVisible = true
    },
    async getAllRoleList() {
      const res = await listRole({})
      if (res.Success) {
        this.roleOptions = _.get(res, 'Data.PageList', [])
      } else {
        this.msgError(res.Msg)
      }
    },
    // 给角色组分配角色
    async handleSetRoleInGroup(roleKeys) {
      if (!this.isEmptyValue(roleKeys)) {
        const data = {
          GroupCode: this.currentNodeRight.data.Code,
          RoleKeys: roleKeys.map(e => e.RoleKey),
        }
        const res = await setRoleGroupRole(data)
        if (res.Success) {
          this.refreshGroup()
          this.$refs.SelectRole.cancel()
          this.msgSuccess(this.$t('usual_operation_success'))
        } else {
          this.msgError(res.Msg)
        }
      }
    },
    async hanldleRemoveRoleFromGroup(row) {
      const parent = _.get(this.currentNodeRight, 'parent.data', {})
      const data = {
        GroupCode: parent.Code,
        RoleKeys: [row.Code],
      }
      const res = await removeRoleGroupRole(data)
      if (res.Success) {
        this.refreshGroup()
        this.msgSuccess(this.$t('usual_operation_success'))
      } else {
        this.msgError(res.Msg)
      }
    },
    groupFilterNode(value, data) {
      if (!value) return true
      return data[this.groupTreeProps.label] && data[this.groupTreeProps.label].toUpperCase().includes(value.toUpperCase())
    },
    refreshGroup() {
      this.getRoleGroupList()
      this.currentData = null
      this.currentDataType = null
      this.menuList = []
      this.memberData = []
    },
    // 删除角色
    handleDeleteRole(row) {
      let roleIds = []
      if (row && row.Id) {
        roleIds = [row.Id]
      } else {
        const list = this.$refs.groupTree.getCheckedNodes().map(e => e.Id)
        roleIds = Array.from(new Set(list))
      }
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
            this.refreshGroup()
            this.msgSuccess(this.$t('IQC_DeleteSuccess'))
          } else {
            this.msgError(response.Msg)
          }
        })
        .catch(() => {})
    },
    // 判断节点是否可拖拽
    allowDrag(node) {
      return !node.data.IsGroup
    },
    // 判断拖拽节点是否可被放置
    allowDrop(draggingNode, dropNode, type) {
      // 从当前节点拖拽到当前节点不可以放置
      if (this.hasParentNode(this.draggingNode) && _.get(this.draggingNode, 'parent.data.Code') == dropNode.data.Code && type == 'inner') {
        return false
        // 只有角色组节点可以放置
      } else if (dropNode.data.IsGroup && type == 'inner') {
        return true
      } else {
        return false
      }
    },
    nodeDragStart(draggingNode) {
      // 保存当前拖拽节点的数据
      this.draggingNode = _.cloneDeep(draggingNode)
    },
    nodeDragEnter(draggingNode, dropNode, type, event) {
      this.$confirm(
        `${this.$tl('system_roleGroup_dragNodeEnter1', '确定将角色：')}${draggingNode.data?.Name}${this.$tl('system_roleGroup_dragNodeEnter2', '移动到角色组：')}${dropNode.data?.Name}`,
        this.$t('usual_warning'),
        {
          confirmButtonText: this.$t('usual_confirm'),
          cancelButtonText: this.$t('usual_cancel'),
          type: 'warning',
        },
      )
        .then(async () => {
          const hasParent = this.hasParentNode(this.draggingNode)
          // 移动角色到角色组
          const data = {
            fromGroupCode: hasParent ? _.get(this.draggingNode, 'parent.data.Code') : undefined,
            roleKey: draggingNode.data?.Code,
            toGroupCode: dropNode.data?.Code,
          }
          if (this.hasParentNode(draggingNode)) {
            _.set(data, 'fromGroupCode', _.get(this.currentData, 'parent.data.Code'))
          }
          const res = await moveRoleinGroup(data)
          if (res.Success) {
            this.msgSuccess(this.$t('usual_operation_success'))
          } else {
            this.msgError(res.Msg)
          }
          this.draggingNode = null
          this.refreshGroup()
        })
        .catch(e => {
          this.refreshGroup()
          this.draggingNode = null
        })
    },
    // 校验勾选项是否是同一类型（角色/角色组）
    checkedNodeIsSameLevel(nodes) {
      const list = Array.from(new Set(nodes.map(item => item.IsGroup)))
      if (list.length == 1) {
        return list[0]
      } else {
        this.msgInfo(this.$tl('system_roleGroup_SameLevel', '角色和角色组不能一起操作，请确认勾选项'))
        return 0
      }
    },
    // eslint-disable-next-line vue/no-dupe-keys
    hasPerimission(moduleName = '') {
      // 管理员拥有所有权限
      if (this.OperationType == 'Admin') return true
      // 普通用户无任何权限
      if (this.OperationType == 'User') return false
      let result = false
      if (moduleName.toUpperCase() == 'MENU') {
        // 其余的，除了角色组管理员能管理角色的菜单外，都没权限
        result = this.currentDataType == 2 && this.OperationType == 'GroupAdmin' ? true : false
        // 角色组管理员点击未分组的角色时，也无权操作菜单
        if (this.currentData && !this.hasParentNode(this.currentData) && this.currentDataType == 2 && this.OperationType == 'GroupAdmin') result = false
      } else if (moduleName.toUpperCase() == 'MEMBER') {
        // 角色组管理员允许修改角色的人员分配，不能修改角色组的人员分配
        result = this.currentDataType == 2 && this.OperationType == 'GroupAdmin' ? true : false
      }
      return result
    },
    /* 角色组操作 end */

    /* 菜单操作 start */
    async getMenuList() {
      this.loading.menu = true
      //   let res = await listMenu({ platform: "PC" });
      const data = {
        RoleKey: !this.currentData.data.IsGroup ? this.currentData.data.Code : '',
        groupCode: this.currentData.data.IsGroup ? this.currentData.data.Code : '',
        platform: this.menuPlatform,
      }
      if (this.hasParentNode(this.currentData)) {
        _.set(data, 'groupCode', _.get(this.currentData, 'parent.data.Code'))
      }
      const rsp = await getMenuTree(data)
      this.loading.menu = false
      if (rsp.Success) {
        this.menuList = _.cloneDeep(rsp.Data.PermissionMenus) || []
        setTimeout(() => {
          const SelectMenuIds = _.cloneDeep(rsp.Data.SelectMenuIds)
          SelectMenuIds.forEach(item => {
            this.$refs.menuTree.setChecked(item, true)
          })
          // 下方一起设置已选节点的方法有问题，选中不对应的选项，改用上方循环的方法设置选中值
          // this.$refs.menuTree.setCheckedKeys(SelectMenuIds);
        }, 300)
      } else {
        this.msgError(rsp.Msg)
      }
    },
    menuFilterNode(value, data) {
      if (!value) return true
      return data[this.menuTreeProps.label] && data[this.menuTreeProps.label].toUpperCase().includes(value.toUpperCase())
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      //#####PC端菜单权限#####
      // 目前被选中的菜单节点
      const checkedKeys = this.$refs.menuTree.getCheckedKeys()
      // 半选中的菜单节点
      const halfCheckedKeys = this.$refs.menuTree.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)

      //#####移动端端菜单权限#####
      // 目前被选中的菜单节点
      //  let checkedKeys2 = this.$refs.menuTreeMobile.getCheckedKeys();
      //  // 半选中的菜单节点
      //  let halfCheckedKeys2 = this.$refs.menuMobile.getHalfCheckedKeys();
      //  checkedKeys2.unshift.apply(checkedKeys2, halfCheckedKeys2);

      // let arr = checkedKeys.concat(checkedKeys2)
      return checkedKeys
    },
    // 保存菜单配置
    async hanldleSetMenu() {
      let res = null
      const data = {}
      const menuIds = this.getMenuAllCheckedKeys()
      _.set(data, 'platform', this.menuPlatform)
      _.set(data, 'menuIds', menuIds)
      this.loading.saveMenu = true
      if (this.currentDataType == 1) {
        _.set(data, 'GroupCode', this.currentData.data.Code)
      } else {
        if (this.hasParentNode(this.currentData)) {
          _.set(data, 'GroupCode', _.get(this.currentData, 'parent.data.Code'))
        }
        _.set(data, 'RoleKey', this.currentData.data.Code)
        // res = await allocatedMenu(data);
      }
      res = await setRoleGroupMenu(data)
      this.loading.saveMenu = false
      if (res.Success) {
        this.msgSuccess(this.$t('usual_operation_success'))
      } else {
        this.msgError(res.Msg)
      }
    },
    /* 菜单操作 end */

    /* 人员操作 start */
    handleMemberQuery(params = {}) {
      this.memberQueryParams.PageIndex = 1
      this.memberQueryParams.PageRows = 100
      this.memberQueryParams.Search = params
      if (!this.isEmptyValue(this.memberFilterText)) {
        _.set(this.memberQueryParams, 'Search.UserCode', this.memberFilterText)
      }
      this.getMemberList()
    },
    async getMemberList() {
      this.loading.member = true
      const data = _.cloneDeep(this.memberQueryParams)

      if (this.currentDataType == 1) {
        _.set(data, 'Search.GroupCode', this.currentData.data.Code)
      } else {
        _.set(data, 'Search.RoleKey', this.currentData.data.Code)
        if (this.hasParentNode(this.currentData)) {
          _.set(data, 'Search.GroupCode', _.get(this.currentData, 'parent.data.Code'))
        } else {
          _.set(data, 'Search.GroupCode', undefined)
        }
      }
      if (!this.isEmptyValue(this.memberFilterText)) {
        _.set(data, 'Search.Users', this.memberFilterText.split(','))
      } else {
        _.set(data, 'Search.Users', undefined)
      }
      const res = await getAllocatedUser(data)
      this.loading.member = false
      if (res.Success) {
        this.memberData = _.get(res, 'Data.PageList', [])
        this.memberQueryParams.Total = _.get(res, 'Data.Total', 0)
      } else {
        this.msgError(res.Msg)
      }
    },
    // 取消用户授权
    async removeUser() {
      const members = this.$refs.memberTree.getCheckedNodes() || []
      if (this.isEmptyValue(members)) {
        return this.msgInfo(this.$tl('system_roleGroup_removeUserTip1', '请勾选人员'))
      } else {
        this.$confirm(
          `${this.$tl('system_roleGroup_removeMember', `确定取消授权用户：`)}${`<span style="color:red;">${members.length + this.$tl('system_roleGroup_man', '人')}</span>`} ${
            '<div style="width:100%;overflow: auto;max-height:200px;">' + members.map(item => `<span>${item.RealName}(${item.UserCode})</span>`) + '</div>'
          }`,
          this.$t('usual_warning'),
          {
            confirmButtonText: this.$t('usual_confirm'),
            cancelButtonText: this.$t('usual_cancel'),
            type: 'warning',
            dangerouslyUseHTMLString: true,
          },
        )
          .then(async () => {
            this.loading.removeUser = true
            const data = {}
            if (this.currentDataType == 1) {
              _.set(data, 'GroupCode', this.currentData.data.Code)
            } else {
              _.set(data, 'GroupCode', this.currentData.parent.data.Code)
              _.set(data, 'RoleKey', this.currentData.data.Code)
              // res = await authUserCancelAll(data);
            }
            _.set(
              data,
              'UserCodes',
              members.map(e => e.UserCode),
            )
            const res = await removeRoleGroupUser(data)
            this.loading.removeUser = false
            if (res.Success) {
              this.msgSuccess(this.$t('usual_operation_success'))
              this.handleMemberQuery({})
            } else {
              this.msgError(res.Msg)
            }
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('usual_cancel_success'),
            })
          })
      }
    },
    // 显示选择用户的弹窗
    allocateUser() {
      let GroupCode, RoleKey
      if (_.get(this.currentData, 'data.IsGroup')) {
        // 角色组
        GroupCode = _.get(this.currentData, 'data.Code', undefined)
      } else {
        // 角色
        RoleKey = _.get(this.currentData, 'data.Code', undefined)
        if (this.hasParentNode(this.currentData)) {
          GroupCode = _.get(this.currentData, 'parent.data.Code')
        }
      }
      this.$refs.SelectUser.show(RoleKey, GroupCode)
    },
    async handleAllocateUser(list) {
      let data = {}
      if (this.currentDataType == 1) {
        _.set(data, 'GroupCode', this.currentData.data.Code)
        _.set(
          data,
          'UserCodes',
          list.map(e => e.UserCode),
        )
      } else {
        data = {
          RoleKey: _.get(this.currentData, 'data.Code'),
          UserCodes: list.map(e => e.UserCode),
          GroupCode: _.get(this.currentData, 'parent.data.Code'),
        }
      }
      const res = await setRoleGroupUser(data)
      if (res.Success) {
        this.$refs.SelectUser.cancel()
        this.msgSuccess(this.$t('usual_operation_success'))
        this.handleMemberQuery({})
      } else {
        this.msgError(res.Msg)
      }
    },
    // 全选/全不选
    handleCheckedAll() {
      const value = this.$refs.memberTree.getCheckedNodes()
      this.$refs.memberTree.setCheckedNodes(value.length < this.memberData.length ? this.memberData : [])
    },
    /* 人员操作 end */
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables';
::v-deep .input-with-select .el-input-group__prepend {
  background-color: #fff !important;
}
.roleGroupMain {
  background-color: #f4f7fb;
  .roleBox {
    height: calc(100vh - 110px);
    background: #fff;
    box-shadow: 2px 2px 40px #e1e5ea4d;
    border-radius: 10px;
    overflow: hidden;
    .boxTitle {
      //   position: fixed;
      line-height: 20px;
      margin-bottom: 10px;
      width: 100%;
      @include flex-justify(center);
      .boxTitleLeft {
        @include flex-justify(flex-start);
        @include ellipsis(1);
        max-width: 100%;
        font-style: normal;
        font-size: 16px;
        color: #fff;
      }
      line-height: 30px;
      text-align: center;
      border-radius: 10px 10px 0px 10px;
      &.group {
        background: $lightBlue;
      }
      &.menu {
        background: $green;
      }
      &.member {
        background: $pink;
      }
    }
    .boxContent {
      // margin-top: 46px;
      overflow: auto;
      border-bottom: 10px solid #fff;
      margin: 0 10px;
      height: calc(100% - 46px); /* 46px == boxTitle.height */
    }
    .actionHeader {
      @include flex-justify(flex-start);
      .actionHeaderItem {
      }
    }
    .treeItem {
      width: 100%;
      @include flex-justify(space-between);
    }
    .rightClickCard {
      transform-origin: center top;
      z-index: 2006;
      width: 160px;
    }
    .treeBox {
      overflow: auto;
      &.groupTree {
        height: calc(100% - 66px);
      }
      &.menuTree {
        height: calc(100% - 76px);
      }
      &.memberTree {
        height: calc(100% - 126px);
      }
    }
  }
}
</style>
