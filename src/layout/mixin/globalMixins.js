export const globalMixin = {
  data() {
    return {
      searchTimes: 0, // 远程搜索的次数
    }
  },
  methods: {
    /**
     * @msg: 远程下拉框的赋值方法
     * @param {*} remoteList 远程搜索的结果
     * @param {*} localList 本地已经赋值的下拉数据
     * @param {*} count 下拉组件内部记录的remotemethod次数
     * @param {*} times 本地记录
     * @return {*}
     */
    setRemoteOption(remoteList, localList, count, times = this.searchTimes) {
      this.searchTimes = count > this.searchTimes ? count : this.searchTimes
      const rList = remoteList && remoteList.length ? remoteList : []
      const lList = localList && localList.length ? localList : []
      return count < this.searchTimes ? lList : rList
    },
    // 全局判空方法
    isEmptyValue(v) {
      switch (typeof v) {
        case 'undefined':
          return true
        case 'string':
          if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true
          break
        case 'boolean':
          if (!v) return true
          break
        case 'number':
          if (0 === v || isNaN(v)) return true
          break
        case 'object':
          if (null === v || v.length === 0) return true
          for (const i in v) {
            return false
          }
          return true
      }
      return false
    },
  },
}
