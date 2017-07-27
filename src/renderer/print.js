const moment = require('moment');
var Printer = function () { };

Printer.prototype.init = function (config) {
  this.config = config;
  this.printer = CLODOP;
  this.printer.webskt.onclose = function (e) { };
  return this;
};
Printer.prototype.setJob = function (job) {
  this.job = job || "Receipt";
  return this;
};
Printer.prototype.print = function (data) {
  if (!this.job) this.init();
  switch (this.job) {
    case "receipt":
      this.printReceipt(data);
      break;
    case "activation":
      this.printGiftCard("Activation", data);
      break;
    case "reload":
      this.printGiftCard("Reload", data);
      break;
    case "balance":
      this.printGiftCard("Balance", data);
      break;
    case "cashout":
      this.printGiftCard("Cash Out", data);
      break;
    case "creditCard":
      this.printCreditCard(data);
      break;
    case "reprint creditCard":
      this.printCreditCard(data, true);
      break;
    case "void":
      this.printVoidTranscation(data);
      break;
    case "checksum":
      this.printChecksum(data);
      break;
    case "batch":
      this.printBatchReport(data);
      break;
    case "report":
      this.printReport(data);
      break;
    case "timeCard report":
      this.printTimeCardReport(data);
      break;
    case "cashin report":
      this.printCashInReport(data);
      break;
    case "cashout report":
      this.printCashOutReport(data, false);
      break;
    case "detail cashout report":
      this.printCashOutReport(data, true);
      break;
  }
};
Printer.prototype.openCashDrawer = function () {
  let { station } = this.config;
  station.cashDrawer && CLODOP.SET_PRINTER_INDEX(station.cashDrawer.bind);
  CLODOP.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(112) + String.fromCharCode(48) + String.fromCharCode(55) + String.fromCharCode(221));
};
Printer.prototype.buzzer = function () {
  CLODOP.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(67) + String.fromCharCode(4) + String.fromCharCode(2) + String.fromCharCode(3));
}
Printer.prototype.printReceipt = function (raw) {

  let printers = this.config.printer;
  let redirect = this.config.station.printRedirect;

  for (let name in printers) {
    if (printers.hasOwnProperty(name)) {
      if (printers[name]['labelPrinter']) {
        this.printLabel(name, raw);
        return;
      }
      let ctrl = printers[name]['control'];
      let isPrint = printers[name]['print'][raw.type];
      let header = createHeader(this.config.store, raw);
      let list = isPrint ? createList(name, ctrl, raw.content) : [];
      if (list && list.length) {
        let style = createStyle(printers[name]['control']);
        let footer = createFooter(printers[name]['control'], raw.payment);

        let html = header + list + footer + style;

        this.printer.PRINT_INIT(this.job);
        this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
        redirect && (name = this.config.station.print[name] || name);
        this.printer.SET_PRINTER_INDEX(name);
        printers[name].buzzer && this.buzzer();
        this.printer.PRINT();

        if (printers[name].double[raw.type]) {
          this.printer.PRINT_INIT('Reprint receipt');
          this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
          this.printer.SET_PRINTER_INDEX(name);
          this.printer.PRINT();
        }
      }
    }
  };
  function createHeader(store, data) {
    let {
        type,
      time,
      number,
      server,
      cashier,
      station,
      table,
      customer
        } = data;
    let ticket = {};

    let phone = customer.phone && customer.phone.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1.$2.$3");
    switch (type) {
      case "WALK_IN":
        ticket.zhCN = "外等";
        ticket.usEN = "Walk In";
        break;
      case "PICK_UP":
        ticket.zhCN = "来取";
        ticket.usEN = "Pick Up";
        break;
      case "DELIVERY":
        ticket.zhCN = "送餐";
        ticket.usEN = "Delivery";
        break;
      case "DINE_IN":
        ticket.zhCN = "堂吃";
        ticket.usEN = "Dine In";
        break;
      case "PRE_PAYMENT":
        ticket.zhCN = "预结单";
        ticket.usEN = "PrePay Ticket";
        break;
      case "PAYMENT":
      case "RECEIPT":
        ticket.zhCN = "账单";
        ticket.usEN = "Receipt"
        break;
      default:
        ticket.zhCN = '\u8054\u5408\u5546\u4E1A\u7535\u8111\u516C\u53F8';
        ticket.usEN = "United POS Demo";
    }

    let date = moment(Number(time)).format("MM-DD-YYYY");
    let placeTime = moment(Number(time)).locale('en').format("hh:mm a");
    let customerInfo = "";
    customerInfo += phone ? `<p><span class="text">Tel:</span><span class="value tel enlarge">${phone}</span><span class="ext">${customer.extension}</span></p>` : "";
    customerInfo += customer.address ? `<p><span class="text">Addr:</span><span class="value addr enlarge">${customer.address}</span></p>` : "";
    customerInfo += customer.city ? `<p><span class="text">City:</span><span class="value">${customer.city}</span><span class="space">${customer.distance}</span><span class="space">${customer.duration}</span></p>` : "";
    customerInfo += customer.name ? `<p><span class="text">Name:</span><span class="value">${customer.name}</span></p>` : "";
    customerInfo += customer.note ? `<p><span class="text">Note:</span><span class="value">${customer.note}</span></p>` : "";
    let ticketInfo = `<p><span class="wrap">
                          <span class="text">Server:</span><span class="value">${server || cashier}</span>
                          <span class="text">Station:</span><span class="value">${station || ""}</span>
                        </span></p>`;

    ticketInfo += (type === 'DINE_IN' || type === 'BAR' || type === 'PRE_PAYMENT' || type === 'PAYMENT') ?
      `<p><span class="wrap">
              <span class="text">Cashier:</span><span class="value">${cashier || ""}</span>
              <span class="text">Table:</span><span class="value">${table || ""}</span>
            </span></p>`: "";

    return `<section class="header">
                <div class="store">
                  <h3>${store.name}</h3>
                  <h5>${store.address}</h5>
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                  <h5>${store.contact}</h5>
                </div>
                <div class="type">
                  <p class="zhCN">${ticket.zhCN}</p>
                  <p class="usEN">${ticket.usEN}</p>
                </div>
                <div class="time">
                  <span>Date: ${date}</span>
                  <span>Time: ${placeTime}</span>
                  <div class="number">${number}</div>
                </div>
                <div class="server">
                  ${ticketInfo}
                </div>
                <div class="customer">
                  ${customerInfo}
                </div>
            </section>`;
  }
  function createList(printer, ctrl, data) {
    function mockup(item) {
      let side = item.side.zhCN ? item.side.zhCN : "";
      let qty = item.qty === 1 ? "" : item.qty;
      let markA = item.mark[0].join(" ");
      let markB = item.mark[1].join(" ");
      let mark = (markA || markB) ? "markItem" : "";
      let setCN = "";
      let setEN = "";
      item.choiceSet.forEach(set => {
        setCN += `<p class="list choiceSet zhCN">
                      <span class="qty">${set.qty === 1 ? " " : set.qty}</span>
                      <span class="CNSet">${set.zhCN} ${set.price > 0 ? ' ($' + parseFloat(set.price).toFixed(2) + ')' : ""}</span>
                    </p>`;
        setEN += `<p class="list choiceSet usEN">
                      <span class="qty">${set.qty === 1 ? " " : set.qty}</span>
                      <span class="itemWrap">${set.usEN}</span>
                      <span class="price">${set.price > 0 ? parseFloat(set.price).toFixed(2) : ""}</span>
                    </p>`;
      });
      let name = (item[printer] && item[printer].hasOwnProperty("zhCN")) ? item[printer].zhCN : item.zhCN;
      let zhCN = `<p class="list zhCN">
                    <span class="qty">${qty}</span>
                    <span class="itemWrap ${mark}">
                      <span class="item">${name}<span class="mark">${markA}</span></span>
                      <span class="side">${side}<span class="mark">${markB}</span></span>
                    </span></p>${setCN}`;
      side = item.side.usEN ? item.side.usEN : "";
      name = (item[printer] && item[printer].hasOwnProperty("usEN")) ? item[printer].usEN : item.usEN;
      let usEN = `<p class="list usEN">
                      <span class="qty">${qty}</span>
                      <span class="itemWrap">
                        <span class="item">${name}</span>
                        <span class="side">${side}</span>
                      </span>
                      <span class="price">${item.total}</span></p>${setEN}`;
      return zhCN + usEN;
    }

    let { sortItem, duplicate } = ctrl;
    let list = data.filter(item => item.printer[printer]);
    !duplicate && (list = list.filter(item => {
      return !item.print;
    }));

    if (list.length === 0) return null;
    let content = "";
    if (sortItem) {
      let sorted = [];
      let categoryMap = [];
      for (let i = 0; i < list.length; i++) {
        let category = list[i].category;
        if (!sorted[category]) {
          sorted[category] = [];
          categoryMap[category] = list[i].categoryCN;
          sorted[category].push(list[i]);
        } else {
          sorted[category].push(list[i]);
        }
      }
      for (let category in sorted) {
        if (sorted.hasOwnProperty(category)) {
          content += `<div class="category">
                        <span class="zhCN">${categoryMap[category]}</span>
                        <span class="usEN">${category}</span>
                      </div>`;
          content += sorted[category].map(mockup).join("").toString();
        }
      }
    } else {
      content = list.map(mockup).join("").toString();
    }

    return `<section class="body">
                ${content}
              </section>`;
  };
  function createStyle(ctrl) {
    let {
      printPrimary,
      primaryFont,
      primaryFontSize,
      printSecondary,
      secondaryFont,
      secondaryFontSize,
      sortItem,
      printStore,
      printType,
      printCustomer,
      printPrice,
      printPayment,
      printSuggestion,
      printCoupon,
      printActionTime,
      buzzer,
      enlargeDetail
      } = ctrl;

    let enlarge = enlargeDetail ? ".customer .enlarge{font-size:1.2em;font-family:'Tensentype RuiHeiJ-W2'}" : "";

    return `<style>
              *{margin:0;padding:0}
              section.header{font-family:'Agency FB';text-align:center;}
              div.store{${printStore ? '' : 'display:none;'}}
              .header h3{font-size:1.25em;}
              .header h5{font-size:16px;font-weight:lighter}
              div.type{margin:10px 0;${printType ? '' : 'display:none;'}}
              div.type .zhCN{font-weight:lighter;font-size:1.3em;}
              div.type .usEN{margin-top:-5px;font-size:1.25em;}
              div.number{position:absolute;right:10px;${printStore ? 'bottom:12px;' : 'bottom:-39px;'}font-size:2em;font-weight:bold;font-family:"Agency FB"}
              div.time span{display:inline-block;margin:0 10px;font-size:1em;}
              div.time{border-bottom:1px solid #000;position:relative;}
              .server{border-bottom:1px solid #000;padding-bottom:1px;text-align:left;}
              .server .wrap{display:flex;padding:0 10px;}
              .wrap .text{flex:2;}.wrap .value{flex:3;}
              .customer{${printCustomer ? '' : 'display:none;'}}
              .customer p{text-align:left;}
              .customer p:last-child{border-bottom:1px solid #000;padding-bottom:4px;}
              .customer .text{display:inline-block;width:32px;margin-left:5px;}
              .customer .tel{letter-spacing:2px;}
              .customer .ext{margin-left:10px;}
              ${enlarge}
              section.body{padding:0px 5px 15px;}
              p.list{display:flex;flex-direction:row}
              span.qty{width:25px;text-align:center;}
              span.itemWrap{flex:1;}
              span.space{margin-left:10px;}
              .itemWrap.markItem{margin-top:5px;}
              span.item,span.side{position:relative;display:inline-block;}
              span.mark{position:absolute;top:-10px;left:0;font-size:10px;width:100%;text-align:center;display:inline-block;font-weight:bold;}
              span.side{font-weight:lighter;}
              span.price{width:35px;text-align:right;${printPrice ? '' : 'display:none;'}}
              div.category{border-bottom:1px dashed #000;margin-top:5px;${sortItem ? '' : 'display:none;'}}
              .list.zhCN{margin-top:5px;${printPrimary ? '' : 'display:none;'}}
              .list.usEN{margin-top:-5px;${printSecondary ? '' : 'display:none;'}}
              p.list.choiceSet{margin-top:0px;}
              .CNSet{text-indent:15px;font-size:0.8em;}
              .choiceSet .itemWrap{text-indent:15px;}
              .choiceSet.zhCN{${printPrimary ? '' : 'display:none;'}}
              .choiceSet.usEN{${printSecondary ? '' : 'display:none;'}}
              section.other{display:flex;flex-direction:row;border-bottom:1px solid #000;}
              .payment{${printPayment ? '' : 'display:none;'}}
              .misc,.payment{flex:1;vertical-align:top;}
              .payment .text{width:calc(60% - 5px);text-align:right;display:inline-block;}
              .payment .value{width:40%;text-align:right;display:inline-block;padding-right:5px;}
              p.bold{font-weight:bold;font-size:22px;}
              section.tip{font-family:'Agency FB'; margin:auto;width:90%;${printSuggestion ? '' : 'display:none;'}}
              section.tip .text{text-align:left;display:inline-block;width:50%}
              section.tip .value{text-align:right;display:inline-block;width:50%}
              section.welcome{text-align:center;font-weight:lighter;margin-top:10px;}
              footer{font-family:'Agency FB';}
              .printTime{${printActionTime ? '' : 'display:none;'}}
              .zhCN{font-family:'${primaryFont}';font-size:${primaryFontSize};${printPrimary ? '' : 'display:none;'}}
              .usEN{font-family:'${secondaryFont}';font-size:${secondaryFontSize};${printSecondary ? '' : 'display:none;'}}
          </style>`
  }
  function createFooter(ctrl, payment) {
    let { footer, printSuggestion } = ctrl;
    let { total } = payment;
    let gratuity = [
      (total * 0.15).toFixed(2),
      (total * 0.20).toFixed(2),
      (total * 0.25).toFixed(2)
    ];

    let content = footer ? footer.map(text => "<p>" + text + "</p>").join("").toString() : "";
    let settle = (payment.settled || payment.log) ?
      payment.log.filter(trans => trans.type !== 'CASH')
        .map(trans => `<p><span>${trans.type}</span><span>${trans.paid}</span><span>${trans.balance}</span></p>`).join("").toString() : "";
    let cash = (payment.hasOwnProperty('paidCash') && parseFloat(payment.paidCash) !== 0) ?
      `<p class="bold"><span class="text">CASH:</span><span class="value">${payment.paidCash}</span></p>
       <p class="bold"><span class="text">CHANGE:</span><span class="value">${(payment.paidCash - payment.due).toFixed(2)}</span></p>` : "";
    let credit = (payment.hasOwnProperty('paidCredit') && parseFloat(payment.paidCredit) !== 0) ? `<p class="bold"><span class="text">CREDIT:</span><span class="value">${payment.paidCredit}</span></p>` : "";
    let gift = (payment.hasOwnProperty('paidGift') && parseFloat(payment.paidGift) != 0) ? `<p class="bold"><span class="text">GIFT:</span><span class="value">${payment.paidGift}</span></p>` : "";
    let discount = parseFloat(payment.discount) !== 0 ? `<p class="bold"><span class="text">Discount:</span><span class="value">-${payment.discount}</span></p>` : '';
    let paid = (cash + credit + gift) || "";
    return `<footer>
               <section class="other">
                 <div class="misc"></div>
                 <div class="payment">
                   <p><span class="text">Subtotal:</span><span class="value">${payment.subtotal.toFixed(2)}</span></p>
                   <p><span class="text">Tax:</span><span class="value">${payment.tax.toFixed(2)}</span></p>
                   ${discount}
                   <p class="bold"><span class="text">TOTAL:</span><span class="value">${(payment.total - payment.discount).toFixed(2)}</span></p>
                   ${paid}
                 </div>
               </section>
               <section class="settle">${settle}</section>
               <section class="tip">
                 <p><span class="text">Good Service</span><span class="value">15% Gratuity: $${gratuity[0]}</span></p>
                 <p><span class="text">Great Service</span><span class="value">20% Gratuity: $${gratuity[1]}</span></p>
                 <p><span class="text">Excellent Service</span><span class="value">25% Gratuity: $${gratuity[2]}</span></p>
               </section>
               <section class="welcome">
               ${content}
               </section>
               <p class="printTime">${moment().format('hh:mm:ss')}</p>
             </footer>`;
  }
};
Printer.prototype.printLabel = function (name, order) {
  let { printPrimary, printSecondary, primaryFont, secondaryFont, primaryFontSize, secondaryFontSize } = this.config.printer[name]['control'];
  let style = `<style>
              .item{text-align:center;display:inline-block;}
              .number{float:right;}
              .option{text-align:center;}
              .primary{font-family:'${primaryFont}';font-size:${primaryFontSize};${printPrimary ? '' : 'display:none;'}}
              .secondary{font-family:'${secondaryFont}';word-spacing:1px;font-size:${secondaryFontSize};${printSecondary ? '' : 'display:none;'}}
              </style>`;
  let items = order.content.filter(item => item.printer[name])
    .map(item => {
      let choiceSet = item.choiceSet.map(set => {
        return `<span class="primary">${set.zhCN}</span><span class="secondary">${set.usEN}</span>`
      }).join(",").toString();

      return `<div>
                <span class="item number"># ${order.number}</span>
                <span class="item primary">${item.zhCN}</span>
                <span class="item secondary">${item.usEN}</span>
              </div>
              <div class="option">${choiceSet}</div>`
    }).forEach(item => {
      let html = item + style;
      this.printer.PRINT_INIT('Reprint Label');
      this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
      this.printer.SET_PRINTER_INDEX(name);
      this.printer.PRINT();
    })


};
Printer.prototype.printCreditCard = function (trans, reprint) {
  let store = this.config.store;
  let timestamp = moment(Number(trans.trace.time), 'YYYYMMDDHHmmss');
  let date = timestamp.format("MM/DD/YYYY");
  let time = timestamp.format("HH:mm:ss");
  let html = createHtml();
  let style = createStyle();
  let printer = this.findPrinterFor('PAYMENT');
  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(printer);
  this.printer.PRINT();

  this.printer.PRINT_INIT(this.job);
  html = html.replace("MERCHANT COPY", "CUSTOMER COPY");
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(printer);
  this.printer.PRINT();

  function createHtml() {
    let due = parseFloat(trans.amount.due) > 0 ? `<p class="due"><span class="text">Due:</span><span class="value">$${trans.amount.due}</span></p>` : "";
    let duplicate = reprint ? '<p class="center">***Duplicate***</p>' : '';
    return `<section class="header">
              <div class="store">
                <h3>${store.name}</h3>
                <h5>${store.address}</h5>
                <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                <h5>${store.contact}</h5>
              </div>
              <div class="type">
                <h3>${trans.transType}</h3>
              </div>
            </section>
            <article>
              <p class="time"><span class="text">${date}</span><span class="value">${time}</span></p>
              <p><span class="text">Transcation #:</span><span class="value">${trans.trace.trans}</span></p>
              <p><span class="text">Card Type</span><span class="value">${trans.account.type}</span></p>
              <p><span class="text">Account</span><span class="value">**** **** **** ${trans.account.number}</span></p>
              <p><span class="text">Entry</span><span class="value">${trans.account.entry}</span></p>
              <p><span class="text">Present</span><span class="value">${trans.account.present}</span></p>
              <p class="bold amount"><span class="text">Amount:</span><span class="value">$${trans.amount.approve}</span></p>
              ${due}
              <p class="bold"><span class="text">Tip:</span><span class="value ul">$</span></p>
              <p class="bold"><span class="text">Total:</span><span class="value ul">$</span></p>
              <p><span class="text">Auth Code</span><span class="value">${trans.host.auth}</span></p>
              <p><span class="text">Response</span><span class="value">${trans.host.msg}</span></p>
            </article>
            <footer>
              <div class="agreement">
                <p>I AGREE TO PAY ABOVE TOTAL AMOUNT</p>
                <p>ACCORDING TO CARD ISSUER AGREEMENT</p>
                <p>(MERCHANT AGREEMENT IF CREDIT VOUCHER)</p>
              </div>
              <p class="sign">X</p>
              <p class="center">${trans.account.holder}</p>
              <p class="center">MERCHANT COPY</p>
              ${duplicate}
            </footer>`;
  }
  function createStyle() {
    return `<style>
            *{margin:0;padding:0;font-family:'Agency FB';}
            section.header{text-align:center;}
            .header h3{font-size:1.25em;}
            .header h5{font-size:16px;font-weight:lighter}
            div.type{margin:10px;}
            div.type h3{font-weight:lighter;font-size:1.3em;}
            div.type h5{margin-top:-5px;font-size:1.25em;}
            article p{display:flex;}
            article .text{flex:2;}
            article .value{flex:4;text-align:right}
            p.bold{font-weight:bold;font-size:1.25em;display:flex;}
            .bold .text{width:120px;text-align:right;margin-right:10px;}
            .bold .value{flex:1;text-align:left;}
            .ul{border-bottom:1px solid #000;}
            .agreement{text-align:center;margin:15px 0;}
            p.sign{border-bottom:1px solid #000;margin-top:20px;}
            p.center{text-align:center;}
          </style>`;
  }
};
Printer.prototype.printGiftCard = function (type, card) {
  let store = this.config.store;
  let date = moment().format("MM/DD/YYYY");
  let time = moment().format("hh:mm:ss");
  let condition;
  switch (type) {
    case "Activation":
      condition = `<h5>Balance: $ ${card.balance}</h5>`;
      break;
    case "Reload":
      condition = `<h5>Reload Amount: $ ${card.reload}</h5>
                  <h5>Current Balance: $ ${card.balance}</h5>`;
      break;
    case "Balance":
      condition = `<h5>Balance: $ ${card.balance}</h5>
                   <h5>As of ${moment().format('MM/DD/YY hh:mm:ss')}</h5>`;
      break;
    case "Cash Out":
      condition = `<h5>Remain Balance: $ ${card.balance}</h5>`;
      break;
  }
  let html = `<section class="header">
                <div class="store">
                  <h3>${store.name}</h3>
                  <h5>${store.address}</h5>
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                  <h5>${store.contact}</h5>
                </div>
                <div class="type">
                  <h3>Gift Card</h3>
                  <h5>${type}</h5>
                </div>
                <div class="time">
                  <span>Date: ${date}</span>
                  <span>Time: ${time}</span>
                </div>
                <div class="server">
                  <span class="text">Cashier:</span><span class="value">${card.seller}</span>
                </div>
            </section>
            <section class="body">
              <img src="http://api-bwipjs.rhcloud.com/?bcid=code128&text=${card.number}">
              <h5>${card.number.replace(/(.{4})(.{4})(.{4})(.{4})/g, '$1  $2  $3  $4')}</h5>
              ${condition}
            </section>
            <footer>
              Thank You Very Much
            </footer>`;
  let style = `<style>
              *{margin:0;padding:0;font-family:'Agency FB';}
              section.header{text-align:center;}
              .header h3{font-size:1.25em;}
              .header h5{font-size:16px;font-weight:lighter}
              div.type{margin:10px;}
              div.type h3{font-weight:lighter;font-size:1.3em;}
              div.type h5{margin-top:-5px;font-size:1.25em;}
              div.time span{display:inline-block;margin:0 10px;font-size:1em;}
              div.time{border-bottom:1px solid #000;position:relative;}
              .server{border-bottom:1px solid #000;padding-bottom:1px;text-align:left;}
              section.body{text-align:center;margin:25px;}
              img{width:200px;height:45px;}
              .body h5{margin-top:10px;}
              footer{border-top:1px solid #000;text-align:center;}
              </style>`;

  let printers = this.config.store.printer;
  let printer = [];
  for (let i in printers) {
    if (printers.hasOwnProperty(i))
      printer.push(i);
  }
  let name = printer.findIndex(name => printers[name].print['PAYMENT'] === true);
  printer = printer[name];
  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", (html + style));
  this.printer.SET_PRINTER_INDEX(printer);
  this.printer.PRINT();
};
Printer.prototype.printReport = function (data) {
  let store = this.config.store;
  let { date, report } = data;
  let from = moment(date.from).format("M/D/YY HH:mm");
  let to = moment(date.to).format("M/D/YY HH:mm");
  let html = createReport();
  let style = createStyle();

  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(this.findPrinterFor('REPORT'));
  this.printer.PRINT();

  function createReport() {
    let content = "";
    for (let key in report) {
      if (report.hasOwnProperty(key) && report[key]) {
        let section = "";
        if (Array.isArray(report[key])) {
          section += report[key].map(record => {
            let { text, count, amount } = record;
            amount = isNumber(amount) ? "$ " + amount.toFixed(2) : amount;
            count = count > 0 ? count : "";
            return `<p>
                  <span class="text">${text}</span>
                  <span class="amount">${amount}</span>
                  <span class="count">${count}</span>
                 </p>`
          }).join("").toString();
        } else {
          for (let value in report[key]) {
            let { text, count, amount } = report[key][value];
            amount = isNumber(amount) ? "$ " + amount.toFixed(2) : amount;
            count = count > 0 ? count : "";
            section += `<p>
                         <span class="text">${text}</span>
                         <span class="amount">${amount}</span>
                         <span class="count">${count}</span>
                       </p>`
          }
        }
        section = `<section class="type"><h4>${key}</h4>${section}</section>`;
        content += section;
      }
    }
    return `<section class="header">
              <div class="store">
                <h3>${store.name}</h3>
                <h5>${store.address}</h5>
                <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                <h5>${store.contact}</h5>
              </div>
              <div class="type">
                <h3>Sales Summary Report</h3>
                <h5>${from} ~ ${to}</h5>
              </div>
          </section>
          ${content}
          <footer>
            <p>Powered by United POS&reg;</p>
          </footer>`;
  }
  function createStyle() {
    return `<style>
              *{margin:0;padding:0;font-family:'Agency FB';}
                section.header{text-align:center;}
                .header h3{font-size:1.25em;}
                .header h5{font-size:16px;font-weight:lighter}
                div.type{margin:10px;border-bottom:1px solid #000;}
                div.type h3{font-weight:lighter;font-size:1.3em;}
                div.type h5{margin-top:5px;font-size:1.25em;}
                p{margin:0;padding:0 5px;display:flex}
                section.type{margin-bottom:10px;}
                section h4{text-align:center;border-bottom:1px dashed #000;border-top:1px dashed #000;margin-bottom:10px;}
                p .amount{flex:1;text-align:right;}
                p .count{width:35px;text-align:right;}
                footer p{text-align:center;border-top:1px solid #000;margin-top:15px;display:block;}
            </style>`;
  }
}
Printer.prototype.printChecksum = function (data) {
  let store = this.config.store;
  let date = moment().format("MM/DD/YYYY");
  let time = moment().format("hh:mm:ss");
  let content = data.content.map(list => {
    return `<li class="first">
              <span class="f1 center bold">${list.trans}</span>
              <span class="f2">${list.transType}</span>
              <span class="f2">...${list.card}</span>
              <span class="f2">$ ${list.total}<span class="tip">${list.tip === 0 ? '' : "(" + list.tip.toFixed(2) + ")"}</span></span>
            </li>
            <li class="second">
              <span class="f1 center">${list.time}</span>
              <span class="f2">${list.orderType} ${list.ticket}</span>
              <span class="f2"></span>
              <span class="f2"></span>
            </li>`
  }).join("").toString();
  let detail = '';
  detail = data.summary.visa ? detail + `<p><span class="text">Visa (${data.summary.visa})</span><span class="value">$${data.summary.visaSum.toFixed(2)}</span></p>` : detail;
  detail = data.summary.master ? detail + `<p><span class="text">Mastercard (${data.summary.master})</span><span class="value">$${data.summary.masterSum.toFixed(2)}</span></p>` : detail;
  detail = data.summary.discover ? detail + `<p><span class="text">Discover (${data.summary.discover})</span><span class="value">$${data.summary.discoverSum.toFixed(2)}</span></p>` : detail;
  detail = data.summary.amex ? detail + `<p><span class="text">AMEX (${data.summary.amex})</span><span class="value">$${data.summary.amexSum.toFixed(2)}</span></p>` : detail;
  detail = data.summary.other ? detail + `<p><span class="text">Other (${data.summary.other})</span><span class="value">$${data.summary.otherSum.toFixed(2)}</span></p>` : detail;

  let summary = '';
  summary = data.summary.voided ? summary = `<p><span class="text">Voided (${data.summary.voided})</span><span class="value">($${data.summary.voidedSum.toFixed(2)})</span></p>` : summary;
  summary = data.summary.tip ? summary + `<p><span class="text">Tips (${data.summary.tip})</span><span class="value">$${data.summary.tipSum.toFixed(2)}</span></p>` : summary;
  summary = data.summary.sale ? summary + `<p><span class="text">Total Credit Sales (${data.summary.sale})</span><span class="value">$${data.summary.saleSum.toFixed(2)}</span></p>` : summary;

  let html = `<section class="header">
                <div class="store">
                  <h3>${store.name}</h3>
                  <h5>${store.address}</h5>
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                  <h5>${store.contact}</h5>
                </div>
                <div class="type">
                  <h3>Sale Summary</h3>
                </div>
                <div class="time">
                  <span>Date: ${date}</span>
                  <span>Time: ${time}</span>
                </div>
            </section>
            <ul>${content}</ul>
            <section class="data">
              <h3>Detail</h3>
              ${detail}
            </section>
            <section class="data">
              <h3>Summary</h3>
              ${summary}
            </section>
            <footer>
              <p>END OF BATCH REPORT</p>
              <p>Powered By United POS&reg;</p>
            </footer>`;
  let style = `<style> 
                *{margin:0;padding:0;font-family:'Agency FB';}
                section.header{text-align:center;}
                .header h3{font-size:1.25em;}
                .header h5{font-size:16px;font-weight:lighter}
                div.type{margin:10px;}
                div.type h3{font-weight:lighter;font-size:1.3em;}
                div.type h5{margin-top:-5px;font-size:1.25em;}
                div.time span{display:inline-block;margin:0 10px;font-size:1em;}
                div.time{border-bottom:1px solid #000;position:relative;}
                ul{margin:10px 0;}
                li{display:flex;}
                li.second{border-bottom:1px dashed #000;margin-bottom:5px;}
                li:last-child{border-bottom:none;}
                .center{text-align:center;}
                .bold{font-weight:bold;}
                .tip{margin-left:5px;}
                .f1{flex:1}
                .f2{flex:2}
                .f3{flex:3}
                section.data h3{text-align:center;border-bottom:1px solid #000;}
                section.data p{display:flex;padding:0 10px;}
                p .text{flex:1;}
                footer{margin-top:25px;}
              </style>`;
  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(this.findPrinterFor('REPORT'));
  this.printer.PRINT();

}
Printer.prototype.printBatchReport = function (data) {
  let store = this.config.store;
  let date = moment().format("MM/DD/YYYY");
  let time = moment().format("hh:mm:ss");

  let html = `<article>
              <section class="data">
              <h3>Batch Report</h3>
                <p class="time"><span class="text">${date}</span><span class="value">${time}</span></p>
                <p><span class="text">Result</span><span class="value">${data.batchResult}</span></p>
                <p><span class="text">Batch #</span><span class="value">${data.batchNumber}</span></p>
                <p><span class="text">Device</span><span class="value">${data.tid}</span></p>
                <p><span class="text">Machine</span><span class="value">${data.mid}</span></p>
                <p><span class="text">Total</span><span class="value">$ ${data.settled}</span></p>
              </section>
              <section class="data">
                <h3>Overview</h3>
                <p><span class="text">Credit (${data.count.credit})</span><span class="value">$ ${data.amount.credit}</span></p>
                <p><span class="text">Debit (${data.count.debit})</span><span class="value">$ ${data.amount.debit}</span></p>
              </section>
            </article>`;
  let style = `<style>
            *{margin:0;padding:0;font-family:'Agency FB';}
            article p{display:flex;}
            article .text{flex:2;}
            article .value{flex:4;text-align:right}
            section.data{margin:15px 0;}
            .data h3{border-bottom:1px solid #000;text-align:center;}`;

  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(this.findPrinterFor('REPORT'));
  this.printer.PRINT();
}
Printer.prototype.printTimeCardReport = function (data) {
  let store = this.config.store;
  let date = moment().format("MM/DD/YYYY");
  let time = moment().format("hh:mm:ss");
  let total = 0;
  let activity = data.activity.map((session, index) => {
    let clockIn = moment(session.clockIn).locale('en').format("hh:mm:ss a");
    let clockOut = moment(session.clockOut).locale('en').format("hh:mm:ss a");
    let diff = session.clockOut - session.clockIn;
    total += diff;
    let h = ("0" + Math.floor(diff / 36e5)).slice(-2) + "  Hr.";
    let m = ("0" + Math.floor(diff / 6e4 % 60)).slice(-2) + "  Min.";

    return `<div class="log">
                <span class="qty">#${index + 1}</span>
                <div class="record">
                  <span>${clockIn}</span>
                  <span>${clockOut}</span>
                </div>
                <span class="diff">${h} ${m}</span>
              </div>`
  }).join("").toString();
  let html = `<section class="header">
                <div class="store">
                  <h3>${store.name}</h3>
                  <h5>${store.address}</h5>
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                  <h5>${store.contact}</h5>
                </div>
                <div class="type">
                  <h3>Time Card</h3>
                  <h5>Activity</h5>
                </div>
                <div class="time">
                  <span>Date: ${date}</span>
                  <span>Time: ${time}</span>
                </div>
            </section>
            ${activity}
            <div class="log last">
              <span class="qty"></span>
              <div class="record">Found ${data.activity.length} record(s)</div>
              <span class="diff">${("0" + Math.floor(total / 36e5)).slice(-2) + "  Hr."} ${("0" + Math.floor(total / 6e4 % 60)).slice(-2) + "  Min."}</span>
            </div>
            <footer>
              <p>Powered by United POS&reg;</p>
            </footer>`;
  let style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
                section.header{text-align:center;}
                .header h3{font-size:1.25em;}
                .header h5{font-size:16px;font-weight:lighter}
                div.type{margin:10px;}
                div.type h3{font-weight:lighter;font-size:1.3em;}
                div.type h5{margin-top:-5px;font-size:1.25em;}
                .qty{width:40px;padding:0 10px;}
                div.time span{display:inline-block;margin:0 10px;font-size:1em;}
                div.time{border-bottom:1px solid #000;position:relative;}
                div.log{display:flex;justify-content:center;align-items:center;border-bottom:1px dashed #000;margin:5px 0;padding-bottom: 5px;}
                .log .record{flex:1;display:flex;flex-direction:column;}
                .log.last{border-bottom:none;}
                .diff{width:75px;text-align:right;}
                footer{border-top:1px solid #000;text-align:center;}</style>`;
  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(this.findPrinterFor('REPORT'));
  this.printer.PRINT();
}
Printer.prototype.printCashInReport = function (data) {
  let store = this.config.store;
  let date = moment().format("MM/DD/YYYY");
  let time = moment().format("hh:mm:ss");

  let html = `<section class="header">
                <div class="store">
                  <h3>${store.name}</h3>
                  <h5>${store.address}</h5>
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                  <h5>${store.contact}</h5>
                </div>
                <div class="type">
                  <h3>Cash In</h3>
                  <h5>Record</h5>
                </div>
                <div class="time">
                  <span>Date: ${date}</span>
                  <span>Time: ${time}</span>
                </div>
            </section>
            <div class="log">
                <span class="qty">OPEN</span>
                <div class="record">
                  <span>${data.operator}</span>
                  <span>${moment(data.beginTime).format("HH:mm:ss")}</span>
                </div>
                <span class="diff">$${data.begin.toFixed(2)}</span>
              </div>
            <div class="log last">
              <div class="for">Cash Drawer: ${data.cashDrawer}</div>
            </div>
            <footer>
              <p>Powered by United POS&reg;</p>
            </footer>`;
  let style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
                section.header{text-align:center;}
                .header h3{font-size:1.25em;}
                .header h5{font-size:16px;font-weight:lighter}
                div.type{margin:10px;}
                div.type h3{font-weight:lighter;font-size:1.3em;}
                div.type h5{margin-top:-5px;font-size:1.25em;}
                .qty{width:40px;padding:0 10px;}
                div.time span{display:inline-block;margin:0 10px;font-size:1em;}
                div.time{border-bottom:1px solid #000;position:relative;}
                div.log{display:flex;justify-content:center;align-items:center;border-bottom:1px dashed #000;margin:5px 0;padding-bottom: 5px;}
                .log .record{flex:1;display:flex;flex-direction:column;}
                .for{text-align:center;font-weight:bold;}
                .log.last{border-bottom:none;}
                .diff{width:75px;text-align:right;}
                footer{border-top:1px solid #000;text-align:center;}</style>`;
  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(this.findPrinterFor('REPORT'));
  this.printer.PRINT();
}
Printer.prototype.printCashOutReport = function (data, detail) {
  console.log(data, detail)
  let store = this.config.store;
  let date = moment().format("MM/DD/YYYY");
  let time = moment().format("hh:mm:ss");
  let amount = 0;
  let list = detail ? data.activity.map(log => `            
              <div class="log">
              <span class="action">${log.operator}</span>
                <div class="record">
                  <span>${log.ticket === null ? '&nbsp;' : '#' + log.ticket.number}</span>
                  <span>${log.ticket === null ? '&nbsp;' : log.ticket.type}</span>
                </div>
                <div class="record">
                  <span>+${log.inflow}</span>
                  <span>-${log.outflow}</span>
                </div>
                <span class="diff">$${(amount += (log.inflow - log.outflow)).toFixed(2)}</span>
            </div>`).join("").toString() : "";

  let html = `<section class="header">
                <div class="store">
                  <h3>${store.name}</h3>
                  <h5>${store.address}</h5>
                  <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                  <h5>${store.contact}</h5>
                </div>
                <div class="type">
                  <h3>Cash Out</h3>
                  <h5>Report</h5>
                </div>
                <div class="time">
                  <span>Date: ${date}</span>
                  <span>Time: ${time}</span>
                </div>
            </section>
            <div class="log">
                <span class="action bold">OPEN</span>
                <div class="record">
                  <span>${data.operator}</span>
                  <span>${moment(data.beginTime).format("HH:mm:ss")}</span>
                </div>
                <span class="diff">$${data.begin.toFixed(2)}</span>
            </div>
            <div>
            ${list}
            </div>
            <div class="log">
              <span class="action bold">CLOSE</span>
              <div class="record">
                <span>${data.operator}</span>
                <span>${moment(data.endTime).format("HH:mm:ss")}</span>
              </div>
              <span class="diff">$${data.end.toFixed(2)}</span>
            </div>
            <div class="log last">
              <div class="for">Cash Drawer: ${data.cashDrawer}</div>
            </div>
            <footer>
              <p>Powered by United POS&reg;</p>
            </footer>`;
  let style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
                section.header{text-align:center;}
                .header h3{font-size:1.25em;}
                .header h5{font-size:16px;font-weight:lighter}
                div.type{margin:10px;}
                div.type h3{font-weight:lighter;font-size:1.3em;}
                div.type h5{margin-top:-5px;font-size:1.25em;}
                .action{min-width:40px;padding:0 10px;}
                .bold{font-weight:bold}
                div.time span{display:inline-block;margin:0 10px;font-size:1em;}
                div.time{border-bottom:1px solid #000;position:relative;}
                div.log{display:flex;justify-content:center;align-items:center;border-bottom:1px dashed #000;margin:5px 0;padding-bottom: 5px;}
                .log .record{flex:1;display:flex;flex-direction:column;}
                .for{text-align:center;font-weight:bold;}
                .log.last{border-bottom:none;}
                .diff{width:75px;text-align:right;}
                footer{border-top:1px solid #000;text-align:center;}</style>`;
  this.printer.PRINT_INIT(this.job);
  this.printer.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
  this.printer.SET_PRINTER_INDEX(this.findPrinterFor('REPORT'));
  this.printer.PRINT();
}
Printer.prototype.findPrinterFor = function (type) {
  let printers = this.config.store.printer;
  let printer = [];
  for (let i in printers) {
    printers.hasOwnProperty(i) && printer.push(i);
  }
  let name = printer.findIndex(name => printers[name].print[type] === true);
  return printer[name];
}
module.exports = new Printer();
