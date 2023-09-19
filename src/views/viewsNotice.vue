<template>
  <div class="noticeMain wrap">
    <div class="sectionRight">
      <div class="boxTitleLeft">公告详情</div>
      <div class="noticeTitle">
        <div class="noticeTitle">{{ detailData.Title }}</div>
      </div>
      <div class="subTitle">
        <div>{{ detailData.Subtitle }}</div>
      </div>
      <div class="baseInfo">
        <span class="dateBox">日期：{{ detailData.CreateTime }}</span>
        <span class="creatorBox">作者：{{ detailData.CreatorName }}</span>
        <span class="viewsBox">浏览次数：{{ detailData.Views }}</span>
      </div>
      <div class="ql-editor" v-html="detailData.Content"></div>
    </div>
    <div class="sectionLeft">
      <div class="otherNoticeBox">
        <div class="boxTitle">
          <div class="boxTitleLeft">公告通知</div>
          <a v-hasRole="['Development']" @click="noticeList">{{ $t('usual_more') }}</a>
        </div>
        <div>
          <div class="noticeBox pointer" v-for="(item, index) in notice" :key="index" @click="viewsNotice(item.Id)">
            <div class="noticeBoxTitle">
              <img src="../assets/images/index/notice.svg" />
              <el-tooltip :content="item.Title" :disabled="getTextLen(item.Title) < 32" placement="top" :open-delay="500">
                <div class="content">
                  {{ item.Title }}
                </div>
              </el-tooltip>
            </div>
            <div class="noticeBoxTime">{{ item.CreateTime | formatDate(2) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { listNotice, getNotice } from '@/api/system/notice'
import { getBLen } from '@/utils/util'
import _ from 'lodash'

export default {
  name: 'ViewsNotice',
  data() {
    return {
      notice: [],
      id: '', //公告内容
      detailData: {},
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.id = this.$route.params && this.$route.params.id
    this.getNotice(this.id)
    document.getElementById('app').classList.add('greyBg')
  },
  beforeUnmount() {
    document.getElementById('app').classList.remove('greyBg')
  },
  methods: {
    getTextLen(text) {
      return getBLen(text)
    },
    /** 查询公告列表 */
    async getList() {
      const res = await listNotice({})
      if (res.Success) {
        this.notice = res.Data.PageList || []
      } else {
        this.msgError(res.Msg)
      }
    },
    //查看公告
    async getNotice(Id) {
      const res = await getNotice(Id)
      if (res.Success) {
        this.detailData = res.Data
      } else {
        this.msgError(res.Msg)
      }
    },
    viewsNotice(id) {
      const url = '/index/viewsNotice/index/' + id
      if (this.$route.fullPath != url) {
        this.$router.push(url)
      }
    },
    noticeList() {
      this.$router.push('/system/notice')
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/styles/viewsNotice.scss';
</style>
