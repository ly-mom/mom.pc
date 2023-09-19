const state = {
  showBall: false, //是否显示上传悬浮球
  showDialog: false, // 是否显示上传的弹窗
  uploading: false, // 是否在上传中
  chunkSize: 1024 * 100 * 10, // 每个切片大小
  fileList: [], // 文件列表
  chunkList: [], // 文件切片后的数组
  chunkIndex: [], // 文件待上传切片索引
}

const mutations = {
  TOGGLE_DIALOG(state, data) {
    state.showDialog = data
  },
  TOGGLE_BALL(state, data) {
    state.showBall = data
  },
  TOGGLE_UPLOADING(state, data) {
    state.uploading = data
  },
  SET_FILELIST(state, data) {
    state.fileList = data
  },
  SET_CHUNKSIZE(state, data) {
    state.chunkSize = data
  },
  SET_CHUNKLIST(state, data) {
    state.chunkList = data
  },
  SET_CHUNKINDEX(state, data) {
    state.chunkIndex = data
  },
}

const actions = {
  toggleBall({ commit }, data) {
    commit('TOGGLE_BALL', data)
  },
  toggleDialog({ commit }, data) {
    commit('TOGGLE_DIALOG', data)
  },
  toggleUploading({ commit }, data) {
    commit('TOGGLE_UPLOADING', data)
  },
  setFileList({ commit }, data) {
    commit('SET_FILELIST', data)
  },
  setChunkSize({ commit }, data) {
    commit('SET_CHUNKSIZE', data)
  },
  setChunkList({ commit }, data) {
    commit('SET_CHUNKLIST', data)
  },
  setChunkIndex({ commit }, data) {
    commit('SET_CHUNKINDEX', data)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
