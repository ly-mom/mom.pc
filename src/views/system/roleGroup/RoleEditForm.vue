<template>
  <el-dialog :title="title" width="700px" :visible="visible" @close="toggleModal(false)" v-dialogDrag :close-on-click-modal="false">
    <el-form ref="form" :model="entity" size="small" :rules="rules" label-width="110px">
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$tl('system_roleGroup_addRole_GroupCode', '所属角色组')" prop="GroupCode">
            <!-- 后端接口不允许修改时直接修改角色组，但如果原分组是空的，可设置 -->
            <el-select v-model="entity.GroupCode" filterable :disabled="!!originGroupCode" style="width: 100%" size="small" clearable :placeholder="$t('base_keyword_search')">
              <el-option v-for="d in roleGroupList" :key="d.GroupCode" :value="d.GroupCode" :label="d.GroupName"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item prop="RoleKey">
            <span slot="label">
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
              {{ $t('system_permission_character') }}
            </span>
            <el-input :disabled="!!entity.Id" v-model="entity.RoleKey" :placeholder="$t('MOM_InputPlease')" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('system_role_name')" prop="RoleName">
            <el-input v-model="entity.RoleName" :placeholder="$t('MOM_InputPlease')" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('system_role_order')" prop="RoleSort">
            <el-input-number style="width: 100%" v-model="entity.RoleSort" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('MMS_Remark')" prop="Remark">
            <el-input v-model="entity.Remark" rows="1" type="textarea" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('usual_status')" prop="Status">
            <el-select v-model="entity.Status" :placeholder="$t('usual_choose')" clearable style="width: 100%">
              <el-option v-for="dict in statusOptions" :key="parseInt(dict.DataValue)" :label="dict.DataText" :value="parseInt(dict.DataValue)" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="toggleModal(false)">{{ $t('usual_cancel') }}</el-button>
      <!-- 取消按钮 -->
      <el-button size="mini" type="primary" @click="handleSubmit">{{ $t('usual_confirm') }}</el-button>
      <!-- 确定按钮 -->
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { addRole, updateRole, listRole, getRoleGroupList } from '@/api/system/role'
import _ from 'lodash'
export default {
  props: {
    parentObj: Object,
  },
  computed: {
    ...mapGetters(['dictMap']),
    OrgCode() {
      return this.$store.getters.orgCode
    },

    statusOptions() {
      return this.dictMap['sys_normal_disable'] && this.dictMap['sys_normal_disable'].items
    },
  },
  data() {
    return {
      visible: false,
      loading: false,
      originGroupCode: undefined, // 未修改前的角色组
      entity: {
        Id: undefined,
        RoleId: undefined,
        RoleName: undefined,
        RoleKey: undefined,
        GroupCode: undefined,
        RoleSort: 0,
        Remark: undefined,
        Status: 0,
      },
      rules: {
        RoleName: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'blur',
          },
        ],
        RoleKey: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'blur',
          },
        ],
      },
      title: '新增',
      roleGroupList: [],
    }
  },
  created() {
    this.$store.dispatch('dict/getByDictKeys', ['sys_normal_disable'])
  },
  methods: {
    init() {
      this.entity.Id = undefined
      this.entity.RoleId = undefined
      this.entity.RoleName = undefined
      this.entity.RoleKey = undefined
      this.entity.GroupCode = undefined
      this.entity.RoleSort = 0
      this.entity.Remark = undefined
      this.entity.Status = 0
    },
    async openForm(Id, title, group = null) {
      this.init()
      if (title) {
        this.title = title
      }
      if (!this.isEmptyValue(Id)) {
        this.loading = true
        const res = await listRole({ Search: { Id } })
        if (res.Success) {
          this.entity = _.pick(_.get(res, 'Data.PageList[0]', {}), Object.keys(this.entity))
          this.originGroupCode = _.cloneDeep(this.entity.GroupCode)
          this.visible = true
        } else {
          this.msgError(res.Msg)
        }
        this.loading = false
      } else {
        this.visible = true
      }
      if (group) {
        // this.roleGroupList = [{GroupCode: group.Code, GroupName: group.Name}]
        this.entity.GroupCode = group.Code
      }
      this.roleGroupList = this.parentObj.groupList.map(e => ({ GroupCode: e.Code, GroupName: e.Name }))
    },
    handleSubmit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.loading = true
          const data = _.cloneDeep(this.entity)
          let resJson = null
          if (data.Id) {
            resJson = await updateRole(data)
          } else {
            resJson = await addRole(data)
          }
          this.loading = false
          if (resJson.Success) {
            this.msgSuccess(this.$t('usual_operation_success'))
            this.toggleModal(false)
            this.$refs['form'].resetFields()
            this.parentObj.refreshGroup()
          } else {
            this.msgError(resJson.Msg)
            this.$refs['form'].resetFields()
          }
        }
      })
    },
    toggleModal(status) {
      if (!status) {
        this.entity.Id = ''
        this.$refs.form.resetFields()
      }
      this.visible = status
    },
    // 角色组下拉
    async getRoleGroupOption(value, count) {
      const ParmeterData = {
        PageIndex: 0,
        PageRows: 20,
        Search: {
          GroupName: value,
        },
      }
      const res = await getRoleGroupList(ParmeterData)
      if (res.Success) {
        const list = res.Data.PageList || []
        this.roleGroupList = this.setRemoteOption(list, this.roleGroupList, count)
      } else {
        this.msgError(res.Msg)
      }
    },
  },
}
</script>
