<template>
  <el-dialog :title="title" width="700px" :visible="visible" @close="toggleModal(false)" v-dialogDrag :close-on-click-modal="false">
    <el-form ref="form" :model="entity" size="small" :rules="rules" label-width="110px">
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item
            :label="$tl('system_roleGroup_addRole_GroupCode', '所属角色组')"
            prop="ParentCode"
            :rules="[{ required: !checkRole(parentObj.topRole), message: this.$t('MOM_IsRequire'), trigger: 'blur' }]"
          >
            <!-- <el-cascader
            filterable
            size="small"
            v-model="entity.ParentCode"
            clearable
            :disabled="!!entity.Id"
            :options="roleGroupList"
            :props="{ label: 'Name', value: 'Code',children: 'Children' }"
            ></el-cascader> -->
            <el-select v-model="entity.ParentCode" filterable style="width: 100%" size="small" clearable :disabled="!!entity.Id">
              <el-option v-for="d in parentObj.groupList" :key="d.Code" :value="d.Code" :label="d.Name"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$tl('system_roleGroup_GroupCode', '权限字符')" prop="GroupCode">
            <el-input v-model="entity.GroupCode" :disabled="!!entity.Id" autocomplete="off" clearable />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$tl('system_roleGroup_GroupName', '角色组名称')" prop="GroupName">
            <el-input v-model="entity.GroupName" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('usual_order')" prop="Sort">
            <el-input-number style="width: 100%" v-model="entity.Sort" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('usual_status')" prop="Status">
            <el-select v-model="entity.Status" :placeholder="$t('usual_choose')" clearable style="width: 100%">
              <el-option v-for="dict in statusOptions" :key="parseInt(dict.DataValue)" :label="dict.DataText" :value="parseInt(dict.DataValue)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('MMS_Remark')" prop="Remark">
            <el-input v-model="entity.Remark" rows="1" type="textarea" autocomplete="off" />
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
import { addRoleGroup, editRoleGroup, getRoleGroupList } from '@/api/system/role'
import { checkRole } from '@/utils/permission'
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
      entity: {
        Id: undefined,
        ParentCode: undefined,
        GroupCode: undefined,
        GroupName: undefined,
        Sort: 0,
        Remark: undefined,
        Status: 0,
      },
      rules: {
        GroupCode: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'blur',
          },
        ],
        GroupName: [
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
    checkRole,
    init() {
      this.entity.Id = undefined
      this.entity.ParentCode = undefined
      this.entity.GroupCode = undefined
      this.entity.GroupName = undefined
      this.entity.Sort = 0
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
        const res = await getRoleGroupList({ Search: { Id } })
        if (res.Success) {
          this.entity = _.pick(_.get(res, 'Data.PageList[0]', {}), Object.keys(this.entity))
          this.visible = true
        } else {
          this.msgError(res.Msg)
        }
        this.loading = false
      } else {
        this.visible = true
      }
      if (group) {
        this.entity.ParentCode = group.Code
      }
      // 非开发者非右键新建角色组，将第一个角色组设置为父角色组
      if (!this.checkRole(this.parentObj.topRole) && !group) {
        this.entity.ParentCode = this.parentObj.groupList[0].Code
      }
    },
    handleSubmit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.loading = true
          const data = _.cloneDeep(this.entity)
          let resJson = null
          if (data.Id) {
            resJson = await editRoleGroup(data)
          } else {
            resJson = await addRoleGroup(data)
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
