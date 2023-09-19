<template>
  <div>
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="title" v-bind="$attrs" v-on="$listeners" width="60%" :visible="visible" @close="onClose">
      <el-row :gutter="24">
        <el-form ref="editForm" :model="formData" :rules="rules" size="small" label-width="100px" v-loading="loading">
          <el-col :span="12">
            <el-form-item :label="$t('mrb_module_name')" prop="ModuleCode">
              <el-select value-key="DataValue" size="small" v-model="formData.ModuleCode" @change="changeFn" clearable>
                <el-option v-for="(item, index) in languageModuleList" :key="index" :label="item.DataText" :value="item.DataValue"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="标识代码" prop="TagCode">
              <el-input v-model="formData.TagCode" placeholder="请输入代码" clearable :style="{ width: '100%' }" :disabled="$store.state.user.UserInfo.Id != 'admin' && formData.TypeName == 'pc_menu'">
              </el-input>
            </el-form-item>
            <!-- 多国语言 -->
            <el-form-item v-for="(item, index) in languageList" :key="index" label="多国语言">
              <el-input v-model="item.DataText" :disabled="true" placeholder="语言" clearable :style="{ width: '100%' }"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板代码">
              <el-input v-model="visibleModuleCode" placeholder="请输入模板代码" readonly clearable :style="{ width: '100%' }"></el-input>
            </el-form-item>
            <el-form-item label="展示平台" prop="TypeName">
              <el-select size="small" v-model="formData.TypeName" clearable @change="TypeNameChange">
                <el-option v-for="(item, index) in platformList" :key="index" :label="item.DataText" :value="item.DataValue"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-for="(item, index) in languageList" :key="index" label="显示文本">
              <el-input v-model="formData.Cultures[item.DataValue]" :placeholder="'请输入' + item.DataText" clearable :style="{ width: '100%' }"></el-input>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer">
        <el-button @click="visible = false">{{ $t('usual_cancel') }}</el-button>
        <el-button type="primary" @click="handelConfirm">{{ $t('usual_confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { addLang, editLang, getLangById } from '@/api/system/lang'
import { mapGetters } from 'vuex'

export default {
  inheritAttrs: false,
  components: {},
  props: [],
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      type: '',
      visibleModuleCode: null,
      formData: {
        Id: '',
        Lang: '',
        ModuleCode: '',
        ModuleName: '',
        TagCode: '',
        TagText: '',
        TypeName: '',
        Cultures: {},
      },
      rules: {
        ModuleCode: [
          {
            required: true,
            message: '请输入模板代码',
            trigger: 'blur',
          },
        ],
        Lang: [
          {
            required: true,
            message: '请选择语言',
            trigger: 'blur',
          },
        ],
        TagCode: [
          {
            required: true,
            message: '请输入代码',
            trigger: 'blur',
          },
        ],
        TagText: [
          {
            required: true,
            message: '中文（简体）描述',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    platformList() {
      return this.dictMap['platform_language'] && this.dictMap['platform_language'].items
    },
    languageList() {
      return this.dictMap['country_language'] && this.dictMap['country_language'].items
    },
    languageModuleList() {
      return this.dictMap['country_language_module'] && this.dictMap['country_language_module'].items
    },
  },
  watch: {},
  created() {
    this.$store.dispatch('dict/getByDictKeys', ['country_language', 'platform_language', 'country_language_module'])
    // this.getDictList()
  },
  mounted() {},
  inject: ['getDataList'],
  methods: {
    init() {
      this.visible = true
      this.type = ''
      this.visibleModuleCode = ''
      this.formData.Id = ''
      this.formData.Cultures = {}
      this.$nextTick(() => {
        this.$refs['editForm'].resetFields()
      })
    },
    changeFn(val) {
      const findObj = this.languageModuleList.find(item => item.DataValue == val)
      // 用于后台保存数据
      this.formData.ModuleName = findObj ? findObj.DataText : ''
      // 用于页面展示code
      this.visibleModuleCode = findObj ? findObj.DataValue : ''
    },
    async openForm(id, title, type) {
      this.init()
      this.type = type
      this.title = title
      if (id) {
        this.loading = true
        const resJson = await getLangById(id)
        this.loading = false
        if (resJson.Success) {
          this.formData = resJson.Data
          this.visibleModuleCode = resJson.Data.ModuleCode
        } else {
          this.msgError(resJson.Msg)
        }
      }
    },
    queryFn() {},
    onClose() {
      this.formData.Cultures = {}
      this.$refs['editForm'].resetFields()
    },
    close() {
      this.$emit('update:visible', false)
    },
    handelConfirm() {
      this.$refs['editForm'].validate(async valid => {
        if (!valid) return
        const params = JSON.parse(JSON.stringify(this.formData))
        if (this.type == 'add') {
          delete params.Id
          this.languageList.forEach(item => {
            // 追加属性
            const obj = this.formData.Cultures[item.DataValue]
            this.formData.Cultures[item.DataValue] = obj ? obj : ''
          })
        }
        const res = this.type == 'add' ? await addLang(this.formData) : await editLang(this.formData)
        if (res.Success) {
          this.$message({ type: 'success', message: this.$t('usual_operation_success') })
          this.visible = false
          this.getDataList()
        } else {
          this.msgError(res.Msg)
        }
        this.close()
      })
    },
    getDictList() {
      // 多国语言
      if (!this.dictMap['country_language']) {
        this.$store.dispatch('dict/getByDictKey', {
          dictKey: 'country_language',
        })
      }
      // 多国语言平台
      if (!this.dictMap['platform_language']) {
        this.$store.dispatch('dict/getByDictKey', {
          dictKey: 'platform_language',
        })
      }
      // 多国语言模块
      if (!this.dictMap['country_language_module']) {
        this.$store.dispatch('dict/getByDictKey', {
          dictKey: 'country_language_module',
        })
      }
    },
    TypeNameChange(value) {
      // 选择菜单时将埋点清空
      if (this.$store.state.user.UserInfo.Id != 'admin' && value == 'pc_menu') this.formData.TagCode = undefined
    },
  },
}
</script>
<style></style>
