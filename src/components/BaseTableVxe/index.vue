<template>
  <vxe-table
    border
    size="mini"
    ref="xTable1"
    :height="options.height ? options.height : lHeight"
    :auto-resize="false"
    :stripe="options.stripe"
    :id="id"
    :tree-config="options.treeProps"
    :column-config="{ resizable: true }"
    :data="listData"
    :footer-method="footerMethod"
    :show-footer="!!footerMethodMethod && options.showFooter"
    :scroll-y="{ mode: 'wheel', gt: 20, oSize: options.merge ? 50 : 10 }"
    :span-method="options.merge ? objectSpanMethod : undefined"
    :loading="options.loading"
    :sort-config="{ multiple: options.hasOwnProperty('sortMultiple') ? options.sortMultiple : true }"
    :cellStyle="tableCellStyle"
    :header-cell-style="headerCellStyle"
    :row-class-name="tableRowClassName"
    :header-cell-class-name="headerClassName"
    :header-row-class-name="headerRowClassName"
    :cell-class-name="cellClassName"
    :row-config="{
      isHover: true,
      keyField: options.keyField ? options.keyField : '_X_ROW_KEY',
      isCurrent: options.highlightCurrentRow,
      height: options.rowHeight ? options.rowHeight : 33,
    }"
    @filter-visible="filterVisible"
    @filter-change="getProp"
    @checkbox-change="handleSelectionChange"
    @checkbox-all="handleSelectionAllChange"
    :checkbox-config="{
      checkField: options.checkField,
      reserve: options.reserve,
    }"
    show-header-overflow
    @cell-dblclick="dbrowclick"
    @cell-click="rowclick"
    @sort-change="remoteSortMethod"
  >
    <vxe-column v-if="options.showTreeNode" :field="id + 'treeNode'" tree-node fixed="left"></vxe-column>
    <vxe-column v-if="options.mutiSelect" :key="id + 'checkbox'" field="checkbox" type="checkbox" width="60" fixed="left"></vxe-column>
    <vxe-column v-if="options.showNum" :key="id + 'seq'" type="seq" field="seq" width="60" fixed="left" title="序号"></vxe-column>
    <!-- <template v-for="item in localColums">
      <vxe-colgroup
        v-if="item.children && item.children.length"
        :align="item.align ? item.align : 'center'"
        :title="item.title"
        :key="item.title"
      >
        <my-column
          v-for="ele in item.children"
          :key="ele.title + ele.dataIndex"
          :col="ele"
          :list="list"
          :listData="listData"
          @conditionChange="conditionChange"
        >
          <template
            :slot="item.slots ? item.dataIndex : undefined"
            slot-scope="data"
          >
            <slot
              :name="item.slots ? item.dataIndex : undefined"
              :row="data.row"
            ></slot>
          </template>
        </my-column>
      </vxe-colgroup>
      <my-column
        v-else
        :key="item.dataIndex"
        :col="item"
        :list="list"
        :listData="listData"
        @conditionChange="conditionChange"
        :conditionObj="conditionObj"
      >
        <template
          :slot="item.slots ? item.dataIndex : undefined"
          slot-scope="data"
        >
          <slot
            :name="item.slots ? item.dataIndex : undefined"
            :row="data.row"
          ></slot>
        </template>
      </my-column>
    </template> -->
    <my-column-group
      v-for="(item, index) in localColums"
      :key="item.dataIndex + item.title + item.sortable + item.key + '-' + index"
      :col="item"
      :autoWidth="options.autoWidth"
      :list="list"
      :listData="listData"
      @conditionChange="conditionChange"
      :conditionObj="conditionObj"
    >
      <template :slot="item.slots ? item.dataIndex : undefined" slot-scope="data">
        <slot :name="item.slots ? item.dataIndex : undefined" :row="data.row"></slot>
      </template>
    </my-column-group>
    <!--按钮操作组-->
    <TableColumn
      ref="fixedColumn"
      :label="$t('usual_operation')"
      align="center"
      :width="operates.width"
      :fixed="operates.fixed"
      v-if="operates && operates.list && operates.list.filter(_x => _x.show === true).length > 0"
    >
      <template #header v-if="operates.PageId == 'quotations' || 'NPIPricing' || 'MPPricing'">
        <div @click="operatesList">
          <i :class="operatesClass ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"></i>
          操作
        </div>
      </template>
      <template slot-scope="scope">
        <div class="operate-group">
          <template v-if="operates.PageId == 'quotations'">
            <template v-if="operatesClass">
              <template v-for="(btn, key) in operates.list">
                <template v-if="btn.id == 1">
                  <div class="item" v-if="scope.row.CreatorId == locCreatorId && btn.show" :key="btn.id">
                    <span :style="btn.style" size="mini" :class="btn.class" :plain="btn.plain" @click.stop="btn.method(key, scope.row)">{{ btn.label }} </span>
                  </div>
                </template>
                <template v-else>
                  <template v-if="btn.hasPermi">
                    <div class="item" v-if="btn.show" :key="btn.id">
                      <span v-hasPermi="btn.hasPermi" :style="btn.style" size="mini" :class="btn.class" :plain="btn.plain" @click.stop="btn.method(key, scope.row)">{{ btn.label }} </span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="item" v-if="btn.show" :key="btn.id">
                      <span :style="btn.style" size="mini" :class="btn.class" :plain="btn.plain" @click.stop="btn.method(key, scope.row)">{{ btn.label }} </span>
                    </div>
                  </template>
                </template>
              </template>
            </template>
            <template v-else>
              <i @click.stop="operatesList" :class="operatesClass ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"></i>
            </template>
          </template>
          <template v-else-if="operates.PageId == 'NPIPricing' || 'MPPricing'">
            <template v-if="operatesClass">
              <template v-for="(btn, key) in operates.list">
                <template v-if="btn.id == 2">
                  <div class="item" v-if="scope.row.CreatorId == locCreatorId && btn.show" :key="btn.id">
                    <span :style="btn.style" size="mini" :class="btn.class" :plain="btn.plain" @click.stop="btn.method(key, scope.row)">{{ btn.label }} </span>
                  </div>
                </template>
                <template v-else>
                  <div class="item" v-if="btn.show" :key="btn.id">
                    <span :style="btn.style" size="mini" :class="btn.class" :plain="btn.plain" @click.stop="btn.method(key, scope.row)">{{ btn.label }} </span>
                  </div>
                </template>
              </template>
            </template>
            <template v-else>
              <i @click.stop="operatesList" :class="operatesClass ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"></i>
            </template>
          </template>
          <template v-else>
            <template v-for="(btn, key) in operates.list">
              <div class="item" v-if="btn.show" :key="btn.id">
                <span :style="btn.style" size="mini" :class="btn.class" :plain="btn.plain" @click.stop="btn.method(key, scope.row)">{{ btn.label }} </span>
              </div>
            </template>
          </template>
        </div>
      </template>
    </TableColumn>
    <slot name="action"></slot>
  </vxe-table>
