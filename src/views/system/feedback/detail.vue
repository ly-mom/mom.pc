<!-- 添加或修改公告对话框 -->
<template>
  <div>
    <el-dialog :close-on-click-modal="false" v-dialogDrag :title="$tl('usual_detail', '查看')" :visible="open" width="780px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-row :gutter="40">
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('system_factory', '厂区名称')">
              {{ form.OrgName }}
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('sys_feedbackTime', '反馈时间')">
              {{ form.CreateTime }}
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('sys_feedbackId', '反馈人工号')">
              {{ form.CreatorId }}
            </el-form-item>
          </el-col>
          <el-col :md="12" :xs="24">
            <el-form-item :label="$tl('sys_feedbackName', '反馈人')">
              {{ form.CreatorName }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :md="24" :xs="24">
            <el-form-item :label="$tl('sys_content', '內容')">
              {{ form.Content }}
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
import { getFeedback } from '@/api/system/feedback'
export default {
  data() {
    return {
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        Search: {
          Content: undefined, //内容
        },
        pageNum: 1,
        pageSize: 100,
      },
      // 表单参数
      form: {},
    }
  },
  methods: {
    init(Id) {
      this.open = true
      this.getList(Id)
    },
    async getList(Id) {
      const res = await getFeedback(Id)
      if (res.Success) {
        this.form = res.Data
      }
    },
    // 取消按钮
    cancel() {
      this.form = {}
      this.open = false
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.cancel()
        }
      })
    },
  },
}
</script>

<style></style>
