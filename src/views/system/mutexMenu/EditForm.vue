<template>
  <el-dialog :title="title" width="700px" :visible="visible" @close="visible = false" v-dialogDrag :close-on-click-modal="false">
    <el-row>
      <el-col :md="2" :xs="4">
        <div class="tipText">
          {{ $tl('sys_mutexMenu_text1', '当遇到') }}
        </div>
      </el-col>
      <el-col :md="10" :xs="20">
        <div class="menuTreeBox" v-loading="loading">
          <el-tree :style="{ height: $table.FullViewHeight(206) }" ref="menuTree" show-checkbox :data="menuList" node-key="Code" :props="defaultProps" :filter-node-method="filterNode"> </el-tree>
        </div>
      </el-col>
      <el-col :md="2" :xs="4">
        <div class="tipText">
          {{ $tl('sys_mutexMenu_text2', '隐藏') }}
        </div>
      </el-col>
      <el-col :md="10" :xs="20">
        <div class="menuTreeBox" v-loading="loading">
          <el-tree :style="{ height: $table.FullViewHeight(206) }" ref="menuMutexTree" show-checkbox :data="menuList" node-key="Code" :props="defaultProps" :filter-node-method="filterNode"> </el-tree>
        </div>
      </el-col>
    </el-row>

    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="visible = false">{{ $t('usual_cancel') }}</el-button>
      <!-- 取消按钮 -->
      <el-button size="mini" type="primary" @click="handleSubmit">{{ $t('usual_confirm') }}</el-button>
      <!-- 确定按钮 -->
    </div>
  </el-dialog>
</template>

<script>
import { listMenu, addMutexList } from '@/api/system/menu'
export default {
  props: {
    parentObj: Object,
  },
  data() {
    return {
      visible: false,
      loading: false,
      title: '新增',
      menuList: [],
      defaultProps: {
        children: 'children',
        label: 'menuName',
      },
    }
  },
  created() {},
  methods: {
    init() {
      this.visible = true
      this.getMenuList()
    },
    async openForm() {
      this.init()
    },
    async getMenuList() {
      const queryParams = {
        platform: 'PC',
      }

      this.loading = true
      const res = await listMenu(queryParams)
      this.loading = false
      if (res.Success) {
        const list = res.Data.filter(item => item.menuType && item.menuType.toUpperCase() != 'F') || []
        this.menuList = this.handleTree(list, 'id')
      } else {
        this.msgError(res.Msg)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return (data.Code && data.Code.toUpperCase().indexOf(value.toUpperCase()) > -1) || (data.Name && data.Name.toUpperCase().indexOf(value.toUpperCase()) > -1)
    },
    async handleSubmit() {
      let menuTreeCheckedNodes = this.$refs.menuTree.getCheckedNodes() || []
      let menuMutexTreeCheckedNodes = this.$refs.menuMutexTree.getCheckedNodes() || []
      menuTreeCheckedNodes = menuTreeCheckedNodes.filter(item => item.menuType && item.menuType.toUpperCase() != 'M').map(item => item.id)
      menuMutexTreeCheckedNodes = menuMutexTreeCheckedNodes.filter(item => item.menuType && item.menuType.toUpperCase() != 'M').map(item => item.id)
      console.log(menuTreeCheckedNodes)
      console.log(menuMutexTreeCheckedNodes)
      if (!this.isEmptyValue(menuTreeCheckedNodes) && !this.isEmptyValue(menuMutexTreeCheckedNodes)) {
        const data = {
          menuIds: menuTreeCheckedNodes,
          menuMutexIds: menuMutexTreeCheckedNodes,
        }
        this.loading = true
        const res = await addMutexList(data)
        this.loading = false
        if (res.Success) {
          this.msgSuccess(this.$tl('usual_operation_success', '操作成功'))

          this.parentObj.getDataList()
        } else {
          this.msgError(res.Msg)
        }
      } else {
        this.msgWarning(this.$tl('sys_mutexMenu_addValid', '请勾选配对的互斥菜单'))
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/styles/variables';
.tipText {
  font-size: 16px;
  color: $lightBlueBlack;
  font-weight: bold;
  text-align: center;
}
.menuTreeBox {
  height: 60vh;
  overflow: auto;
  border: 1px solid #ebeef5;
}
</style>
