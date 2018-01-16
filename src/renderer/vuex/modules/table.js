import * as types from '../mutation-types'

const state = {
  selectedTables: [],
  currentTable: null
}

const mutations = {
  [types.CURRENT_TABLE](state, table) {
    state.currentTable = table;
  },
  [types.SET_CURRENT_TABLE](state, info) {
    state.currentTable = Object.assign({}, state.currentTable, info);
  },
  [types.RESET_CURRENT_TABLE](state) {
    state.currentTable = Object.assign({}, state.currentTable, {
      guest: 0,
      server: "",
      time: "",
      status: 1,
      current: {
        guest: 0,
        server: "",
        time: "",
        invoice: [],
        group: "",
        color: ""
      }
    })
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
