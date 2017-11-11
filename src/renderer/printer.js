var Printer = function (plugin, config) {
    this.plugin = plugin;
    this.config = config;
    this.station = config.station;
    this.setting = config.printer;
    this.devices = Object.keys(config.printer);
    this.targetDevices = [];
    this.template = null;
    this.target = 'Receipt';

    /**
     * Set target printers
     * @param  {string} name       The name of the printer target group
     * 
     *           All,     // call all printer to print 
     *           Receipt, // only the cashier printer to print
     *           Order,   // All printer but EXCLUDE cashier printer
     *         
     * @return 
     */
    this.initial = function (plugin, config) {
        this.plugin = plugin;
        this.config = config;
        this.station = config.station;
        this.setting = config.printer;
        this.devices = config.station.printerGroup || Object.keys(config.printer);
    }

    this.setTarget = function (name) {
        this.target = name || 'All';
        return this
    }

    this.setTemplate = function (type) {
        this.template = type || 'Receipt';
        return this
    }

    this.setPrinter = function (name, template) {
        this.targetDevices = [name];
        template && (this.template = template);
        return this
    }

    this.openCashDrawer = function () {
        if (this.station.cashDrawer.enable) {
            this.plugin.PRINT_INIT('Open');
            this.plugin.SET_PRINTER_INDEX(this.station.cashDrawer.bind || this.station.printer);
            this.plugin.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(112) + String.fromCharCode(48) + String.fromCharCode(55) + String.fromCharCode(221));
        }
    }

    this.buzzer = function (device) {
        this.plugin.PRINT_INIT('Buzzer');
        this.plugin.SET_PRINTER_INDEX(device);
        this.plugin.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(67) + String.fromCharCode(4) + String.fromCharCode(2) + String.fromCharCode(3));
        return this
    }

    this.testPage = function (device) {
        let { name, address, city, state, zipCode, contact } = this.config.store;

        this.plugin.PRINT_INIT('Test Page');
        this.plugin.PRINT_INITA(0, 0, 270, 2000, "");
        this.plugin.ADD_PRINT_TEXT(3, 2, 262, 23, name);
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
        this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
        this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
        this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
        this.plugin.ADD_PRINT_TEXT(30, 2, 262, 20, address);
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
        this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
        this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
        this.plugin.ADD_PRINT_TEXT(42, 2, 262, 20, `${city}, ${state} ${zipCode}`);
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
        this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
        this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
        this.plugin.ADD_PRINT_TEXT(60, 2, 262, 20, contact);
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 10);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
        this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
        this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
        this.plugin.ADD_PRINT_LINE(82, 6, 82, 266, 0, 1);
        this.plugin.ADD_PRINT_TEXT(90, 10, 262, 20, device + ' printer');
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
        this.plugin.SET_PRINTER_INDEX(device);
        this.plugin.PRINT();
        this.reset();
    }

    this.getPrinters = function () {
        let printer;
        switch (this.target) {
            case 'All':
                printer = this.devices.filter(device => !(/cashier/i).test(device));
                printer.splice(0, 0, this.station.printer || 'cashier');
                break;
            case 'Receipt':
                printer = [this.station.printer || 'cashier'];
                break;
            case 'Order':
                printer = this.devices.filter(device => !(/cashier/i).test(device));
                break;
        }
        return this.targetDevices.length > 0 ? this.targetDevices : printer;
    }

    this.print = function (raw, receipt) {
        let printers = this.getPrinters();
        printers.forEach(printer => {
            let setting = this.setting[printer];
            let ticket = raw.type, skip;

            if (!receipt) {
                skip = setting.print.hasOwnProperty(raw.type) ? !setting.print[ticket] : true
            } else {
                skip = !setting.print[ticket] && setting.print[receipt]
            }

            if (skip) { this.skip(); return }
            if (setting.labelPrinter) {
                this.printLabel(printer, raw);
                return;
            }
            let items = raw.content.filter(item => item.printer[printer]);
            if (items.length === 0) return false;
            //change incoming
            let { printStore, printType, printCustomer, enlargeDetail } = setting.control;
            let header = createHeader(this.config.store, raw);
            let list = createList(printer, setting.control, raw);
            if (!list) return;

            let style = createStyle(setting.control);
            let footer = createFooter(this.config.store.table, setting.control, printer, raw);

            let html = header + list + footer + style;

            setting.control.buzzer && this.buzzer(printer);

            this.plugin.PRINT_INIT('Ticket Receipt');
            this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
            this.plugin.SET_PRINTER_INDEX(printer);
            this.plugin.PRINT();

            if (raw.carryNote && (/cashier/i).test(printer)) {
                this.plugin.PRINT_INIT('Ticket carry note');
                this.plugin.SET_PRINTER_INDEX(printer);
                this.plugin.PRINT_INITA(0, 0, 270, 500, "");
                let cursor = 0;
                raw.carryNote.content.forEach(line => {
                    this.plugin.ADD_PRINT_TEXT(cursor, 10, 260, 20, line);
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Tensentype RuiHeiJ-W2");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 16);
                    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
                    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
                    cursor += 22
                })
                this.plugin.PRINT()
            }
            if (Array.isArray(setting.reprint) && setting.reprint.includes(ticket)) {
                this.plugin.PRINT_INIT('Reprint ticket')
                this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html)
                this.plugin.SET_PRINTER_INDEX(printer)
                this.plugin.PRINT()
            }
        })

        this.reset()
    }

    this.preview = function (raw) {
        let printer = 'cashier';
        let setting = this.setting.cashier;

        let { printStore, printType, printCustomer, enlargeDetail } = setting.control;
        let header = createHeader(this.config.store, raw);
        let list = createList(printer, setting.control, raw);
        let style = createStyle(setting.control);
        let footer = createFooter(this.config.store.table, setting.control, 'cashier', raw);

        let html = header + list + footer + style;

        return html;
    }

    this.printLabel = function (name, order) {
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
                this.plugin.PRINT_INIT('Reprint Label');
                this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
                this.plugin.SET_PRINTER_INDEX(name);
                this.plugin.PRINT();
            })
    }

    this.printCreditCard = function (trans, reprint) {
        let { store, printer } = this.config;
        let device = this.station.printer || 'cashier';

        if (!printer[device]['print']['CREDITCARD']) return;

        let timestamp = moment(Number(trans.trace.time), 'YYYYMMDDHHmmss');
        let date = timestamp.format("MM/DD/YYYY");
        let time = timestamp.format("HH:mm:ss");
        let html = createHtml();
        let style = createStyle();

        this.plugin.PRINT_INIT('Credit Card - Store');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(device);
        this.plugin.PRINT();

        this.plugin.PRINT_INIT('Credit Card - Customer');
        html = html.replace("MERCHANT COPY", "CUSTOMER COPY");
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(device);
        this.plugin.PRINT();

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
                    <p class="bold"><span class="text">Tip:</span><span class="value ul">$${parseFloat(trans.amount.tip) > 0 ? trans.amount.tip : ''}</span></p>
                    <p class="bold"><span class="text">Total:</span><span class="value ul">$</span></p>
                    <p><span class="text">Auth Code</span><span class="value">${trans.host.auth}</span></p>
                    <p><span class="text">Response</span><span class="value">${trans.host.msg}</span></p>
                    <p><span class="text">Station</span><span class="value">${trans.station}</span></p>
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
    }

    this.printGiftCard = function (title, card) {
        let { name, address, city, state, zipCode, contact } = this.config.store;

        CLODOP.PRINT_INIT('Gift Card');
        CLODOP.PRINT_INITA(0, 0, 260, 2000, "");
        CLODOP.ADD_PRINT_TEXT(3, 2, 262, 23, name);
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.ADD_PRINT_TEXT(30, 2, 262, 20, address);
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.ADD_PRINT_TEXT(42, 2, 262, 20, `${city}, ${state} ${zipCode}`);
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.ADD_PRINT_TEXT(60, 2, 262, 20, contact);
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.ADD_PRINT_TEXT(76, 88, 100, 21, 'Gift Card');
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_TEXT(96, 88, 100, 21, title);
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_TEXT(120, 42, 110, 20, "Date: " + moment().format('MM-DD-YYYY'));
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_TEXT(120, 145, 110, 20, "Time: " + moment().format('HH:mm:ss'));
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_LINE(138, 6, 138, 266, 0, 1);
        CLODOP.ADD_PRINT_TEXT(152, 2, 262, 20, 'THANK YOU');
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.ADD_PRINT_TEXT(178, 2, 262, 20, 'BALANCE: $ ' + card.balance.toFixed(2));
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_BARCODE(250, 30, 266, 70, "Code39", card.number);
        CLODOP.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        CLODOP.PRINT();
    }

    this.printReport = function (data) {
        let store = this.config.store;
        let { date, report } = data;
        let from = moment(date.from).format("M/D/YY HH:mm");
        let to = moment(date.to).format("M/D/YY HH:mm");
        let html = createReport();
        let style = createStyle();

        this.plugin.PRINT_INIT('Report');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        this.plugin.PRINT();

        function createReport() {
            let content = "";
            for (let key in report) {
                if (report.hasOwnProperty(key) && report[key]) {
                    let section = "";
                    if (Array.isArray(report[key])) {
                        section += report[key].map(record => {
                            let { text, count, amount } = record;
                            amount = isNumber(amount) ? "$ " + toFixed(amount, 2).toFixed(2) : amount ? flatten(amount) : "";
                            count = count > 0 ? count : "";
                            return `<div class="data">
                        <div class="text">${text}</div>
                        <div class="amount">${amount}</div>
                        <div class="count">${count}</div>
                       </div>`
                        }).join("").toString();
                    } else {
                        for (let value in report[key]) {
                            let { text, count, amount } = report[key][value];
                            amount = isNumber(amount) ? "$ " + toFixed(amount, 2).toFixed(2) : amount ? flatten(amount) : '';
                            count = count > 0 ? count : "";
                            section += `<div class="data">
                               <div class="text">${text}</div>
                               <div class="amount">${amount}</div>
                               <div class="count">${count}</div>
                             </div>`
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
        function flatten(array) {
            let html = "";
            Array.isArray(array) ?
                array.forEach(data => {
                    for (let key in data) {
                        if (isNumber(data[key]) && parseFloat(data[key]) === 0) continue;
                        html += `<div class="row">
                        <span class="text">${key}:</span>
                        <span class="value">${isNumber(data[key]) ? '$ ' + data[key] : data[key]}</span>
                      </div>`
                    }
                }) : null;
            return html;
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
                      .data {margin-bottom:0px;padding:0 5px;display:flex}
                      section.type{margin-bottom:10px;}
                      section h4{text-align:center;border-bottom:1px dashed #000;border-top:1px dashed #000;margin-bottom:10px;letter-spacing:1px;}
                      .data .amount{flex:1;text-align:right;}
                      .data .count{width:35px;text-align:right;}
                      .value{display:inline-block;min-width:50px;}
                      footer p{text-align:center;border-top:1px solid #000;margin-top:15px;display:block;}
                  </style>`;
        }
    }
    this.printPreBatchReport = function (data) {
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
        detail = data.summary.visa ? detail + `<p><span class="text">Visa (${data.summary.visa})</span><span class="value">$${data.summary.visaAmount.toFixed(2)}</span></p>` : detail;
        detail = data.summary.master ? detail + `<p><span class="text">Mastercard (${data.summary.master})</span><span class="value">$${data.summary.masterAmount.toFixed(2)}</span></p>` : detail;
        detail = data.summary.discover ? detail + `<p><span class="text">Discover (${data.summary.discover})</span><span class="value">$${data.summary.discoverAmount.toFixed(2)}</span></p>` : detail;
        detail = data.summary.amex ? detail + `<p><span class="text">AMEX (${data.summary.amex})</span><span class="value">$${data.summary.amexAmount.toFixed(2)}</span></p>` : detail;
        detail = data.summary.other ? detail + `<p><span class="text">Other (${data.summary.other})</span><span class="value">$${data.summary.otherAmount.toFixed(2)}</span></p>` : detail;

        let summary = '';
        summary = data.summary.voidSale ? summary = `<p><span class="text">Voided (${data.summary.voidSale})</span><span class="value">($${data.summary.voidSaleAmount.toFixed(2)})</span></p>` : summary;
        summary = data.summary.tip ? summary + `<p><span class="text">Tips (${data.summary.tip})</span><span class="value">$${data.summary.tipAmount.toFixed(2)}</span></p>` : summary;
        summary = data.summary.sales ? summary + `<p><span class="text">Total Credit Sales (${data.summary.sales})</span><span class="value">$${data.summary.salesAmount.toFixed(2)}</span></p>` : summary;

        let html = `<section class="header">
                      <div class="store">
                        <h3>${store.name}</h3>
                        <h5>${store.address}</h5>
                        <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                        <h5>${store.contact}</h5>
                      </div>
                      <div class="type">
                        <h3>Credit Sales</h3>
                        <h5>Summary Report</h5>
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
                  </section>`;
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
                      section.data h3{text-align:center;border-bottom:1px dashed #000;}
                      section.data p{display:flex;padding:0 10px;}
                      p .text{flex:1;}
                      footer{margin-top:25px;}
                    </style>`;
        this.plugin.PRINT_INIT('Prebatch report');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        this.plugin.PRINT();
    }

    this.printBatchReport = function (data) {
        let store = this.config.store;
        let batchTime = moment(Number(data.time), 'YYYYMMDDHHmmss')
        let date = batchTime.format("MM/DD/YYYY");
        let time = batchTime.format("hh:mm:ss");
        let { credit, debit, ebt } = data.amount;
        let total = (parseFloat(credit) + parseFloat(debit) + parseFloat(ebt)).toFixed(2);

        let html = `<article>
                    <section class="data">
                    <h3>Batch Report</h3>
                      <p class="time"><span class="text">${date}</span><span class="value">${time}</span></p>
                      <p><span class="text">MID</span><span class="value">${data.mid}</span></p>
                      <p><span class="text">Device</span><span class="value">${data.tid}</span></p>
                      <p><span class="text">Station</span><span class="value">${data.station}</span></p>
                      <p><span class="text">Batch #</span><span class="value">${data.batchNumber}</span></p>
                      <p><span class="text">Result</span><span class="value">${data.resMsg}</span></p>
                      <p><span class="text">Total</span><span class="value">$ ${total}</span></p>
                    </section>
                    <section class="data">
                      <h3>Overview</h3>
                      <p><span class="text">Credit (${data.count.credit})</span><span class="value">$ ${data.amount.credit}</span></p>
                      <p><span class="text">Debit (${data.count.debit})</span><span class="value">$ ${data.amount.debit}</span></p>
                    </section>
                  </article>
                  <footer>
                    <p>END OF BATCH REPORT</p>
                    <p>Powered By United POS&reg;</p>
                  </footer>`;
        let style = `<style>
                  *{margin:0;padding:0;font-family:'Agency FB';}
                  article p{display:flex;}
                  article .text{flex:2;}
                  article .value{flex:4;text-align:right}
                  section.data{margin:15px 0;}
                  .data h3{border-bottom:1px dashed #000;text-align:center;}
                  footer{text-align:center;}`;

        this.plugin.PRINT_INIT('Batch Report');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        this.plugin.PRINT();
    }

    this.printTimeCardReport = function (data) {
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
        this.plugin.PRINT_INIT('Time card report');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        this.plugin.PRINT();
    }

    this.printCashInReport = function (data) {
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
        this.plugin.PRINT_INIT('Cash in report');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        this.plugin.PRINT();
    }

    this.printCashOutReport = function (data, detail) {
        console.log(data)
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
                        <span>+ ${log.inflow.toFixed(2)}</span>
                        <span>- ${log.outflow.toFixed(2)}</span>
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
        this.plugin.PRINT_INIT('Cash out report');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        this.plugin.PRINT();
    }

    this.printReservationTicket = function (data) {
        let store = this.config.store;
        let { queue, name } = data;
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
                        <h3>Reservation</h3>
                      </div>
                    </section>
                    <section class="data">
                      <h1>${queue}</h1>
                    </section>
                    <footer>
                      <p><span>${date}</span><span class="time">${time}</span></p>
                    </footer>`;

        let style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
        section.header{text-align:center;}
        .header h3{font-size:1.25em;}
        .header h5{font-size:16px;font-weight:lighter}
        div.type{margin:10px;border-bottom:1px solid #000;}
        div.type h3{font-weight:lighter;font-size:1.3em;}
        .data{text-align:center;}h1{font-size:5em;}
        footer{border-top:1px solid #000;text-align:center;}.time{margin-left:10px;}</style>`;
        this.plugin.PRINT_INIT('Reservation Ticket');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.printer || 'cashier');
        this.plugin.PRINT();
    }

    this.skip = function () {

    }
    this.reset = function () {
        this.target = 'All';
        this.template = '';
        this.targetDevices = [];
    }
    return this
}


/*
    Private methods
*/

function createHeader(store, ticket) {
    let { type, time, number, server, cashier, station, table, guest, customer } = ticket;
    let phone = '';
    try {
        phone = customer.phone && customer.phone.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1.$2.$3");
    } catch (e) {
        phone = customer.phone
    }
    let title = type.replace('_', ' ').toCapitalCase()
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

    let hasCashier = cashier ? `<span class="text">Cashier:</span><span class="value">${cashier}</span>` :
        `<span class="text">Guest:</span><span class="value">${guest}</span>`;

    let extraInfo = type === 'DINE_IN' ? `<span class="text">Ticket:</span><span class="value">${number}</span>` :
        `<span class="text">Table:</span><span class="value">${table || ""}</span>`;

    ticketInfo += (type === 'DINE_IN' || type === 'BAR' || type === 'PRE_PAYMENT' || type === 'PAYMENT') ?
        `<p><span class="wrap">${hasCashier}${extraInfo}</span></p>` : "";
    return `<section class="header">
            <div class="store">
                <h3>${store.name}</h3>
                <h5>${store.address}</h5>
                <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                <h5>${store.contact}</h5>
            </div>
            <div class="type">${title}</div>
            <div class="time">
                <span>Date: ${date}</span>
                <span>Time: ${placeTime}</span>
                <div class="number">${number}</div>
                <div class="table">${type === 'DINE_IN' ? table : ''}</div>
            </div>
            <div class="server">
                ${ticketInfo}
            </div>
            <div class="customer">
                ${customerInfo}
            </div>
        </section>`;
}

function createList(printer, ctrl, invoice) {
    let { sortItem, printMenuID, sortPriority, printMode } = ctrl;
    let content = [], items = [];
    let list = JSON.parse(JSON.stringify(invoice.content));
    //print mode decided items
    switch (printMode) {
        case "normal":
            if (!invoice.print) {
                items = list.filter(item => item.printer[printer]);
            } else {
                items = list.filter(item => item.printer[printer] && item.diffs !== 'removed')
            }
            break;
        case "difference":
            if (!invoice.print) {
                items = list.filter(item => item.printer[printer] && !item.print)
            } else {
                items = list.filter(item => item.printer[printer] && !item.print && item.diffs !== 'unchanged')
                items.forEach(item => {
                    switch (item.diffs) {
                        case "less":
                        case "more":
                            item.qty = item.origin + '&rsaquo;' + item.qty
                            break;
                        case "new":
                            item.zhCN = "★" + item.zhCN;
                            item.usEN = "★" + item.usEN;
                        case "removed":
                            break;
                        case "inserted":
                            item.choiceSet.forEach(set => {
                                set.zhCN = "★" + set.zhCN;
                                set.usEN = "★" + set.usEN;
                            })
                            break;
                    }
                })
            }
            break;
        case "new":
            if (!invoice.print) {
                items = list.filter(item => item.printer[printer] && !item.print)
            } else {
                items = list.filter(item => item.printer[printer] && !item.print && (item.diffs === 'new' || item.diffs === 'inserted'));

                items.forEach(item => {
                    switch (item.diffs) {
                        case "new":
                            item.zhCN = "★" + item.zhCN;
                            item.usEN = "★" + item.usEN;
                            break;
                        case "inserted":
                            item.choiceSet.forEach(set => {
                                set.zhCN = "★" + set.zhCN;
                                set.usEN = "★" + set.usEN;
                            })
                            break;
                    }

                })
            }
            break;
        case "todo":
            if (!invoice.print) {
                items = list.filter(item => item.printer[printer] && !item.print)
            } else {
                items = list.filter(item => item.printer[printer] && (item.diffs === 'unchanged' || item.diffs === 'new'))
                    .map(item => {
                        switch (item.diffs) {
                            case "unchanged":
                                item.zhCN = "☑ " + item.zhCN;
                                item.usEN = "☑ " + item.usEN;
                                break;
                            case "new":
                                item.zhCN = "☐ " + item.zhCN;
                                item.usEN = "☐ " + item.usEN;
                                break;
                            default:
                        }
                        return item
                    })
            }
            break;
        default:
            if (!invoice.print) {
                items = list.filter(item => item.printer[printer]);
            } else {
                items = list.filter(item => item.printer[printer] && item.diffs !== 'removed')
            }
    }

    if (items.length === 0) return false;
    if (sortPriority) {
        items.sort((p, n) => {
            let prev = p.priority || 0;
            let next = n.priority || 0;

            return prev < next
        })
    }

    if (sortItem) {
        let sorted = [];
        let categoryMap = [];

        for (let i = 0; i < items.length; i++) {
            let category = items[i].category;
            if (!sorted[category]) {
                sorted[category] = [];
                categoryMap[category] = items[i].categoryCN;
                sorted[category].push(items[i]);
            } else {
                sorted[category].push(items[i]);
            }
        }
        for (let category in sorted) {
            if (sorted.hasOwnProperty(category)) {
                content += `<div class="category">
                        <span class="zhCN">${categoryMap[category]}</span>
                        <span class="usEN">${category}</span>
                      </div>`;
                content += sorted[category].map(item => mockup(item, printer)).join("").toString();
            }
        }
    } else {
        content = items.map(item => mockup(item, printer)).join("").toString();
    }

    return `<table class="receipt"><tbody>${content}</tbody></table>`

    function mockup(item, name) {
        let nameCN = (item.printer[name] && item.printer[name].hasOwnProperty("zhCN")) ? item.printer[name].zhCN : item.zhCN;
        let nameEN = (item.printer[name] && item.printer[name].hasOwnProperty("usEN")) ? item.printer[name].usEN : item.usEN;
        let sideCN = item.side.zhCN ? item.side.zhCN : "";
        let sideEN = item.side.usEN ? item.side.usEN : "";
        let qty = item.qty !== 1 ? `<td class="qty">${item.qty}</td>` : `<td></td>`;
        let markA = item.mark[0].join(" ");
        let markB = item.mark[1].join(" ");
        let mark = (markA || markB) ? "markItem" : "";
        let setCN = "", setEN = "";
        let diffs = item.diffs || "";
        let firstLine, secondLine;

        item.choiceSet.forEach(set => {
            if (set.hasOwnProperty('print') && Array.isArray(set.print) && !set.print.includes(printer)) return;
            setCN += `<div class="sub">
                        <span>${set.qty !== 1 ? set.qty + 'x' : ''}</span>
                        <span>${set.zhCN}</span>
                        <span>${parseFloat(set.price) !== 0 ? '(' + set.price.toFixed(2) + ')' : ''}</span>
                      </div>`;
            setEN += `<div class="sub">
                        <span>${set.qty !== 1 ? set.qty + 'x' : ''}</span>
                        <span>${set.usEN}</span>
                        <span>${parseFloat(set.price) !== 0 ? '(' + set.price.toFixed(2) + ')' : ''}</span>
                    </div>`;
        })
        if (diffs === 'removed') {
            firstLine = `<tr class="zhCN">
                            <td class="qty"><del>${item.qty !== 1 ? item.qty : ''}</del></td>
                            <td class="item">
                                <del><div class="main">${printMenuID ? item.menuID : ''}${nameCN} <span class="side">${sideCN}</span></div></del>
                                <del>${setCN}</del>
                            </td>
                            <td class="price"><del>${item.total}</del></td>
                        </tr>`;
            secondLine = `<tr class="usEN">
                            <td class="qty"><del>${item.qty !== 1 ? item.qty : ''}</del></td>
                            <td class="item">
                                <del><div class="main">${printMenuID ? item.menuID : ''}${nameEN} <span class="side">${sideEN}</span></div></del>
                                <del>${setEN}</del>
                            </td>
                            <td class="price"><del>${item.total}</del></td>
                        </tr>`;
        } else {

            firstLine = `<tr class="zhCN">
                        ${qty}
                        <td class="item"><div class="main">${printMenuID ? item.menuID : ''}${nameCN} <span class="side">${sideCN}</span></div>${setCN}</td>
                        <td class="price">${item.total}</td>
                    </tr>`;
            secondLine = `<tr class="usEN">
                            ${qty}
                            <td class="item"><div class="main">${printMenuID ? item.menuID : ''}${nameEN} <span class="side">${sideEN}</span></div>${setEN}</td>
                            <td class="price">${item.total}</td>
                        </tr>`;
        }

        return firstLine + secondLine;
    }
}

function createStyle(ctrl) {
    let { printPrimary, primaryFont, primaryFontSize, printSecondary, secondaryFont, secondaryFontSize, sortItem, printStore, printType,
        printCustomer, printPrimaryPrice, printSecondaryPrice, printPayment, printCoupon, printActionTime, buzzer } = ctrl;

    !primaryFontSize.includes('px') && (primaryFontSize += "px");
    !secondaryFontSize.includes('px') && (secondaryFontSize += "px");

    return `<style>
              *{margin:0;padding:0}
              section.header{font-family:'Agency FB';text-align:center;}
              div.store{margin-bottom:10px;${printStore ? '' : 'display:none;'}}
              .header h3{font-size:1.25em;}
              .header h5{font-size:16px;font-weight:lighter}
              div.type{${printType ? '' : 'display:none;'}font-size:1.3em;font-weight:bold;font-family:"Agency FB"}
              div.number,div.table{position:absolute;bottom:12px;font-size:2em;font-weight:bold;font-family:"Agency FB"}
              div.number{right:10px;}div.table{left:10px;}
              div.time span{display:inline-block;margin:0 10px;font-size:1em;}
              div.time{border-bottom:1px solid #000;position:relative;margin-top:10px;}
              .server{border-bottom:1px solid #000;padding-bottom:1px;text-align:left;}
              .server .wrap{display:flex;padding:0 10px;}
              .server .text{flex:2;}.server .value{flex:3;}
              .customer {${printCustomer ? '' : 'display:none;'}}
              .customer p{text-align:left;padding-bottom:2px;}
              .customer p:last-child{border-bottom:1px solid #000;padding-bottom:0px;}
              .customer .text{display:inline-block;min-width:32px;margin-left:5px;}
              .customer .tel{letter-spacing:2px;}
              .customer .ext{margin-left:10px;}
              .customer {font-size:1.2em;font-family:'Tensentype RuiHeiJ-W2'}
              .customer .space{ margin-left:5px; }
              section.body{padding:10px 0px;}
              table.receipt{width:100%;border-spacing:0;border-collapse:collapse;margin:5px 0;}
              .receipt tbody tr{display:flex;position:relative;align-items:flex-start;vertical-align:text-top;}
              td.item{flex:1;display:flex;flex-direction:column;margin-left:5px}
              td.item .main{width:100%;}
              .main .side{font-size:0.9em;margin-left:2px;}
              td.price{text-align:right;}
              .sub{text-indent:20px;} 
              td.qty{text-align:center;font-weight:bold;width:17px;padding-right:5px;}
              .zhCN .price{${printPrimaryPrice ? 'display:initial' : 'display:none'}}
              .usEN .price{${printSecondaryPrice ? 'display:initial' : 'display:none'}}          
              footer{font-family:'Agency FB';}
              section.column{display:flex;}
              .payment{min-width:150px;${printPayment ? 'display:flex;flex-direction:column;' : 'display:none;'}}
              .empty{flex:1}
              .payment p{display:flex;font-family:'Tensentype RuiHeiJ-W2';width:200px;}
              .payment .text{flex:1;text-align:right;}
              .payment .value{min-width:40%;text-align:right;}
              .settle{${printPayment ? '' : 'display:none;'}}
              .payment p.bold{font-weight:bold;font-size:22px;}
              section.details{border:1px dashed #000;margin-top:5px;text-align:center;}
              .details p{display:flex;}
              .details .text{text-align:right;padding-right:20px;flex:5;}
              .details .value{text-align:left;flex:6}
              .suggestion{border:1px dashed #000;padding:5px;display:flex;flex-direction:column;text-align:center;}
              .suggestion h5{font-size:22px;}
              .suggestion i{font-style: italic;font-size:14px;}
              .suggestion div{display:flex;justify-content: center;width:75%;margin:auto;}
              .dash{margin: 0 5px;}
              .tips{margin-left:15px;}
              section.note{text-align:center;font-weight:lighter;margin-top:10px;border-top:1px solid #000;}
              .printTime{${printActionTime ? '' : 'display:none;'}font-weight:bold;text-align:center;}
              .tm{text-align: center;margin:5px;}
              .tradeMark {font-weight: bold;display: inline-block;padding: 5px 7px;background: #000;color: #fff;}
              .zhCN{font-family:'${primaryFont}';font-size:${primaryFontSize};${printPrimary ? '' : 'display:none!important;'}}
              .usEN{font-family:'${secondaryFont}';font-size:${secondaryFontSize};${printSecondary ? '' : 'display:none!important;'}}
          </style>`
}
function createFooter(table, ctrl, device, ticket) {
    if (!ticket.hasOwnProperty('payment')) return "";

    let { footer } = ctrl;
    let { payment } = ticket;
    let suggestion = '';

    if (table.tipSuggestion && ticket.type === 'PRE_PAYMENT') {
        let percentage = table.tipPercentages ? table.tipPercentages.split(",") : [15, 18, 20];
        let data = [{
            percentage: percentage[0],
            value: toFixed(payment.balance * percentage[0] / 100, 2).toFixed(2),
            total: toFixed(payment.balance * (1 + percentage[0] / 100), 2).toFixed(2)
        }, {
            percentage: percentage[1],
            value: toFixed(payment.balance * percentage[1] / 100, 2).toFixed(2),
            total: toFixed(payment.balance * (1 + percentage[1] / 100), 2).toFixed(2)
        }, {
            percentage: percentage[2],
            value: toFixed(payment.balance * percentage[2] / 100, 2).toFixed(2),
            total: toFixed(payment.balance * (1 + percentage[2] / 100), 2).toFixed(2)
        }].map(kindness =>
            `<div class="outer">
                <span>${kindness.percentage}%<span class="dash">-</span>$ ${kindness.value}</span>
                <span class="tips">( $ ${kindness.total} )</span>
            </div>`).join("").toString();

        suggestion = `<section class="suggestion">
                        <h5>Tips Suggestion</h5>
                        <i>These tip amounts are provided for your convenience.</i>
                        ${data}
                      </section>`
    }

    let delivery = parseFloat(payment.delivery) > 0 ? `<p><span class="text">Delivery:</span><span class="value">${payment.delivery.toFixed(2)}</span></p>` : "";
    let note = footer ? footer.map(text => `<p>${text}</p>`).join("").toString() : "";
    let settle = [];
    let applyCoupon = ticket.payment.hasOwnProperty('applyCoupon') ? ticket.payment.applyCoupon : true;

    if (ticket.coupon && applyCoupon) {
        settle.push(`<section class="details">
                    <h3>${ticket.coupon.for} - ${ticket.coupon.discount} OFF</h3>
                    </section>`)
    }

    if (payment.settled) {
        payment.log.forEach(log => {
            switch (log.type) {
                case 'CASH':
                    settle.push(`<section class="details">
                                <h3>Paid by Cash - Thank You</h3>
                                <p>
                                <span class="text">Paid:</span>
                                <span class="value">$${log.paid.toFixed(2)}</span>
                                </p>
                                <p>
                                <span class="text">Change:</span>
                                <span class="value">$${log.change.toFixed(2)}</span>
                                </p>
                            </section>`)
                    break;
                case 'CREDIT':
                    let cc = log.number ? `(${log.number})` : '';
                    settle.push(`<section class="details">
                                <h3>Paid by CREDIT Card ${cc} - Thank You</h3>
                                <p>
                                <span class="text">Paid:</span>
                                <span class="value">$${log.paid.toFixed(2)}</span>
                                </p>
                            </section>`)
                    break;
                case 'GIFT':
                    settle.push(`<section class="details">
                                <h3>Paid by GIFT Card - Thank You</h3>
                                <p>
                                <span class="text">Paid:</span>
                                <span class="value">$${log.paid.toFixed(2)}</span>
                                </p>
                            </section>`)
                    break;
                default:
                    settle.push(`<section class="details">
                                    <h3>Paid by ${log.type} - Thank You</h3>
                                </section>`)
            }
        })
    }

    if (ticket.status === 0) {
        settle.push(`<section class="details">
        <h3>*** Ticket Voided ***</h3>
         <p>
          <span class="text">Reason:</span>
          <span class="value">${ticket.void.note}</span>
        </p>
        <h3>Void by: ${ticket.void.by} @ ${moment(ticket.void.time).format('HH:mm:ss')}</h3>
      </section>`)
    }

    let detail = [];
    ['subtotal', 'discount', 'tax', 'delivery', 'tip', 'gratuity', 'total'].forEach(key => {
        if (payment[key] > 0) {
            let cls = '';
            let value = payment[key].toFixed(2);
            let text = key.toCapitalCase();
            key === 'discount' && (value = '- ' + value);
            if (key === 'total') {
                value = payment.balance.toFixed(2);
                cls = 'bold';
            }
            if (key === 'gratuity') {
                text = 'Service Fee';
            }
            detail.push(`<p class="${cls}">
                            <span class="text">${text}:</span>
                            <span class="value">${value}</span>
                        </p>`)
        }
    });
    let discount = parseFloat(payment.discount) !== 0 ?
        `<p><span class="text">Disc.:</span><span class="value">- ${payment.discount.toFixed(2)}</span></p>` : "";
    let tip = parseFloat(payment.tip) > 0 ?
        `<p><span class="text">Tip:</span><span class="value">${payment.tip}</span></p>` : "";
    let gratuity = parseFloat(payment.gratuity) > 0 ?
        `<p><span class="text">Gratuity:</span><span class="value">${payment.gratuity}</span></p>` : "";

    let tradeMark = '';

    if (ticket.source !== 'POS' && (/cashier/i).test(device)) {
        tradeMark = `<p class="tm"><span class="tradeMark">${ticket.source}</span></p>`;
    }

    return `<footer>
              <section class="column">
                <div class="empty"></div>
                <div class="payment">
                  ${detail.join("").toString()}
                </div>
              </section>
              <div class="settle">
                ${suggestion + settle.join("").toString()}
              </div>
              <section class="note">${note}</section>
              ${tradeMark}
              <p class="printTime">${device} print @ ${moment().format('hh:mm:ss')}</p>
            </footer>`
}


export default Printer