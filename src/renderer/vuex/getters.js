export const app = state => state.initial.app
export const time = state => state.initial.time
export const ring = state => state.initial.ring
export const device = state => state.initial.device
export const config = state => state.initial.config
export const ticket = state => state.initial.ticket
export const history = state => state.initial.orders
export const station = state => state.initial.station
export const update = state => state.initial.lastSync
export const spooler = state => state.initial.spooler
export const store = state => state.initial.config.store
export const templates = state => state.initial.templates
export const tax = state => state.initial.config.store.tax
export const language = state => state.initial.app.language
export const reservation = state => state.initial.reservation

//export const callHistory = state => state.initial.callHistory

//login
export const op = state => state.login.op
export const password = state => state.login.password
//main
export const customer = state => state.main.customer
export const displayKeyboard = state => state.main.keyboard
//menu layout
export const item = state => state.menu.item
export const sides = state => state.menu.sides
export const order = state => state.menu.order
export const menu = state => state.initial.config.layout.menu
export const actions = state => state.initial.config.layout.action
export const request = state => state.initial.config.layout.request
export const isEmptyOrder = state => state.menu.order.content.length === 0

//tables
export const currentTable = state => state.table.currentTable
export const tables = state => state.initial.config.layout.table
