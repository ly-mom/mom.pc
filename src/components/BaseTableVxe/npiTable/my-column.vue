<template>
  <vxe-column
    :key="col.dataIndex + col.title"
    :field="col.dataIndex"
    :title="col.title"
    :min-width="col.width ? col.width : 100"
    :content-render="{ name: col.dataIndex }"
    :scopedSlots="col.render"
    :show-overflow="col.ellipsis"
    :align="col.align ? col.align : 'center'"
    :sortable="col.sortable"
    :treeNode="col.treeNode"
    :fixed="col.fixed"
  >
    <!-- <template v-slot:filter="{ col, context }">
      <div>{{col}}</div> -->
    <!-- <input
        type="type"
        v-for="(option, index) in col.filters"
        :key="index"
        v-model="option.data"
        @input="context.changeOption($event, !!option.data, option)"
      /> -->
    <!-- <column-select v-if="col.type=='1' || col.type=='2'"
                     :name="col.title"
                     :attribute-name="col.dataIndex"
                     :table-data="list"
                     :dict-key="col.dictKey"
                     @select-change="conditionChange"></column-select>
      <column-search v-else-if="col.type=='3'"
                     :name="col.title"
                     :attribute-name="col.dataIndex"
                     @search-change="conditionChange"></column-search> -->
    <!-- </template> -->
    <template #filter="{ column }">
      <template v-if="col.type == 1">
        <!-- <el-select
          v-model="inputVal"
          :placeholder="$t('usual_choose')"
          filterable
          clearable
          multiple
          size="mini"
          ref="selectRef"
          @change="$panel.changeOption($event, !!column.params, column.params)"
        >
          <el-option
            v-for="(item,index) in column.filters"
            :key="index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select> -->
        <!-- <select class="my-select" v-model="option.data" v-for="(option, index) in column.filters" :key="index" @change="$panel.changeOption($event, !!option.data, option)">
          <option v-for="(label, cIndex) in demo1.roleList" :key="cIndex" :value="label">{{ label }}</option>
        </select> -->
      </template>
      <template v-else-if="col.type == 3">
        <div>
          <ul class="table-filter-list">
            <li class="table-filter-item">
              <el-checkbox>
                {{ $tl('unsual_all', '全部') }}
              </el-checkbox>
            </li>
            <li class="table-filter-item" v-for="item in column.filters" :key="item.value">
              <el-checkbox>
                {{ item.label }}
              </el-checkbox>
            </li>
          </ul>
        </div>
      </template>
    </template>
    <template v-slot:header v-if="col.type">
      <i v-if="inputVal" class="el-icon-arrow-up"></i>
      <filterSelect
        v-if="col.type == '1' || col.type == '2'"
        :name="col.title"
        ref="columnSelect"
        :attribute-name="col.dataIndex"
        :dict-key="col.dictKey"
        :remote="col.remoteFilter"
        :remoteOption="col.remoteOption"
        :remoteParams="col.remoteParams"
        @select-change="conditionChange"
        @showFilter="showFilter"
      ></filterSelect>
      <filterInput v-else-if="col.type == '3'" :name="col.title" :attribute-name="col.dataIndex" :remote="col.remoteFilter" @search-change="conditionChange"></filterInput>
    </template>
    <template v-else v-slot:header>
      <span>{{ col.title }}</span>
    </template>
    <template #default="data">
      <slot v-if="col.slots" :name="col.dataIndex" :row="data.row"></slot>
      <template v-else-if="!col.render">
        <template v-if="col.formatter">
          <span v-html="col.formatter(data.row, column)"></span>
        </template>
        <template v-else>
          <!--解决排序显示为null问题-->
          {{ data.row[col.dataIndex] == 'null' || data.row[col.dataIndex] == null ? '' : data.row[col.dataIndex] }}
        </template>
      </template>
      <template v-else>
        <expand-dom :column="col" :row="data.row" :render="col.render"></expand-dom>
      </template>
    </template>
  </vxe-column>
</template>

<script>
import XEUtils from 'xe-utils'
import { mapGetters } from 'vuex'
import filterSelect from './filterSelect'
import filterInput from './filterInput'
// import VXETable from 'vxe-table'

// // 创建一个简单的输入框筛选
// VXETable.renderer.add('FilterInput', {
//   // 筛选模板
//   renderFilter (h, renderOpts, params) {
//     return h('span','rer')
//   },
//   // 重置数据方法
//   filterResetMethod ({ options }) {
//     options.forEach((option) => {
//       option.data = ''
//     })
//   },
//   // 重置筛选复原方法（当未点击确认时，该选项将被恢复为默认值）
//   filterRecoverMethod ({ option }) {
//     option.data = ''
//   },
//   // 筛选方法
//   filterMethod ({ option, row, column }) {
//     const { data } = option
//     const cellValue = row[column.property]
//     if (cellValue) {
//       return cellValue.indexOf(data) > -1
//     }
//     return false
//   }
// })

export default {
  name: 'MyColumn',
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
    filterSelect,
    filterInput,
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
  computed: {
    ...mapGetters(['dictMap']),
    dictList() {
      return this.dictMap[this.col.dictKey] && this.dictMap[this.col.dictKey].items
    },
  },
  methods: {
    filterMethod(a, b, c, d) {
      console.log(a, b, c, d)
    },
    filterNameMethod({ value, row, column }) {
      console.log(value, row, column)
      const property = column['property']
      this.$emit('filterChange')
      return row[property] === value
    },
    getFilterData(dataIndex) {
      // console.log(dataIndex);
      // return
      // console.log(
      //   Array.from(new Set(this.list.map((item) => item[dataIndex])))
      //     .map((ele) => {
      //       return { value: ele, label: ele };
      //     })
      //     .filter((item) => item.value)
      // );
      return new Promise((resolve, reject) => {
        let result = []
        const ListData = this.listData && this.listData.length ? this.listData : this.list
        if (this.dictList && this.dictList.length) {
          const liveList = ListData.map(item => item[dataIndex] && item[dataIndex].toString())
          result = this.dictList.filter(item => liveList.includes(item.DataValue))
          resolve(result)
        } else {
          result = Array.from(new Set(ListData.map(item => item[dataIndex])))
            .map(ele => ({ DataText: ele, DataValue: ele }))
            .filter(item => item.DataValue || item.DataValue == 0)

          resolve(result)
        }
      })
    },
    async showFilter(property) {
      if (this.list && this.list.length) {
        const res = await this.getFilterData(property)
        this.filters = res
        this.$store.dispatch('dict/setTableFilter', {
          dictKey: 'tableFilter',
          items: this.filters || [],
        })
      }
    },
    conditionChange(item) {
      const conditionList = []
      conditionList.forEach((o, index) => {
        if (o.attributeName == item.attributeName) {
          conditionList.splice(index, 1)
        }
      })
      conditionList.push(item)
      this.$emit('conditionChange', { ...item, filterType: this.col.type })
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
