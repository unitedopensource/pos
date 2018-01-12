import * as types from '../mutation-types'
import Preset from '../../preset'

const state = {
  customer: Preset.customer(),
  keyboard: false
}

const mutations = {
  [types.TOGGLE_KEYBOARD](state, bool) {
    state.keyboard = bool;
  },
  [types.SET_CUSTOMER](state, data) {
    state.customer = Object.assign({}, state.customer, data);
  },
  [types.EMPTY_CUSTOMER_INFO](state, data) {
    state.customer = Object.assign({
      phone: "",
      extension: "",
      address: "",
      city: "",
      name: "",
      note: ""
    }, data)
  },
  [types.RESET_DASHBOARD](state) {
    state.customer = Preset.customer();
    state.keyboard = false;
  }
}

export default {
  state,
  mutations
}
