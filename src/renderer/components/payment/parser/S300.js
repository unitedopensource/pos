const Pax = function () {
  let url = null;
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
    'WrightExpress'];

  this.initial = function (ip, port) {
    url = `http://${ip}:${port}?`;
    let command = this.parser("A00_1.38");
    return fetch(command);
  };
  this.check = function (device) {
    let data = device.split(String.fromCharCode(28));
    return {
      code: data[3],
      msg: data[4],
      sn: data[5],
      model: data[6],
      mac: data[8]
    }
  };
  this.charge = function (data, ticket) {
    let { number, date, code } = data.creditCard;
    let amount = (data.amount * 100).toFixed(0);
    if (!number && !date) {
      let command = this.parser(`T00_1.38_01_${amount}__1_____`);
      return fetch(command)
    } else {
      let info = `${number}|${date}|${code}`;
      let command = this.parser(`T00_1.38_01_${amount}_${info}_1_____`);
      return fetch(command)
    }
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
          addition,
          unique: Math.random().toString(36).substring(3, 8),
          time: +new Date,
          status: 1
        };
      case "100001":
        return {
          code,
          msg: 'CC_TIMEOUT'
        }
      case "100002":
        return {
          code,
          msg: 'CC_TRANS_ABORT'
        }
      case "100003":
        return {
          code,
          msg: 'CC_EXP_INVALID'
        }
      case "000100":
        return {
          code,
          msg: 'CC_DECLINED'
        }
      case "100010":
        return {
          code,
          msg: 'CC_COMM_ERROR'
        }
      case "100011":
        return {
          code,
          msg: 'CC_DUP_TRANS'
        }
      case "100019":
        return {
          code,
          msg: 'CC_BAD_TRACK'
        }
      default:
        return {
          code: "",
          msg: "CC_UNKNOWN"
        }
    }
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
          time, tid, mid,
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
          msg: 'BATCH_DECLINE'
        }
      case "100001":
        return {
          code,
          msg: 'BATCH_TIMEOUT'
        }
      case "100002":
        return {
          code,
          msg: 'BATCH_ABORTED'
        }
      case "100003":
        return {
          code,
          msg: 'BATCH_PARAMS_INVALID'
        }
      case "100004":
        return {
          code,
          msg: 'BATCH_UNSUPPORT_TRANS'
        }
      case "100005":
        return {
          code,
          msg: 'BATCH_UNSUPPORT_EDC'
        }
      case "100006":
        return {
          code,
          msg: 'BATCH_FAILED'
        }
      case "100007":
        return {
          code,
          msg: 'BATCH_CONNECT_ERROR'
        }
      case "100008":
        return {
          code,
          msg: 'BATCH_SEND_ERROR'
        }
      case "100009":
        return {
          code,
          msg: 'BATCH_RECEIVE_ERROR'
        }
      case "100010":
        return {
          code,
          msg: 'BATCH_COMM_ERROR'
        }
      case "100011":
        return {
          code,
          msg: 'BATCH_DUP_TRANS'
        }
      case "100023":
        return {
          code,
          msg: 'BATCH_NO_FOUND'
        }
      case "199999":
        return {
          code,
          msg: 'TERM_ERROR'
        }
      default:
        return {
          code,
          msg: 'BATCH_UNKNOWN_ERROR'
        }
    }
  }
  this.abort = function () {
    var xhr = new XMLHttpRequest(),
      method = "GET",
      url = this.parser(`A14_1.38`);
    xhr.open(method, url, true);
    xhr.send();
    xhr.abort();
  }
  this.drawSignature = function (data) {
    Draw(data);
  }
  this.parser = function (command) {
    if (!url) throw Error("Terminal Not initialized");
    return url + Encode(command)
  }
  this.adjust = function (invoice, trans, value) {
    let command = this.parser(`T00_1.38_06_${value}__${invoice}|||${trans}______`);
    return fetch(command);
  }
  this.voidSale = function (invoice, trans) {
    let command = this.parser(`T00_1.38_16___${invoice}|||${trans}______`);
    return fetch(command);
  }
  this.report = function () {
    let command = this.parser('R00_1.38_00_')
  }
  this.batch = function () {
    let command = this.parser('B00_1.38_');
    return fetch(command);
  }
};

const Encode = function (d) {
  d = d.replace(/[_]/g, String.fromCharCode(0x1c));
  d = d.replace(/[|]/g, String.fromCharCode(0x1f));
  let l = lrc(d + String.fromCharCode(0x03));
  return new Buffer(String.fromCharCode(0x02) + d + String.fromCharCode(0x03) + l).toString('base64');
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
