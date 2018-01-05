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
      gratuity: 0,
      tip: 0,
      discount: 0,
      delivery: 0,
      surcharge: 0,
      remain: 0,
      log: []
    },
    content: [],
    coupons: [],
    source: "POS"
  },
  diffs: null,
  archivedOrder: null,
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
        gratuity: 0,
        tip: 0,
        discount: 0,
        delivery: 0,
        surcharge: 0,
        remain: 0,
        log: []
      },
      content: [],
      coupons: [],
      date: today(),
      source: "POS"
    };
    state.item = null;
    state.choiceSetTarget = null;
    state.diffs = null,
      state.archivedOrder = null;
    state.sides = Array(11).fill({
      zhCN: "",
      usEN: "",
      disable: true
    })
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
    Array(11 - sides.length).fill().forEach(_ => {
      sides.push({
        zhCN: "",
        usEN: "",
        disable: true
      })
    });
    state.sides = sides;
  },
  [types.RESET_POINTER](state) {
    state.item = state.order.content.last();
    let sides = state.item ? state.item.option.slice() : [];
    Array(11 - sides.length).fill().forEach(_ => {
      sides.push({
        zhCN: "",
        usEN: "",
        disable: true
      })
    });
    state.sides = sides;
    state.choiceSetTarget = null;
  },
  [types.ADD_TO_ORDER](state, item) {
    delete item.clickable;
    Object.assign(item, {
      unique: Math.random().toString(36).substr(2, 5),
      print: false,
      pending: false,
      void: false,
      sort: item.sort || 0,
      qty: 1,
      choiceSet: item.choiceSet ? item.choiceSet : [],
      single: parseFloat(item.price[0]),
      total: item.hasOwnProperty('total') ? item.total : item.price[0].toFixed(2)
    });
    if (state.item) {
      const insert = state.order.content.findIndex(item => item === state.item) + 1;
      state.order.content.splice(insert, 0, item);
      let dom = document.querySelectorAll('li.item');
      let length = dom.length;
      let index;
      dom.forEach((div, i) => {
        if (div.className.indexOf("active") !== -1) {
          dom[i].classList.remove("active");
          state.item = state.order.content.last();
          index = i + 1;
        }
      });
      if (index !== length) {
        dom[index] && dom[index].classList.add("active");
        state.item = state.order.content[insert];
      }
    } else {
      state.order.content.push(item);
      state.item = state.order.content.last();
    }
    state.choiceSetTarget = null;
  },
  [types.ALTER_ITEM](state, item) {
    const index = state.order.content.findIndex(item => item === state.item);
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
        } else if (!data.side.skip) {
          item.side = {
            zhCN: `[${data.side.zhCN}]`,
            usEN: `[${data.side.usEN}]`
          }
        }
      }
    } else {
      if (item.side.zhCN === `[${data.side.zhCN}]` && item.side.usEN === `[${data.side.usEN}]`) {
        item.total = data.disableQtyAdd ? (item.qty * item.single).toFixed(2) : (++item.qty * item.single).toFixed(2);
      } else {
        item.total = (--item.qty * item.single).toFixed(2);
        item = Object.assign({}, item);
        item.unique = Math.random().toString(36).substr(2, 5);
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

        let dom = document.querySelector('li.item.active');
        dom && dom.classList.remove('active');
        let index = state.order.content.findIndex(i => i.unique === state.item.unique);
        document.querySelectorAll('li.item')[index].classList.add('active');
        state.order.content.splice(index + 1, 0, item);
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
        state.choiceSetTarget.price = toFixed(--state.choiceSetTarget.qty * state.choiceSetTarget.single, 2).toFixed(2)
      }
    } else if (delChoiceSetFirst) {
      let set = state.item.choiceSet.last();
      set && (set.qty === 1 ? state.item.choiceSet.pop() : set.price = toFixed(--set.qty * set.single, 2).toFixed(2));
    } else {
      let currentActionTime = +new Date();
      let diff = currentActionTime - state.lastActionTime;

      state.item = state.item || state.order.content.last();

      if (state.item.qty !== 1 && diff > 250) {
        state.item.total = toFixed(--state.item.qty * state.item.single, 2).toFixed(2);
        state.order.content.splice();
      } else {
        state.order.content.remove(state.item);
        state.item = state.order.content.last();
        let dom = document.querySelector('.item.active');
        dom && dom.classList.remove("active");
        let sides = state.order.content.length ? state.order.content.last().option.slice() : [];
        Array(11 - sides.length).fill().forEach(_ => sides.push({
          zhCN: "",
          usEN: "",
          disable: true
        }))
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
      state.item.total = toFixed(++state.item.qty * state.item.single, 2).toFixed(2);
      state.order.content.splice();
    }
  },
  [types.SET_CHOICE_SET](state, set) {
    if (state.order.content.length === 0) return;
    set.unique = Math.random().toString(36).substr(2, 5);

    let dom = document.querySelector(".sub.target");
    if (dom) {
      let key = dom.dataset.key;
      let index = state.item.choiceSet.findIndex(s => s.key === key) + 1;
      state.item.choiceSet.splice(index, 0, set)
      dom.classList.remove("target");
    } else {
      state.item.choiceSet.push(set);
      state.choiceSetTarget = set;
    }
  },
  [types.ALERT_CHOICE_SET](state, set) {
    let {
      zhCN,
      usEN
    } = set;
    state.choiceSetTarget.zhCN = `${state.choiceSetTarget.zhCN} ${zhCN}`;
    state.choiceSetTarget.usEN = `${state.choiceSetTarget.usEN} ${usEN}`;
    state.choiceSetTarget.unique = Math.random().toString(36).substr(2, 5);
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
    let price = toFixed(single * qty, 2).toFixed(2);
    Object.assign(state.choiceSetTarget, {
      qty,
      single,
      price
    })
  },
  [types.SET_CHOICE_SET_TARGET](state, target) {
    state.choiceSetTarget = target;
  },
  [types.SET_ORDER](state, data) {
    state.order = Object.assign({}, state.order, data);
    state.item = state.order.content.last();

    let dom = document.querySelector('li.item.active');
    dom && dom.classList.remove('active')
  },
  [types.REMOVE_PAYMENT](state) {
    delete state.order.payment.type;
    delete state.order.settled;

    let {
      subtotal,
      tax,
      discount,
      delivery,
      tip,
      gratuity
    } = state.order.payment;

    if (state.order.splitPayment) {
      delete state.order.splitPayment;
      delete state.order.split;
      state.order.content.forEach(item => item.sort = 0)
    }

    let surcharge = toFixed(tip + gratuity, 2);
    let total = toFixed(subtotal + tax + delivery, 2);
    let due = toFixed(total - discount, 2);
    let balance = toFixed(due + surcharge, 2);
    let remain = toFixed(balance, 2);

    state.order.payment = {
      subtotal,
      tax,
      delivery,
      discount,
      tip,
      gratuity,
      surcharge,
      total,
      due,
      balance,
      paid: 0,
      remain,
      settled: false,
      log: []
    }
  },
  [types.REFRESH_CURRENT_ORDER](state, orders) {
    if (state.order.hasOwnProperty('status')) {
      let _id = state.order._id;
      let length = orders.length;

      for (let i = 0; i < length; i++) {
        if (orders[i]._id === _id) {
          state.order = Object.assign({}, orders[i]);
          break;
        }
      }
    }
  },
  [types.SAVE_FOR_DIFFS](state, data) {
    state.diffs = JSON.parse(JSON.stringify(data))
  },
  [types.ARCHIVE_ORDER](state, data) {
    state.archivedOrder = JSON.parse(JSON.stringify(data))
  }
}

export default {
  state,
  mutations
}