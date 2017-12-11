var Preset = function () {
  this.station = function (mac, username) {
    return {
      alias: "",
      mac,
      username,
      wol: false,
      terminal: {
        enable: false,
        target: ""
      },
      pole: {
        enable: false,
        port: 'COM4',
        top: "",
        btm: ""
      },
      scale: {
        enable: false,
        port: 'COM1'
      },
      callid: {
        enable: false,
        port: 'COM3'
      },
      receipt: null,
      printers: [],
      cashDrawer: {
        enable: false,
        name: "",
        bind: "",
        cashFlowCtrl: false,
        initialAmount: ""
      },
      autoLock: {
        enable: false,
        timeout: 0,
        done: false
      },
      receiveOnlineOrder: false,
      interface: [{
        "icon": "fa-user",
        "head": "外等",
        "subhead": "Walk In",
        "route": "order",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-phone",
        "head": "来取",
        "subhead": "Pick Up",
        "route": "pickup",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-car",
        "head": "送餐",
        "subhead": "Delivery",
        "route": "delivery",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-cutlery",
        "head": "堂吃",
        "subhead": "Dine In",
        "route": "table",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-list",
        "head": "历史",
        "subhead": "History",
        "route": "history",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-inbox",
        "head": "钱机",
        "subhead": "Cash Drawer",
        "route": "cashDrawer",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-cog",
        "head": "设置",
        "subhead": "Setting",
        "route": "setting",
        "password": false,
        "enable": true
      }, {
        "icon": "fa-lock",
        "head": "锁定",
        "subhead": "Lock",
        "route": "lock",
        "password": false,
        "enable": true
      }]
    }
  };
  this.printer = function () {
    return {
      "print": {
        "WALK_IN": true,
        "PICK_UP": true,
        "DELIVERY": true,
        "DINE_IN": true,
        "BAR": true,
        "PRE_PAYMENT": true,
        "RECEIPT": true,
        "PAYMENT": true,
        "REPORT": true,
        'SALES': true
      },
      "printMode": "normal",
      "reprint": [],
      "control": {
        "printPrimary": true,
        "primaryFont": "QingYuan",
        "primaryFontSize": "19",
        "printPrimaryPrice": false,
        "printSecondary": true,
        "printSecondaryPrice": true,
        "secondaryFont": "Roboto Condensed",
        "secondaryFontSize": "16",
        "sortItem": true,
        "printStore": true,
        "printType": true,
        "printCustomer": true,
        "printPrice": true,
        "printPayment": true,
        "printSuggestion": false,
        "printCoupon": false,
        "printActionTime": false,
        "buzzer": false,
        "footer": [
          "Thank You Very Much"
        ]
      }
    }
  };
  this.item = function () {
    return {
      _id: undefined,
      zhCN: "",
      usEN: "",
      menuID: "",
      price: 0,
      prices: {},
      option: [],
      category: "",
      spicy: false,
      num: 0,
      priority: 0,
      stock: 0,
      commission: {
        enable: false,
        percentage: false,
        value: 0
      },
      taxClass: null,
      disable: false,
      openFood: false,
      marketPrice: false,
      weightItem: {
        enable: false,
        unit: "lbs",
        value: 0
      },
      printer: {}
    }
  };
  this.customer = function () {
    return {
      phone: "",
      extension: "",
      address: "",
      city: "",
      name: "",
      note: "",
      duration: "",
      distance: ""
    }
  };
  this.operator = function () {
    return {
      _id: ObjectId(),
      name: 'New User',
      role: 'Waitstaff',
      pin: '',
      language: 'usEN',
      timeCard: false,
      cashCtrl: 'disable',
      access: [],
      review: [],
      modify: [],
      view: [],
      permission: []
    }
  };
  this.giftCard = function (number, seller, amount, bouns) {
    return {
      _id: ObjectId(),
      number,
      seller,
      customer: "",
      balance: amount,
      activation: new Date,
      activity: [{
        date: today(),
        time: +new Date,
        amount: amount,
        balance: amount,
        bouns: bouns || 0,
        type: 'ACTIVATION',
        op: seller
      }]
    }
  };
  this.cashIn = function (op, name, amount) {
    return {
      date: today(),
      cashDrawer: name,
      operator: op,
      begin: amount.toFixed(2),
      beginTime: +new Date(),
      end: null,
      endTime: null,
      close: false,
      activity: [{
        type: 'START',
        inflow: parseFloat(amount),
        outflow: 0,
        time: +new Date(),
        ticket: null,
        operator: op
      }]
    }
  }
}

module.exports = new Preset();