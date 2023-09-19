// 悬浮上传进度组件
<template>
  <div style="position: relative" v-show="bigFile.showBall">
    <div class="button-box" v-drag draggable="false">
      <el-tooltip effect="dark" :content="text" placement="top">
        <div class="btn-bg-img" @dblclick="openBox">
          <svg t="1649470768091" class="icon" viewBox="0 0 1024 1024" version="1.1" fill="white" xmlns="http://www.w3.org/2000/svg" p-id="2018" width="40" height="40">
            <path
              d="M804.23424 866.5344 630.5792 866.5344c-72.14592 0-129.62816-58.69568-129.62816-129.62816L500.95104 494.7712c0-9.78432 8.55552-18.34496 18.34496-18.34496 9.7792 0 18.34496 8.56064 18.34496 18.34496l0 240.91136c0 51.36896 41.57952 92.94336 92.93824 92.94336l173.65504 0c86.82496 0 158.98112-64.81408 163.87072-147.968 2.44736-44.02176-12.23168-86.82496-42.8032-118.62528-30.57152-31.80032-70.92736-50.14016-116.1728-50.14016l-3.67104 0c-6.11328 0-11.00288-2.44736-14.67392-6.11328-3.66592-4.8896-4.89472-9.7792-3.66592-15.89248 7.33696-35.46624 8.56064-72.15616 1.21856-107.6224-20.79232-118.62016-119.84384-209.11616-239.68768-222.5664-77.04576-8.56064-152.86272 15.8976-211.56352 68.48C279.6032 279.53664 245.36576 352.91136 245.36576 431.17568c0 8.56064-6.11328 17.11616-15.8976 18.34496-95.3856 13.45024-165.0944 97.83808-161.42336 195.66592 3.67104 100.2752 92.94336 183.43424 198.11328 183.43424l84.3776 0c9.78432 0 18.34496 8.55552 18.34496 18.33984 0 9.78944-8.56064 17.1264-19.56864 17.1264l-84.3776 0c-123.51488 0-228.6848-97.82784-233.5744-217.6768-4.89472-111.28832 70.92736-207.8976 177.32096-231.13728 4.8896-81.93536 41.57952-158.98112 103.94624-214.01088 66.03776-58.69568 151.63904-86.82496 240.91648-77.04064 135.74144 13.45024 248.24832 117.4016 271.48288 251.91936 6.11328 34.24256 7.33696 67.26144 2.44736 100.2752 47.6928 3.67104 92.93824 25.68704 124.73344 61.14304 37.90848 40.36096 56.25344 91.7248 52.58752 146.75456C998.67648 785.82272 910.62784 866.5344 804.23424 866.5344L804.23424 866.5344z"
              p-id="2019"
            ></path>
            <path
              d="M663.59808 631.73632c-4.8896 0-9.78432-1.22368-13.45536-4.8896l-132.0704-133.2992L385.9968 625.61792c-7.33696 7.34208-18.34496 7.34208-25.68192 0-7.33696-7.33696-7.33696-18.34496 0-25.68192l145.52576-145.52576c7.33696-7.33696 19.56352-7.33696 25.68192 0l145.53088 145.52576c7.33696 7.33696 7.33696 18.34496 0 25.68192C673.38752 629.29408 668.48768 631.73632 663.59808 631.73632L663.59808 631.73632z"
              p-id="2020"
            ></path>
          </svg>
        </div>
      </el-tooltip>
      <!-- <div class="font-box">{{ text }}</div> -->
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Suspended',
  computed: {
    ...mapGetters(['bigFile']),
  },
  data() {
    return {
      text: '双击显示详情',
      isOpen: false,
      isMove: false,
    }
  },
  mounted() {
    // console.log("this.bigFile");
    // console.log(this.bigFile);
  },
  methods: {
    openBox() {
      // console.log("双击");
      this.$store.dispatch('bigFile/toggleDialog', true)
      this.$store.dispatch('bigFile/toggleBall', false)
    },
    mousedowm(e) {
      // 鼠标按下时的鼠标所在的X，Y坐标
      this.mouseDownX = e.pageX
      this.mouseDownY = e.pageY
      // 初始位置的X，Y 坐标
      // this.initX = obj.offsetLeft;
      // this.initY = obj.offsetTop;
      // console.log("e", e);
      // 表示鼠标已按下
      this.flag = true
    },
    mousemove(e) {
      if (this.flag) {
        console.log('e :', e)
      }
    },
  },
  directives: {
    drag(el) {
      const oDiv = el // 当前元素
      // let self = this // 上下文
      // 禁止选择网页上的文字
      document.onselectstart = function () {
        return false
      }
      oDiv.onmousedown = function (e) {
        // 鼠标按下，计算当前元素距离可视区的距离
        const disX = e.clientX - oDiv.offsetLeft
        const disY = e.clientY - oDiv.offsetTop
        document.onmousemove = function (e) {
          // 通过事件委托，计算移动的距离
          const l = e.clientX - disX
          const t = e.clientY - disY
          // 移动当前元素
          oDiv.style.left = l + 'px'
          oDiv.style.top = t + 'px'
        }
        document.onmouseup = function (e) {
          document.onmousemove = null
          document.onmouseup = null
        }
        // return false不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
        return false
      }
    },
  },
}
</script>

<style scoped lang="scss">
.button-box {
  width: 80px;
  border-radius: 50%;
  position: fixed;
  bottom: 80px;
  right: 50px;
  padding-left: 15px;
  padding-top: 8px;
  cursor: pointer;
  opacity: 0.7;
  z-index: 1001;
}
.btn-bg-img {
  width: 60px;
  height: 60px;
  /* background-image: url(''); */
  background-color: #3193ef;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-box:hover {
  color: white;
  opacity: 1;
  .font-box {
    display: block;
  }
}

.font-box {
  font-size: 14px;
  white-space: nowrap;
  color: #3193ef;
  text-align: center;
  display: none;
}
</style>
