<!-- eslint-disable vue/no-deprecated-slot-attribute -->
<template>
  <div class="table">
    <el-table
      id="iTable"
      size="mini"
      :row-key="rowKey ? rowKey : undefined"
      :tree-props="treeProps"
      :row-class-name="options.rowClassName ? tableRowClassName : undefined"
      :header-cell-class-name="headerClassName"
      :highlight-current-row="options.highlightCurrentRow"
      :span-method="options.merge ? objectSpanMethod : undefined"
      :height="localHeight"
      :data="listData"
      @sort-change="$table.sortChange($event, list)"
      v-loading.iTable="options.loading"
      :stripe="options.stripe"
      ref="mutipleTable"
      @selection-change="handleSelectionChange"
      @row-dblclick="dbrowclick"
      @row-click="rowclick"
      border
    >
      <!--checkbok-->
      <el-table-column v-if="options.mutiSelect" fixed type="selection" style="width: 55px" :reserve-selection="options.reserveSelection" />
      <!--序号-->
      <el-table-column v-if="options.showNum" fixed :label="$t('usual_serial_num')" type="index" :index="1" width="50" />
      <!--数据列-->
      <my-column
        v-for="(item, index) in localColums"
        :key="index"
        :col="item"
        :list="list"
        :condition-list="conditionList"
        @handleMouseDown="handleMouseDown"
        @handleMouseUp="handleMouseUp"
        @handleMouseMove="handleMouseMove"
      >
        <template :slot="item.slots ? item.dataIndex : undefined" slot-scope="data">
          <slot :name="item.slots ? item.dataIndex : undefined" :row="data.data"></slot>
        </template>
      </my-column>

      <!--按钮操作组-->
      <el-table-column
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
      </el-table-column>
      <slot name="action"></slot>
    </el-table>
    <!-- 拖动表头跟随鼠标移动的div -->
    <div id="hint" v-show="dragTitle" style="position: fixed; z-index: 21"></div>
    <!-- 表头行外的遮罩层 -->
    <div :style="{ zIndex: '19', display: !dragTitle ? 'none' : 'block' }" class="el-dialog__wrapper" @mouseup="mouseup"></div>
  </div>
</template>
<script>
import MyColumn from './npiTable/my-column'

export default {
  props: {
    list: {
      type: Array,
      default: () => [],
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
  },
  //组件
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
  // 数据
  data() {
    return {
      conditionList: [],
      pageIndex: 1,
      multipleSelection: [], // 多行选中
      locCreatorId: this.$store.state.user.userCode || undefined,
      operatesClass: true,
      localColums: [],
      dragTitle: undefined, // 当前拖动表头
      moveTitle: undefined, // 当前鼠标移动所在的表头
    }
  },
  computed: {
    listData() {
      this.$emit('dataChange', this.$table.filterTableFn(this.list, this.conditionList))
      return this.$table.filterTableFn(this.list, this.conditionList)
    },
    localHeight() {
      if (this.height) {
        return this.height
      } else if (this.options.autoHeight) {
        return typeof this.options.autoHeight == 'boolean' ? undefined : this.options.autoHeight
      } else {
        return this.$table.FullViewHeight(236)
      }
    },
  },
  methods: {
    handleQuery() {
      this.queryParams.PageIndex = 1
      this.getDataList()
    },
    // 多行选中
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.$emit('handleSelectionChange', val)
    },
    dbrowclick(row) {
      this.$emit('dbrowclick', row)
    },
    rowclick(row) {
      this.$emit('rowclick', row)
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
      const res = this.rowClassName(row, rowIndex)
      return res
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
  },
  // 父组件传入的合并单元格方法
  inject: {
    spanMethod: {
      default: () => {},
    },
    rowClassName: {
      default: () => {},
    },
  },
  watch: {
    list(newVal, oldVal) {
      // 解决页面布局错误
      this.$nextTick(() => {
        this.$refs.mutipleTable.doLayout()
      })
    },
    columns: {
      handler(nVal) {
        this.localColums = nVal
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
