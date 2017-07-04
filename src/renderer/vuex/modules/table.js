import * as types from '../mutation-types'

const state = {
  selectedTables: [],
  currentTable: null
}

const mutations = {
  [types.CURRENT_TABLE](state, table) {
    state.currentTable = table;
  },
  [types.SET_TABLE_INFO](state, info) {
    state.currentTable = Object.assign({},state.currentTable,info);
  },
  [types.RESET_TABLE](state) {
    state.selectedTables = [];
    state.currentTable = null;
  }
}

export default {
  state,
  mutations
}
