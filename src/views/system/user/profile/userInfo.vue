<template>
  <el-form ref="form" :model="UserInfo" :rules="rules" label-width="80px">
    <!-- <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="UserInfo.nickName" maxlength="30" />
    </el-form-item> -->
    <!-- 手机号码 -->
    <el-form-item :label="$t('system_phone_num')" prop="Mobile">
      <el-input v-model="UserInfo.Mobile" maxlength="11" />
    </el-form-item>
    <el-form-item :label="$tl('system_email', '邮箱')" prop="Email">
      <el-input v-model="UserInfo.Email" maxlength="50" />
    </el-form-item>
    <el-form-item :label="$t('system_testing_unit')">
      <el-select
        :style="{ width: '100%' }"
        v-model="UserInfo.TestUnitId"
        clearable
        :key="TestUnitName"
        :placeholder="$t('usual_choose')"
        filterable
        @focus="searchTimes = 0"
        remote
        :remote-method="getTestUnit"
      >
        <el-option v-for="item in TestUnitOptions" :key="item.Id" :label="item.QCDeptName" :value="item.Id"> </el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('base_Sex')">
      <el-radio-group v-model="UserInfo.Sex">
        <el-radio label="0">男</el-radio>
        <el-radio label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">{{ $t('usual_save') }}</el-button>
      <el-button type="danger" size="mini" @click="close">{{ $t('usual_close') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserByMysely } from '@/api/system/user'
import { getTestUnitDataList } from '@/api/base.js'

export default {
  props: {
    user: {
      type: Object,
    },
    TestUnitName: {
      type: String,
    },
  },
  watch: {
    user: {
      handler(nVal) {
        this.UserInfo = JSON.parse(JSON.stringify(nVal))
      },
      immediate: true,
    },
    TestUnitName: {
      handler(nVal) {
        this.TestUnitOptions = [{ Id: this.UserInfo.TestUnitId, QCDeptName: nVal }]
      },
      immediate: true,
    },
  },
  data() {
    return {
      TestUnitOptions: [],
      UserInfo: {},
      // 表单校验
      rules: {
        nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        Email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        Mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const data = {
            // Id: this.$store.state.user.userId,
            Email: this.UserInfo.Email,
            Mobile: this.UserInfo.Mobile,
            Sex: this.UserInfo.Sex,
            TestUnitId: this.UserInfo.TestUnitId,
          }
          const res = await updateUserByMysely(data)
          if (res.Success) {
            this.$emit('updateInfo')
            this.msgSuccess(this.$t('usual_modify_success'))
          } else {
            this.msgError(res.Msg)
          }
        }
      })
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/index' })
    },
    // 检测单位下拉
    async getTestUnit(value, count) {
      const ParmeterData = {
        PageIndex: 0,
        PageRows: 50,
        Search: { QCDeptName: value },
      }
      const res = await getTestUnitDataList(ParmeterData)
      if (res.Success) {
        const list = res.Data.PageList || []
        this.TestUnitOptions = this.setRemoteOption(list, this.TestUnitOptions, count)
      }
    },
  },
}
</script>
