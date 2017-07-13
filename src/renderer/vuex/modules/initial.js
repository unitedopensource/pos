import * as types from '../mutation-types'

const state = {
    app: {},
    ring: null,
    config: {},
    time: +new Date,
    device: {
        callid: false,
        scale: false,
        poleDisplay: false,
        terminal: false
    },
    orders: [],
    spooler: [],
    templates: [],
    reservation: [],
    ticket: {
        number: "01",
        type: ""
    },
    lastSync: {
        table: +new Date,
        order: +new Date
    },
    callLog: []
}

const mutations = {
    [types.START_TICK](state, tick) {
        state.time = tick.time;
        if (tick.date !== state.app.date) {
            state.app.date = tick.date;
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
        console.log("receive station", station)
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
    [types.SET_LASTSYNC](state, data) {
        state.lastSync = Object.assign({}, state.lastSync, data)
    },
    [types.SET_TODAYORDER](state, data) {
        state.orders = data.sort((a, b) => (Number(b.number) - Number(a.number)));
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
        category = flatten(category, items)[0];
        state.config.layout.menu.splice(index, 1, category);
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
    [types.UPDATE_REQUEST_CATEGORY](state, data) {
        let { category, items, index } = data;
        category = flatten(category, items, false)[0];
        state.config.layout.request.splice(index, 1, category);
    },
    [types.REMOVE_MENU_ITEM](state, data) {
        let { id, grp, sub, idx } = data;
        state.config.layout.menu[grp]['item'][sub].splice(idx, 1);
        state.config.layout.menu[grp]['item'][sub].push({ zhCN: "", usEN: "", clickable: false, category: "NA" })
    },
    [types.NEW_PHONE_CALL](state, data) {
        state.callLog.unshift(data);
        state.callLog = state.callLog.slice(0, 10);
    },
    [types.SET_PRINTER](state, data) {
        state.config.printer = Object.assign({}, state.config.printer, data);
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
            Array(align).fill().forEach(_ => { items.push({ zhCN: "", usEN: "", clickable: false, category: "NA" }) })
            layer.item.push(group[item] || items);
        });
        let length = [].concat.apply([], layer.item).length;
        let last = Math.max(0, layer.item.length - 1);
        page = page ? Math.ceil(length / 33) : 1;
        length = Math.max(0, 33 * page - length);
        for (let i = 0; i < length; i++) {
            layer.item[last] && layer.item[last].push({ zhCN: "", usEN: "", clickable: false })
        }
    })
    return layout;
}