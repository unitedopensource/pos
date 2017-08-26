import * as types from '../mutation-types'

const state = {
  order: {
    payment: {
      subtotal: 0,
      tax: 0,
      total: 0,
      due: 0,
      balance: 0,
      paid: 0,
      change: 0,
      gratuity: 0,
      tip: 0,
      discount: 0,
      delivery: 0,
      log: []
    },
    content: []
  },
  item: null,
  sides: [],
  choiceSetTarget: null,
  lastActionTime: +new Date()
}
const mutations = {
  [types.RESET_MENU](state) {
    state.order = {
      _id: ObjectId(),
      payment: {
        subtotal: 0,
        tax: 0,
        total: 0,
        due: 0,
        balance: 0,
        paid: 0,
        change: 0,
        gratuity: 0,
        tip: 0,
        discount: 0,
        delivery: 0,
        log: []
      },
      content: []
    };
    state.item = null;
    state.choiceSetTarget = null;
    state.sides = [];
  },
  [types.SET_VIEW_ORDER](state, order) {
    state.order = order;
  },
  [types.SET_SIDES](state, sides) {
    state.sides = sides;
  },
  [types.SET_POINTER](state, item) {
    state.item = item;
    let sides = item.option.slice();
    Array(11 - sides.length).fill().forEach(_ => { sides.push({ zhCN: "", usEN: "", disable: true }) });
    state.sides = sides;
  },
  [types.RESET_POINTER](state) {
    state.item = state.order.content.last();
    let sides = state.item ? state.item.option.slice() : [];
    Array(11 - sides.length).fill().forEach(_ => { sides.push({ zhCN: "", usEN: "", disable: true }) });
    state.sides = sides;
    state.choiceSetTarget = null;
  },
  [types.ADD_TO_ORDER](state, item) {
    delete item.clickable;
    let zhCN = !item.disableAutoOption ? item.option.length ? item.option[0].overWrite ? item.option[0].zhCN : item.zhCN : item.zhCN : item.zhCN;
    let usEN = !item.disableAutoOption ? item.option.length ? item.option[0].overWrite ? item.option[0].usEN : item.usEN : item.usEN : item.usEN;
    let side = !item.disableAutoOption ? item.option.length ? item.option[0].overWrite ? "" : { zhCN: `[${item.option[0].zhCN}]`, usEN: `[${item.option[0].usEN}]` } : "" : "";
    Object.assign(item, {
      unique: Math.random().toString(36).substr(2, 5),
      zhCN, usEN, side,
      print: false,
      pending: false,
      void: false,
      sort: item.sort || 0,
      qty: 1,
      mark: [[], []],
      choiceSet: item.choiceSet ? item.choiceSet : [],
      single: parseFloat(item.price[0]),
      total: item.hasOwnProperty('total') ? item.total : parseFloat(item.price[0]).toFixed(2)
    });

    if (state.item) {
      let insert = state.order.content.getIndexOf(state.item) + 1;
      state.order.content.splice(insert, 0, item);
      let dom = document.querySelectorAll("div.list");
      let length = dom.length;
      let index;
      dom.forEach((div, i) => {
        if (div.className.indexOf("highlight") !== -1) {
          dom[i].classList.remove("highlight");
          state.item = state.order.content.last();
          index = i + 1;
        }
      });
      if (index !== length) {
        dom[index] && dom[index].classList.add("highlight");
        state.item = state.order.content[insert];
      }
    } else {
      state.order.content.push(item);
      state.item = state.order.content.last();
    }
    state.choiceSetTarget = null;
  },
  [types.ALTER_ITEM](state, item) {
    let index = state.order.content.getIndexOf(state.item);
    state.order.content.splice(index, 1, item);
    state.item = item;
  },
  [types.ALTER_ITEM_OPTION](state, data) {
    let item = state.item;
    let price;
    if (data.side.disable) return;
    if (item.qty === 1) {
      if (item.side.zhCN === `[${data.side.zhCN}]` && item.side.usEN === `[${data.side.usEN}]` && !data.disableAutoAdd) {
        item.total = (++item.qty * item.single).toFixed(2);
      } else {
        item.single =
          data.side.hasOwnProperty('price') ? parseFloat(data.side.price) :
            data.side.hasOwnProperty('extra') ? parseFloat(item.price[0]) + parseFloat(data.side.extra) :
              item.price[data.index] ? parseFloat(item.price[data.index]) : parseFloat(item.price[0]);

        item.total = item.single.toFixed(2);

        if (data.side.overWrite) {
          item.zhCN = data.side.zhCN;
          item.usEN = data.side.usEN;
        } else {
          item.side = { zhCN: `[${data.side.zhCN}]`, usEN: `[${data.side.usEN}]` }
        }

      }
    } else {
      if (item.side.zhCN === `[${data.side.zhCN}]` && item.side.usEN === `[${data.side.usEN}]`) {
        item.total = data.disableQtyAdd ? (item.qty * item.single).toFixed(2) : (++item.qty * item.single).toFixed(2);
      } else {
        item.total = (--item.qty * item.single).toFixed(2);
        item = Object.assign({}, item);
        item.id = Math.random().toString(36).substr(2, 5);
        item.qty = 1;
        item.side = {
          zhCN: `[${data.side.zhCN}]`,
          usEN: `[${data.side.usEN}]`
        };
        if (data.side.hasOwnProperty('price')) {
          price = parseFloat(data.side.price)
        } else if (data.side.hasOwnProperty('extra')) {
          price = parseFloat(item.price[0]) + parseFloat(data.side.extra)
        } else {
          price = item.price[data.index] ? parseFloat(item.price[data.index]) : parseFloat(item.price[0])
        }
        item.single = price;
        item.total = item.single.toFixed(2);
        state.order.content.splice(state.order.content.getIndexOf(state.item) + 1, 0, item);
      }
    }
  },
  [types.LESS_QTY](state, delChoiceSetFirst) {
    if (state.order.content.length === 0) return;
    if (state.choiceSetTarget) {
      if (state.choiceSetTarget.qty === 1) {
        state.order.content.forEach(item => {
          item.choiceSet.forEach((set, index) => {
            if (set === state.choiceSetTarget) {
              item.choiceSet.splice(index, 1);
              state.choiceSetTarget = item.choiceSet.length > index ?
                item.choiceSet[index] :
                null;
            }
          })
        })
      } else {
        state.choiceSetTarget.price = (--state.choiceSetTarget.qty * state.choiceSetTarget.single).toFixed(2);
      }
    } else if (delChoiceSetFirst) {
      let set = state.item.choiceSet.last();
      set && (set.qty === 1 ? state.item.choiceSet.pop() : set.price = (--set.qty * set.single).toFixed(2));
    } else {
      let currentActionTime = +new Date();
      let diff = currentActionTime - state.lastActionTime;
      if (!state.item) state.item = state.order.content.last();
      if (state.item.qty !== 1 && diff > 250) {
        state.item.total = (--state.item.qty * state.item.single).toFixed(2);
        state.order.content.splice();
      } else {
        state.order.content.remove(state.item);
        state.item = state.order.content.last();
        let dom = document.querySelector('.list.highlight');
        dom && dom.classList.remove("highlight");
        let sides = state.order.content.length ? state.order.content.last().option.slice() : [];
        let length = sides.length;
        for (let i = length; i < 11; i++) {
          sides.push({
            zhCN: "",
            usEN: "",
            disable: true
          })
        }
        state.sides = sides;
      }
    }
    state.lastActionTime = +new Date();
  },
  [types.MORE_QTY](state) {
    if (state.order.content.length === 0) return;
    if (state.choiceSetTarget && state.choiceSetTarget.qty < 99) {
      state.choiceSetTarget.price = (++state.choiceSetTarget.qty * state.choiceSetTarget.single).toFixed(2);
    } else {
      state.item.total = (++state.item.qty * state.item.single).toFixed(2);
      state.order.content.splice();
    }
  },
  [types.SET_CHOICE_SET](state, set) {
    if (state.order.content.length === 0) return;
    state.item.choiceSet.push(set);
    state.choiceSetTarget = set;

    let dom = document.querySelector(".choiceSet.target");
    dom && dom.classList.remove("target");
  },
  [types.ALERT_CHOICE_SET](state, set) {
    let { zhCN, usEN } = set;
    state.choiceSetTarget.zhCN = `${state.choiceSetTarget.zhCN} ${zhCN}`;
    state.choiceSetTarget.usEN = `${state.choiceSetTarget.usEN} ${usEN}`;
  },
  [types.RESET_CHOICE_SET](state) {
    state.choiceSetTarget = null;
  },
  [types.EMPTY_CHOICE_SET](state) {
    state.item.choiceSet = [];
  },
  [types.SET_PRICE_FOR_CHOICE_SET](state, data) {
    if (!state.choiceSetTarget) return;
    let single = data.single || data.total;
    let qty = data.qty || 1;
    let price = (single * qty).toFixed(2);
    Object.assign(state.choiceSetTarget, { qty, single, price })
  },
  [types.SET_CHOICE_SET_TARGET](state, target) {
    state.choiceSetTarget = target;
  },
  [types.SET_ORDER](state, data) {
    Object.assign(state.order, data)
  },
  [types.REMOVE_PAYMENT](state) {
    delete state.order.payment.paidCash;
    delete state.order.payment.paidCredit;
    delete state.order.payment.paidGift;
    delete state.order.payment.type;

    if (state.order.payment.splitPayment) {
      delete state.order.payment.splitPayment;
      delete state.order.split;
    }

    state.order.settled = false;
    state.order.payment.settled = false;
    state.order.payment.tip = 0;
    state.order.payment.gratuity = 0;
    state.order.payment.paid = 0;
    state.order.payment.discount = 0;
    state.order.payment.paid = 0;
    state.order.payment.log = [];
    state.order.payment.due = parseFloat(state.order.payment.total);
  }
}

export default {
  state,
  mutations
}
