import * as types from '../mutation-types'

const state = {
    app: {},
    ring: null,
    config: {},
    orders: [],
    callLog: [],
    spooler: [],
    templates: [],
    reservation: [],
    sync: +new Date(),
    time: +new Date(),
    ticket: {
        number: 1,
        type: ""
    },
    device: {
        callid: false,
        scale: false,
        terminal: false,
        poleDisplay: false,
    }
}

const mutations = {
    [types.START_TICK](state, tick) {
        state.time = tick.time;
        if (tick.date !== state.app.date) {
            state.app.date = tick.date;
            state.orders = [];
            state.ticket = {
                number: 1,
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
    [types.SET_CONFIG](state, data) {
        state.config = Object.assign({}, state.config, data)
    },
    [types.SET_TEMPLATES](state, data) {
        state.templates = data;
    },
    [types.SET_RESERVATION](state, data) {
        state.reservation = data;
    },
    [types.SET_APP](state, data) {
        state.app = Object.assign({}, state.app, data)
    },
    [types.FIND_STATION](state, mac) {
        let stations = state.config.store.station;
        for (var name in stations) {
            stations.hasOwnProperty(name) && stations[name].mac === mac &&
                (state.config = Object.assign({}, state.config, { station: stations[name] }))
        }
    },
    [types.SET_STATION](state, station) {
        state.config = Object.assign({}, state.config, { station })
    },
    [types.SET_STATIONS](state, data) {
        state.config.store.station = data;
    },
    [types.SET_MENU](state, data) {
        state.config.layout.menu = flatten(state.config.layout.menu, data, true);
    },
    [types.SET_REQUEST](state, data) {
        state.config.layout.request = flatten(state.config.layout.request, data, false)
    },
    [types.REMOVE_PRINTER](state, data) {
        delete state.config.printer[data];
        state.config.printer.splice();
    },
    [types.SET_TABLE](state, data) {
        let layout = state.config.layout.table;
        state.config.layout.table = layout.map(section => {
            let zone = section.zone;
            let space = Array(56).fill({ shape: "", status: "", name: "" });
            let seats = data.length;
            for (let i = 0; i < seats; i++) {
                let table = data[i];
                table.zone === zone && (space[table.grid] = table);
            }
            section.item = space;
            return section;
        });
    },
    [types.SET_LASTSYNC](state, time) {
        state.sync = time
    },
    [types.SET_TODAYORDER](state, data) {
        state.orders = data
    },
    [types.ADD_SPOOLER](state, data) {
        state.spooler.push(data);
        state.spooler.sort((a, b) => (a.delay - b.delay))
    },
    [types.REMOVE_SPOOLER](state, index) {
        state.spooler.splice(index, 1)
    },
    [types.PHONE_RING](state, data) {
        state.ring = data;
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
    [types.UPDATE_TABLE_STATUS](state, table) {
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
        category = flatten(category, items)[0];
        state.config.layout.menu.splice(index, 1, category);
    },
    [types.RESORT_MENU_CATEGORY](state, data) {
        state.config.layout.menu = data;
    },
    [types.UPDATE_MENU_ITEM](state, data) {
        let { item, grp, sub, idx } = data;
        item.clickable = true;
        state.config.layout.menu[grp]['item'][sub].splice(idx, 1, item);
    },
    [types.REPLACE_MENU_ITEM](state, data) {
        let { index, items } = data;
        state.config.layout.menu[index].item = items;
    },
    [types.REPLACE_REQUEST_ITEM](state, data) {
        let { index, items } = data;
        state.config.layout.request[index].item = items;
    },
    [types.UPDATE_REQUEST_CATEGORY](state, data) {
        let { category, items, index } = data;
        category = flatten(category, items, false)[0];
        state.config.layout.request.splice(index, 1, category);
    },
    [types.UPDATE_REQUEST_ITEM](state, data) {
        let { item, grp, sub, index } = data;
        item.clickable = true;
        state.config.layout.request[grp]['item'][sub].splice(index, 1, item)
    },
    [types.UPDATE_REQUEST_ACTION](state, data) {
        let { action, index } = data;
        state.config.layout.action.splice(index, 1, action)
    },
    [types.REMOVE_REQUEST_ITEM](state, data) {
        let { grp, sub, index } = data;
        state.config.layout.request[grp]['item'][sub].splice(index, 1);
        state.config.layout.request[grp]['item'][sub].push({ zhCN: "", usEN: "", clickable: false, category: "NA" })
    },
    [types.REMOVE_MENU_ITEM](state, data) {
        let { grp, sub, idx } = data;
        state.config.layout.menu[grp]['item'][sub].splice(idx, 1);
        state.config.layout.menu[grp]['item'][sub].push({ zhCN: "", usEN: "", clickable: false, category: "NA" })
    },
    [types.NEW_PHONE_CALL](state, data) {
        state.callLog.unshift(data);
        state.callLog = state.callLog.slice(0, 10);
    },
    [types.SET_PRINTER](state, data) {
        state.config.printer = Object.assign({}, state.config.printer, data);
    },
    [types.UPDATE_TABLE_SECTION](state, data) {
        let { section, index } = data;
        state.config.layout.table.splice(index, 1, section);
    },
    [types.SET_TABLE_SORT](state, data) {
        let { tables, index } = data;
        state.config.layout.table[index].item = tables;
    },
    [types.UPDATE_TABLE_INFO](state, data) {
        let { table, index, section } = data;
    },
    [types.REMOVE_TABLE](state, data) {
        let { section, index } = data;
        state.config.layout.table[section].item.splice(index, 1)
    },
    [types.NEW_RESERVATION](state, data) {
        state.reservation.push(data)
    },
    [types.UPDATE_RESERVATION](state, data) {
        let { _id } = data;
        let index = state.reservation.findIndex(reservation => reservation._id === _id);
        state.reservation.splice(index, 1, data)
    }
}

export default {
    state, mutations
}

function flatten(layout, data, page) {
    let group = {};
    data = data || [];
    data.map(item => {
        !group.hasOwnProperty(item.category) && (group[item.category] = []);
        group[item.category].push(item);
    });
    !Array.isArray(layout) && (layout = [layout]);
    layout.forEach(layer => {
        layer.contain.forEach(item => {
            let items = group[item] || [];
            let align = 6 - items.length % 3;
            align === 6 && (align = 3);
            Array(align).fill().forEach(_ => { items.push({ zhCN: "", usEN: "", clickable: false, category: "NA" }) });
            layer.item.push(group[item] || items);
        });
        let length = [].concat.apply([], layer.item).length;
        let last = Math.max(0, layer.item.length - 1);
        page = page ? Math.ceil(length / 33) : 1;
        length = Math.max(0, (33 * page - length));
        for (let i = 0; i < length; i++) {
            layer.item[last] && layer.item[last].push({ zhCN: "", usEN: "", clickable: false })
        }
    })
    return layout;
}