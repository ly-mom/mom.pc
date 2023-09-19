<template>
  <span style="display: inline-block">
    <span style="margin-right: 5px" v-if="name" @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove" class="cur-move">{{ name }}</span>
    <el-popover ref="popover" placement="bottom" width="280" trigger="hover" v-model="visible" @hide="hideFn">
      <div style="display: flex">
        <el-select v-model="inputVal" :placeholder="$t('usual_choose')" filterable clearable multiple size="mini" ref="selectRef" @visible-change="selectVisibleChange">
          <el-option v-for="(item, index) in list" :key="index" :label="item.text" :value="item.value"></el-option>
        </el-select>
        <el-button style="margin-left: 4px; height: 28px" type="primary" plain size="mini" @click="confrimFn">{{ $t('usual_confirm') }}</el-button>
        <el-button style="margin-left: 4px; height: 28px" size="mini" @click="visible = false">{{ $t('usual_cancel') }}</el-button>
      </div>
      <span slot="reference">
        <i class="el-icon-arrow-down"></i>
      </span>
    </el-popover>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ColumSelect',
  data() {
    return {
      inputVal: '',
      visible: false,
      selectShow: false,
    }
  },
  props: {
    name: {
      type: String, // 表格显示的标题
      default: '',
    },
    attributeName: {
      // 属性名称
      type: String,
      default: '',
    },
    tableData: {
      // table列表数据
      type: Array,
      defalut: [],
    },
    dictKey: {
      // 字典编码
      type: String,
      default: '',
    },
  },
  created() {
    if (!this.dictMap[this.dictKey]) {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: this.dictKey,
      })
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    dictList() {
      return this.dictMap[this.dictKey] && this.dictMap[this.dictKey].items
    },
    list() {
      if (this.tableData && this.tableData.length == 0) return []
      let uniqueList = []
      // 非字典场合
      if (!this.dictKey) {
        let arr = (this.tableData || []).map(item => {
          if (item[this.attributeName]) {
            return {
              text: item[this.attributeName],
              value: item[this.attributeName],
            }
          }
        })
        // 过滤为空的数据
        arr = arr.filter(item => {
          if (item) {
            return item
          }
        })
        if (arr.length == 0) return
        const setList = Array.from(new Set(arr.map(t => JSON.stringify(t))))
        uniqueList = setList.map(str => JSON.parse(str))
      }

      // 字典场合，只有属性id,没有属性name
      if (this.dictKey) {
        const arr = (this.tableData || []).map(item => {
          if (item[this.attributeName] != null || item[this.attributeName] != undefined) {
            return item[this.attributeName]
          }
        })
        const setList = Array.from(new Set(arr))
        for (let i = 0; i < setList.length; i++) {
          const findObj = this.dictList.find(item => item.DataValue == setList[i])
          if (findObj) {
            uniqueList.push({ text: findObj.DataText, value: findObj.DataValue })
          }
        }
      }
      return JSON.parse(JSON.stringify(uniqueList))
    },
  },
  methods: {
    hideFn() {
      // 下拉框出现时候，让popover也一直显示，这样下拉框的选项不会漂浮到其他地方去
      if (this.selectShow) {
        this.visible = true
      }
    },
    // 下拉框出现/隐藏时候触发。出现true 隐藏false
    selectVisibleChange(e) {
      this.selectShow = e
    },
    confrimFn() {
      const that = this
      that.visible = false
      const item = {
        attributeVal: JSON.parse(JSON.stringify(that.inputVal)),
        attributeName: that.attributeName,
        type: 'eq',
      }
      that.$emit('select-change', item)
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
