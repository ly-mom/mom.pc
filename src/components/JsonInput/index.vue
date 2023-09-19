<template>
  <div class="inputJsonMain">
    <el-popover placement="bottom-start" title="JSON对象输入" width="820" trigger="click">
      <div class="inputJsonBox">
        <div class="inputJsonTitle">预览</div>
        <div class="inputJsonTitle">编辑</div>
      </div>
      <div class="inputJsonBox">
        <div class="inputJsonBoxItem">
          <json-viewer v-if="showViewer" ref="JsonViewerRef" :value="jsonData" :expand-depth="5" boxed :copyable="{ copyText: '复制', copiedText: '已复制' }" sort></json-viewer>
        </div>
        <div class="inputJsonBoxItem">
          <el-row v-for="(item, index) in list" :key="index">
            <el-col :span="8">
              <el-input clearable size="mini" v-model.trim="item.key"></el-input>
            </el-col>
            <el-col :span="4">
              <el-select v-model.trim="item.dataType" :placeholder="$t('usual_choose')" clearable size="mini" @change="e => dataTypeChange(e, index)">
                <el-option v-for="(it, idx) in dataType" :key="idx" :label="it" :value="it"></el-option>
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-input-number v-if="item.dataType.toLowerCase() == 'number'" controls-position="right" v-model="item.value" size="mini" style="width: 100%"></el-input-number>
              <el-radio-group style="margin-left: 10px" v-else-if="item.dataType.toLowerCase() == 'boolean'" v-model="item.value">
                <el-radio :label="true" :value="true"></el-radio>
                <el-radio :label="false" :value="false"></el-radio>
              </el-radio-group>
              <el-input v-else-if="item.dataType.toLowerCase() == 'array'" clearable size="mini" v-model.trim="item.value" @input="e => arrayInput(e, index)" style="width: 100%">
                <span style="line-height: 28px" slot="prefix">[</span>
                <span style="line-height: 28px" slot="suffix">]</span>
                <template v-slot:append>
                  <BatchInput v-model="item.value"></BatchInput>
                </template>
              </el-input>
              <el-input v-else-if="item.dataType.toLowerCase() == 'object'" clearable size="mini" v-model.trim="item.value" style="width: 100%">
                <template v-slot:append>
                  <JsonInput v-model="item.value"></JsonInput>
                </template>
              </el-input>
              <el-input v-else clearable size="mini" v-model.trim="item.value" style="width: 100%"></el-input>
            </el-col>
            <el-col :span="4">
              <div class="buttonBox">
                <el-tooltip v-if="index == list.length - 1" :content="$t('usual_add')" placement="top">
                  <i class="el-icon-circle-plus-outline" style="color: #319cff" @click="addAttr(index)" />
                </el-tooltip>
                <el-tooltip v-if="list.length > 1" :content="$t('usual_delete')" placement="top">
                  <i class="el-icon-remove-outline" style="color: #f03d3d" @click="deleteAttr(index, item)" />
                </el-tooltip>
              </div>
            </el-col>
          </el-row>
          <div style="margin-top: 10px">
            <el-button size="mini" @click="clearData">清空</el-button>
            <el-button size="mini" @click="resetData">重置</el-button>
            <el-button size="mini" type="primary" @click="confirm">{{ $t('usual_confirm') }}</el-button>
          </div>
        </div>
      </div>
      <template v-slot:reference>
        <el-tooltip class="item" effect="dark" content="JSON对象输入" placement="top">
          <el-button icon="el-icon-house"></el-button>
        </el-tooltip>
      </template>
    </el-popover>
  </div>
</template>

<script>
import BatchInput from '@/components/BatchInput'
import JsonViewer from 'vue-json-viewer'

