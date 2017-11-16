var Preset = function () {
  this.station = function (alias, mac) {
    return {
      alies:alias,
      mac,
      terminal: {
        enable: false,
        model: "",
        address: "",
        port: "",
        sn: ""
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
      printer: null,
      printerGroup:[],
      cashDrawer: {
        enable: false,
        name: alias,
        bind: '',
        cashFlowCtrl: false,
        initialAmount: 0
      },
      timeout: 0,
      receiveOnlineOrder: false,
      interface: [{
        "icon": "fa-user",
        "head": "外等",
        "subhead": "Walk In",
        "route": "order",
        "enable": true
      }, {
        "icon": "fa-phone",
        "head": "来取",
        "subhead": "Pick Up",
        "route": "pickup",
        "enable": true
      }, {
        "icon": "fa-car",
        "head": "送餐",
        "subhead": "Delivery",
        "route": "delivery",
        "enable": true
      }, {
        "icon": "fa-cutlery",
        "head": "堂吃",
        "subhead": "Dine In",
        "route": "table",
        "enable": true
      }, {
        "icon": "fa-list",
        "head": "历史",
        "subhead": "History",
        "route": "history",
        "enable": true
      }, {
        "icon": "fa-inbox",
        "head": "钱机",
        "subhead": "Cash Drawer",
        "route": "cashDrawer",
        "enable": true
      }, {
        "icon": "fa-cog",
        "head": "设置",
        "subhead": "Setting",
        "route": "setting",
        "enable": true
      }, {
        "icon": "fa-lock",
        "head": "锁定",
        "subhead": "Lock",
        "route": "lock",
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
      "printMode":"normal",
      "reprint":[],
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
  this.item = function (tax) {
    return {
      _id: undefined,
      zhCN: "",
      usEN: "",
      menuID: "",
      price: [],
      prices: {
        DEFAULT: [],
        PICK_UP: [],
        DELIVERY: [],
        DINE_IN: [],
        BAR: []
      },
      option: [],
      category: "",
      spicy: false,
      num: 0,
      priority: 0,
      taxClass: tax,
      categoryCN: "",
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
      permission:[]
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
      activity: [
        {
          date: today(),
          time: +new Date,
          amount: amount,
          balance: amount,
          bouns: bouns || 0,
          type: 'ACTIVATION',
          op: seller
        }
      ]
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
