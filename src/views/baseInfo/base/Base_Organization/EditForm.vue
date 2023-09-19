<template>
  <el-dialog :title="title" :visible="visible" :close-on-click-modal="false" v-dialogDrag @close="visible = false" width="700px">
    <el-form ref="form" :model="entity" :rules="rules" label-width="80px">
      <!-- <el-form-item label="组织编码" prop="OrgCode">
        <el-input size="small" v-model="entity.OrgCode"  autocomplete="off" />
      </el-form-item> -->
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_BgCode')" prop="BgCode">
            <el-input size="small" v-model="entity.BgCode" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_BgName')" prop="BgName">
            <el-input size="small" v-model="entity.BgName" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_BuCode')" prop="BuCode">
            <el-input size="small" v-model="entity.BuCode" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_BuName')" prop="BuName">
            <el-input size="small" v-model="entity.BuName" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_FactoryCode')" prop="FactoryCode">
            <el-input size="small" v-model="entity.FactoryCode" autocomplete="off" />
          </el-form-item>
        </el-col>

        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_SbuCode')" prop="SbuCode">
            <el-input size="small" v-model="entity.SbuCode" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_SbuName')" prop="SbuName">
            <el-input size="small" v-model="entity.SbuName" autocomplete="off" />
          </el-form-item>
        </el-col>

        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_Area')" prop="Area">
            <el-input size="small" v-model="entity.Area" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('base_SbuAddress')" prop="SbuAddress">
            <el-input size="small" v-model="entity.SbuAddress" autocomplete="off" />
          </el-form-item>
        </el-col>
        <!-- <el-form-item label="所属厂区" prop="Sbu">
        <el-input size="small" v-model="entity.Sbu" autocomplete="off" />
      </el-form-item> -->
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('MMS_Remark')" prop="Remark">
            <el-input size="small" v-model="entity.Remark" autocomplete="off" />
          </el-form-item>
        </el-col>
        <!-- <el-form-item :label="$t('usual_status')" prop="Status">
        <el-input size="small" v-model="entity.Status" autocomplete="off" />
      </el-form-item> -->
      </el-row>
      <el-row>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$tl('usual_shortCode', '简码')" prop="ShortCode">
            <el-input size="small" v-model="entity.ShortCode" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :md="12" :xs="24">
          <el-form-item :label="$t('usual_status')" prop="Status">
            <el-select v-model="entity.Status" :placeholder="$t('usual_choose')" clearable size="small" style="width: 100%">
              <el-option v-for="dict in statusOptions" :key="dict.DataValue" :label="dict.DataText" :value="dict.DataValue" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="cancel">{{ $t('usual_cancel') }}</el-button>
      <!-- 取消按钮 -->
      <el-button size="mini" type="primary" @click="handleSubmit">{{ $t('usual_confirm') }}</el-button>
      <!-- 确定按钮 -->
    </div>
  </el-dialog>
</template>

<script>
import { GetTheDataOrganization, SaveDataOrganization } from '@/api/base/public_base'
export default {
  props: {
    parentObj: Object,
  },
  data() {
    return {
      visible: false,
      loading: false,
      entity: {},
      statusOptions: [],
      rules: {
        /* OrgCode: [
          { required: true, message: "组织编码不能为空", trigger: "blur" },
        ], */
        BgCode: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        BgName: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        BuCode: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        BuName: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        SbuCode: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
        //  SbuName: [
        //   { required: true, message: "厂区名称不能为空", trigger: "blur" },
        // ],
        //  Area: [
        //   { required: true, message: "所属区域不能为空", trigger: "blur" },
        // ],
        //  SbuAddress: [
        //   { required: true, message: "厂区地址不能为空", trigger: "blur" },
        // ],
        //   Sbu: [
        //   { required: true, message: "所属厂区不能为空", trigger: "blur" },
        // ],
        FactoryCode: [{ required: true, message: this.$t('MOM_IsRequire'), trigger: 'blur' }],
      },
      title: '',
    }
  },
  created() {
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.Data
    })
  },

  methods: {
    init() {
      this.visible = true
      this.entity = {}
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    // 取消按钮
    cancel() {
      this.visible = false
      this.reset()
    },
    reset() {
      this.entity = {
        // OrgCode: undefined,
        BgCode: undefined,
        BgName: undefined,
        BuCode: undefined,
        BuName: undefined,
        SbuCode: undefined,
        SbuName: undefined,
        Area: undefined,
        SbuAddress: undefined,
        Sbu: undefined,
        Status: 0,
        Remark: undefined,
        ShortCode: undefined, //厂区简码
      }
      this.resetForm('form')
    },

    openForm(id, title) {
      if (title) {
        this.title = title
      }

      this.init()
      if (id) {
        this.loading = true
        GetTheDataOrganization({ id: id }).then(resJson => {
          this.loading = false
          this.entity = resJson.Data
          this.entity.Status = this.entity.Status.toString()
        })
      }
    },
    handleSubmit() {
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        SaveDataOrganization(this.entity).then(resJson => {
          this.loading = false

          if (resJson.Success) {
            this.msgSuccess(this.$t('usual_operation_success'))
            if (!!this.entity.Id) {
              this.visible = false
            }
            this.$refs['form'].resetFields()

            this.parentObj.getDataList()
          } else {
            this.msgError(resJson.Msg)
          }
        })
      })
    },
  },
}
</script>
