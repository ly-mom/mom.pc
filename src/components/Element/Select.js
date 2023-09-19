// element的Select的二次封装
import Element from 'element-ui'

export default {
  name: 'Select',
  extends: Element.Select,
  data() {
    return {
      companyTimer: null, // 定时器
      searchCount: 0, // remote的次数
    }
  },
  props: {
    labelKey: {
      type: String,
      default: 'Text',
    },
    filterable: {
      type: Boolean,
      default: true,
    },
    defaultFirstOption: {
      type: Boolean,
      default: true,
    },
    // 远程下拉对焦时是否重置数据
    remoteInit: {
      type: Boolean,
      default: true,
    },
  },
  updated() {
    // 当this.selected是数组时，则是多选，否则单选
    if (Array.isArray(this.selected)) {
      if (this.selected.length > 0 && this.selected[0].$el) {
        // 确保能获取到下拉列表的dom节点
        try {
          const labels = []
          const parent = this.$el
          if (Object.prototype.toString.call(this.value[0]).toLowerCase() === '[object object]') {
            if (this.value.length == this.selected.length && this.selected.length > 0) {
              // 这是在下拉列表中存在所有已选项的情况
              this.selected.forEach(element => {
                labels.push(element.label)
              })
            } else {
              // 这是在下拉列表中不存在所有已选项的情况，像知会人的下拉
              this.value.forEach(element => {
                if (element[this.labelKey]) {
                  labels.push(element[this.labelKey])
                }
              })
            }
          } else {
            this.selected.forEach(element => {
              if (element.label) {
                labels.push(element.label)
              }
            })
          }
          parent.title = labels.join(',')
          // console.log(labels)
        } catch (error) {
          console.log(error)
        }
      }
    }
  },
  methods: {
    handleQueryChange(val) {
      if (this.previousQuery === val || this.isOnComposition) return
      if (this.previousQuery === null && (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')) {
        this.previousQuery = val
        return
      }
      this.previousQuery = val
      this.$nextTick(() => {
        if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper')
      })
      this.hoverIndex = -1
      if (this.multiple && this.filterable) {
        this.$nextTick(() => {
          const length = this.$refs.input.value.length * 15 + 20
          this.inputLength = this.collapseTags ? Math.min(50, length) : length
          this.managePlaceholder()
          this.resetInputHeight()
        })
      }
      if (this.remote && typeof this.remoteMethod === 'function') {
        if (val) {
          // 增加定时器，避免输入过程中连续请求接口
          if (this.companyTimer) {
            clearTimeout(this.companyTimer)
          }
          this.companyTimer = setTimeout(() => {
            this.hoverIndex = -1
            clearTimeout(this.companyTimer)
            this.searchCount++
            this.remoteMethod(val, this.searchCount)
            this.companyTimer = null
          }, 500)
        }
      } else if (typeof this.filterMethod === 'function') {
        this.filterMethod(val)
        this.broadcast('ElOptionGroup', 'queryChange')
      } else {
        this.filteredOptionsCount = this.optionsCount
        this.broadcast('ElOption', 'queryChange', val)
        this.broadcast('ElOptionGroup', 'queryChange')
      }
      if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
        this.checkDefaultFirstOption()
      }
    },
    handleFocus(event) {
      this.searchCount = 0
      if (!this.softFocus) {
        // 添加远程搜索框聚焦时搜索
        if (this.remoteInit && this.remote && typeof this.remoteMethod === 'function') {
          this.searchCount++
          this.remoteMethod('', this.searchCount)
        }
        if (this.automaticDropdown || this.filterable) {
          this.visible = true
          if (this.filterable) {
            this.menuVisibleOnFocus = true
          }
        }
        this.$emit('focus', event)
      } else {
        this.softFocus = false
      }
    },
  },
}
