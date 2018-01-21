var Printer = function (plugin, config, station) {
    this.plugin = plugin;
    this.config = config.store;
    this.station = station;
    this.setting = config.printers;
    this.devices = station ? station.printers || Object.keys(config.printers) : Object.keys(config.printers);
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
    this.initial = function (plugin, config, station) {
        this.plugin = plugin;
        this.config = config.store;
        this.station = station;
        this.setting = config.printers;
        this.devices = station.printers || Object.keys(config.printers);
    }

    this.setTarget = function (name) {
        this.target = name || this.station.receipt || 'cashier';
        return this
    }

    this.openCashDrawer = function () {
        if (this.station.cashDrawer.enable) {
            this.plugin.PRINT_INIT('Open');
            this.plugin.SET_PRINTER_INDEX(this.station.cashDrawer.bind || this.station.receipt);
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
        const { name, address, city, state, zipCode, contact } = this.config;

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
        let printer = [];
        switch (this.target) {
            case "All":
            case "Ticket":
                printer = this.devices.filter(device => !(/cashier/i).test(device));
                printer.splice(0, 0, this.station.receipt || 'cashier');
                break;
            case 'Receipt':
                printer = [this.station.receipt || 'cashier'];
                break;
            case 'Order':
                printer = this.devices.filter(device => !(/cashier/i).test(device));
                break;
            default:
                printer = [this.target]
        }
        return printer;
    }

    this.print = function (raw, receipt) {
        const printers = this.getPrinters();
        const ticket = raw.type;

        printers.forEach(printer => {
            const setting = this.setting[printer];

            if (!setting) return false;
            if (!receipt && !setting.print.includes(ticket)) return false;
            if (setting.type === 'label') {
                this.printLabel(printer, raw);
                return false;
            }

            const items = raw.content.filter(item => item.printer[printer]);

            if (setting.type === 'hibachi' && items.length > 0) {
                const slicer = (array) => {
                    let next = [];
                    let current = [];
                    array.filter(item => {
                        const index = current.findIndex(i => i.seat === item.seat);
                        index === -1 ? current.push(item) : next.push(item);
                    });
                    this.printHibachi(printer, raw, current);
                    next.length && slicer(next);
                }
                slicer(items);
                return false;
            }

            if (items.length === 0) return false;

            const header = createHeader(this.config, setting, raw);
            const list = createList(printer, setting, raw, false);

            if (list.length === 0) return false;

            const style = createStyle(setting);
            const footer = createFooter(this.config, setting, printer, raw);
            const html = header + list + footer + style;

            setting.control.buzzer && this.buzzer(printer);

            this.plugin.PRINT_INIT('Ticket Receipt');
            this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html);
            this.plugin.SET_PRINTER_INDEX(printer);
            this.plugin.PRINT();

            if (Array.isArray(setting.reprint) && setting.reprint.includes(ticket)) {
                this.plugin.PRINT_INIT(`Reprint ticket ${raw.number}`)
                this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html)
                this.plugin.SET_PRINTER_INDEX(printer)
                this.plugin.PRINT()
            }
        });
        this.reset();
    }

    this.preview = function (printer, ticket) {
        printer = printer || 'cashier';

        const setting = this.setting[printer];
        const header = createHeader(this.config, setting, ticket);
        const list = createList(printer, setting, ticket, true);
        const style = createStyle(setting);
        const footer = createFooter(this.config, setting, printer, ticket);
        const html = header + list + footer + style;

        return html;
    }

    this.printLabel = function (name, order) {
        const {
            printPrimary,
            printSecondary,
            primaryFont,
            secondaryFont,
            primaryFontSize,
            secondaryFontSize
        } = this.config.printers[name]['control'];

        const style = `<style>
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

    this.printHibachi = function (printer, order, items) {
        const { name, address, city, state, zipCode, contact } = this.config;
        const layout = {
            left: [{
                seat: 7,
                rect: [196, 8, 62, 140, 0, 1],
                number: [395, 55, 130, 34, "7"],
                text: [330, 20, 130, 34]
            }, {
                seat: 8,
                rect: [196, 70, 62, 140, 0, 1],
                number: [395, 117, 130, 34, "8"],
                text: [330, 80, 130, 34]
            }, {
                seat: 9,
                rect: [196, 131, 62, 140, 0, 1],
                number: [395, 178, 130, 34, "9"],
                text: [330, 142, 130, 34]
            }, {
                seat: 10,
                rect: [196, 193, 62, 140, 0, 1],
                number: [395, 241, 130, 34, "10"],
                text: [330, 205, 130, 34]
            }, {
                seat: 6,
                rect: [335, 8, 62, 140, 0, 1],
                number: [533, 55, 130, 34, "6"],
                text: [470, 20, 130, 34]
            }, {
                seat: 5,
                rect: [474, 8, 62, 140, 0, 1],
                number: [673, 55, 130, 34, "5"],
                text: [610, 20, 130, 34]
            }, {
                seat: 4,
                rect: [613, 8, 62, 140, 0, 1],
                number: [812, 55, 130, 34, "4"],
                text: [750, 20, 130, 34]
            }, {
                seat: 3,
                rect: [613, 70, 62, 140, 0, 1],
                number: [812, 117, 130, 34, "3"],
                text: [750, 80, 130, 34]
            }, {
                seat: 2,
                rect: [613, 131, 62, 140, 0, 1],
                number: [812, 178, 130, 34, "2"],
                text: [750, 142, 130, 34]
            }, {
                seat: 1,
                rect: [613, 193, 62, 140, 0, 1],
                number: [812, 241, 130, 34, "1"],
                text: [750, 205, 130, 34]
            }],

            right: [{
                seat: 10,
                rect: [196, 8, 62, 140, 0, 1],
                number: [395, 55, 130, 34, "10"],
                text: [330, 20, 130, 34]
            }, {
                seat: 9,
                rect: [196, 70, 62, 140, 0, 1],
                number: [395, 117, 130, 34, "9"],
                text: [330, 80, 130, 34]
            }, {
                seat: 8,
                rect: [196, 131, 62, 140, 0, 1],
                number: [395, 178, 130, 34, "8"],
                text: [330, 142, 130, 34]
            }, {
                seat: 7,
                rect: [196, 193, 62, 140, 0, 1],
                number: [395, 241, 130, 34, "7"],
                text: [330, 205, 130, 34]
            }, {
                seat: 6,
                rect: [335, 193, 62, 140, 0, 1],
                number: [533, 241, 130, 34, "6"],
                text: [470, 205, 130, 34]
            }, {
                seat: 5,
                rect: [474, 193, 62, 140, 0, 1],
                number: [673, 241, 130, 34, "5"],
                text: [610, 205, 130, 34]
            }, {
                seat: 1,
                rect: [613, 8, 62, 140, 0, 1],
                number: [812, 55, 130, 34, "1"],
                text: [750, 20, 130, 34]
            }, {
                seat: 2,
                rect: [613, 70, 62, 140, 0, 1],
                number: [812, 117, 130, 34, "2"],
                text: [750, 80, 130, 34]
            }, {
                seat: 3,
                rect: [613, 131, 62, 140, 0, 1],
                number: [812, 178, 130, 34, "3"],
                text: [750, 142, 130, 34]
            }, {
                seat: 4,
                rect: [613, 193, 62, 140, 0, 1],
                number: [812, 241, 130, 34, "4"],
                text: [750, 205, 130, 34]
            }]
        };

        CLODOP.PRINT_INIT('Ticket Hibachi');
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
        CLODOP.ADD_PRINT_TEXT(76, 88, 100, 21, "HIBACHI");
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_TEXT(96, 88, 100, 21, order.table);
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 14);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        CLODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_TEXT(96, 188, 250, 21, order.number);
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 18);
        CLODOP.SET_PRINT_STYLEA(0, "Alignment", 3);
        CLODOP.SET_PRINT_STYLEA(0, "Bold", 1);
        CLODOP.SET_PRINT_STYLEA(0, "ItemType", 1);
        CLODOP.SET_PRINT_STYLEA(0, "Horient", 2);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_TEXT(120, 42, 110, 20, "Date: " + moment(order.time).format('MM-DD-YYYY'));
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_TEXT(120, 145, 110, 20, "Time: " + moment(order.time).format('HH:mm:ss'));
        CLODOP.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
        CLODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        CLODOP.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
        CLODOP.ADD_PRINT_LINE(138, 6, 138, 266, 0, 1);

        layout[order.layout].forEach((table) => {
            let item = items.find(i => i.seat === table.seat);
            if (item) {
                let food = item.usEN + (item.side.usEN || "") + "\n";
                item.choiceSet.forEach(set => {
                    food += set.usEN + " "
                })
                table.text.push(food);
            }

            CLODOP.ADD_PRINT_RECT(...table.rect);
            CLODOP.ADD_PRINT_TEXT(...table.number);
            CLODOP.SET_PRINT_STYLEA(0, "Angle", 90);
            CLODOP.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
            CLODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
            CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
            CLODOP.ADD_PRINT_TEXT(...table.text);
            CLODOP.SET_PRINT_STYLEA(0, "Angle", 90);
            CLODOP.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
            CLODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
            CLODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
        });

        CLODOP.PRINT();
    }

    this.printCreditCard = function (trans, reprint) {
        const store = this.config;
        const device = this.station.receipt || 'cashier';
        const timestamp = moment(Number(trans.trace.time), 'YYYYMMDDHHmmss');
        const date = timestamp.format("MM / DD / YYYY");
        const time = timestamp.format("HH:mm:ss");

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
                    <p><span class="text">Transaction:</span><span class="value"># ${trans.trace.trans}</span></p>
                    <p><span class="text">Card Type</span><span class="value">${trans.account.type}</span></p>
                    <p><span class="text">Account</span><span class="value">**** **** **** ${trans.account.number}</span></p>
                    <p><span class="text">Entry</span><span class="value">${trans.account.entry}</span></p>
                    <p><span class="text">Present</span><span class="value">${trans.account.present}</span></p>
                    <p class="bold amount"><span class="text">Amount:</span><span class="value">$ ${(trans.amount.approve - trans.amount.tip).toFixed(2)}</span></p>
                    ${due}
                    <p class="bold"><span class="text">Tip:</span><span class="value ul">$ ${parseFloat(trans.amount.tip) > 0 ? trans.amount.tip : ''}</span></p>
                    <p class="bold"><span class="text">Total:</span><span class="value ul">$</span></p>
                    <p><span class="text">Auth Code</span><span class="value">${trans.host.auth}</span></p>
                    <p><span class="text">Response</span><span class="value">${trans.host.msg}</span></p>
                    <p><span class="text">From Station</span><span class="value">${trans.station}</span></p>
                  </article>
                  <footer>
                    <div class="index">${trans.index || ""}</div>
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
                  footer{position:relative;}
                  .index{font-size:30px;font-weight:bold;position:absolute;bottom:5px;left:10px;}
                </style>`;
        }
    }

    this.printGiftCard = function (title, card) {
        let { name, address, city, state, zipCode, contact } = this.config;

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
        CLODOP.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        CLODOP.PRINT();
    }

    this.printReport = function (report) {
        const store = this.config;
        const html = createReport();
        const style = createStyle();

        this.plugin.PRINT_INIT("Report");
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        this.plugin.PRINT();

        function createReport() {
            let content = "";

            for (let title in report) {
                if (report.hasOwnProperty(title) && report[title]) {
                    let section = "";
                    section += report[title].map(({ text, value, style }) =>
                        `<p class="${style}"><span class="text">${text}</span><span class="value">${value}</span></p>`
                    ).join("").toString();
                    content += `<section class="type"><h4>${title}</h4>${section}</section>`;
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
                      <h3>Sales Report</h3>
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
                    .header h3{font-size:1.25em;font-weight:bold;}
                    div.type{margin:10px;}
                    div.type h3{font-weight:lighter;font-size:1.3em;}
                    div.type h5{margin-top:5px;font-size:1.25em;}
                    section.type{margin-bottom:10px;}
                    section h4{text-align:center;border:1px dashed #000;margin-bottom:10px;letter-spacing:1px;}
                    p{display:flex;}
                    p .text{flex:1;}
                    .indent .text{text-indent:1.5em;font-style:italic;}
                    .bold .value{font-weight:bold;}
                    .space {margin-bottom:10px;}
                    .total .value{border-top:1px dashed #000;}
                    .breakline {border-bottom:1px dashed #000;}
                    .value{min-width:90px;text-align:right;}
                    footer p{text-align:center;border-top:1px solid #000;margin-top:15px;display:block;}
                </style>`;
        }
    }

    this.printPreBatchReport = function (data) {
        const store = this.config;
        const date = moment().format("MM/DD/YYYY");
        const time = moment().format("hh:mm:ss");
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
        this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        this.plugin.PRINT();
    }

    this.printBatchReport = function (data) {
        const store = this.config;
        const batchTime = moment(Number(data.time), 'YYYYMMDDHHmmss')
        const date = batchTime.format("MM/DD/YYYY");
        const time = batchTime.format("hh:mm:ss");
        const {
            credit,
            debit,
            ebt
        } = data.amount;
        const total = (parseFloat(credit) + parseFloat(debit) + parseFloat(ebt)).toFixed(2);

        const html = `<article>
                    <section class="data">
                    <h3>Batch Report</h3>
                      <p class="time"><span class="text">${date}</span><span class="value">${time}</span></p>
                      <p><span class="text">MID</span><span class="value">${data.mid}</span></p>
                      <p><span class="text">Device</span><span class="value">${data.tid}</span></p>
                      <p><span class="text">Terminal</span><span class="value">${data.terminal}</span></p>
                      <p><span class="text">Batch #</span><span class="value">${data.batch}</span></p>
                      <p><span class="text">Result</span><span class="value">${data.resMsg}</span></p>
                      <p><span class="text">Total</span><span class="value">$ ${total}</span></p>
                    </section>
                    <section class="data">
                      <h3>Overview</h3>
                      <p><span class="text">Credit ( ${data.count.credit} )</span><span class="value">$ ${data.amount.credit}</span></p>
                      <p><span class="text">Debit ( ${data.count.debit} )</span><span class="value">$ ${data.amount.debit}</span></p>
                    </section>
                  </article>
                  <footer>
                    <p>END OF BATCH REPORT</p>
                    <p>Powered By United POS&reg;</p>
                  </footer>`;
        const style = `<style>
                  *{margin:0;padding:0;font-family:'Agency FB';}
                  article p{display:flex;}
                  article .text{flex:2;}
                  article .value{flex:4;text-align:right}
                  section.data{margin:15px 0;}
                  .data h3{border-bottom:1px dashed #000;text-align:center;}
                  footer{text-align:center;}`;

        this.plugin.PRINT_INIT('Batch Report');
        this.plugin.ADD_PRINT_HTM(0, 0, "100%", "100%", html + style);
        this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        this.plugin.PRINT();
    }

    this.printTimeCardReport = function (data) {
        const store = this.config;
        const date = moment().format("MM/DD/YYYY");
        const time = moment().format("hh:mm:ss");
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
        this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        this.plugin.PRINT();
    }

    this.printCashInReport = function (data) {
        const store = this.config;
        const date = moment().format("MM/DD/YYYY");
        const time = moment().format("hh:mm:ss");

        const html = `<section class="header">
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
        const style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
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
        this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        this.plugin.PRINT();
    }

    this.printCashOutReport = function (data, detail) {
        const store = this.config;
        const date = moment().format("MM/DD/YYYY");
        const time = moment().format("hh:mm:ss");
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

        const html = `<section class="header">
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
        const style = `<style>*{margin:0;padding:0;font-family:'Agency FB';}
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
        this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        this.plugin.PRINT();
    }

    this.printReservationTicket = function (data) {
        const store = this.config;
        const {
            queue,
            name
        } = data;
        const date = moment().format("MM/DD/YYYY");
        const time = moment().format("hh:mm:ss");
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
        this.plugin.SET_PRINTER_INDEX(this.station.receipt || 'cashier');
        this.plugin.PRINT();
    }

    this.reset = function () {
        this.target = 'All';
        this.template = '';
    }
    return this
}

/*
    Private methods
*/

function createHeader(store, setting, raw) {
    const { type, time, number, server, cashier, station, table, guest, customer } = raw;
    const phone = customer.phone ? customer.phone.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1.$2.$3") : null;
    const title = setting.title[type] || type.replace('_', ' ').toCapitalCase();
    const date = moment(Number(time)).format("MM-DD-YYYY");
    const placeTime = moment(Number(time)).locale('en').format("hh:mm a");
    const handler = `<p><span class="wrap">
                        <span class="text">Server:</span><span class="value">${server}</span>
                        <span class="text">Station:</span><span class="value">${station || ""}</span>
                      </span></p>`;

    const { address, distance, duration, city, name, note } = customer;

    let information = "";

    information += phone ? `<p><span class="value tel">${phone}</span><span class="ext">${customer.extension}</span></p>` : "";
    information += address ? `<p><span class="value addr">${address}</span></p>` : "";
    information += (city && store.city.toUpperCase() !== city.toUpperCase()) ? `<p><span class="value">${city}</span><span class="space">${distance}</span><span class="space">${duration}</span></p>` : "";
    information += name ? `<p><span class="value">${name}</span></p>` : "";
    information += note ? `<p><span class="value">${note}</span></p>` : "";

    return `<section class="header">
                <div class="store">
                    <h3>${store.name}</h3>
                    <h5>${store.address}</h5>
                    <h5>${store.city} ${store.state} ${store.zipCode}</h5>
                    <h5>${store.contact}</h5>
                </div>
                <h1>${title}</h1>
                <div class="time">
                    <span>Date: ${date}</span>
                    <span>Time: ${placeTime}</span>
                    <div class="ticketNumber">${number}</div>
                    <div class="tableName">${table || ""}</div>
                </div>
                <div class="server">${handler}</div>
                <div class="customer">${information}</div>
            </section>`;
}

function createList(printer, setting, invoice, preview) {
    const list = JSON.parse(JSON.stringify(invoice.content));
    let { categorize, prioritize, mode } = setting.control;
    const { languages } = setting.layout;
    const primary = languages.find(t => t.ref === 'usEN');
    const secondary = languages.find(t => t.ref === 'zhCN');

    let content = [], items = [];

    if (preview) mode = "preview";

    switch (mode) {
        case "normal":
            items = !invoice.print ?
                list.filter(item => item.printer[printer]) :
                list.filter(item => item.printer[printer] && item.diffs !== 'removed');
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
            items = !invoice.print ?
                list.filter(item => item.printer[printer]) :
                list.filter(item => item.printer[printer] && item.diffs !== 'removed');
    }

    if (items.length === 0) return [];

    const renderQty = items.filter(i => i.qty > 1).length > 0;

    prioritize && items.sort((p, n) => (p.priority || 0) < (n.priority || 0));

    if (categorize) {
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
                content += `<div class="category"><span class="zhCN">${categoryMap[category]}</span><span class="usEN">${category}</span></div>`;
                content += sorted[category].map(item => mockup(item, renderQty)).join("").toString();
            }
        }
    } else {
        content = items.map(item => mockup(item, renderQty)).join("").toString();
    }

    return `<section class="receipt">${content}</section>`

    function mockup(item, renderQty) {
        const { replace = false, zhCN, usEN, note } = item.printer[printer];
        const idCN = secondary.id ? item.menuID + ' ' : '';
        const idEN = primary.id ? item.menuID + ' ' : '';
        const nameCN = replace ? idCN + zhCN : idCN + item.zhCN;
        const nameEN = replace ? idEN + usEN : idEN + item.usEN;
        const sideCN = item.side.zhCN || "";
        const sideEN = item.side.usEN || "";
        const cnPrice = secondary.price ? `<span class="price">${item.total}</span>` : "";
        const enPrice = primary.price ? `<span class="price">${item.total}</span>` : "";
        const enableChinese = secondary.enable;
        const enableEnglish = primary.enable;
        const qty = renderQty ? `<span class="qty">${item.qty === 1 ? "" : item.qty}</span>` : "";
        const diffs = item.diffs || "";

        let chineseItem = "", englishItem = "", chineseSub = "", englishSub = "";

        item.choiceSet.forEach(set => {
            if (set.hasOwnProperty(print) && !set.print.includes(printer)) return;
            const _qty = set.qty !== 1 ? set.qty + " x " : "";
            const _price = Math.abs(set.price) > 0 ? `( ${set.price.toFixed(2)} )` : "";

            if (diffs === 'removed') {
                chineseSub += enableChinese ? `<p><del></del><span>${_qty}</span><span>${set.zhCN}</span><span>${_price}</span></p>` : "";
                englishSub += enableEnglish ? `<p><del></del><span>${_qty}</span><span>${set.usEN}</span><span>${_price}</span></p>` : "";
            } else {
                chineseSub += enableChinese ? `<p><span>${_qty}</span><span>${set.zhCN}</span><span>${_price}</span></p>` : "";
                englishSub += enableEnglish ? `<p><span>${_qty}</span><span>${set.usEN}</span><span>${_price}</span></p>` : "";
            }
        })
        if (diffs === 'removed') {
            chineseItem = enableChinese ? `<div class="zhCN">
                            <div class="main">
                                <del></del>
                                ${qty}
                                <div class="wrap">
                                    <span class="item">${nameCN}</span>
                                    <span class="side">${sideCN}</span>
                                </div>
                                ${cnPrice}
                            </div>
                            <div class="sub">${chineseSub}</div>
                        </div>`: "";
            englishItem = enableEnglish ? `<div class="usEN">
                            <div class="main">
                                <del></del>
                                ${qty}
                                <div class="wrap">
                                    <span class="item">${nameEN}</span>
                                    <span class="side">${sideEN}</span>
                                </div>
                                ${enPrice}
                            </div>
                            <div class="sub">${englishSub}</div>
                        </div>`: "";
        } else {
            chineseItem = enableChinese ?
                `<div class="zhCN">
                    <div class="main">
                        ${qty}
                        <div class="wrap">
                            <span class="item">${nameCN}</span>
                            <span class="side">${sideCN}</span>
                        </div>
                        ${cnPrice}
                    </div>
                    <div class="sub">${chineseSub}</div>
                </div>`: "";
            englishItem = enableEnglish ?
                `<div class="usEN">
                    <div class="main">
                        ${qty}
                        <div class="wrap">
                            <span class="item">${nameEN}</span>
                            <span class="side">${sideEN}</span>
                        </div>
                        ${enPrice}
                    </div>
                    <div class="sub">${englishSub}</div>
                </div>`: "";
        }
        return languages[0].ref === "zhCN" ? chineseItem + englishItem : englishItem + chineseItem;
    }
}

function createStyle(setting) {
    const { contact, title, customer, payment, languages } = setting.layout;
    const primary = languages.find(t => t.ref === 'usEN');
    const secondary = languages.find(t => t.ref === 'zhCN');
    const fontFamily = navigator.language === 'zh-CN' ? "微软雅黑" : "Microsoft YaHei";

    return `<style>\
              *{margin:0;padding:0}\
              section.header{font-family:'Agency FB';text-align:center;}\
              div.store{margin-bottom:10px;${contact ? '' : 'display:none;'}}\
              h3{font-size:1.25em;}\
              h5{font-size:16px;font-weight:lighter}\
              h1{${title ? '' : 'display:none;'}font-size:1.5em;font-family:"${fontFamily}"}\
              .ticketNumber,.tableName{position:absolute;bottom:12px;font-size:2em;font-weight:bold;}\
              footer .ticketNumber,footer .tableName{top: 5px;bottom: initial;}\
              .ticketNumber{right:10px;}.table{left:10px;}\
              div.time span{display:inline-block;margin:0 10px;font-size:1em;}\
              div.time{border-bottom:1px solid #000;position:relative;margin-top:10px;}\
              .server{border-bottom:1px solid #000;padding-bottom:1px;text-align:left;}\
              .server .wrap{display:flex;padding:0 10px;}\
              .server .text{flex:2;}.server .value{flex:3;}\
              .customer {${customer ? '' : 'display:none;'}font-size:1.2em;font-family:'Tensentype RuiHeiJ-W2';text-align:left;}\
              .customer p:last-child{border-bottom:1px solid #000;}\
              .tel{letter-spacing:2px;}.ext{margin-left:10px;}\
              section.receipt{width:100%;margin:5px 0;}\
              .main{display:flex;position:relative;width:100%;}\
              .main .wrap,.empty{flex:1;}\
              .main .side{font-size:0.9em;margin-left:2px;}\
              .sub{padding-left:20px;font-size:0.8em;}\
              .sub p{position:relative;width:100%;}\
              .qty{min-width:15px;margin-right:5px;}\     
              footer{font-family:'Agency FB';}\
              section.column{display:flex;}\
              .payment{min-width:150px;${payment ? 'display:flex;flex-direction:column;' : 'display:none;'}}\
              .payment p{display:flex;font-family:'Tensentype RuiHeiJ-W2';width:200px;}\
              .payment .text{flex:1;text-align:right;}\
              .payment .value{min-width:40%;text-align:right;}\
              .settle{${payment ? '' : 'display:none;'}}\
              .payment p.bold{font-weight:bold;font-size:22px;}\
              .details{border:1px dashed #000;margin-top:5px;text-align:center;}\
              .details h3{letter-spacing:1px;}\
              .details p{display:flex;}\
              .details .text{text-align:right;padding-right:20px;flex:5;}\
              .details .value{text-align:left;flex:6}\
              .suggestion{border:1px dashed #000;padding:5px;display:flex;flex-direction:column;text-align:center;}\
              .suggestion h5{font-size:22px;}\
              .suggestion i{font-style: italic;font-size:14px;}\
              .suggestion div{display:flex;justify-content: center;width:75%;margin:auto;}\
              .dash{margin: 0 5px;}\
              .tips{margin-left:15px;}\
              footer p{text-align:center;}\
              .slogan{font-weight:lighter;margin-top:10px;border-top:1px solid #000;position:relative;}\
              .tradeMark {font-weight: bold;display: inline-block;padding: 5px 7px;background: #000;color: #fff;}\
              .zhCN{font-family:'${secondary.fontFamily}';font-size:${secondary.fontSize}px;}\
              .usEN{font-family:'${primary.fontFamily}';font-size:${primary.fontSize}px;}\
              del{display:block;position:absolute;width:inherit;height:2px;background:#000;top:40%;}\
          </style>`
}

function createFooter(config, setting, printer, ticket) {
    if (!ticket.hasOwnProperty('payment')) return "";

    const { ticketNumber, tableName, jobTime, tradeMark, content } = setting.control.footer;
    const { enable, percentages } = config.tipSuggestion;
    const { type, payment, coupons, number, table } = ticket;

    let suggestions = "";

    if (enable && type === 'PRE_PAYMENT') {
        const { balance } = payment;
        const data = percentages.split(",").map(pct => ({
            pct,
            val: (balance * pct / 100).toFixed(2),
            tip: (balance * (1 + pct / 100)).toFixed(2)
        })).map(tip =>
            `<div class="outer">
                <span>${tip.pct}%<span class="dash">-</span>$ ${tip.val}</span>
                <span class="tips">( $ ${tip.tip} )</span>
            </div>`).join("").toString();

        suggestions = `<section class="suggestion">\
                            <h5>Tips Suggestion</h5>\
                            <i>These tip amounts are provided for your convenience.</i>\
                            ${data}\
                        </section>`
    }

    const slogan = content.map(text => `<p>${text}</p>`).join("").toString();

    let settle = [];
    const applied = payment.applyCoupon || true;

    if (coupons && applied)
        coupons.forEach(coupon => settle.push(`<section class="details"><h3>${coupon.alias}</h3></section>`));

    payment.log.forEach(log => {
        const { type, subType, lfd, paid, change } = log;
        switch (type) {
            case 'CASH':
                settle.push(`<section class="details">
                                <h3>Paid by Cash - Thank You</h3>
                                <p>
                                <span class="text">Paid:</span>
                                <span class="value">$ ${paid.toFixed(2)}</span>
                                </p>
                                <p>
                                <span class="text">Change:</span>
                                <span class="value">$ ${change.toFixed(2)}</span>
                                </p>
                            </section>`)
                break;
            case 'CREDIT':
                settle.push(`<section class="details">
                                <h3>CREDIT CARD - ${subType} ( ${lfd} )</h3>
                                <p>
                                <span class="text">Paid:</span>
                                <span class="value">$ ${paid.toFixed(2)}</span>
                                </p>
                            </section>`)
                break;
            case 'GIFT':
                settle.push(`<section class="details">
                                <h3>Paid by GIFT Card - Thank You</h3>
                                <p>
                                <span class="text">Paid:</span>
                                <span class="value">$ ${paid.toFixed(2)}</span>
                                </p>
                            </section>`)
                break;
            default:
                settle.push(`<section class="details"><h3>Paid by ${subType} - Thank You</h3></section>`)
        }
    })

    if (!ticket.settled && payment.paid !== 0)
        settle.push(`<section class="details"><h3>Balance Due: $ ${payment.remain.toFixed(2)}</h3></section>`);


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
    ['subtotal', 'discount', 'tax', 'delivery', 'tip', 'gratuity', 'rounding', 'total'].forEach(key => {
        if (payment[key] > 0) {
            let style = '';
            let value = payment[key].toFixed(2);
            let text = key.toCapitalCase();

            switch (key) {
                case "discount":
                    value = `- ${value}`;
                    break;
                case "gratuity":
                    text = 'Service Fee';
                    break;
                case "total":
                    value = payment.balance.toFixed(2);
                    style = 'bold';
                    break;
            }

            detail.push(`<p class="${style}"><span class="text">${text}:</span><span class="value">${value}</span></p>`)
        }
    });

    const _provider = ticket.source !== 'POS' && (/cashier/i).test(printer) ? `<p class="tm"><span class="tradeMark">${ticket.source}</span></p>` : "";
    const _time = jobTime ? `<p class="printTime">${printer} print @ ${moment().format('hh:mm:ss')}</p>` : "";
    const _number = ticketNumber ? `<div class="ticketNumber">${number}</div>` : "";
    const _table = tableName ? `<div class="tableName">${table || ""}</div>` : "";
    const extraInfo = _provider + _time + _number + _table;

    return `<footer>
              <section class="column">
                <div class="empty"></div>
                <div class="payment">
                  ${detail.join("").toString()}
                </div>
              </section>
              <div class="settle">
                ${suggestions + settle.join("").toString()}
              </div>
              <div class="slogan">
                ${slogan}
                ${extraInfo}
              </div>
            </footer>`
}


export default Printer