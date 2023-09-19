<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" :placeholder="$t('MOM_InputPlease')" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" :placeholder="$t('MOM_InputPlease')" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" show-password @keyup.enter.native="submit" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">{{ $t('usual_save') }}</el-button>
      <el-button type="danger" size="mini" @click="close">{{ $t('usual_close') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd } from '@/api/system/user'
import { modifyPwd } from '@/api/base.js'

export default {
  name: 'ResetPwd',
  props: {
    isFirst: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      test: '1test',
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      },
      // 表单校验
      rules: {
        oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          {
            min: 9,
            message: '必须大于 8 个字符',
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { required: true, validator: equalToPassword, trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          const data = {
            UserId: this.$store.state.user.userId,
            OldPwd: this.user.oldPassword,
            NewPwd: this.user.newPassword,
          }
          const res = await modifyPwd(data)
          if (res.Success) {
            this.$message({ message: '修改成功，正在跳转登录。。。', duration: 2000 })
            this.$emit('modifySuccess')
            this.$store.dispatch('LogOut').then(() => {
              setTimeout(() => {
                location.href = '/index'
              }, 2000)
            })
          } else {
            this.msgError(res.Msg)
          }
        }
      })
    },
    close() {
      if (this.isFirst) {
        this.$store.commit('SET_PWDSTATUS', false)
      } else {
        this.$store.dispatch('tagsView/delView', this.$route)
        this.$router.push({ path: '/index' })
      }
    },
  },
}
</script>
