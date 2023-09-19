<template>
  <vxe-column :field="dataIndex" :fixed="fixed" :width="width || minWidth" :show-overflow="true">
    <template v-slot:header>
      <span>{{ label }}</span>
      <el-tooltip placement="top">
        <div slot="content">
          {{ $tl('table_action_tip', '可拖动列改变宽度') }}
        </div>
        <i class="el-icon-question"></i>
      </el-tooltip>
    </template>
    <template v-slot="scope">
      <slot :row="scope.row" :index="scope.$index" :data="scope"></slot>
    </template>
  </vxe-column>
</template>

<script>
export default {
  name: 'TableColumn',
  props: {
    dataIndex: {
      type: String,
      default: 'action',
    },
    fixed: {
      type: String,
    },
    width: {
      type: [String, Number],
    },
    minWidth: {
      type: String,
    },
    label: {
      type: String,
    },
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>

<style lang="scss" scoped></style>
