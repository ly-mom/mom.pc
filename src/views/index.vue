<template>
  <div class="app-container home">
    <el-row :gutter="20" type="flex" style="flex-wrap: wrap">
      <el-col :md="16" :xs="24">
        <el-row style="height: 100%">
          <el-col :md="24" :xs="24" class="mb20">
            <div class="radiusBox">
              <div class="boxTitle">
                <div class="boxTitleLeft">常用功能</div>
              </div>
              <div class="functionContent">
                <router-link class="functionItem" v-for="(item, index) in routerLink" :key="index" :to="{ name: item.routerName }">
                  <div class="icon" :class="[colorArr[index % 9]]">{{ item.iconText }}</div>
                  <div class="text" :title="item.title">{{ item.title }}</div>
                </router-link>
              </div>
            </div>
          </el-col>
          <el-col :md="24" :xs="24" :style="{ height: urgencyNotice ? '103vh' : '100%' }">
            <el-row v-if="!urgencyNotice" :gutter="20" type="flex" style="flex-wrap: wrap; height: 72%">
              <el-col :md="13" :xs="24" class="mb20">
                <div class="radiusBox">
                  <div class="boxTitle">
                    <div class="boxTitleLeft">{{ $tl('index_main_title', '系统介绍') }}</div>
                  </div>
                  <div class="pointer" @click="viewsVideo(TopVideo.Id)">
                    <div class="bigImage">
                      <img :src="TopVideo.Cover" />
                      <!-- <video :src="TopVideo.url" :poster="TopVideo.Cover" controls width="400px" height="300px"></video> -->
                      <!-- <div class="play"></div> -->
                    </div>
                    <div class="introduceBox">
                      <div class="introduceTitle mb10 mt20">{{ TopVideo.Title }}</div>
                      <div class="introduceDesc">
                        {{ TopVideo.Description }}
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :md="11" :xs="24" class="mb20">
                <div class="radiusBox">
                  <div class="boxTitle">
                    <div class="boxTitleLeft">视频培训资料</div>
                    <a v-hasRole="['Development']" @click="documentList">{{ $t('usual_more') }}</a>
                  </div>
                  <el-row :gutter="20" type="flex" style="flex-wrap: wrap; height: 420px; overflow: auto" v-if="video && video.length">
                    <el-col :span="12" class="smallVideoBox mb10" v-for="(item, index) in video" :key="index">
                      <div @click="viewsVideo(item.Id)">
                        <div class="smallImage pointer">
                          <img :src="item.Cover" />
                        </div>
                        <div class="introduceBox">
                          <div class="introduceTitle mb10 mt20 pointer">
                            {{ item.Title }}
                          </div>
                          <div class="introduceDesc pointer">{{ item.Description }}</div>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                  <el-empty v-else description="无数据" :image-size="100"></el-empty>
                </div>
              </el-col>
            </el-row>
            <div v-else :style="{ flexWrap: 'wrap', height: urgencyNotice ? '100%' : '73%', overflow: 'auto' }" class="radiusBox">
              <div class="noticeTitle">
                <div class="noticeTitle">{{ urgencyNotice.Title }}</div>
              </div>
              <div class="subTitle">
                <div>{{ urgencyNotice.Subtitle }}</div>
              </div>
              <div class="baseInfo">
                <span class="dateBox">日期：{{ urgencyNotice.CreateTime }}</span>
                <span class="creatorBox">作者：{{ urgencyNotice.CreatorName }}</span>
                <!-- <span  class="viewsBox">浏览次数：{{urgencyNotice.Views}}</span> -->
              </div>
              <div class="ql-editor" v-html="urgencyNotice.Content"></div>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :md="8" :xs="24">
        <div class="radiusBox mb20" style="height: calc(45% - 20px)">
          <div class="boxTitle">
            <div class="boxTitleLeft">公告通知</div>
            <a v-hasRole="['Development']" @click="noticeList">{{ $t('usual_more') }}</a>
          </div>
          <div class="scrollContent notice" v-infinite-scroll="loadNotice" infinite-scroll-immediate="false" :infinite-scroll-delay="400">
            <div class="noticeBox pointer" v-for="(item, index) in notice" :key="index" @click="viewsNotice(item.Id)">
              <div class="noticeBoxTitle" style="position: relative">
                <img src="../assets/images/index/notice.svg" />
                <el-tooltip :content="item.Title" :disabled="getTextLen(item.Title) < 32" placement="top" :open-delay="500">
                  <div class="content" style="position: relative">
                    {{ item.Title }}
                  </div>
                </el-tooltip>
                <div
                  :style="{ position: 'absolute', top: '0', left: (getTextLen(item.Title) > 30 ? 250 : getTextLen(item.Title) * 7.2 + 26) + 'px' }"
                  src="../assets/images/index/new.svg"
                  class="new"
                  v-if="computTime(item.CreateTime) < 1"
                />
              </div>
              <div class="noticeBoxTime">{{ item.CreateTime | formatDate(2) }}</div>
            </div>
            <el-divider v-if="noticeStatus.loading">{{ $tl('usual_loading', '加载中...') }}</el-divider>
            <el-divider v-if="noticeStatus.noMore">{{ $tl('usual_no_more', '没有更多了') }}</el-divider>
          </div>
        </div>
        <div class="radiusBox mb20" style="height: calc(54% - 12px)">
          <div class="boxTitle">
            <div class="boxTitleLeft">文档培训资料</div>
            <a v-hasRole="['Development']" @click="documentList">{{ $t('usual_more') }}</a>
          </div>
          <div class="scrollContent document" v-infinite-scroll="loadDocument" infinite-scroll-immediate="false" :infinite-scroll-delay="400">
            <div class="documentBox pointer" v-for="(item, index) in document" :key="index" @click="handleDowload(item.Url)">
              <div class="documentLeft">
                <div :class="['documentType', colorArr[index % 9]]">
                  {{ item.Subtitle }}
                </div>
                <el-tooltip :content="item.Title" placement="top" :open-delay="500">
                  <div class="documentTitle">
                    {{ item.Title }}
                  </div>
                </el-tooltip>
                <div class="documentDesc">{{ item.FileName }}</div>
              </div>
              <svg width="16" class="downloadSvg" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 0C2.66971 0 0 2.66971 0 8C0 13.3303 2.66971 16 8 16C13.3303 16 16 13.3303 16 8C16 2.66971 13.3303 0 8 0ZM11.3829 8.49371L8.40229 12.0503C8.20114 12.3063 7.808 12.3063 7.60686 12.0503L4.61714 8.49371C4.48 8.32 4.59886 8.064 4.81829 8.064H6.528C6.67429 8.064 6.79314 7.94514 6.79314 7.79886V4.96457C6.79314 4.29714 7.33257 3.75771 8 3.75771C8.66743 3.75771 9.20686 4.29714 9.20686 4.96457V7.79886C9.20686 7.94514 9.32571 8.064 9.472 8.064H11.1726C11.392 8.064 11.52 8.32 11.3829 8.49371Z"
                  fill="#5D7092"
                />
              </svg>
            </div>
            <el-divider v-if="documentStatus.loading">{{ $tl('usual_loading', '加载中...') }}</el-divider>
            <el-divider v-if="documentStatus.noMore">{{ $tl('usual_no_more', '没有更多了') }}</el-divider>
          </div>
          <el-empty v-if="isEmptyValue(document)" description="无数据" :image-size="80"></el-empty>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" type="flex" style="flex-wrap: wrap" class="bottomRow">
      <el-col :md="10" :xs="24">
        <div class="radiusBox">
          <div class="boxTitle">
            <div class="boxTitleLeft">资源导航</div>
            <a v-hasRole="['Development']">{{ $t('usual_more') }}</a>
          </div>
          <div class="navContent">
            <div class="navBox mb20 pointer" v-for="(item, index) in nav" :key="index">
              <div :class="['navIcon', item.class]">
                {{ item.iconText }}
              </div>
              <div class="navText">
                <div class="navTitle">{{ item.title }}</div>
                <div class="navDesc">{{ item.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :md="6" :xs="24">
        <div class="radiusBox">
          <div class="boxTitle">
            <div class="boxTitleLeft">联系我们</div>
          </div>
          <div class="mb20">有相关疑问或需求请联系我们：</div>
          <div v-html="$tl('index_contact_us')"></div>
          <!-- <div>敖建文：18929103087</div>
          <div>李艳红：15838130750</div> -->
          <!-- <div>邮箱：lynn@lingyiitech.com</div> -->
          <!-- <div>地址：广东省东莞市裕元工业区福泰B栋2楼办公室</div> -->
        </div>
      </el-col>
      <el-col :md="8" :xs="24">
        <div class="radiusBox">
          <div class="boxTitle">
            <div class="boxTitleLeft">意见反馈</div>
          </div>
          <el-form :model="form">
            <el-form-item>
              <el-input type="textarea" rows="4" v-model.trim="form.Content" placeholder="请留下您的宝贵意见" :maxlength="5000"></el-input>
            </el-form-item>
            <div class="formAction">
              <el-upload
                style="width: 80%"
                size="mini"
                name="file"
                ref="upload"
                :limit="1"
                :headers="upload.headers"
                :action="upload.action"
                :file-list="fileList"
                :before-upload="beforeUpload"
                :on-change="handleUploadChange"
                :on-remove="handleUploadRemove"
                :on-exceed="handleExceed"
              >
                <el-button size="mini" plain icon="el-icon-plus" :loading="submiting">添加附件</el-button>
              </el-upload>
              <el-button type="primary" size="mini" @click="submitForm()" :loading="submiting">{{ $t('usual_commit') }}</el-button>
            </div>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { listNotice } from '@/api/system/notice'
import { addFeedback } from '@/api/system/feedback'
import { deleteFile, downloadFile } from '@/api/base.js'
import { getBLen, createFileDownload } from '@/utils/util'
import dayjs from 'dayjs'
import _ from 'lodash'
import { getFilePageList } from '@/api/system/fileManage.js'
import { addClass, removeClass } from '@/utils'

export default {
  name: 'index',
  data() {
    return {
      // 版本号
      version: '3.6.0',
      submiting: false,
      noticeStatus: {
        loading: false,
        noMore: false,
        PageIndex: 1,
      },
      documentStatus: {
        loading: false,
        noMore: false,
        PageIndex: 1,
      },
      urgencyNotice: null,
      fileList: [],
      colorArr: ['bg-greens', 'bg-blues', 'bg-oranges', 'bg-magentas', 'bg-skyBlues', 'bg-grassGreens', 'bg-lightBlueBlacks', 'bg-voliets', 'bg-pinks'],
      upload: {
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        action: process.env.VUE_APP_BASE_API + '/Base/File/Upload',
      },
      TopVideo: {},
      video: [],
      routerLink: [
        { routerName: 'IqcInput', iconText: 'IQC', title: '检验申请' },
        { routerName: 'IqcInputReview', iconText: 'IQC', title: '检验审核' },
        { routerName: 'IqcInputReviewReturn', iconText: 'IQC', title: '重审记录' },
        { routerName: 'CheckTask', iconText: 'MMS', title: '检测任务' },
        { routerName: 'ReceivedMails', iconText: '收', title: '收件' },
        { routerName: 'ApplyList', iconText: '申', title: '检测申请' },
        { routerName: 'ReportCheck', iconText: '申', title: '检测审核' },
        { routerName: 'ReportList', iconText: '报', title: '报告查询' },
      ],
      nav: [
        {
          iconText: 'SRM',
          title: 'SRM系统',
          desc: '供应商关系管理系统',
          class: 'bg-greens',
        },
        {
          iconText: 'SRM',
          title: 'SRM系统',
          desc: '供应商关系管理系统',
          class: 'bg-magentas',
        },
        {
          iconText: 'SRM',
          title: 'SRM系统',
          desc: '供应商关系管理系统',
          class: 'bg-oranges',
        },
        {
          iconText: 'SRM',
          title: 'SRM系统',
          desc: '供应商关系管理系统',
          class: 'bg-skyBlues',
        },
        {
          iconText: 'SRM',
          title: 'SRM系统',
          desc: '供应商关系管理系统',
          class: 'bg-grassGreens',
        },
        {
          iconText: 'SRM',
          title: 'SRM系统',
          desc: '供应商关系管理系统',
          class: 'bg-voliets',
        },
      ],
      notice: [],
      document: [],
      form: {
        Content: '',
        FileKey: '',
      },
    }
  },
  created() {
    this.getList()
    this.getVideoAndDocumentList()
    this.getVideoAndDocumentList('video')
    if (!this.$store.state.user.orgCode && getToken()) {
      this.$confirm(this.$tl('system_selectOrgFirst', '请先选择厂区?'), this.$t('usual_notice'), {
        showCancelButton: false,
        type: 'warning',
      })
    }
  },
  mounted() {
    if (this.computTime(new Date(), this.$t('global_grey')) >= 0) {
      addClass(document.body, 'global-grey')
    }
  },
  beforeUnmount() {
    removeClass(document.body, 'global-grey')
  },
  methods: {
    getTextLen(text) {
      return getBLen(text)
    },
    goTarget(href) {
      window.open(href, '_blank')
    },
    beforeUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 100

      if (!isLt2M) {
        this.$message({
          message: this.$t('MOM_UploadFileLimit'),
          type: 'warning',
        })
      }
      return isLt2M
    },
    handleUploadChange(info, fileList) {
      this.fileList = fileList
      this.form.FileKey = _.get(info, 'response.Data.Files[0].FileId', '')
    },
    async handleUploadRemove(file, fileList) {
      const id = _.get(file, 'response.Data.Files[0].FileId')
      if (id) {
        const res = await deleteFile([id])
        if (res.Success) {
          this.fileList = fileList
        } else {
          this.msgError(res.Msg)
        }
      }
    },
    async submitForm() {
      if (!this.form.Content && this.fileList.length == 0) {
        this.msgInfo('请输入意见或者上传附件')
      } else {
        this.submiting = true
        const res = await addFeedback(this.form)
        this.submiting = false
        if (res.Success) {
          this.form = {}
          this.fileList = []
          this.msgSuccess('感谢您的反馈！')
        } else {
          this.msgError(res.Msg)
        }
      }
    },
    toDownloadDoc(url) {
      if (!url) return
      const elemIF = document.createElement('iframe')
      elemIF.src = url
      elemIF.style.display = 'none'
      document.body.appendChild(elemIF)
    },
    /** 查询公告列表 */
    async getList() {
      this.noticeLoading = true
      const res = await listNotice({
        PageIndex: this.noticeStatus.PageIndex,
        PageRows: 10,
        Search: { InfoType: 1 },
      })
      this.noticeLoading = false
      if (res.Success) {
        const resData = res.Data.PageList || []
        const total = res.Data.Total || 0
        if (this.noticeStatus.PageIndex == 1) {
          this.notice = resData
          if (resData.length) {
            this.getUrgencyNotice(resData)
          }
        } else {
          this.notice = this.notice.concat(resData)
        }
        this.noticeNoMore = total && total == this.notice.length
      } else {
        this.msgError(res.Msg)
      }
    },
    getUrgencyNotice(list) {
      const ur = list.filter(item => item.Level == 'urgent')
      const im = list.filter(item => item.Level == 'important')
      const tempUr = ur[0] || null
      const tempIm = im[0] || null
      let scrollNotice = tempIm
      if (ur.length && this.computTime(tempUr.CreateTime) < 1) {
        this.urgencyNotice = tempUr
        scrollNotice = tempUr
      }
      // this.$store.dispatch('settings/setScrollNotice', scrollNotice)
      this.$store.commit('settings/SET_NOTICE', scrollNotice)
    },
    async getVideoAndDocumentList(type = 'document') {
      // 标识是否为文档的请求
      const isDoc = type == 'document'
      this.documentStatus.loading = isDoc
      this.videoLoading = isDoc
      const res = await getFilePageList({
        PageIndex: isDoc ? this.documentStatus.PageIndex : 1,
        PageRows: 10,
        timestamp: new Date().getTime(),
        Search: {
          Tags: [type],
        },
      })
      this.documentStatus.loading = false
      this.videoLoading = false
      if (res.Success) {
        const resData = res.Data.PageList || []
        const total = res.Data.Total || 0
        if (isDoc) {
          if (this.documentStatus.PageIndex == 1) {
            this.document = resData
          } else {
            this.document = this.document.concat(resData)
          }
          this.documentStatus.noMore = total && total == this.document.length
        } else {
          const videoList = resData.filter(item => item.Tags.includes('video'))
          this.TopVideo = videoList.length ? videoList[0] : this.TopVideo
          const lastVideo = videoList.slice(1, videoList.length) || []
          this.video = lastVideo && lastVideo.length ? lastVideo : this.video
        }
      } else {
        this.msgError(res.Msg)
      }
    },
    viewsVideo(id) {
      if (!id) return
      const url = '/index/viewsVideo/' + id
      if (this.$route.fullPath != url) {
        this.$router.push(url)
      }
    },
    async handleDowload(url) {
      if (url.indexOf('http') > -1) {
        this.toDownloadDoc(url)
      } else {
        if (url.indexOf('/') > -1) {
          // let urlPrefix = process.env.NODE_ENV
          // // 正式环境的情况下，换用域名路径，方便外网访问
          // if (urlPrefix == 'production'){
          //   urlPrefix = 'http://mom.lingyiitech.com:8000/'
          // }else {
          //   // 本地开发的情况下，换用测试服ip
          //   urlPrefix = 'http://10.0.41.30:8000/'
          // }
          this.toDownloadDoc(process.env.VUE_APP_BASE_API + '/' + url)
        } else {
          const res = await downloadFile(url)
          if (res) {
            createFileDownload(res)
          }
        }
      }
    },
    viewsNotice(id) {
      this.$router.push('/index/viewsNotice/index/' + id)
    },
    noticeList() {
      this.$router.push('/system/notice')
    },
    documentList() {
      this.$router.push('/system/file')
    },
    handleExceed(files, fileList) {
      this.$message.warning('当前限制只允许上传 1 个文件！')
    },
    // 计算时间差（天数）
    computTime(endtime, starttime = new Date()) {
      if (!endtime) return 0
      const dateStr = dayjs(endtime).format('YYYY-MM-DD HH:mm:ss')
      return dateStr !== 'Invalid Date' ? dayjs(starttime).diff(dayjs(dateStr), 'days') : 0
    },
    // 公告的滚动加载
    loadNotice() {
      if (!this.noticeStatus.noMore) {
        this.noticeStatus.PageIndex += 1
        this.getList()
      }
    },
    // 文档的滚动加载
    loadDocument() {
      if (!this.documentStatus.noMore) {
        this.documentStatus.PageIndex += 1
        this.getVideoAndDocumentList()
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/styles/indexView.scss';
</style>
