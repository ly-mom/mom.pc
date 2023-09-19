<template>
  <div class="top-right-btn">
    <el-row>
      <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top">
        <el-button size="mini" v-show="!hideSearch" circle icon="el-icon-search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button size="mini" circle icon="el-icon-refresh" @click="refresh()" />
      </el-tooltip>
      <!-- <el-tooltip class="item" effect="dark" content="显隐列" placement="top" v-if="columns">
        <el-button size="mini" circle icon="el-icon-menu" @click="showColumn()" />
      </el-tooltip> -->
      <el-popover placement="left" :title="'显隐列(至少' + columnsLimit + '列)'" width="180" trigger="click">
        <div class="columnsBox">
          <el-checkbox-group v-model="value" name="checkboxColumns" @change="handleCheckedChange">
            <el-checkbox v-for="(item, index) in originColumns" :key="index" :label="item.title" :title="item.title" :disabled="value.length <= columnsLimit && value.includes(item.title)">
              {{ item.title }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <el-tooltip class="item" slot="reference" effect="dark" content="显隐列" placement="top" v-if="columns">
          <el-button size="mini" circle icon="el-icon-menu" style="margin-left: 10px" />
        </el-tooltip>
      </el-popover>
    </el-row>
    <!-- <el-dialog :title="title" :visible.sync="open" append-to-body>
      <el-transfer
        :titles="['显示', '隐藏']"
        v-model="value"
        :data="columns"
        @change="dataChange"
      ></el-transfer>
    </el-dialog> -->
  </div>
</template>
<script>
export default {
  name: 'RightToolbar',
  data() {
    return {
      // 显隐数据
      value: [],
      // 弹出层标题
      title: '显示/隐藏',
      // 是否显示弹出层
      open: false,
      originColumns: [], // 数据列的原始数据
    }
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Array,
    },
    columnsLimit: {
      // 显示数据列的最少数量
      type: [String, Number],
      default: 12,
    },
    // 隐藏搜索图标
    hideSearch: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    columns: {
      handler(val) {
        if (val && val.length) {
          this.value = val.map(item => item.title)
          // 当原始数据列为空时赋值，否则不赋值
          if (!this.originColumns.length) {
            this.originColumns = val
          }
        }
      },
      immediate: true,
    },
  },
  created() {
    // 显隐列初始默认隐藏列
    for (const item in this.columns) {
      if (this.columns[item].visible === false) {
        this.value.push(parseInt(item))
      }
    }
  },
  methods: {
    // 搜索
    toggleSearch() {
      this.$emit('update:showSearch', !this.showSearch)
    },
    // 刷新
    refresh() {
      this.$emit('queryTable')
    },
    // 右侧列表元素变化
    /* dataChange(data) {
      for (var item in this.columns) {
        const key = this.columns[item].key;
        this.columns[item].visible = !data.includes(key);
      }
    }, */
    // 打开显隐列dialog
    /* showColumn() {
      this.open = true;
    }, */
    handleCheckedChange(value) {
      const list = this.originColumns.filter(item => value.includes(item.title))
      this.$emit('update:columns', list)
    },
  },
}
</script>
<style lang="scss" scoped>
/* ::v-deep .el-transfer__button {
  border-radius: 50%;
  padding: 12px;
  display: block;
  margin-left: 0px;
}
::v-deep .el-transfer__button:first-child {
  margin-bottom: 10px;
} */
.columnsBox {
  max-height: 200px;
  overflow: auto;
}
</style>
