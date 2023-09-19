<template>
  <span style="display: inline-block">
    <el-popover placement="bottom-start" title="批量输入(换行符间隔)" width="200" trigger="click">
      <el-input class="mb10" size="small" type="textarea" v-model="textAreaValue" clearable />
      <el-button size="mini" @click="textAreaValue = undefined"> 清空</el-button>
      <el-button size="mini" type="primary" @click="transfer"> {{ $t('usual_confirm') }}</el-button>
      <template v-slot:reference>
        <el-tooltip class="item" effect="dark" content="批量输入" placement="top">
          <el-button icon="el-icon-files" :disabled="disabled"></el-button>
        </el-tooltip>
      </template>
    </el-popover>
  </span>
</template>

<script>
export default {
  name: 'BatchInput',
  data() {
    return {
      textAreaValue: undefined,
    }
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    transfer() {
      if (!this.textAreaValue) return
      let strContent = this.textAreaValue
      strContent = strContent.replace(/\n/g, ',')
      let tempArr = strContent.split(',')
      tempArr = tempArr.map(item => item.trim())
      const res = Array.from(new Set(tempArr)).join(',') || ''
      // console.log(tempArr.join(","));
      this.textAreaValue = undefined
      this.$emit('update:value', res)
    },
  },
}
</script>

<style></style>
