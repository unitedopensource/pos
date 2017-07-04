import * as types from '../mutation-types'

const state = {
  password: [],
  op: {}
}

const mutations = {
  [types.SET_PIN](state, password) {
    password ?
      state.password.push(password) :
      state.password = [];

    state.password.length === 8 && state.password.pop();
  },
  [types.DEL_PIN](state) {
    state.password.pop()
  },
  [types.SET_OP](state, data) {
    state.op = Object.assign({}, state.op, data);
  }
}

export default {
  state,
  mutations
}
