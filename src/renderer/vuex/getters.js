export const time = state => state.initialize.time
export const configuration = state => state.initialize.config
export const application = state => state.initialize.application
export const store = state => state.initialize.config.store
export const tax = state => state.initialize.config.store.tax
export const language = state => state.initialize.application.language
export const history = state => state.initialize.orders
export const update = state => state.initialize.update
export const spooler = state => state.initialize.spooler
export const ring = state => state.initialize.ring
export const callHistory = state => state.initialize.callHistory
export const reservation = state => state.initialize.reservation
export const station = state => state.initialize.station
export const ticket = state => state.initialize.ticket
export const templates = state => state.initialize.templates
//login
export const password = state => state.login.password
export const op = state => state.login.op
//main
export const customer = state => state.main.customer
export const displayKeyboard = state => state.main.keyboard
//menu layout
export const menu = state => state.initialize.config.layout.menu
export const request = state => state.initialize.config.layout.request
export const actions = state => state.initialize.config.layout.action
export const order = state => state.menu.order
export const isEmptyOrder = state => state.menu.order.content.length === 0
export const item = state => state.menu.item
export const sides = state => state.menu.sides
//tables
export const tables = state => state.initialize.config.layout.table
export const currentTable = state => state.table.currentTable
export const selectedTables = state => state.table.selectedTables
