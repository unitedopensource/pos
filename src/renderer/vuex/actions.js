import * as types from './mutation-types'

export const startTick = ({
  commit
}) => {
  setInterval(() => {
    let a = new Date();
    let time = +a;
    let d = new Date(a.setHours(a.getHours() - 4));
    let date = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    commit(types.START_TICK, { time, date });
  }, 1000)
}
export const setConfig = ({
  commit
}, config) => {
  commit(types.SET_CONFIGURATION, config)
}
export const setApplication = ({
  commit
}, data) => {
  commit(types.SET_APPLICATION, data)
}
export const setReservation = ({
  commit
}, list) => {
  commit(types.SET_RESERVATION, list)
}
export const regTemplates = ({
  commit
}, templates) => {
  commit(types.REG_TEMPLATES, templates)
}
export const regStation = ({
  commit
}, mac) => {
  commit(types.REG_STATION, mac)
}
export const setCategory = ({
  commit
}, category) => {
  commit(types.SET_CATEGORY, category)
}
export const updateMenuItem = ({
  commit
}, data) => {
  commit(types.UPDATE_MENU_ITEM, data)
}
export const removeMenuItem = ({
  commit
}, data) => {
  commit(types.REMOVE_MENU_ITEM, data)
}
export const setMenu = ({
  commit
}, menu) => {
  commit(types.SET_MENU, menu)
}
export const setTable = ({
  commit
}, tables) => {
  commit(types.SET_TABLE, tables)
}
export const setRequest = ({
  commit
}, request) => {
  commit(types.SET_REQUEST, request);
}
export const setPin = ({
  commit
}, pin) => {
  commit(types.SET_PIN, pin)
}
export const delPin = ({
  commit
}) => {
  commit(types.DEL_PIN)
}
// export const opLogin = ({
//   commit
// }, op) => {
//   commit(types.OP_LOGIN, op)
// }
export const setOp = ({
  commit
}, op) => {
  commit(types.SET_OP, op)
}
export const setTicket = ({
  commit
}, data) => {
  commit(types.SET_TICKET, data);
}
export const setCustomer = ({
  commit
}, data) => {
  commit(types.SET_CUSTOMER, data)
}
export const toggleKeyboard = ({
  commit
}, bool) => {
  commit(types.TOGGLE_KEYBOARD, bool)
}
export const resetDashboard = ({
  commit
}) => {
  commit(types.RESET_DASHBOARD);
  commit(types.SET_TICKET, { type: "" });
}
export const resetAll = ({
  commit
}) => {
  commit(types.RESET_MENU);
  commit(types.RESET_DASHBOARD);
  commit(types.SET_TICKET, { type: "" });
  commit(types.RESET_TABLE);
  commit(types.SET_APPLICATION, { mode: 'create' });
}
export const resetMenu = ({
  commit
}) => {
  commit(types.RESET_MENU)
}
export const setSides = ({
  commit
}, sides) => {
  commit(types.SET_SIDES, sides)
}
export const delayPrint = ({
  commit
}, order) => {
  commit(types.PUSH_SPOOLER, order)
}
export const removeSpooler = ({
  commit
}, index) => {
  commit(types.REMOVE_SPOOLER, index)
}
export const setOrder = ({
  commit
}, data) => {
  commit(types.SET_ORDER, data)
}
export const addToOrder = ({
  commit
}, item) => {
  commit(types.ADD_TO_ORDER, item)
}
export const setPointer = ({
  commit
}, target) => {
  commit(types.SET_POINTER, target)
}
export const resetPointer = ({
  commit
}) => {
  commit(types.RESET_POINTER)
}
export const lessQty = ({
  commit
}, bool) => {
  commit(types.LESS_QTY, bool)
}
export const moreQty = ({
  commit
}) => {
  commit(types.MORE_QTY)
}
export const alterItem = ({
  commit
}, item) => {
  commit(types.ALTER_ITEM, item)
}
export const alterItemOption = ({
  commit
}, data) => {
  data.side.sub ?
    commit(types.SET_CHOICE_SET, {
      qty: 1,
      single: data.side.price || 0,
      price: data.side.price || 0,
      usEN: data.side.usEN,
      zhCN: data.side.zhCN
    }) :
    commit(types.ALTER_ITEM_OPTION, data);
}
export const setChoiceSet = ({
  commit
}, set) => {
  commit(types.SET_CHOICE_SET, set)
}
export const resetChoiceSet = ({
  commit
}) => {
  commit(types.RESET_CHOICE_SET)
}
export const emptyChoiceSet = ({
  commit
}) => {
  commit(types.EMPTY_CHOICE_SET);
}
export const setChoiceSetTarget = ({
  commit
}, target) => {
  commit(types.SET_CHOICE_SET_TARGET, target)
}
export const setPriceForChoiceSet = ({
  commit
}, price) => {
  commit(types.SET_PRICE_FOR_CHOICE_SET, price)
}
export const updateTable = ({
  commit
}, data) => {
  commit(types.LAST_UPDATE_TABLE, data.time);
  commit(types.UPDATE_TABLE, data.table);
}
export const insertOrder = ({
  commit
}, data) => {
  commit(types.SET_TICKET, { number: data.ticket });
  commit(types.LAST_UPDATE_ORDER, data.time);
  commit(types.INSERT_ORDER, data.order);
}
export const updateOrder = ({
  commit
}, data) => {
  commit(types.LAST_UPDATE_ORDER, data.time);
  commit(types.UPDATE_ORDER, data.order);
}
export const updateCategory = ({
  commit
}, data) => {
  commit(types.UPDATE_CATEGORY, data);
}
export const setUpdate = ({
  commit
}, time) => {
  commit(types.UPDATE_LAST_TIME, time)
}
export const setTodayOrderHistory = ({
  commit
}, data) => {
  commit(types.LAST_UPDATE_ORDER, data.time);
  commit(types.SET_TODAY_ORDER_HISTORY, data.orders);
}
export const setCurrentTable = ({
  commit
}, table) => {
  commit(types.CURRENT_TABLE, table)
}
export const resetTable = ({
  commit
}) => {
  commit(types.RESET_TABLE)
}
export const setTableInfo = ({
  commit
}, info) => {
  commit(types.SET_TABLE_INFO, info)
}
export const setViewOrder = ({
  commit
}, order) => {
  commit(types.SET_VIEW_ORDER, JSON.parse(JSON.stringify(order)));
}
export const insertCallHistory = ({
  commit
}, data) => {
  commit(types.INSERT_CALL_HISTORY, data)
}
export const removePayment = ({
  commit
}) => {
  commit(types.REMOVE_PAYMENT)
}
// export const cmsStore = ({
//   commit
// }, change) => {
//   commit(types.CMS_STORE, change)
// }
// export const cmsTable = ({
//   commit
// }, setting) => {
//   commit(types.CMS_TABLE, setting);
// }
export const replaceMenuItem = ({
  commit
}, change) => {
  commit(types.REPLACE_MENU_ITEM, change)
}