export default {
  name: 'JsonInput',
  components: {
    BatchInput,
    JsonViewer,
  },
  props: ['value'],
  data() {
    return {
      list: [
        {
          key: undefined,
          dataType: 'string',
          value: undefined,
        },
      ],
      dataType: ['string', 'boolean', 'number', 'array', 'object'],
      showViewer: true,
      jsonData: {}, // 预览的JSON
      originData: {}, // 初始源数据
    }
  },
  watch: {
    value: {
      handler(nVal) {
        this.jsonData = this.isJSON(nVal) ? JSON.parse(nVal) : {}
        if (this.isJSON(nVal)) {
          const json = JSON.parse(nVal)
          this.originData = json
          this.listToJson(json)
        }
      },
      immediate: true,
    },
  },
  methods: {
    addAttr(index) {
      this.setJsonProperty(this.list[index], true)
      // this.$forceUpdate()
      this.list.push({
        key: undefined,
        dataType: 'string',
        value: undefined,
      })
    },
    deleteAttr(index, item) {
      //   if (this.list.length > 0) {
      //     this.$confirm(`确定删除该属性?`, this.$t("usual_warning"), {
      //       type: "warning",
      //     })
      //       .then(() => {
      this.list = this.list.filter((it, idx) => index != idx)
      delete this.jsonData[item.key]
      this.showViewer = false
      setTimeout(() => {
        this.showViewer = true
      }, 0)
      //         this.msgSuccess(this.$t("IQC_DeleteSuccess"));
      //       })
      //       .catch(() => {
      //         this.$message({
      //           type: "info",
      //           message: this.$t("usual_cancel_success"),
      //         });
      //       });
      //   } else {
      //     this.msgInfo("至少填写一个属性");
      //   }
    },
    dataTypeChange(value, index) {
      this.$set(this.list[index], 'value', undefined)
    },
    clearData() {
      this.list = [
        {
          key: undefined,
          dataType: 'string',
          value: undefined,
        },
      ]
      this.jsonData = {}
    },
    confirm() {
      try {
        const obj = {}
        for (let i = 0; i < this.list.length; i++) {
          const element = this.list[i]
          switch (element.dataType.toLowerCase()) {
            case 'number':
              obj[element.key] = Number(element.value)
              break
            case 'boolean':
              obj[element.key] = element.value.toString() == 'true'
              break
            case 'array':
              obj[element.key] = JSON.parse('[' + element.value + ']')
              break
            case 'object':
              obj[element.key] = JSON.parse(element.value)
              break
            default:
              obj[element.key] = element.value
              break
          }
        }
        this.$emit('update:value', JSON.stringify(obj))
      } catch (error) {
        this.msgError(this.$tl('jsonInput_tip', '转换JSON失败，请检查格式'))
      }
    },
    /**
     * @msg: 设置json或者数组
     * @param {*} value json对象某一个单独的属性值  {key:'',value:'',dataType:''}
     * @param {*} toJson true：list转json  false：json转list
     */
    setJsonProperty(value, toJson = true) {
      const obj = {}
      const element = value
      const dataType = element.dataType.toLowerCase()
      switch (dataType.toLowerCase()) {
        case 'number':
          obj[element.key] = toJson ? Number(element.value) : element.value
          break
        case 'boolean':
          obj[element.key] = element.value.toString() == 'true'
          break
        case 'array':
          if (toJson) {
            obj[element.key] = JSON.parse('[' + element.value + ']')
          } else {
            const list = []
            element.value.forEach(ele => {
              list.push(JSON.stringify(ele))
            })
            obj[element.key] = list.join(',')
          }
          break
        case 'object':
          obj[element.key] = toJson ? JSON.parse(element.value) : JSON.stringify(element.value)
          break
        default:
          obj[element.key] = element.value
          break
      }
      if (toJson) {
        this.jsonData[element.key] = obj[value.key]
      } else {
        this.list.push({ value: obj[value.key], key: element.key, dataType: dataType })
      }
      if (toJson) {
        this.showViewer = false
        setTimeout(() => {
          this.showViewer = true
        }, 0)
      }
      // console.log(this.jsonData);
    },
    // 判断转换值是否符合JSON格式
    isJSON(str) {
      let result = false
      if (str) {
        try {
          const obj = JSON.parse(str)
          if (typeof obj === 'object') {
            result = true
          }
        } catch (e) {
          result = false
        }
      }
      return result
    },
    arrayInput(value, index) {
      const temp = value.replace(/，/g, ',')
      this.$set(this.list[index], 'value', temp)
    },
    // 数组转JSON
    listToJson(json) {
      this.list = []
      for (const key in json) {
        const element = json[key]
        const dataType = typeof element == 'object' ? (element instanceof Array ? 'array' : 'object') : typeof element
        const obj = {
          key: key,
          value: element,
          dataType: dataType.toLocaleUpperCase(),
        }
        this.setJsonProperty(obj, false)
      }
    },
    // 重置数据
    resetData() {
      this.jsonData = this.originData
      this.listToJson(this.originData)
    },
  },
}
</script>
<style scoped lang="scss">
@import '@/assets/styles/variables';
.inputJsonMain {
}
.inputJsonBox {
  @include flex-justify(space-around);
  .inputJsonBoxItem {
    height: 300px;
    width: 50%;
    max-height: 200px;
    overflow: auto;
  }
  .inputJsonTitle {
    margin-bottom: 8px;
  }
}
.buttonBox {
  min-height: 28px;
  padding: 0 10px;
  @include flex-justify(space-between);
  i {
    font-size: 22px;
    //   margin: 0 5px;
  }
}
</style>
