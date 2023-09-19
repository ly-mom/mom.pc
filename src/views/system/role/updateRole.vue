<template>
  <div>
    <div class="title">{{ title }}</div>
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
      <el-form-item :label="$tl('system_menu_permissions2', 'PC菜单权限')">
        <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
        <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
        <el-checkbox v-model="form.MenuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
        <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menu" node-key="Id" :check-strictly="!form.MenuCheckStrictly" empty-text="加载中，请稍后" :props="defaultProps">
          <span class="custom-tree-node" slot-scope="{ node }">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-form-item>
      <el-form-item :label="$tl('system_menu_permissions2', '移动菜单权限')">
        <el-checkbox v-model="mobileExpand" @change="handleCheckedTreeExpand($event, 'menuMobile')">展开/折叠</el-checkbox>
        <el-checkbox v-model="mobileNodeAll" @change="handleCheckedTreeNodeAll($event, 'menuMobile')">全选/全不选</el-checkbox>
        <el-checkbox v-model="form.MobileCheckStrictly" @change="handleCheckedTreeConnect($event, 'menuMobile')">父子联动</el-checkbox>
        <el-tree
          class="tree-border"
          :data="menuMobileOptions"
          show-checkbox
          ref="menuMobile"
          node-key="Id"
          :check-strictly="!form.MobileCheckStrictly"
          empty-text="加载中，请稍后"
          :props="defaultProps"
        >
          <span class="custom-tree-node" slot-scope="{ node }">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-form-item>
      <el-form-item :label="$t('MMS_Remark')">
        <el-input v-model="form.Remark" type="textarea" :placeholder="$t('MOM_InputPlease')"></el-input>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button type="primary" @click="submitForm">{{ $t('usual_confirm') }}</el-button>
      <el-button @click="reset">{{ $t('usual_reset') }}</el-button>
    </div>
  </div>
</template>
<script>
import { getRole, addRole, updateRole } from '@/api/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'
import { mapGetters } from 'vuex'
export default {
  name: 'updateRole',
  data() {
    return {
      menuExpand: false, //PC端 展开/折叠
      menuNodeAll: false, //PC端 全选/全不选
      mobileExpand: false, //移动端展开/折叠
      mobileNodeAll: false, //移动端全选/全不选
      title: '新增角色',
      // PC菜单列表
      menuOptions: [],
      // 移动菜单列表
      menuMobileOptions: [],
      // 表单参数
      form: {
        Id: undefined,
        RoleId: undefined,
        RoleName: undefined,
        RoleKey: undefined,
        RoleSort: 0,
        Status: '0',
        MenuIds: [],
        deptIds: [],
        MenuCheckStrictly: false,
        MobileCheckStrictly: false,
        Remark: undefined,
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
    }
  },
  async created() {
    const id = this.$route.params.roleId
    await this.getMenuTreeselect({ platform: 'PC' })
    await this.getMenuTreeselect({ platform: 'Mobile' })
    if (id) {
      this.title = '编辑角色'
      await this.getDetailFn(id)
    } else {
      this.title = '新增角色'
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
  },
  methods: {
    /** 查询菜单树结构 */
    async getMenuTreeselect(param) {
      const response = await menuTreeselect(param)
      if (response.Success) {
        param.platform == 'PC' ? (this.menuOptions = response.Data) : (this.menuMobileOptions = response.Data)
      } else {
        this.msgError(response.Msg)
      }
    },
    async getDetailFn(roleId) {
      // 获取用户已有权限
      const roleMenu = this.getRoleMenuTreeselect(roleId)
      await getRole(roleId).then(response => {
        this.form.Id = response.Data.Id
        this.form.RoleId = response.Data.RoleId
        this.form.RoleName = response.Data.RoleName
        this.form.RoleKey = response.Data.RoleKey
        this.form.RoleSort = response.Data.RoleSort
        this.form.Status = response.Data.Status.toString()
        this.form.MenuIds = response.Data.MenuIds
        this.form.deptIds = response.Data.deptIds
        this.form.Remark = response.Data.Remark
        this.form.MenuCheckStrictly = false
        this.form.MobileCheckStrictly = false
        this.open = true
        this.$nextTick(() => {
          roleMenu.then(res => {
            const checkedKeys = res.Data.checkedKeys
            checkedKeys.forEach(v => {
              this.$nextTick(() => {
                this.$refs.menu.setChecked(v, true, false)
                this.$refs.menuMobile.setChecked(v, true, false)
              })
            })
          })
        })
      })
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      return roleMenuTreeselect(roleId).then(
        response =>
          // this.menuOptions = response.Data.menus;//废弃
          response,
      )
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      //#####PC端菜单权限#####
      // 目前被选中的菜单节点
      const checkedKeys = this.$refs.menu.getCheckedKeys()
      // 半选中的菜单节点
      const halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys()
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)

      //#####移动端端菜单权限#####
      // 目前被选中的菜单节点
      const checkedKeys2 = this.$refs.menuMobile.getCheckedKeys()
      // 半选中的菜单节点
      const halfCheckedKeys2 = this.$refs.menuMobile.getHalfCheckedKeys()
      checkedKeys2.unshift.apply(checkedKeys2, halfCheckedKeys2)

      // let arr = checkedKeys.concat(checkedKeys2)
      return checkedKeys.concat(checkedKeys2)
    },
    /** 提交按钮 */
    submitForm: function () {
      console.log(123)
      this.$refs['form'].validate(valid => {
        if (valid) {
          console.log(1)
          if (this.form.Id != undefined) {
            console.log(2)
            this.form.MenuIds = this.getMenuAllCheckedKeys()
            updateRole(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess(this.$t('usual_modify_success'))
                // this.open = false;
                // this.getList();
                this.$store.dispatch('tagsView/delView', this.$route)
                this.$router.go(-1)
              } else {
                this.msgError(response.Msg)
              }
            })
          } else {
            this.form.MenuIds = this.getMenuAllCheckedKeys()
            addRole(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess('新增成功')
                this.$router.push({ path: '/system/role' })
                // this.open = false;
                // this.getList();
              } else {
                this.msgError(response.Msg)
              }
            })
          }
        }
      })
    },
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == 'menu') {
        const treeList = this.menuOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].Id].expanded = value
        }
      } else if (type == 'menuMobile') {
        const treeList = this.menuMobileOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menuMobile.store.nodesMap[treeList[i].Id].expanded = value
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : [])
      } else if (type == 'menuMobile') {
        this.$refs.menuMobile.setCheckedNodes(value ? this.menuMobileOptions : [])
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      console.log(value)
      if (type == 'menu') {
        this.form.MenuCheckStrictly = value ? true : false
      } else if (type == 'menuMobile') {
        this.form.MobileCheckStrictly = value ? true : false
      }
    },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([])
      }
      this.menuExpand = false
      this.menuNodeAll = false
      this.mobileExpand = false
      this.mobileNodeAll = false
      this.form = {
        Id: undefined,
        RoleId: undefined,
        RoleName: undefined,
        RoleKey: undefined,
        RoleSort: 0,
        Status: '0',
        MenuIds: [],
        deptIds: [],
        MenuCheckStrictly: true,
        MobileCheckStrictly: true,
        Remark: undefined,
      }
      this.resetForm('form')
    },
  },
}
</script>
<style lang="scss" scoped>
.title {
  margin: 30px 0px 20px 30px;
  font-weight: bold;
}
.footer {
  margin: 10px 0px 30px 100px;
}
</style>
