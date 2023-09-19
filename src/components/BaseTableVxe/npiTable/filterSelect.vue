<template>
  <span style="display: inline-block" @contextmenu.prevent="showMenu">
    <span style="margin-right: 5px" v-if="name">{{ name }}</span>
    <el-popover ref="popover" placement="bottom" width="280" trigger="hover" v-model="visible" @show="showFn" @hide="hideFn">
      <div style="display: flex" v-if="visible">
        <el-select
          v-if="remote && remoteOption && !dictKey"
          v-model="inputVal"
          :placeholder="$t('usual_choose')"
          filterable
          clearable
          remote
          multiple
          :multiple-limit="remoteParams && remoteParams.multiple ? undefined : 1"
          size="mini"
          ref="selectRef"
          @focus="searchTimes = 0"
          :remote-method="getRemoteData"
          @visible-change="selectVisibleChange"
          @clear="confrimFn"
        >
          <el-option v-for="item in remoteData" :key="item[remoteParams.value]" :label="item[remoteParams.label]" :value="item[remoteParams.value]"></el-option>
        </el-select>
        <el-select v-else v-model="inputVal" :placeholder="$t('usual_choose')" filterable clearable multiple size="mini" ref="selectRef" @visible-change="selectVisibleChange" @clear="confrimFn">
          <el-option v-for="(item, index) in filterData" :key="index" :label="item.DataText" :value="item.DataValue"></el-option>
        </el-select>
        <el-button style="margin-left: 4px; height: 28px" type="primary" plain size="mini" @click="confrimFn">{{ $t('usual_confirm') }}</el-button>
        <el-button style="margin-left: 4px; height: 28px" size="mini" @click="visible = false">{{ $t('usual_cancel') }}</el-button>
      </div>
      <span slot="reference">
        <template v-if="remote">
          <svg t="1672724780477" v-if="isFilter" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4388" width="12" height="12">
            <path
              d="M707.101 84a57.559 57.559 0 0 1 35 11.862c25.211 19.31 29.98 55.384 10.65 80.57l-240.649 313.56v367.325a43.64 43.64 0 0 1-4.632 19.566l-0.52 1.006c-11.374 21.277-37.858 29.316-59.157 17.954L340.92 838.83c-26.222-13.989-42.598-41.272-42.598-70.97V491.217L55.933 176.51a57.432 57.432 0 0 1-11.922-33.893L44 141.467C44 109.729 69.754 84 101.522 84z m192.987 694.197c16.52 0 29.912 13.38 29.912 29.883 0 16.268-13.012 29.5-29.206 29.874l-0.706 0.008H614.771c-16.52 0-29.911-13.378-29.911-29.882 0-16.268 13.012-29.5 29.205-29.875l0.706-0.008h285.317z m0-160.906c16.52 0 29.912 13.378 29.912 29.882 0 16.268-13.012 29.5-29.206 29.875l-0.706 0.008H614.771c-16.52 0-29.911-13.38-29.911-29.883 0-16.268 13.012-29.5 29.205-29.874l0.706-0.008h285.317z m0-160.907c16.52 0 29.912 13.379 29.912 29.883 0 16.268-13.012 29.5-29.206 29.874l-0.706 0.008H614.771c-16.52 0-29.911-13.379-29.911-29.882 0-16.268 13.012-29.5 29.205-29.875l0.706-0.008h285.317z"
              fill="#409eff"
              p-id="4389"
            ></path>
          </svg>
          <svg t="1672724857812" v-else class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4705" width="12" height="12">
            <path
              d="M921.6 686.08h-245.76c-10.24 0-20.48-10.24-20.48-20.48s10.24-20.48 20.48-20.48H921.6c10.24 0 20.48 10.24 20.48 20.48s-10.24 20.48-20.48 20.48z m0-122.88h-245.76c-10.24 0-20.48-10.24-20.48-20.48s10.24-20.48 20.48-20.48H921.6c10.24 0 20.48 10.24 20.48 20.48s-10.24 20.48-20.48 20.48z m-166.4-289.28c-2.56 2.56-243.2 227.84-243.2 227.84v389.12l-163.84-81.92v-307.2L112.64 281.6c-2.56-2.56-5.12-5.12-7.68-5.12-15.36-15.36-23.04-35.84-23.04-58.88 0-46.08 38.4-84.48 84.48-84.48h527.36c46.08 0 84.48 38.4 84.48 84.48 0 23.04-10.24 43.52-23.04 56.32zM693.76 179.2H166.4C145.92 179.2 128 197.12 128 217.6c0 10.24 2.56 20.48 10.24 25.6l2.56 2.56 227.84 215.04 15.36 12.8 2.56 25.6-2.56 273.92 81.92 40.96V473.6l15.36-12.8 230.4-212.48 2.56-2.56c7.68-7.68 10.24-15.36 10.24-25.6 7.68-23.04-10.24-40.96-30.72-40.96z m-17.92 588.8H921.6c10.24 0 20.48 10.24 20.48 20.48s-10.24 20.48-20.48 20.48h-245.76c-10.24 0-20.48-10.24-20.48-20.48 0-12.8 7.68-20.48 20.48-20.48z"
              fill="#606266"
              p-id="4706"
            ></path>
          </svg>
        </template>
        <template v-else>
          <svg v-if="isFilter" t="1656297761842" class="icon" style="padding-top: 2px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4161" width="12" height="12">
            <path
              d="M800.46125676 126.00961539H223.53874324c-30.64932016 0-54.08653846 23.4372183-54.08653846 54.08653846v32.45192309c0 14.42335863 5.40865385 27.04326923 14.42251352 36.057974l237.98076923 219.95135967c10.81730769 10.81730769 18.02940955 25.24066631 18.02940956 39.66402494v268.62924429c0 18.02940955 9.01385967 36.05797401 25.23982121 45.07267879l91.94711537 55.88914137c1.80344802 5.40865385 5.40865385 5.40865385 9.01470479 5.40865385 9.01470478 0 18.02856445-7.21125676 18.02856445-18.02856445v-356.97115385c0-14.42335863 7.21210187-28.84671725 18.02940957-39.66402494l237.98076922-219.95135967c9.01385967-10.81730769 14.42251353-23.4380634 14.42251352-36.05797402V180.09615385c0-30.64932016-23.4372183-54.08653846-54.08653846-54.08653846z"
              p-id="4162"
              fill="#409eff"
            ></path>
          </svg>
          <svg v-else t="1656296992791" style="padding-top: 2px" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3887" width="12" height="12">
            <path
              d="M878.27692308 134.78290599c-3.93846154-7.87692308-11.81538462-11.81538462-19.6923077-11.81538462H161.47692308c-7.87692308 0-15.75384615 3.93846154-19.6923077 11.81538462s0 15.75384615 3.93846154 19.69230769L409.6 422.2905983c3.93846154 3.93846154 3.93846154 7.87692308 3.93846154 11.81538461v326.8923077c0 7.87692308 3.93846154 11.81538462 7.87692308 15.75384615l63.01538461 47.26153846c7.87692308 7.87692308 19.69230769 3.93846154 27.56923077-3.93846154s3.93846154-19.69230769-3.93846154-27.56923077l-55.13846154-39.38461538V434.10598291c0-15.75384615-3.93846154-27.56923077-15.75384615-39.38461538L208.73846154 162.35213676h602.58461538L586.83076923 394.72136753c-11.81538462 11.81538462-15.75384615 23.63076923-15.75384615 39.38461538v437.16923077c0 11.81538462 7.87692308 19.69230769 19.69230769 19.69230769s19.69230769-7.87692308 19.69230769-19.69230769V434.10598291c0-3.93846154 0-7.87692308 3.93846154-11.81538461l259.93846154-267.81538462c7.87692308-3.93846154 7.87692308-11.81538462 3.93846154-19.69230769z"
              p-id="3888"
              fill="#606266"
            ></path>
          </svg>
        </template>
        <!-- <i :class="[!isFilter ? 'el-icon-s-help' :'el-icon-help']" :style="{color: !isFilter ?'#0067FF':'#606266'}"></i> -->
        <!-- <i class="el-icon-arrow-down"></i> -->
      </span>
    </el-popover>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
