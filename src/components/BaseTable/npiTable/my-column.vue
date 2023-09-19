<template>
  <!--  :sort-method="(a,b)=>{return a[col.dataIndex]-b[col.dataIndex]}"-->
  <!--  lijinya 2022.02.8 去掉自定义排序 :sort-method="(a,b)=>{return a[col.dataIndex]-b[col.dataIndex]}" -->
  <el-table-column :prop="col.dataIndex" :key="col.title" :label="col.title" :align="col.align" :width="col.width" :fixed="col.fixed" :sortable="col.sortable" :show-overflow-tooltip="col.ellipsis">
    <!--type(1:下拉框  3：文本框）-->
    <template v-slot:header v-if="col.type">
      <column-select
        v-if="col.type == '1' || col.type == '2'"
        :name="col.title"
        :attribute-name="col.dataIndex"
        :table-data="list"
        :dict-key="col.dictKey"
        @select-change="conditionChange"
        @mousedown="mousedown"
        @mouseup="mouseup"
        @mousemove="mousemove"
      ></column-select>
      <column-search
        v-else-if="col.type == '3'"
        :name="col.title"
        :attribute-name="col.dataIndex"
        @search-change="conditionChange"
        @mousedown="mousedown"
        @mouseup="mouseup"
        @mousemove="mousemove"
      ></column-search>
    </template>
    <template v-else v-slot:header>
      <span @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove" class="cur-move">{{ col.title }}</span>
    </template>
    <template slot-scope="scope">
      <slot v-if="col.slots" :name="col.dataIndex" :data="scope.row"></slot>
      <template v-else-if="!col.render">
        <template v-if="col.formatter">
          <span v-html="col.formatter(scope.row, column)"></span>
        </template>
        <template v-else>
          <!--解决排序显示为null问题-->
          {{ scope.row[col.dataIndex] == 'null' || scope.row[col.dataIndex] == null ? '' : scope.row[col.dataIndex] }}
        </template>
      </template>
      <template v-else>
        <expand-dom :column="col" :row="scope.row" :render="col.render"></expand-dom>
      </template>
    </template>

    <template v-if="col.children">
      <my-column v-for="(item, index) in col.children" :key="index" :col="item"></my-column>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'MyColumn',
  props: {
    col: {
      type: Object,
    },
    list: {
      type: Array,
    },
    conditionList: {
      type: Array,
    },
  },
  components: {
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
      this.conditionList.forEach((o, index) => {
        if (o.attributeName == item.attributeName) {
          // eslint-disable-next-line vue/no-mutating-props
          this.conditionList.splice(index, 1)
        }
      })
      // eslint-disable-next-line vue/no-mutating-props
      this.conditionList.push(item)
    },
    mousedown($event) {
      this.$emit('handleMouseDown', $event, this.col)
    },
    mouseup($event) {
      this.$emit('handleMouseUp', $event, this.col)
    },
    mousemove($event) {
      this.$emit('handleMouseMove', $event, this.col)
    },
  },
}
</script>
