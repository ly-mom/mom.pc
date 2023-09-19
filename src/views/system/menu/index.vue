<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item :label="$t('system_menu_name')" prop="menuName">
        <el-input v-model="queryParams.menuName" :placeholder="$t('MOM_InputPlease')" clearable size="small" style="140px;" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('system_meun_state')" prop="status">
        <el-select style="width: 130px" v-model="queryParams.status" :placeholder="$t('usual_choose')" clearable size="small">
          <el-option v-for="dict in statusOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$tl('wms_menu_platform', '平台')" prop="platform">
        <el-select filterable :placeholder="$t('MOM_InputPlease')" v-model="queryParams.platform" style="width: 100%" clearable>
          <el-option v-for="dict in platformList" :value="dict.DataValue" :key="dict.DataValue" :label="dict.DataText"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">{{ $t('usual_search') }}</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{ $t('usual_reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:menu:add']">{{ $t('usual_add') }}</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- <base-table
      v-loading="loading"
      :columns="columns"
      :list="menuList"
      :cutheight="100"
      :options="options"
    >
      <template slot="menuName"  slot-scope="scope">
        <template v-if="scope.row.platform=='PC'">
            <svg-icon :style="scope.row.menuType == 'F'?{fontSize:'20px'}:''" :icon-class="scope.row.menuType == 'F' ? 'plainButton' :scope.row.icon" />
          </template>
          <template v-else>
            <i :class="['albb_icon','iconfont',scope.row.icon]"></i>
          </template>
        <span>
          {{scope.row.menuName}}
        </span>
      </template>
      <template slot="action">
        <table-column
          fixed="right"
          width="200"
          :label="$t('usual_operation')"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-plus"
              @click="handleAdd(scope.row)"
              v-hasPermi="['system:menu:add']"
              >{{$t('usual_add')}}</el-button
            >
              <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              style= 'cursor:pointer;color: #a4da89;'
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:menu:edit']"
              >{{$t('usual_update')}}</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              v-hasPermi="['system:menu:remove']"
              style= 'cursor:pointer;color: #f00;'
              @click="handleDelete(scope.row)"
              >{{$t('usual_delete')}}</el-button
            >
          </template>
        </table-column>
      </template>
    </base-table> -->
    <vxe-table v-loading="loading" border show-overflow row-id="id" :height="lHeight" :data="menuList" :tree-config="{ transform: true, reserve: true }" :row-config="{ height: 33 }">
      <vxe-column type="seq" width="160" title="序号" tree-node resizable></vxe-column>
      <vxe-column field="menuName" :title="$t('system_menu_name')" sortable align="center" resizable>
        <template #default="{ row }">
          <template v-if="row.platform == 'PC'">
            <svg-icon :style="row.menuType == 'F' ? { fontSize: '20px' } : ''" :icon-class="row.menuType == 'F' ? 'plainButton' : row.icon" />
          </template>
          <template v-else>
            <!--移动端选的图标-->
            <i :class="['albb_icon', 'iconfont', row.icon]"></i>
          </template>
          <span>
            {{ row.menuName }}
          </span>
        </template>
      </vxe-column>
      <vxe-column field="displaySort" width="80" :title="$t('usual_order')" sortable align="center" resizable></vxe-column>
      <vxe-column field="permissions" :title="$t('system_authority_id')" sortable align="center" resizable></vxe-column>
      <vxe-column field="componentPath" :title="$t('system_component_path')" sortable align="center" resizable></vxe-column>
      <vxe-column field="status" width="100" :title="$t('usual_status')" sortable align="center" resizable>
        <template #default="{ row }">
          <dict-tag v-model="row.status" dict-key="sys_normal_disable"></dict-tag>
        </template>
      </vxe-column>
      <vxe-column field="action" min-width="40" :title="$t('usual_operation')">
        <template #default="{ row }">
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(row)" v-hasPermi="['system:menu:add']">{{ $t('usual_add') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" style="cursor: pointer; color: #a4da89" @click="handleUpdate(row)" v-hasPermi="['system:menu:edit']">{{
            $t('usual_update')
          }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" v-hasPermi="['system:menu:remove']" style="cursor: pointer; color: #f00" @click="handleDelete(row)">{{
            $t('usual_delete')
          }}</el-button>
          <el-popover v-hasPermi="['system:menu:role']" placement="left-start" :title="$tl('baseMenu_menuRoleList', '已分配的角色')" width="240" trigger="click">
            <div style="maxheight: 200px; overflow: auto" v-loading="roleListLoading">
              <div class="mb10 reporItem" v-for="(item, index) in roleList" :key="index">
                <el-tooltip :content="item.RoleName" placement="top" :open-delay="500" :disabled="item.RoleName && item.RoleName.length < 19">
                  <div>
                    {{ item.RoleName }}
                  </div>
                </el-tooltip>
              </div>
            </div>
            <el-empty v-if="isEmptyValue(roleList)" :description="$t('usual_no_data')" :image-size="30"></el-empty>
            <el-button slot="reference" size="mini" type="text" icon="el-icon-user" @click="handleRoleList(row)">{{ $tl('baseMenu_menuRoleButton', '角色') }}</el-button>
          </el-popover>
        </template>
      </vxe-column>
    </vxe-table>
    <!-- 添加或修改菜单对话框 -->
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('system_upper_menu')">
              <treeselect v-model="form.parentId" :options="menuOptions" :normalizer="normalizer" :show-count="true" :placeholder="$t('usual_choose')" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('system_menu_type')" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">{{ $t('system_contents') }}</el-radio>
                <el-radio label="C">{{ $t('system_menu') }}</el-radio>
                <el-radio label="F">{{ $t('system_btn') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <!--PC图标菜单-->
            <el-form-item v-if="form.menuType != 'F' && iconFlag == 'PC'" :label="$t('system_icon')">
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" :placeholder="$t('MOM_InputPlease')" readonly>
                  <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon" style="height: 32px; width: 16px" />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
            <!--移动端图标菜单-->
            <el-form-item v-if="form.menuType != 'F' && iconFlag == 'Mobile'" :label="$t('system_icon')">
              <el-select v-model="form.icon" clearable>
                <el-option :value="jitem" v-for="(jitem, index) in mobileMenuIconList" :key="index">
                  <i :class="['albb_icon', 'iconfont', jitem]"></i>
                </el-option>
              </el-select>
              <i :class="['albb_icon', 'iconfont', form.icon]" style="margin-left: 10px"></i>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system_menu_name')" prop="menuName">
              <el-input v-model="form.menuName" :placeholder="$t('MOM_InputPlease')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$tl('wms_menu_platform', '平台')" prop="platform">
              <el-select filterable :placeholder="$t('MOM_InputPlease')" v-model="form.platform" @change="changePlatformFn" style="width: 100%">
                <el-option v-for="dict in platformList" :value="dict.DataValue" :key="dict.DataValue" :label="dict.DataText"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'" prop="urlPath">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $t('system_router_address') }}
              </span>
              <el-input v-model="form.urlPath" :placeholder="$t('MOM_InputPlease')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'">
              <span slot="label">
                <el-tooltip content="输入语言埋点Key，实现菜单语言国际化" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $t('system_language_buried_point') }}
              </span>
              <el-input v-model="form.cultureKey" :placeholder="$t('MOM_InputPlease')" />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="componentPath">
              <span slot="label">
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                组件路径
              </span>
              <el-input v-model="form.componentPath" :placeholder="$t('MOM_InputPlease')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'M'">
              <el-input v-model="form.permissions" :placeholder="$t('MOM_InputPlease')" maxlength="100" />
              <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $t('system_permission_character') }}
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'">
              <span slot="label">
                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $t('system_display_state') }}
              </span>
              <el-radio-group v-model="form.isVisible">
                <el-radio v-for="dict in isVisibleOptions" :key="dict.DataValue" :label="dict.DataValue">{{ dict.DataText }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system_display_order')" prop="displaySort">
              <el-input-number v-model="form.displaySort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'">
              <span slot="label">
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $t('system_meun_state') }}
              </span>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key="dict.DataValue" :label="dict.DataValue">{{ dict.DataText }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.menuType == 'C'">
              <span slot="label">
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                是否缓存
              </span>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">缓存</el-radio>
                <el-radio label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item v-if="form.menuType != 'F'">
              <span slot="label">
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                {{ $t('system_is_link') }}
              </span>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">是</el-radio>
                <el-radio label="1">否</el-radio>
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
  </div>
</template>

<script>
import { listMenu, getMenu, delMenu, addMenu, updateMenu, getRoleListByMenu } from '@/api/system/menu'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import { mapGetters } from 'vuex'
import XEUtils from 'xe-utils'
import { VXETable, Column } from 'vxe-table'
import zhCN from 'vxe-table/lib/locale/lang/zh-CN'
VXETable.setup({
  i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhCN, key), args),
})

