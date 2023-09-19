<template>
  <div>
    <slot v-bind:dict="dict">
      <!-- <span v-for="item in dict.items" :key="item.DataValue"> -->
      <template v-if="istag == 'no'">
        <span v-if="item.DataValue == value" :class="classList">{{ item.DicKey ? $tl(`${item.DicKey}#${item.DataValue}`, item.DataText) : item.DataText }}</span>
      </template>
      <template v-else>
        <template v-if="item.ListClass == 'default' || !item.ListClass">
          <span v-if="item.DataValue == value">{{ item.DicKey ? $tl(`${item.DicKey}#${item.DataValue}`, item.DataText) : item.DataText }}</span>
        </template>
        <template v-else>
          <div v-if="item.DataValue == value" class="dict-item" :class="item.ListClass">{{ item.DicKey ? $tl(`${item.DicKey}#${item.DataValue}`, item.DataText) : item.DataText }}</div>
        </template>
      </template>
      <!-- </span> -->
    </slot>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DictTag',
  props: {
    // 字典唯一编码(表名_字段名)
    dictKey: {
      type: String,
      default: undefined,
    },
    dictAll: {
      type: Boolean,
      default: false,
    },
    value: [String, Number, Array],
    istag: {
      type: String,
      default: 'yes',
    },
    classList: {
      type: String,
      default: '',
    },
  },
  created() {
    if (!this.dictMap[this.dictKey]) {
      this.$store.dispatch('dict/getByDictKey', {
        dictKey: this.dictKey,
        isAll: this.dictAll,
      })
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    // 当前字典
    dict() {
      return this.dictMap[this.dictKey] || {}
    },
    item() {
      const data = this.dict.items || []
      const items = data.find(item => item.DataValue == this.value)
      return items || {}
    },
  },
}
</script>
<style scoped></style>
