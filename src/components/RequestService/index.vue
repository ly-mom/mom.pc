<template>
  <el-select
    v-model="selectValue"
    placeholder="服务"
    clearable
    size="small"
    @change="change"
    :style="{
      width: typeof selectWidth == 'string' ? selectWidth : selectWidth + 'px',
    }"
  >
    <el-option v-for="item in SeiviceOptions" :key="item" :label="item" :value="item" />
  </el-select>
</template>

<script>
export default {
  name: 'RequestService',
  props: {
    selectWidth: {
      type: [Number, String],
      default: '180px',
    },
    value: [String, Number, Boolean, Array],
  },
  watch: {
    value: {
      handler: function (newVal) {
        this.selectValue = newVal
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      selectValue: undefined,
      SeiviceOptions: ['Base', 'Quality', 'WMS', 'SDManage', 'BI', 'Interface'],
    }
  },
  methods: {
    change(value) {
      this.$emit('input', value)
      this.$emit('onchange', value)
    },
  },
}
</script>

<style></style>