</template>
<script>
import MyColumnGroup from './npiTable/my-column-group'
import 'xe-utils'
import { VXETable, Column, Colgroup, Table } from 'vxe-table'
import zhCN from 'vxe-table/lib/locale/lang/zh-CN'
import _ from 'lodash'
// import Vue from 'vue'

// Vue.component('expand-dom', {
//   render: function (createElement) {
//     return createElement(
//           h,params
//         )
//   }
//   }
// )
VXETable.setup({
  i18n: (key, args) => XEUtils.toFormatString(XEUtils.get(zhCN, key), args),
})

export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    }, // 数据列表
    spanArrData: {
      type: Array,
    }, // 数据列表
    columns: {
      type: Array,
      default: () => [],
    }, // 需要展示的列 === prop：列数据对应的属性，label：列名，align：对齐方式，width：列宽
    operates: {
      default: () => {},
    }, // 操作按钮组 === label: 文本，type :类型（primary / success / warning / danger / info / text），show：是否显示，icon：按钮图标，plain：是否朴素按钮，disabled：是否禁用，method：回调方法
    options: {
      type: Object,
      default: () => ({
        stripe: false, // 是否为斑马纹 table
        highlightCurrentRow: false, // 是否要高亮当前行
      }),
    }, // table 表格的控制参数
    rowKey: {}, // rowKey
    treeProps: {
      type: Object,
      default: () => {},
    }, // 数据列表
    // 表格高度，不传则默认使用this.$table.FullViewHeight计算高度
    height: {
      type: [String, Number],
    },
    // 表格被减去的高度（除了页面头部和表格上方操作按钮的高度）
    cutheight: {
      type: [String, Number],
    },
    id: {
      type: String,
      default: new Date().getTime().toString(),
    },
    cellClassNameFn: {
      type: Function,
    },
  },
  //组件
  components: {
    MyColumnGroup,
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
  // 数据
  data() {
    return {
      filters: [],
      listData: [],
      lHeight: 400,
      innerHeight: window.innerHeight,
      conditionObj: {},
      conditionList: [],
      pageIndex: 1,
      clickCount: 0, // 单元格点击次数
      locCreatorId: this.$store.state.user.userCode || undefined,
      operatesClass: true,
      localColums: [],
      dragTitle: undefined, // 当前拖动表头
      moveTitle: undefined, // 当前鼠标移动所在的表头
    }
  },
  computed: {},
  mounted() {
    window.addEventListener('resize', () => {
      this.lHeight = this.cutheight ? window.innerHeight - this.cutheight - 112 : window.innerHeight - 324
    })
  },
  methods: {
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getDataList()
    },
    // 多行选中
    handleSelectionChange(val) {
      if (this.options.reserve && this.options.keyField) {
        const check = this.$refs.xTable1.getCheckboxReserveRecords()
        this.$emit('handleSelectionChange', check.concat(val.records), val.row, { ...val, checkboxAll: false })
      } else {
        this.$emit('handleSelectionChange', val.records, val.row, { ...val, checkboxAll: false })
      }
    },
    // 全选/全不选操作
    handleSelectionAllChange(val) {
      if (this.options.reserve && this.options.keyField) {
        const check = this.$refs.xTable1.getCheckboxReserveRecords()
        this.$emit('handleSelectionChange', check.concat(val.records), val.row, { ...val, checkboxAll: true })
      } else {
        this.$emit('handleSelectionChange', val.records, val.row, { ...val, checkboxAll: true })
      }
    },
    dbrowclick({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event }) {
      this.$emit('dbrowclick', row)
      this.$emit('dbcellclick', { row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event })
      this.clickCount = 0
    },
    rowclick({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event }) {
      this.clickCount = this.clickCount + 1
      setTimeout(() => {
        if (this.clickCount == 1) {
          this.$emit('rowclick', row)
          this.$emit('cellclick', { row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event })
          this.clickCount = 0
        }
      }, 300)
    },
    // 显示 表格操作弹窗
    showActionTableDialog() {
      this.$emit('handelAction')
    },
    operatesList() {
      console.log(this.operatesClass)
      this.operatesClass = !this.operatesClass
      if (this.operatesClass) {
        // eslint-disable-next-line vue/no-mutating-props
        this.operates.width = 300
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        this.operates.width = 80
      }
    },
    // 合并单元格的方法
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (this.options.merge) {
        const res = this.spanMethod(row, column, rowIndex, columnIndex)
        return res
      }
    },
    // 自定义行样式
    tableRowClassName({ row, rowIndex }) {
      const res = this.rowClassName ? this.rowClassName(row, rowIndex) : undefined
      return res
    },
    // 单元格样式
    cellClassName({ row, rowIndex, column, columnIndex }) {
      if (this.cellClassNameMethod) {
        const res = this.cellClassNameMethod(row, rowIndex, column, columnIndex)
        return res
      } else {
        return ''
      }
    },
    // 设置表头样式
    headerClassName({ column }) {
      if (this.dragTitle) {
        if (!column.fixed && column.property == this.moveTitle) {
          // 设置拖动表头的位置标识样式
          return 'dragTableTitleBoder'
        } else {
          return ''
        }
      }
    },
    handleMouseDown(e, element) {
      if (element.fixed) return
      this.dragTitle = element.dataIndex
      // console.log("handleMouseDown")
      const parent = document.getElementsByTagName('th')
      for (let i = 0; i < parent.length; i++) {
        const item = parent[i]
        item.style.zIndex = '20'
      }
      const myhint = document.getElementById('hint')
      myhint.innerHTML = element.title
      // console.log(this.dragTitle)
    },
    handleMouseUp(e, element) {
      if (element.fixed || !this.dragTitle) return
      if (element.dataIndex == this.dragTitle) {
        this.dragTitle = undefined
        this.moveTitle = undefined
        this.resetTitleStyle()
        return
      }
      this.dragChange(this.dragTitle, element.dataIndex)
    },
    handleMouseMove(e, element) {
      this.moveTitle = element.dataIndex
      const myhint = document.getElementById('hint')
      myhint.style.left = e.clientX + 8 + 'px'
      myhint.style.top = e.clientY + 6 + 'px'
    },
    dragChange(start, end) {
      const startColum = this.localColums.find(item => item.dataIndex == start) || {}
      this.localColums = this.localColums.filter(item => item.dataIndex != start)
      // console.log(this.localColums.length)
      const endIndex = this.localColums.findIndex(item => item.dataIndex == end)
      const before = this.localColums.slice(0, endIndex)
      const after = this.localColums.slice(endIndex, this.localColums.length)
      before.push(startColum)
      this.localColums = before.concat(after)
      this.dragTitle = undefined
      this.moveTitle = undefined
      this.resetTitleStyle()
    },
    mouseup(e) {
      this.dragTitle = undefined
      this.resetTitleStyle()
    },
    resetTitleStyle() {
      const parent = document.getElementsByTagName('th')
      for (let i = 0; i < parent.length; i++) {
        const item = parent[i]
        item.style.zIndex = ''
      }
    },
    filterNameMethod({ value, row, column }) {
      console.log(value, row, column)
      const property = column['property']
      return row[property] === value
    },
    async filterVisible({ column, property, visible, filterList, $event }) {
      console.log(column, property, visible, filterList, $event)
      // return
      // this.$refs.xTable1.closeFilter();
      // $event.preventDefault();
      const res = await this.getFilterData(property)
      if (res) {
        // this.$refs.xTable1.setFilter(property, res);
        // this.$refs.xTable1.updateData();
        // this.$refs.xTable1.refreshColumn();
        // this.$refs.xTable1.openFilter(property)
      }
      // this.getFilterData(property).then(res => {
      //   console.log("res");
      //   console.log(res);
      // })
    },
    getProp(a, b, c, d) {
      console.log(a, b, c, d)
    },
    filterChange() {
      this.$refs.xTable1.updateData()
    },
    async headerCellClick({ $rowIndex, column, columnIndex, $columnIndex, triggerResizable, triggerSort, triggerFilter, $event }) {
      console.log($rowIndex, column, columnIndex, $columnIndex, triggerResizable, triggerSort, triggerFilter, $event)
      const res = await this.getFilterData(column.field)
      if (res) {
        this.$refs.xTable1.openFilter(column.field)
      }
    },
    conditionChange(data) {
      if (data.remote) {
        this.$emit('remoteFilterMethod', data)
      } else {
        if (data.attributeVal || data.attributeVal.length) {
          this.conditionObj[data.attributeName] = data
        } else {
          delete this.conditionObj[data.attributeName]
        }
        this.conditionList = Object.values(this.conditionObj)
        this.filterData()
      }
    },
    filterData() {
      this.listData = this.$table.filterTableFn(this.list, this.conditionList)
      this.$refs.xTable1.reloadData(this.listData)
    },
    // 设置单元格颜色
    tableCellStyle(data) {
      const res = this.cellStyle ? this.cellStyle(data) : undefined
      return res
    },
    // 表格头样式
    headerRowClassName(data) {
      const res = this.headerRowClassNameMethod ? this.headerRowClassNameMethod(data) : undefined
      return res
    },
    // 更新表头数据
    updateColums() {
      this.localColums = []
      this.columns
        .filter(e => e.visible != false)
        .forEach(element => {
          this.localColums.push(element)
        })
    },
    refreshColumn() {
      this.$refs.xTable1.refreshColumn()
    },
    // 排序改变触发方法
    remoteSortMethod({ column, property, order, sortBy, sortList, $event }) {
      this.$emit('remoteSortMethod', sortList)
    },
    // 更新表格数据勾选状态的方法
    setCheckboxRow(row, checked) {
      if (checked === false && this.isEmptyValue(row)) {
        // 清空当前页的已勾选数据
        this.$refs.xTable1.clearCheckboxRow()
        if (this.options.reserve) {
          // 如果是翻页勾选的情况，需要把非当前页的已勾选数据也清空
          this.$refs.xTable1.clearCheckboxReserve()
        }
      } else {
        this.$refs.xTable1.setCheckboxRow(row, checked)
      }
    },
    // 表尾合计行
    footerMethod(data) {
      const res = this.footerMethodMethod ? this.footerMethodMethod(data) : undefined
      return res
    },
  },
  // 父组件传入的合并单元格方法
  inject: {
    spanMethod: {
      default: () => {},
    },
    rowClassName: {
      default: () => {},
    },
    cellStyle: {
      default: () => {},
    },
    cellClassNameMethod: {
      default: () => {},
    },
    headerRowClassNameMethod: {
      default: () => {},
    },
    headerCellStyle: {
      default: () => {},
    },
    footerMethodMethod: {
      default: () => {},
    },
  },
  watch: {
    listData(newVal, oldVal) {
      // 解决页面布局错误
      this.$nextTick(() => {
        // this.$refs.xTable1.updateData();
        // this.$refs.xTable1.reloadData(this.listData);
      })
    },
    list: {
      handler(newVal, oldVal) {
        this.$nextTick(() => {
          // 解决筛选后，更新列表后筛选条件失效的问题
          this.listData = this.$table.filterTableFn(newVal, this.conditionList)
          // 支持翻页勾选
          // 数据更新情况已选数据列表
          if (!this.options.reserve) {
            this.$emit('handleSelectionChange', [], undefined, { checkboxAll: undefined, checked: undefined })
            this.$refs.xTable1.clearCheckboxRow()
          }
          // if (check&&check.length) {
          //   this.$refs.xTable1.setCheckboxRow(check, true)
          //   this.$refs.xTable1.updateStatus(check[0])
          // }
        })
      },
      immediate: true,
    },
    columns: {
      handler(nVal) {
        this.localColums = nVal ? nVal.filter(e => e.visible != false) : []
      },
      immediate: true,
    },
    cutheight: {
      handler(nVal) {
        if (typeof this.options.autoHeight == 'boolean' && this.options.autoHeight) {
          this.lHeight = 'auto'
        } else {
          this.lHeight = nVal ? window.innerHeight - nVal - 112 : window.innerHeight - 324
        }
      },
      immediate: true,
    },
  },
}
</script>
<style>
.operate-group {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
</style>
