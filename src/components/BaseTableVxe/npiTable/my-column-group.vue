<template>
  <vxe-colgroup v-if="col.children && col.children.length" :align="col.align ? col.align : 'center'" :title="col.title" :key="col.title">
    <my-column-group v-for="(ele, index) in col.children" :key="ele.title + ele.dataIndex + col.key + '-' + index" :col="ele" :list="list" :listData="listData" @conditionChange="conditionChange">
      <!-- <template :slot="col.slots ? col.dataIndex : undefined" slot-scope="data"> -->
      <template #default="data">
        <slot :name="col.slots ? col.dataIndex : undefined" :row="data.row"></slot>
      </template>
    </my-column-group>
  </vxe-colgroup>
  <my-column v-else :key="col.dataIndex + col.title + col.key" :col="col" :list="list" :listData="listData" @conditionChange="conditionChange">
    <template :slot="col.slots ? col.dataIndex : undefined" slot-scope="data">
      <slot :name="col.slots ? col.dataIndex : undefined" :row="data.row"></slot>
    </template>
  </my-column>
</template>

<script>
import MyColumn from './my-column'

export default {
  name: 'MyColumnGroup',
  data() {
    return {
      inputVal: '',
      filters: [],
    }
  },
  props: {
    context: {},
    col: {
      type: Object,
    },
    // 源数据
    list: {
      type: Array,
    },
    // 筛选后的数据
    listData: {
      type: Array,
    },
  },
  components: {
    MyColumn,
    // eslint-disable-next-line vue/no-unused-components
    expandDom: {
      functional: true,
      props: {
        row: Object,
        render: Function,
        index: Number,
        column: {
          type: Object,
          default: null,
        },
      },
      render: (h, ctx) => {
        const params = {
          row: ctx.props.row,
          index: ctx.props.index,
        }
        if (ctx.props.column) params.column = ctx.props.column
        return ctx.props.render(h, params)
      },
    },
  },
  methods: {
    conditionChange(item) {
      this.$emit('conditionChange', item)
    },
  },
}
</script>
<style lang="scss" scoped>
.table-filter-list {
  max-height: 180px;
  overflow: auto;
  font-size: 12px;
  line-height: 16px;
  .table-filter-item {
    &:hover {
      background-color: #e8f4ff;
      color: #46a6ff;
    }
    font-size: 12px;
    line-height: 16px;
    padding: 2px 6px;
  }
}
</style>