export default {
  name: 'MenuData',
  // eslint-disable-next-line vue/no-unused-components
  components: { Treeselect, IconSelect, VXETable, Column },
  data() {
    return {
      iconFlag: 'PC', //默认是PC
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 菜单状态数据字典
      // statusOptions: [],
      // 查询参数
      queryParams: {
        menuName: undefined,
        status: undefined,
        visible: undefined,
        platform: 'PC',
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        menuName: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        displaySort: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        urlPath: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        platform: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'change' }],
      },
      mobileMenuIconList: [
        'icon-a-Group534',
        'icon-a-Group528',
        'icon-a-Group531',
        'icon-a-Group536',
        'icon-a-Group537',
        'icon-a-Group535',
        'icon-a-Group529',
        'icon-zcrk_x',
        'icon-a-Group539',
        'icon-a-Group542',
        'icon-a-Group540',
        'icon-a-Group538',
        'icon-a-Group541',
        'icon-a-Group533',
        'icon-scrk_x',
        'icon-a-Group532',
        'icon-llrk_x',
        'icon-a-Group5433',
        'icon-a-Group5274',
        'icon-a-Group5301',
      ],
      columns: [
        {
          title: this.$t('system_menu_name'),
          dataIndex: 'menuName',
          width: '160px',
          type: '1',
          sortable: true,
          treeNode: true,
          align: 'left',
          slots: true,
        },
        {
          title: this.$t('usual_order'),
          dataIndex: 'displaySort',
          width: '80px',
          type: '3',
          sortable: true,
        },
        {
          title: this.$t('system_authority_id'),
          dataIndex: 'permissions',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$t('system_component_path'),
          dataIndex: 'componentPath',
          type: '3',
          sortable: true,
          ellipsis: true,
        },
        {
          title: this.$t('usual_status'),
          dataIndex: 'status',
          type: '1',
          sortable: true,
          dictKey: 'sys_normal_disable',
          render: (h, params) =>
            h('dict-tag', {
              props: {
                value: params.row.status,
                'dict-key': 'sys_normal_disable',
              },
            }),
        },
      ],
      options: {
        showNum: true, // 是否显示序号
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否支持当前行高亮显示
        mutiSelect: false, // 是否支持列表项选中功能
        treeProps: { transform: true, rowField: 'id', parentField: 'parentId' },
      }, // table 的参数
      lHeight: 500,
      roleListLoading: false,
      roleList: [], // 某个菜单已分配的角色列表
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
    platformList() {
      return this.dictMap['system_platform'] && this.dictMap['system_platform'].items
    },
    isVisibleOptions() {
      return this.dictMap['sys_show_hide'] && this.dictMap['sys_show_hide'].items
    },
  },
  created() {
    this.getDictList()
    this.getList()
    // this.getDicts("sys_normal_disable").then((response) => {
    //   this.statusOptions = response.Data;
    // });
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.lHeight = window.innerHeight - 224
    })
  },
  methods: {
    changePlatformFn(e) {
      this.iconFlag = e
    },
    getDictList() {
      this.$store.dispatch('dict/getByDictKeys', ['sys_normal_disable', 'system_platform', 'sys_show_hide'])
    },
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询菜单列表 */
    async getList() {
      this.loading = true
      const res = await listMenu(this.queryParams)
      this.loading = false
      if (res.Success) {
        this.menuList = res.Data
        console.log(this.menuList)
      } else {
        this.msgError(res.Msg)
      }
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }

      return {
        id: node.id,
        label: node.menuName,
        children: node.children,
      }
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      this.menuOptions = []
      const menu = { id: 0, menuName: '主类目', children: [] }
      menu.children = this.handleTree(this.menuList, 'id')
      this.menuOptions.push(menu)
    },
    // // 显示状态字典翻译
    // isVisibleFormat(row, column) {
    //   if (row.menuType == "F") {
    //     return "";
    //   }
    //   return this.selectDictLabel(this.isVisibleOptions, row.isVisible);
    // },
    // // 菜单状态字典翻译
    // statusFormat(row, column) {
    //   if (row.menuType == "F") {
    //     return "";
    //   }
    //   return this.selectDictLabel(this.statusOptions, row.status);
    // },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: 'M',
        cultureKey: undefined,
        displaySort: undefined,
        isFrame: '1',
        isCache: '0',
        isVisible: '0',
        status: '0',
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.getTreeselect()

      if (row != null && row.id) {
        this.form.parentId = row.id
      } else {
        this.form.parentId = 0
      }
      this.open = true
      this.title = '添加菜单'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.getTreeselect()

      getMenu(row.id).then(response => {
        this.form = response.Data

        this.form.status = this.form.status ? this.form.status.toString() : '0'
        this.iconFlag = response.Data.platform
        this.open = true
        this.title = '修改菜单'
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateMenu(this.form).then(response => {
              if (response.Success) {
                this.msgSuccess(this.$t('usual_modify_success'))
                this.open = false
                this.getList()
              } else {
                this.msgError(response.Msg)
              }
            })
          } else {
            addMenu(this.form).then(response => {
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
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.menuName + '"的数据项?', this.$t('usual_warning'), {
        confirmButtonText: this.$t('usual_confirm'),
        cancelButtonText: this.$t('usual_cancel'),
        type: 'warning',
      })
        .then(function () {
          return delMenu(row.id)
        })
        .then(res => {
          if (res.Success) {
            this.getList()
            this.msgSuccess(this.$t('IQC_DeleteSuccess'))
          } else {
            this.msgError(res.Msg)
          }
        })
        .catch(() => {})
    },
    // 查询菜单已分配的角色
    async handleRoleList(row) {
      this.roleList = []
      this.roleListLoading = true
      const res = await getRoleListByMenu(row.id)
      this.roleListLoading = false
      if (res.Success) {
        this.roleList = res.Data
      } else {
        this.msgError(res.Msg)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/styles/variables';
.reporItem {
  max-width: 200px;
  @include ellipsis(1);
  // &:hover {
  //   color: $lightBlue;
  //   text-decoration: underline;
  // }
}
.albb-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
}
</style>
