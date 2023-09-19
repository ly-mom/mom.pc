<template>
  <div style="display: inline-block; margin-left: 10px">
    <slot name="action">
      <el-button type="primary" :disabled="disabled" size="mini" @click="init">
        {{ $t('MOM_Upload') }}
      </el-button>
    </slot>
    <el-dialog :close-on-click-modal="false" v-dialogDrag :visible="bigFile.showDialog" width="400px" append-to-body :show-close="false">
      <div slot="title" class="bigFileTitle">
        <div>{{ title }}</div>
        <i v-if="bigFile.fileList && bigFile.fileList.length && !bigFile.uploading" @click="closeUpload" class="el-icon-circle-close pointer"></i>
        <i v-else @click="minimality" class="el-icon-remove-outline pointer"></i>
      </div>
      <div class="text-reds mb10">文件上传过程中，不要刷新浏览器，否则上传将会暂停</div>
      <el-upload
        v-loading="loading"
        element-loading-text="解析文件中"
        v-show="bigFile.fileList && bigFile.fileList.length == 0"
        name="file"
        :before-upload="beforeUpload"
        ref="upload"
        :disabled="bigFile.uploading"
        :limit="1"
        action="no"
        :show-file-list="false"
        drag
        :http-request="privateUpload"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{ $t('dataM_DownloadDesc') }}<em>{{ $t('MOM_Upload') }}</em>
        </div>
      </el-upload>
      <ul class="el-upload-list el-upload-list--text is-disabled" v-if="bigFile.fileList && bigFile.fileList.length">
        <li tabindex="0" class="el-upload-list__item is-success" v-for="(file, index) in bigFile.fileList" :key="index">
          <a class="el-upload-list__item-name">
            <i class="el-icon-document"></i>
            {{ file.name }}
          </a>
          <label class="el-upload-list__item-status-label">
            <i class="el-icon-loading" v-if="bigFile.uploading"></i>
            <i class="el-icon-circle-check" v-else></i>
          </label>
          <el-progress v-if="bigFile.uploading" :text-inside="true" :stroke-width="16" :percentage="percentage"></el-progress>
        </li>
      </ul>
      <!-- <div slot="title" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">{{ $t('usual_confirm') }}</el-button>
        <el-button @click="upload.open = false">{{ $t('usual_cancel') }}</el-button>
      </div> -->
    </el-dialog>
    <!-- <Suspended></Suspended> -->
  </div>
</template>

<script>
import { setChunkInfo, getUploadPr, chunkUpload, mergeFiles } from '@/api/base.js'
import SparkMD5 from 'spark-md5'
// import Suspended from '@/components/LargerFileUpload/suspended.vue'
import { mapGetters } from 'vuex'

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))
function getFileMD5(file) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    fileReader.onload = e => {
      spark.append(e.target.result)
      resolve(spark.end())
    }
    fileReader.onerror = () => {
      reject('')
    }
    fileReader.readAsArrayBuffer(file)
  })
}

