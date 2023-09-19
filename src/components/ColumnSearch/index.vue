<template>
  <span style="display: inline-block">
    <span style="margin-right: 5px" @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove" class="cur-move">{{ name }}</span>
    <el-popover placement="bottom" width="180" trigger="hover" v-model="visible">
      <el-input v-model="search" size="mini" placeholder="输入关键字搜索" @keyup.enter.native="enterHandler" clearable @clear="enterHandler" @blur="visible = false" />
      <span slot="reference">
        <i class="el-icon-arrow-down"></i>
      </span>
    </el-popover>
  </span>
</template>

<script>
export default {
  name: 'ColumnSearch',
  data() {
    return {
      search: '',
      visible: false,
    }
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    attributeName: {
      type: String,
      default: '',
    },
  },
  methods: {
    enterHandler() {
      const item = {
        attributeVal: this.search,
        attributeName: this.attributeName,
        type: 'include',
      }
      this.visible = false
      this.$emit('search-change', item)
    },
    mousedown($event) {
      this.$emit('mousedown', $event)
    },
    mouseup($event) {
      this.$emit('mouseup', $event)
    },
    mousemove($event) {
      this.$emit('mousemove', $event)
    },
  },
}
</script>