export default {
  name: 'FilterSelect',
  data() {
    return {
      inputVal: '',
      visible: false,
      isFilter: false, // 标识是否有筛选条件
      selectShow: false,
      filters: [], // 过滤的下拉框数据
      remoteData: [], // 过滤的下拉框数据
    }
  },
  props: {
    name: {
      type: String, // 表格显示的标题
      default: '',
    },
    attributeName: {
      // 属性名称
      type: String,
      default: '',
    },
    dictKey: {
      // 字典KEY
      type: String,
      default: '',
    },
    tableData: {
      // table列表数据
      type: Array,
      defalut: [],
    },
    // 是否开启远程筛选
    remote: {
      type: Boolean,
      default: false,
    },
    // 是否启用接口获取下拉数据或者取全部字典数据，否则将从当前页的已有数据作为下拉数据源
    remoteOption: {
      type: Boolean,
      default: false,
    },
    // 启用调接口获取下拉源的配置
    remoteParams: {
      type: Object,
      default: () => {
        /* return {
          request: GetDataListProject,  // 下拉的请求API方法
          searchField: "Search.Code", // 远程搜索下拉数据的请求字段名称
          label: "ProjectName", // 下拉数据源显示的label字段名
          value: "ProjectName", // 下拉数据源保存的value字段名
          optionAttr: 'Data.PageList', // 请求返回数据体中的取下拉数据源的字段名
          extraParams: [
            ['PageRows',30],
          ],
          // 下拉请求的额外参数：二维数组，第一维度是，请求参数json的一个属性和属性值。第二维度的是，json对象的[key,value]。可在此修改下拉的请求数目条数
          multiple: true, // 是否可多选
        }; */
      },
    },
  },
  created() {},
  computed: {
    ...mapGetters(['dictMap']),
    filterData() {
      let result = []
      if ((this.dictKey && this.remoteOption) || this.dictKey) {
        // 取全部字典数据
        result = this.dictMap[this.dictKey] && this.dictMap[this.dictKey].items
      } else {
        // 取列表中存在的数据
        result = this.dictMap['tableFilter'] && this.dictMap['tableFilter'].items
      }
      return result
    },
  },
  methods: {
    setFilter(list) {
      this.filters = list
    },
    showMenu() {
      console.log(900)
    },
    hideFn() {
      // 下拉框出现时候，让popover也一直显示，这样下拉框的选项不会漂浮到其他地方去
      if (this.selectShow) {
        this.visible = true
      }
    },
    showFn() {
      this.$emit('showFilter', this.attributeName)
    },
    // 下拉框出现/隐藏时候触发。出现true 隐藏false
    selectVisibleChange(e) {
      this.selectShow = e
    },
    clearFilter() {},
    confrimFn() {
      const that = this
      that.visible = false
      const item = {
        attributeVal: JSON.parse(JSON.stringify(that.inputVal)),
        attributeName: that.attributeName,
        remote: this.remote,
        type: 'eq',
      }
      that.$emit('select-change', item)
      this.isFilter = that.inputVal && that.inputVal.length
    },
    // 请求下拉的数据
    async getRemoteData(value, count) {
      if (!this.remoteParams.request) {
        return this.msgError(this.$tl('table_remoteSelect', '请配置请求的API'))
      }
      const data = {
        PageIndex: 1,
        PageRows: 50,
        Search: {},
      }
      if (this.remoteParams.searchField) _.set(data, this.remoteParams.searchField, value)
      if (this.remoteParams.extraParams && this.remoteParams.extraParams.length) {
        // 追加额外的请求参数
        this.remoteParams.extraParams.forEach(element => {
          _.set(data, element[0], element[1])
        })
      }
      const res = await this.remoteParams.request(data)
      if (res.Success) {
        const optionAttr = this.remoteParams.optionAttr ? this.remoteParams.optionAttr : 'Data.PageList'
        this.remoteData = this.setRemoteOption(_.get(res, optionAttr, []), this.remoteData, count)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
// 設置多選下拉框，已選項的最大寬度
::v-deep .el-select__tags-text {
  max-width: 62px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: inline-block;
}
::v-deep .el-select .el-tag__close.el-icon-close {
  top: -5px;
}
</style>