export default {
  name: 'LargerFileUpload',
  computed: {
    ...mapGetters(['bigFile']),
  },
  data() {
    return {
      title: '大文件上传',
      MD5: null,
      percentage: 0,
      loading: false,
    }
  },
  props: {
    disabled: {
      default: false,
      type: Boolean,
    },
  },
  mounted() {},
  methods: {
    md5WithChunk(file, chunkSize, processCallback = console.log) {
      return new Promise((resolve, reject) => {
        const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
        const chunks = Math.ceil(file.size / chunkSize)
        let currentChunk = 0
        const spark = new SparkMD5.ArrayBuffer()
        const fileReader = new FileReader()
        fileReader.onerror = reject
        fileReader.onload = e => {
          // processCallback(currentChunk / chunks)
          spark.append(e.target.result)
          currentChunk++
          if (currentChunk < chunks) {
            loadNext()
          } else {
            resolve(spark.end())
          }
        }
        function loadNext() {
          const start = currentChunk * chunkSize
          const end = start + chunkSize >= file.size ? file.size : start + chunkSize
          fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
        }
        loadNext()
      })
    },
    init() {
      if (!this.disabled) {
        this.$store.dispatch('bigFile/toggleBall', this.bigFile.uploading)
        this.$store.dispatch('bigFile/toggleDialog', true)
      }
    },
    //   查询进度
    async getProgress(hash) {
      // eslint-disable-next-line no-async-promise-executor
      new Promise(async (resolve, reject) => {
        const rsp = await getUploadPr({ md5: hash })
        const result = {}
        if (rsp.Success) {
          this.chunkIndex = rsp.Data.ChunkIndex || 0
          result['Success'] = true
          resolve(result)
        } else {
          result['Success'] = false
          result['Msg'] = rsp.Msg
          reject(result)
        }
      })
    },
    //   设置文件信息
    async setFileInfo(data) {
      const res = await setChunkInfo(data)
      if (res.Success) {
        return true
      } else {
        this.msgError(res.Msg)
        return false
      }
    },
    // async beforeUploadold(file) {
    //   console.log("beforeUpload");
    //   let fileHash = await getFileMD5(file);
    //   this.MD5 = fileHash;
    //   //大文件切片后的数组
    //   this.chunkList = [];
    //   //开始切片
    //   for (let i = 0; i < file.size; i = i + this.chunkSize) {
    //     const tmp = file.slice(i, Math.min(i + this.chunkSize, file.size));
    //     this.chunkList.push(tmp);
    //   }
    //   console.log(this.chunkList);
    //   let res = await this.getProgress(this.MD5);
    //   console.log("res");
    //   console.log(res);
    //   if (res.Success) {
    //     return true;
    //   } else {
    //     let data = {
    //       MD5: fileHash,
    //       FileName: file.name,
    //       FileSize: file.size,
    //       ChunkSize: this.chunkSize,
    //       ChunkCount: this.chunkList.length,
    //     };
    //     return this.setFileInfo(data);
    //   }
    // },
    async beforeUpload(file, fileList) {
      console.log('beforeUpload')
      this.loading = true
      const fileHash = await this.md5WithChunk(file, this.bigFile.chunkSize * 1000)
      this.loading = false
      this.MD5 = fileHash.toUpperCase()
      this.$store.dispatch('bigFile/setFileList', [file])
      this.showFile = true
      //大文件切片后的数组
      // 切片文件临时数组
      const chunkList = []
      // 切片后等待上传的切片索引
      const chunkIndex = []
      //开始切片
      let index = 0
      for (let i = 0; i < file.size; i = i + this.bigFile.chunkSize) {
        // index才是真正的切片索引，i是每个切片的内存起始位置
        const tmp = file.slice(i, Math.min(i + this.bigFile.chunkSize, file.size))
        chunkIndex.push(index)
        index++
        chunkList.push(tmp)
      }
      // 设置文件切换后的数组
      this.$store.dispatch('bigFile/setChunkList', chunkList)
      const rsp = await getUploadPr({ md5: this.MD5 })
      if (rsp.Success) {
        // console.log(rsp.Data.ChunkIndexs);
        // 如果文件已经设置过文件信息，那么接口返回的ChunkIndexs才是真正待上传的切片索引
        this.$store.dispatch('bigFile/setChunkIndex', rsp.Data.ChunkIndexs)
        return true
      } else {
        // 如果文件没有设置过文件信息，则文件没有已经上传的切片，那么待上传切片则是所有索引
        this.$store.dispatch('bigFile/setChunkIndex', chunkIndex)
        const data = {
          MD5: this.MD5,
          FileName: file.name,
          FileSize: file.size,
          ChunkSize: this.bigFile.chunkSize,
          ChunkCount: this.bigFile.chunkList.length,
        }
        const res = await setChunkInfo(data)
        if (res.Success) {
          return true
        } else {
          this.msgError(res.Msg)
          return false
        }
      }
    },
    async handleUploadChange(file, fileList) {
      // console.log("handleUploadChange");
      // console.log(file, fileList);
    },
    // if(file.status == 'success'){
    //   this.fileList = fileList;
    // }

    async privateUpload() {
      for (let i = 0; i < this.bigFile.chunkIndex.length; i++) {
        const element = this.bigFile.chunkIndex[i]
        // 开始上传
        this.$store.dispatch('bigFile/toggleUploading', true)
        const res = await chunkUpload(
          {
            file: this.bigFile.chunkList[element],
            timestamp: new Date().getTime(),
          },
          { md5: this.MD5, chunkIndex: element },
        )
        if (res.Success) {
          // 获取上传的进度
          const rsp = await getUploadPr({ md5: this.MD5 })
          if (rsp.Success) {
            const total = this.bigFile.chunkList.length
            const left = rsp.Data.ChunkIndexs.length
            const per = ((total - left) / total) * 100
            // 更新进度
            this.percentage = parseInt(per.toFixed(0))
          }
          sleep(500)
        } else {
          // 上传过程出差的，结束loading
          this.$store.dispatch('bigFile/toggleUploading', false)
          this.msgError(res.Msg)
        }
      }
      const res = await mergeFiles({ md5: this.MD5 })
      this.$store.dispatch('bigFile/toggleUploading', false)
      if (res.Success) {
        this.clearCache()
        this.$emit('uploadSuccess', res)
        this.$notify({
          title: '成功',
          message: '文件上传成功',
          type: 'success',
        })
      } else {
        this.msgError(res.Msg)
      }
    },
    clearCache() {
      this.MD5 = null
      this.percentage = 0
      this.$refs.upload.clearFiles()
      this.$store.dispatch('bigFile/setChunkList', [])
      this.$store.dispatch('bigFile/setChunkIndex', [])
    },
    closeUpload() {
      this.clearCache()
      this.$refs.upload.clearFiles()
      this.$store.dispatch('bigFile/toggleDialog', false)
      this.$store.dispatch('bigFile/toggleBall', false)
      this.$store.dispatch('bigFile/setFileList', [])
    },
    minimality() {
      this.$store.dispatch('bigFile/toggleDialog', false)
      this.$store.dispatch('bigFile/toggleBall', this.bigFile.uploading)
    },
  },
}
</script>
<style lang="scss" scoped>
.bigFileTitle {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;
}
</style>
