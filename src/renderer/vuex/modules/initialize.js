import * as types from '../mutation-types'

const state = {
  config: null,
  station: null,
  application: {},
  reservation: [],
  device: {
    callid: false,
    scale: false,
    poleDisplay: false,
    terminal: false
  },
  spooler: [],
  orders: [],
  templates: [],
  time: +new Date,
  callHistory: [],
  update: {
    table: +new Date,
    order: +new Date
  },
  ticket: {
    number: "01",
    type: ""
  },
  ring: null
}

const mutations = {
  [types.START_TICK](state, tick) {
    state.time = tick.time;
    if (tick.date !== state.application.date) {
      //reset memory
      state.application.date = tick.date;
      state.orders = [];
      state.ticket = {
        number: "01",
        type: ""
      }
    }
  },
  [types.SET_TICKET](state, data) {
    state.ticket = Object.assign({}, state.ticket, data)
  },
  [types.SET_DEVICE](state, data) {
    state.device = Object.assign({}, state.device, data)
  },
  [types.SET_APPLICATION](state, data) {
    state.application = Object.assign({}, state.application, data)
  },
  [types.SET_CONFIGURATION](state, config) {
    state.config = Object.assign({}, state.config, config)
  },
  [types.REG_STATION](state, mac) {
    if (typeof mac === 'object') {
      state.station = mac;
      state.config.store.station[mac.alies] = mac;
    } else {
      let stations = state.config.store.station;
      for (var name in stations) {
        if (stations[name].mac === mac)
          state.station = stations[name];
      }
    }
  },
  [types.SET_CATEGORY](state, data) {
    let group = state.config.layout.menu[data.index]['item']
  },
  [types.SET_RESERVATION](state, reservation) {
    state.reservation = reservation
  },
  [types.REG_TEMPLATES](state, templates) {
    state.templates = templates
  },
  [types.REMOVE_MENU_ITEM](state, data) {
    let { id, grp, sub, idx } = data;
    state.config.layout.menu[grp]['item'][sub].splice(idx, 1);
    state.config.layout.menu[grp]['item'][sub].push({
      zhCN: "",
      usEN: "",
      clickable: false,
      category: "none"
    })
  },
  [types.UPDATE_MENU_ITEM](state, data) {
    let { item, insert, grp, sub, idx } = data;
    item.clickable = true;
    state.config.layout.menu[grp]['item'][sub].splice(idx, 1, item);
    if (insert) {
      let items = state.config.layout.menu[grp]['item'].map(group => {
        let temp = group.filter(item => item.clickable).sort((c, n) => ((c.num > n.num) ? 1 : ((n.num > c.num) ? -1 : 0)));
        let length = Math.abs(6 - temp.length % 3);
        length = length === 6 ? 3 : length;
        for (let i = 0; i < length; i++) {
          temp.push({
            zhCN: "",
            usEN: "",
            clickable: false,
            category: "none"
          })
        }
        return temp;
      });
      length = [].concat.apply([], items).length;
      let page = Math.ceil(length / 33);
      length = 33 * page - length;
      let index = items.length - 1;
      for (let i = 0; i < length; i++) {
        items[index].push({
          zhCN: "",
          usEN: "",
          clickable: false,
          category: "none"
        })
      }
      state.config.layout.menu[grp]['item'] = items;
    }
  },
  [types.SET_MENU](state, menu) {
    let menuLayout = state.config.layout.menu;
    let initialized = menuLayout.map(category => {
      let key = category.contain;
      for (let i = 0; i < key.length; i++) {
        let temp = menu.filter(item => {
          item.clickable = true;
          return item.category === key[i];
        })
        temp.sort((c, n) => {
          return (c.num > n.num) ? 1 : ((n.num > c.num) ? -1 : 0);
        })
        let length = temp.length;
        if (length < 3) {
          length = 3 - length;
        } else {
          length = Math.abs(6 - length % 3);
          length = length === 6 ? 3 : length;
        }
        for (let i = 0; i < length; i++) {
          temp.push({
            zhCN: "",
            usEN: "",
            clickable: false,
            category: "none"
          })
        }
        category.item.push(temp);
      }
      let length = [].concat.apply([], category.item).length;
      let page = Math.ceil(length / 33);
      length = 33 * page - length;
      let index = category.item.length - 1;
      for (let i = 0; i < length; i++) {
        category.item[index].push({
          zhCN: "",
          usEN: "",
          clickable: false
        })
      }
      return category;
    })
    state.config.layout.menu = initialized;
  },
  [types.SET_REQUEST](state, request) {
    let requestLayout = state.config.layout.request;
    let initialized = requestLayout.map(category => {
      let key = category.contain;
      for (let i = 0; i < key.length; i++) {
        let temp = request.filter(item => {
          item.clickable = true;
          item.single = parseFloat(item.price);
          return item.category === key[i];
        })
        temp.sort((c, n) => {
          return (c.num > n.num) ? 1 : ((n.num > c.num) ? -1 : 0);
        })
        let length = Math.abs(6 - temp.length % 3);
        length === 6 && (length = 3);
        for (let i = 0; i < length; i++) {
          temp.push({
            zhCN: "",
            usEN: "",
            clickable: false
          })
        }
        category.item.push(temp);
      }
      let length = 33 - [].concat.apply([], category.item).length;
      //let page = Math.ceil(length / 33);
      let index = category.item.length - 1;
      for (let i = 0; i < length; i++) {
        category.item[index] && category.item[index].push({
          zhCN: "",
          usEN: "",
          clickable: false
        })
      }
      return category;
    })
    state.config.layout.request = initialized;
  },
  [types.SET_TABLE](state, tables) {
    let tableLayout = state.config.layout.table;
    let initialized = tableLayout.map(section => {
      let item = new Array(56);
      let length = tables.length;
      for (let i = 0; i < length; i++) {
        let table = tables[i];
        if (table.zone === section.zone) {
          item[table.grid] = table;
        }
      }
      for (let i = 0; i < item.length; i++) {
        if (!item[i]) {
          item[i] = {
            shape: "",
            status: "",
            name: ""
          };
        }
      };
      section.item = item;
      return section;
    });
    state.config.layout.table = initialized;
  },
  [types.UPDATE_TABLE](state, table) {
    let zone = table.zone;
    let tables = state.config.layout.table;
    for (let i = 0; i < tables.length; i++) {
      if (tables[i].zone === zone) {
        let items = tables[i].item;
        for (let i = 0; i < items.length; i++) {
          if (items[i]._id === table._id) {
            items[i] = table;
            break;
          }
        }
        break;
      }
    }
    state.config.layout.table.splice();
  },
  [types.UPDATE_MENU_CATEGORY](state, data) {
    let { category, items, index } = data;
    category.item = flatten(items, 33, true);
    state.config.layout.menu.splice(index, 1, category);
  },
  [types.LAST_UPDATE_TABLE](state, time) {
    state.update.table = time;
  },
  [types.LAST_UPDATE_ORDER](state, time) {
    state.update.order = time;
  },
  [types.INSERT_ORDER](state, order) {
    state.orders.unshift(order);
  },
  [types.UPDATE_ORDER](state, order) {
    for (let i = 0; i < state.orders.length; i++) {
      if (state.orders[i]._id === order._id) {
        state.orders.splice(i, 1, order);
        break;
      }
    }
  },
  [types.UPDATE_LAST_TIME](state, time) {
    state.update = time
  },
  [types.SET_TODAY_ORDER_HISTORY](state, orders) {
    state.orders = orders
  },
  [types.PUSH_SPOOLER](state, order) {
    state.spooler.push(order);
    state.spooler.sort((a, b) => (a.delay - b.delay))
  },
  [types.REMOVE_SPOOLER](state, index) {
    state.spooler.splice(index, 1)
  },
  [types.PHONE_RING](state, data) {
    state.ring = data
  },
  [types.INSERT_CALL_HISTORY](state, data) {
    state.callHistory.push(data)
  },
  [types.REPLACE_MENU_ITEM](state, replace) {
    state.config.layout.menu[replace.index]['item'] = replace.items;
  },
  [types.UPDATE_REQUEST_CATEGORY](state, data) {
    let { category, items, index } = data;
    category.item = flatten(items, 33, false);
    state.initialize.config.layout.request.splice(index, 1, category);
  },
  [types.REMOVE_REQUEST_ITEM](state, id) {
    //let request = state.initialize.config.layout.request;
  }
}

export default {
  state,
  mutations
}

function flatten(items, pageSize = 33, multiPage = false) {
  let group = [];
    items.forEach(item => {
      !group.hasOwnProperty(item.category) && (group[item.category] = []);
      group[item.category].push(item);
    });

    items = Object.keys(group).map(key => group[key]);
    items.forEach(items => {
      items = items.map(item => {
        item.clickable = true;
        return item
      }).sort((c, n) => {
        return (c.num > n.num) ? 1 : ((n.num > c.num) ? -1 : 0);
      });
    });

  let length = [].concat.apply([], items).length;
  let page = multiPage ? Math.ceil(length / pageSize) : 1;
  length = pageSize * page - length;
  let last = items.length - 1;
  for (let i = 0; i < length; i++) {
    items[last] && items[last].push({
      zhCN: "",
      usEN: "",
      clickable: false
    })
  }

  return items;
}