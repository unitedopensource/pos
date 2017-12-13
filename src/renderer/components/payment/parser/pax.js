const axios = require("axios");

const Pax = function () {
  let device = null;
  let station = null;
  let request = null;
  let terminal = null;
  let cardType = ['',
    'Visa',
    'MasterCard',
    'American Express',
    'Discover',
    'Diner Club',
    'enRoute',
    'JCB',
    'RevolutionCard',
    'VisaFleet',
    'MasterCardFleet',
    'FleetOne',
    'Fleetwide',
    'Fuelman',
    'Gascard',
    'Voyager',
    'WrightExpress'
  ];


  this.initial = function (ip, port, sn, stationAlias, terminalAlias) {
    if (!ip || !port) throw new Error("CONFIG_FILE_ERROR");

    station = stationAlias || '';
    terminal = terminalAlias || '';
    request = axios.create({
      baseURL: `http://${ip}:${port}`
    });

    let command = Encode("A00_1.38");
    return request.get(command);
  };

  this.check = function (d) {
    try {
      let data = d.split(String.fromCharCode(28));
      let sn = data[5] ? data[5].replace(/[^a-z0-9]/gi, '') : "";
      let msg = data[4].indexOf(String.fromCharCode(3) !== -1) ? data[4].split(String.fromCharCode(3))[0] : data[4];
      device = {
        msg,
        sn,
        code: data[3],
        model: data[6],
        mac: data[8]
      };
    } catch (e) {
      device = {
        code: "999999",
        msg: "parseError"
      }
    }

    return device;
  };
  this.charge = function (data, ticket) {
    let {
      number,
      date
    } = data.creditCard;
    let amount = toFixed(data.amount * 100, 0);
    let tip = toFixed(data.tip * 100, 0);
    let command;

    if (number && date) {
      let info = `${number}|${date}|`;
      command = Encode(`T00_1.38_01_${amount}_${info}_1_____`)
    } else {
      command = Encode(`T00_1.38_01_${amount}|${tip}|__1_____`)
    }

    return request.get(command)
  };
  this.explainTransaction = function (raw) {
    let data = raw.split(String.fromCharCode(28));
    let code = data[3];
    switch (code) {
      case "000000":
        let host = data[5].split(String.fromCharCode(31));
        let amount = data[7].split(String.fromCharCode(31));
        let account = data[8].split(String.fromCharCode(31));
        let trace = data[9].split(String.fromCharCode(31));
        let extra = data[13].split(String.fromCharCode(0x03))[0].split(String.fromCharCode(31));
        let mode = ['Manual', 'Swipe', 'Contactless', 'Scanner', 'Chip', 'Chip Fall Back Swipe'];
        let transType = ['MENU', 'SALE', 'RETURN', 'AUTH', 'POSTAUTH', 'FORCED', 'ADJUST', 'WITHDRAWAL', 'ACTIVATE', 'ISSUE', 'ADD', 'CASHOUT', 'DEACTIVATE', 'REPLACE', 'MERGE', 'REPORTLOST', 'VOID', 'VOID/SALE', 'VOID/RTRN', 'VOID/AUTH', 'VOID/POST', 'VOID/FORCE', 'VOID/WITHDRAW', 'BALANCE', 'VERIFY', 'REACTIVATE', 'FORCED ISSUE', 'FORCE ADD', 'UNLOAD', 'RENEW', 'GET CONVT DETAIL', 'CONVERT', 'TOKENIZE', 'INCREMENTAL AUTH', 'BALANCE w.LOCK', 'REDEMPTION w.UNLOCK']
        let addition = {};

        extra.forEach(data => {
          let key = data.split("=")[0];
          let value = data.split("=")[1];
          addition[key] = value;
        });

        return {
          code,
          resMsg: data[4],
          host: {
            code: host[0],
            msg: host[1],
            auth: host[2],
            ref: host[3],
            trace: host[4],
            batch: host[5]
          },
          transType: transType[~~data[6]] || 'REVERSAL',
          amount: {
            approve: (amount[0] / 100).toFixed(2),
            due: (amount[1] / 100).toFixed(2),
            tip: (amount[2] / 100).toFixed(2),
            cashBack: (amount[3] / 100).toFixed(2),
            fee: (amount[4] / 100).toFixed(2),
            tax: (amount[5] / 100).toFixed(2),
            balance: (amount[6] / 100).toFixed(2)
          },
          account: {
            number: account[0],
            entry: mode[account[1]],
            exp: account[2],
            type: cardType[~~account[6]] || 'Other',
            holder: account[7],
            present: account[10] ? 'Present' : 'Not Present'
          },
          trace: {
            trans: trace[0],
            ref: trace[1],
            time: trace[2]
          },
          device,
          station,
          terminal,
          addition,
          order: {},
          time: +new Date,
          status: 1
        };
      case "100001":
        return {
          code,
          msg: 'terminal.creditCard.timeout'
        }
      case "100002":
        return {
          code,
          msg: 'terminal.creditCard.aborted'
        }
      case "100003":
        let error = data[4].split(String.fromCharCode(3))[0];
        return {
          code,
          msg: 'terminal.creditCard.errorCode',
          error,
        }
      case "100004":
        return {
          code,
          msg: 'terminal.creditCard.unsupportedTrans'
        }
      case "000100":
        return {
          code,
          msg: 'terminal.creditCard.declined'
        }
      case "100010":
        return {
          code,
          msg: 'terminal.creditCard.commError'
        }
      case "100011":
        return {
          code,
          msg: 'terminal.creditCard.duplicated'
        }
      case "100019":
        return {
          code,
          msg: 'terminal.creditCard.badTrack'
        }
      case "100021":
        return {
          code,
          msg: 'terminal.creditCard.void'
        }
      case "100023":
        return {
          code,
          msg: 'terminal.creditCard.notFound'
        }
      default:
        return {
          code,
          msg: "terminal.creditCard.unknown"
        }
    }
  }
  this.getLocalReport = function () {
    let command = Encode(`R00_1.26_01_`);
    return request.get(command)
  }

  this.explainBatch = function (raw) {
    let data = raw.split(String.fromCharCode(28));
    let code = data[3];

    switch (code) {
      case "000000":
        let response = data[5];
        let host = response.split(String.fromCharCode(31));
        let hostRes = host[1].split(String.fromCharCode(32));
        let count = data[6].split("=");
        let amount = data[7].split("=");
        let time = data[8];
        let tid = data[9];
        let mid = data[10].split(String.fromCharCode(0x03))[0];

        return {
          code,
          resMsg: data[4],
          date: today(),
          time,
          tid,
          mid,
          device,
          station,
          count: {
            credit: count[0],
            debit: count[1],
            ebt: count[2]
          },
          amount: {
            credit: (amount[0] / 100).toFixed(2),
            debit: (amount[1] / 100).toFixed(2),
            ebt: (amount[2] / 100).toFixed(2)
          },
          batchResult: host[0],
          batchNumber: host[5],
          status: hostRes[0],
          settled: hostRes[7]
        }
      case "000100":
        return {
          code,
          msg: 'terminal.batch.declined'
        }
      case "100001":
        return {
          code,
          msg: 'terminal.batch.timeout'
        }
      case "100002":
        return {
          code,
          msg: 'terminal.batch.aborted'
        }
      case "100003":
        return {
          code,
          msg: 'terminal.batch.paramsInvalid'
        }
      case "100004":
        return {
          code,
          msg: 'terminal.batch.unsupported'
        }
      case "100005":
        return {
          code,
          msg: 'terminal.batch.unsupportedEDC'
        }
      case "100006":
        return {
          code,
          msg: 'terminal.batch.failed'
        }
      case "100007":
        return {
          code,
          msg: 'terminal.batch.connectError'
        }
      case "100008":
        return {
          code,
          msg: 'terminal.batch.sendError'
        }
      case "100009":
        return {
          code,
          msg: 'terminal.batch.receiveError'
        }
      case "100010":
        return {
          code,
          msg: 'terminal.batch.commError'
        }
      case "100011":
        return {
          code,
          msg: 'terminal.batch.duplicated'
        }
      case "100023":
        return {
          code,
          msg: 'terminal.batch.noFound'
        }
      case "199999":
        return {
          code,
          msg: 'terminal.batch.error'
        }
      default:
        return {
          code,
          msg: 'terminal.batch.unknown'
        }
    }
  }
  this.abort = function () {
    var xhr = new XMLHttpRequest(),
      url = this.parser(`A14_1.38`);
    xhr.open('GET', url, true);
    xhr.send(null);
    xhr.abort();
  }

  this.drawSignature = function (data) {
    Draw(data);
  }

  this.adjust = function (invoice, trans, value) {
    let command = Encode(`T00_1.38_06_${value}__${invoice}|||${trans}______`);
    return request.get(command)
  }
  this.voidSale = function (invoice, trans) {
    let command = Encode(`T00_1.38_16___${invoice}|||${trans}______`);
    console.log(command)
    return request.get(command)
  }
  this.report = function () {
    let command = Encode('R00_1.38_00_')
  }
  this.batch = function () {
    let command = Encode('B00_1.38_');
    return request.get(command)
  }
};

