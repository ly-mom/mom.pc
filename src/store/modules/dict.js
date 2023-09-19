import { getDicts, getMutilDicts } from '@/api/system/dict/data'
import i18n from '@/locales'

const getDefaultState = () => ({
  // 字典map
  dictMap: {},
})

const state = getDefaultState()

const mutations = {
  // 保存字典项
  SAVE_DICT_ITEM: (state, data) => {
    const obj = {}
    obj[data.dictKey] = data
    // 需要拷贝一份，要不然数据变动监听不到
    state.dictMap = Object.assign({}, state.dictMap, obj)
  },
  // 保存多个字典项
  SAVE_DICT_ITEM_FROM_LIST: (state, data) => {
    const dictKeys = data.dictKeys || []
    const dataList = data.list
    for (let i = 0; i < dictKeys.length; i++) {
      const element = dictKeys[i]
      const obj = {}
      obj[element] = element
      obj[element] = { dictKey: element, items: dataList.filter(item => item.DicKey == element) }
      state.dictMap = Object.assign({}, state.dictMap, obj)
    }
  },
  // 切换多语言时，更新已缓存字典的文本
  UPDATE_DICT_TEXT: (state, data) => {
    for (const key in state.dictMap) {
      const ele = state.dictMap[key]
      ele.items = ele.items.map(item => {
        item['DataText'] = i18n.t(`${item.DicKey}#${item.DataValue}`) != `${item.DicKey}#${item.DataValue}` ? i18n.t(`${item.DicKey}#${item.DataValue}`) : item.DataText
        return item
      })
    }
  },
}

const actions = {
  // 设置表格筛选下拉数据源
  setTableFilter({ commit }, data) {
    commit('SAVE_DICT_ITEM', {
      dictKey: data.dictKey,
      items: data ? data.items : [],
    })
  },
  // 获取字典的action
  getByDictKey({ commit }, data) {
    // console.log(data,"8888")
    if (!data.dictKey) return
    return new Promise((resolve, reject) => {
      if (state.dictMap[data.dictKey]) {
        resolve()
      } else {
        // 防止同一个key多次请求
        commit('SAVE_DICT_ITEM', {
          dictKey: data.dictKey,
          items: [],
        })
        getDicts(data.dictKey, data.isAll).then(res => {
          commit('SAVE_DICT_ITEM', {
            dictKey: data.dictKey,
            items: res ? res.Data : [],
          })
          resolve()
        })
      }
    })
  },
  // 获取多个字典数据
  getByDictKeys({ commit }, data) {
    if (data && data.length) {
      const requsetKeys = Array.from(new Set(data.filter(item => !Object.keys(state.dictMap).includes(item))))
      return new Promise((resolve, reject) => {
        if (requsetKeys.length == 0) {
          resolve()
        } else {
          getMutilDicts(requsetKeys).then(res => {
            commit('SAVE_DICT_ITEM_FROM_LIST', {
              dictKeys: requsetKeys,
              list: res ? res.Data : [],
            })
            resolve()
          })
        }
      })
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
