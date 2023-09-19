<template>
  <!-- 一键分配检测单位对话框 -->
  <div>
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" :visible="open" width="25%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-row>
          <el-col :span="24">
            <!-- 检测单位 -->
            <el-form-item :label="$t('system_testing_unit')" prop="TestUnitId">
              <el-select :style="{ width: '100%' }" v-model="form.TestUnitId" clearable :placeholder="$t('usual_choose')" filterable @focus="getTestUnit">
                <el-option v-for="item in TestUnitOptions" :key="item.Id" :label="item.QCDeptName" :value="item.Id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('usual_cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTestUnitDataList } from '@/api/base.js'
import { setChkUint } from '@/api/system/user.js'

export default {
  name: 'setChkUint',
  data() {
    return {
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      submitLoading: false,
      form: {
        TestUnitId: '',
      },
      TestUnitOptions: [],
      // 表单校验
      rules: {
        TestUnitId: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'change',
          },
        ],
      },
      UserCodes: [],
    }
  },
  methods: {
    init(UserCodes) {
      this.open = true
      this.UserCodes = UserCodes
    },
    // 检测单位选项请求
    async getTestUnit() {
      const res = await getTestUnitDataList({})
      if (res.Success) {
        this.TestUnitOptions = res.Data.PageList || []
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.form.UserCodes = this.UserCodes

          this.submitLoading = true
          const response = await setChkUint(this.form)
          this.submitLoading = false
          if (response.Success) {
            this.msgSuccess(response.Data)
            this.open = false
            this.$emit('refreshPageOne')
          } else {
            this.msgError(response.Msg)
          }
        }
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
        TestUnitId: undefined,
      }
      this.resetForm('form')
      this.TestUnitOptions = []
      this.UserCodes = []
    },
  },
}
</script>

<style></style>
