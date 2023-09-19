<template>
  <el-dialog
    :title="type == 'add' ? $t('usual_add') : type == 'copy' ? $t('usual_copy') : $t('usual_update')"
    :visible="visible"
    v-loading="confirmLoading"
    :close-on-click-modal="false"
    :before-close="handleClose"
    width="1180px"
    class="info-push-content"
  >
    <div class="verticalLineTitle">{{ $t('usual_basic_info') }}</div>
    <el-form ref="form" :model="form" :rules="rules" inline :label-width="'80px'" size="small">
      <el-row class="linghtBlueBg pt10 mb10">
        <el-col :span="24">
          <el-row>
            <el-col :md="6" :sm="24">
              <el-form-item :label="$t('system_obj_type')" prop="ObjectType">
                <el-select v-model.trim="form.ObjectType" :placeholder="$t('usual_choose')" class="input-wid" clearable>
                  <el-option :value="dict.DataValue" v-for="dict in $parent.ObjectTypeList" :key="dict.DataValue" :label="dict.DataText"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="BG">
                <el-select filterable v-model="form.BgCode" class="input-wid" clearable :placeholder="$t('usual_choose')" @change="changeFn(1)" @clear="clearFn(1)">
                  <el-option v-for="(item, index) in BGList" :key="index" :label="item.BgName" :value="item.BgCode"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="BU">
                <el-select filterable v-model="form.BuCode" class="input-wid" clearable :placeholder="$t('usual_choose')" @change="changeFn(2)" @clear="clearFn(2)">
                  <el-option v-for="(item, index) in BUList" :key="index" :label="item.BuName" :value="item.BuCode"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :md="6" :sm="24">
              <el-form-item label="SBU">
                <el-select filterable v-model="form.SbuCode" class="input-wid" clearable :placeholder="$t('usual_choose')" @clear="clearFn(3)">
                  <el-option v-for="(item, index) in SBUList" :key="index" :label="item.SbuName" :value="item.SbuCode"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- 机台触发人，根据这个触发人的去找他的上层领导 -->
            <el-col :md="6" :sm="24">
              <el-form-item :label="$tl('system_point', '触发人')">
                <el-select
                  v-model="form.UserCode"
                  class="input-wid"
                  filterable
                  remote
                  clearable
                  value-key="Key"
                  @focus="searchTimes = 0"
                  :placeholder="$t('base_keyword_search')"
                  :remote-method="notifySearch"
                >
                  <el-option v-for="(d, index) in userOptions" :key="index" :value="d" :label="d.Text">
                    {{ d.Text + '(' + d.Key + ')' }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-button type="primary" icon="el-icon-plus" style="margin-bottom: 18px; margin-top: 10px" size="mini" plain @click="addRowFn">{{ $t('usual_add') }}</el-button>
      <el-collapse v-model="activeKey" class="mb10">
        <el-collapse-item v-for="(item, index) in detailList" :key="index.toString()" :name="index.toString()">
          <template slot="title">
            <div class="detailTitle">
              <el-select size="small" v-model.trim="item.ObjectType" :placeholder="$t('usual_choose')" class="input-wid" clearable>
                <el-option :value="dict.DataValue" v-for="dict in $parent.ObjectTypeList" :key="dict.DataValue" :label="dict.DataText"> </el-option>
              </el-select>
              <div>
                <el-tooltip content="复制">
                  <i class="el-icon-document-copy font-18" @click="copyDetail(index)" />
                </el-tooltip>
                <el-tooltip content="添加">
                  <i class="el-icon-circle-plus-outline font-18" @click="addDetail(index)" />
                </el-tooltip>
                <!--外层删除-->
                <el-tooltip v-if="detailList.length > 1" :content="$t('usual_delete')">
                  <i class="el-icon-delete font-18" @click="deleteRow(index)" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <el-row class="detailList">
            <el-col :span="24" class="linghtBlueBg pt10 mb10">
              <el-row v-for="(subItem, sIndex) in item.DetailChild" :key="sIndex" style="position: relative">
                <el-col :span="5">
                  <el-form-item :label="$t('system_PushHierarchy')">
                    <el-input :placeholder="$t('MOM_InputPlease')" style="width: 140px" v-model="subItem.PushHierarchy"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item :label="$t('system_trigger_time')" label-width="120">
                    <el-input-number controls-position="right" v-model.trim="subItem.ObjectTime" :min="1" :step="0.5" :maxLength="100" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item :label="$t('usual_order')" label-width="50">
                    <el-input-number controls-position="right" v-model.trim="subItem.SortCode" :min="1" :step="1" :maxLength="100" />
                  </el-form-item>
                </el-col>
                <el-col :span="10" style="display: flex">
                  <el-form-item :label="$t('system_pusher')" label-width="80">
                    <el-select
                      v-model="subItem.UserList"
                      class="specail-select"
                      style="width: 80px"
                      filterable
                      multiple
                      remote
                      clearable
                      value-key="Key"
                      @focus="searchTimes = 0"
                      :placeholder="$t('base_keyword_search')"
                      :remote-method="notifySearch"
                    >
                      <el-option v-for="(d, index) in userOptions" :key="index" :value="d" :label="d.Text">
                        {{ d.Text + '(' + d.Key + ')' }}
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <div class="special-tag-rba">
                    <el-tag closable size="mini" v-for="(item, jIndex) in subItem.UserList" :key="jIndex" @close="removeUserFn(index, sIndex, jIndex)" class="tag-item">{{ item.Text }} </el-tag>
                  </div>
                  <!--内层删除-->
                  <el-tooltip :content="$t('usual_delete')">
                    <i class="el-icon-delete font-18" @click="deleteDetail(index, sIndex)" style="position: absolute; top: 9px; right: 10px; color: #1890ff" v-if="item.DetailChild.length > 1" />
                  </el-tooltip>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handleClose">{{ $t('usual_cancel') }}</el-button>
      <el-button size="mini" type="primary" @click="saveFn" :loading="submiting">{{ $t('usual_confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { editOrAddInfo, getInfo, BGListApi, SBUListApi } from '@/api/system/info'
import { baseUserInfo } from '@/api/base.js'
import { BUListApi } from '@/api/base'

export default {
  name: 'addOrEditDialog',
  data() {
    return {
      type: 'add',
      confirmLoading: false,
      visible: false,
      submiting: false,
      detail: {},
      activeKey: ['0'],
      userOptions: [],
      BUList: [],
      BGList: [],
      SBUList: [],
      form: {
        Id: '',
        BgCode: '',
        BuCode: '',
        SbuCode: '',
        ObjectType: '',
        UserCode: null, //触发人
      },
      rowItem: {
        ObjectType: '',
        DetailChild: [
          {
            Id: undefined,
            PushMessageId: undefined,
            PushHierarchy: '', //推送层级
            ObjectTime: '', //触发时间（单位:小时）
            UserList: [], //推送人工号（多选）
            SortCode: '',
          },
        ],
      },
      detailList: [],
      rules: {
        ObjectType: [
          {
            required: true,
            message: this.$t('MOM_IsRequire'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  inject: ['getData'],
  methods: {
    init({ type, id }) {
      this.type = type
      this.visible = true
      this.activeKey = ['0']
      this.getBGListFn()
      this.getBUListFn()
      this.getSBUListFn()
      if (type == 'add') {
        this.detailList.push(JSON.parse(JSON.stringify(this.rowItem)))
      } else {
        this.form.Id = id
        this.getDetail()
      }
    },
    // 新增编辑调用同一个接口
    saveFn() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          // console.log("this.form",this.form)
          // return
          const data = { ...this.form }
          if (this.type == 'copy') data.Id = '' //

          data.UserCode = this.form.UserCode ? this.form.UserCode.Key : ''
          this.detailList.forEach(item => {
            item.DetailChild.forEach(subItem => {
              subItem.UserCodes = subItem.UserList.map(item => item.Key).join(',')
              subItem.UserNames = subItem.UserList.map(item => item.Text).join(',')

              if (this.type == 'copy') subItem.Id = '' //复制场合
              delete subItem.UserList
            })
          })
          data.DetailList = JSON.parse(JSON.stringify(this.detailList))

          this.submiting = false
          const res = await editOrAddInfo(data)
          if (res.Success) {
            this.submiting = true
            this.handleClose()
            this.getData()
          } else {
            this.msgError(res.Msg)
          }
        }
      })
    },
    // 根据id查询明细
    async getDetail() {
      this.confirmLoading = true
      const res = await getInfo(this.form.Id)
      if (res.Success) {
        // 基本信息赋值
        const Entity = res.Data
        this.form.Id = Entity.Id
        this.form.BgCode = Entity.BgCode
        this.form.BuCode = Entity.BuCode
        this.form.SbuCode = Entity.SbuCode
        this.form.ObjectType = Entity.ObjectType

        let userObject = {}
        userObject = {
          Key: Entity.UserCode,
          Text: Entity.UserName,
        }
        this.userOptions.push(userObject)
        this.form.UserCode = userObject
        // 明细列表赋值
        const DataList = res.Data.DetailList
        DataList.forEach((sitem, oIndex) => {
          sitem.DetailChild.forEach((item, oIndex) => {
            const codeArr = item.UserCodes.split(',')
            const nameArr = item.UserNames.split(',')
            const userList = []
            for (let i = 0; i < codeArr.length; i++) {
              const userItem = {
                Key: codeArr[i],
                Text: nameArr[i],
              }
              userList.push(userItem)
            }
            item.UserList = userList
          })

          this.activeKey.push(oIndex.toString())
        })
        this.detailList = DataList
      } else {
        this.msgError(res.Msg)
      }
      this.confirmLoading = false
    },
    handleClose() {
      this.visible = false
      this.confirmLoading = false
      this.submiting = false
      this.form.Id = ''
      this.form.BgCode = ''
      this.form.BuCode = ''
      this.form.ObjectType = ''
      this.form.SbuCode = ''
      this.form.UserCode = ''
      this.detailList = []
      this.userOptions = []
    },
    // 用户搜索
    notifySearch(value, count) {
      const ParmeterData = {
        PageIndex: 0,
        PageRows: 100,
        SortField: 'id',
        SortType: 'asc',
        Search: {
          all: true,
          RealName: value,
        },
      }
      this.userOptions = []
      baseUserInfo(ParmeterData).then(res => {
        if (res.Success) {
          const list = res.Data.PageList.map(item => ({
            Key: item.UserCode,
            Text: item.RealName,
          }))
          this.userOptions = this.setRemoteOption(list, this.userOptions, count)
        }
      })
    },
    // 删除明细行(外层循环）
    deleteRow(index) {
      this.detailList.splice(index, 1)
      this.activeKey.splice(index, 1)
      event.stopPropagation()
    },
    // 删除明细行（内层循环）
    deleteDetail(index, sIndex) {
      this.detailList[index].DetailChild.splice(sIndex, 1)
    },
    // 添加明细行（内层循环）
    addDetail(index) {
      this.detailList[index].DetailChild.push(JSON.parse(JSON.stringify(this.rowItem.DetailChild[0])))
      event.stopPropagation()
    },
    // 复制明细行（内层循环）
    copyDetail(index) {
      const copyObj = JSON.parse(JSON.stringify(this.detailList[index]))
      copyObj.DetailChild.forEach(item => (item.Id = ''))
      this.detailList.push(copyObj)
      this.activeKey.push((this.detailList.length - 1).toString())
    },
    // 添加明细行 (外层循环）
    addRowFn() {
      this.detailList.push(JSON.parse(JSON.stringify(this.rowItem)))
      this.activeKey.push((this.detailList.length - 1).toString())
    },
    // 删除用户
    removeUserFn(index, sIndex, jIndex) {
      this.detailList[index].DetailChild[sIndex].UserList.splice(jIndex, 1)
    },
    changeFn(type) {
      if (type == 1) {
        this.getBUListFn()
        this.getSBUListFn()
      } else if (type == 2) {
        this.getSBUListFn()
      }
    },
    clearFn(type) {
      if (type == 1) {
        this.form.BuCode = ''
        this.form.SbuCode = ''
        this.getBGListFn() //查询自身即可，clear事件会触发changeFn
      } else if (type == 2) {
        this.form.SbuCode = ''
        this.getBUListFn()
      } else if (type == 3) {
        this.getSBUListFn()
      }
    },
    async getBUListFn() {
      const data = {
        Search: {
          BgCode: this.form.BgCode,
        },
      }
      const res = await BUListApi(data)
      if (res.Success) {
        this.BUList = res.Data.PageList
      } else {
        this.msgError(res.Msg)
      }
    },
    async getBGListFn() {
      const res = await BGListApi({})
      if (res.Success) {
        this.BGList = res.Data.PageList
      } else {
        this.msgError(res.Msg)
      }
    },
    async getSBUListFn() {
      const data = {
        Search: {
          BgCode: this.form.BgCode,
          BuCode: this.form.BuCode,
        },
      }
      const res = await SBUListApi(data)
      if (res.Success) {
        this.SBUList = res.Data.PageList
      } else {
        this.msgError(res.Msg)
      }
    },
  },
}
</script>
<style lang="scss">
.info-push-content {
  .input-wid {
    width: 180px;
  }
  .font-18 {
    font-size: 18px;
  }
  .special-tag-rba {
    display: flex;
    flex-wrap: wrap;
    height: 36px;
    align-items: center;
    .tag-item {
      margin-right: 5px;
    }
  }
  .specail-select {
    .el-select__tags {
      > span {
        display: none;
      }
      .el-input {
        height: 32px;
      }
    }
  }
}
</style>
