var Preset = function () {
  this.station = function (alies, mac) {
    return {
      alies,
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
        port: 'COM4'
      },
      scale: {
        enable: false,
        port: 'COM1'
      },
      print: {},
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
        "REPORT": true
      },
      "double": {
        "WALK_IN": false,
        "PICK_UP": false,
        "DELIVERY": true,
        "DINE_IN": false,
        "BAR": false
      },
      "control": {
        "printPrimary": true,
        "primaryFont": "晴圆",
        "primaryFontSize": "19px",
        "printSecondary": true,
        "secondaryFont": "Agency FB",
        "secondaryFontSize": "16px",
        "sortItem": true,
        "duplicate": true,
        "printStore": true,
        "printType": true,
        "printCustomer": true,
        "printPrice": true,
        "printPayment": true,
        "printSuggestion": false,
        "printCoupon": false,
        "printActionTime": false,
        "buzzer": false,
        "enlargeDetail": true,
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
  this.giftCard = function (number, amount, seller) {
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
          type: 'ACTIVATION',
          op: seller
        }
      ]
    }
  }
};
function today() {
  let d = new Date();
  d = d.setHours(d.getHours() - 4);
  d = new Date(d);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
}
module.exports = new Preset();