const Encode = function (d) {
  d = d.replace(/[_]/g, String.fromCharCode(0x1c));
  d = d.replace(/[|]/g, String.fromCharCode(0x1f));
  let l = lrc(d + String.fromCharCode(0x03));
  return String.fromCharCode(0x3F) + new Buffer(String.fromCharCode(0x02) + d + String.fromCharCode(0x03) + l).toString('base64');
};

const Decode = function (d) {
  d = new Buffer(d, 'base64').toString();
  let e, i = 0;
  for (; i < d.length; i++) {
    if (d.charCodeAt(i) === 3) {
      e = i;
      break;
    }
  }
  return d.slice(1, e).split(String.fromCharCode(28));
};

const lrc = function (s) {
  let l = s.charCodeAt(0);
  for (let i = 1; i < s.length; i++) {
    l ^= s.charCodeAt(i);
  }
  return String.fromCharCode(l);
};
const Draw = function (path) {
  let canvas = document.getElementById('vector');
  let context = canvas.getContext('2d');
  let draws = path.slice(0, -1).split("0,65535");
  context.moveTo(0, 0);
  for (let i = 1; i < draws.length; i++) {
    let coordinator = draws[i].split("^").slice(0, -1);
    for (let x = 0; x < coordinator.length; x++) {
      let pixel = coordinator[x].split(",");
      context.lineTo(pixel[0], pixel[1]);
      context.stroke();
    }
  }
};

module.exports = new Pax();