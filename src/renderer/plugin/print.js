var Printer = function (plugin, config) {
    this.plugin = plugin;
    this.config = config;
    this.station = config.station;
    this.setting = config.printer;
    this.devices = Object.keys(config.printer);
    this.job = 'Receipt';

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

    // this.setTarget = function (name) {
    //     this.job = name;
    //     return this
    // }

    this.setPrinter = function (name) {
        this.plugin.SET_PRINTER_INDEX(name)
        return this
    }

    this.openCashDrawer = function () {
        if (this.station.cashDrawer) {
            this.setPrinter(this.station.cashDrawer.bind);
            this.plugin.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(112) + String.fromCharCode(48) + String.fromCharCode(55) + String.fromCharCode(221));
        }
    }

    this.buzzer = function (name) {
        name = name || this.station.printer;
        this.plugin.PRINT_INIT('Buzzer');
        this.setPrinter(name);
        this.plugin.SEND_PRINT_RAWDATA(String.fromCharCode(27) + String.fromCharCode(67) + String.fromCharCode(4) + String.fromCharCode(2) + String.fromCharCode(3));
        return this
    }

    this.getPrinters = function () {
        let printer;
        switch (this.job) {
            case 'All':
                printer = this.devices.filter(device => !(/cashier/i).test(device));
                printer.splice(0, 0, this.station.printer || 'cashier')
                break;
            case 'Receipt':
                printer = [this.station.printer || 'cashier']
                break;
            case 'Order':
                printer = this.devices.filter(device => !(/cashier/i).test(device));
                break;
        }
        return printer
    }

    this.print = function (raw) {
        let printers = this.getPrinters();
        printers.forEach(printer => {
            let setting = this.setting[printer];
            let skip = setting.print.hasOwnProperty(raw.type) ? !setting.print[raw.type] : true;

            if (skip) { this.skip(); return }
            let items = raw.content.filter(item => item.printer[printer]);
            if (items.length === 0) return false;
            //change incoming
            let cursor = 0;
            let { printStore, printType, printCustomer, enlargeDetail } = setting.control;

            cursor = this.header(printStore, printType, printCustomer, enlargeDetail, { number: raw.number, type: raw.type, time: raw.time, customer: raw.customer });
            cursor = this.body(cursor, setting, items);
            setting.control.printPayment && (cursor = this.bottom(cursor, setting, raw.payment));
            cursor = this.footer(cursor, setting)

            if (typeof cursor === 'boolean') { this.skip(); return }

            this.plugin.PRINT();
        })

        this.job = 'All'
    }

    this.header = function (head, title, info, enlarge, content) {
        let { name, address, city, state, zipCode, contact } = this.config.store;
        let { number, type, time, customer } = content;
        let cursor = 0;
        this.plugin.PRINT_INITA(0, 0, 270, 2000, "");
        if (head) {
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
            cursor += 95
        }
        if (title) {
            this.plugin.ADD_PRINT_TEXT(cursor, 88, 100, 21, type.replace('_', ' ').toCapitalCase());
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
            this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
            this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
            this.plugin.SET_PRINT_STYLEA(0, "ItemType", 1);
            this.plugin.SET_PRINT_STYLEA(0, "Horient", 2);
            this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
            this.plugin.ADD_PRINT_TEXT(cursor - 8, 218, 47, 40, number);
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 24);
            this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
            this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
            this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
            cursor += 35
        }
        if (time) {
            this.plugin.ADD_PRINT_TEXT(cursor, 42, 110, 20, "Date: " + moment(time).format('MM-DD-YYYY'));
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
            this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
            this.plugin.ADD_PRINT_TEXT(cursor, 145, 110, 20, "Time: " + moment(time).format('HH:mm:ss'));
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
            this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
            this.plugin.ADD_PRINT_LINE(cursor + 22, 6, cursor + 22, 266, 0, 1);
            cursor += 24
        }
        if (info) {
            if (customer.phone && customer.phone.length === 10) {
                this.plugin.ADD_PRINT_TEXT(cursor, 10, 262, 20, 'Tel: ');
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);

                this.plugin.ADD_PRINT_TEXT(cursor, 42, 262, 20, customer.phone.replace(/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})/, "$1.$2.$3"));
                if (enlarge) {
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Tensentype RuiHeiJ-W2");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
                    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
                } else {
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                    this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
                    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
                }

                cursor += 20
            }
            if (customer.address) {
                this.plugin.ADD_PRINT_TEXT(cursor, 10, 262, 20, 'Addr: ');
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);

                this.plugin.ADD_PRINT_TEXT(cursor, 42, 262, 20, customer.address);
                if (enlarge) {
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Tensentype RuiHeiJ-W2");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
                    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
                } else {
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                    this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
                    this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
                }

                cursor += 20
            }
            if (customer.city) {
                this.plugin.ADD_PRINT_TEXT(cursor, 10, 262, 20, 'City: ');
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);

                this.plugin.ADD_PRINT_TEXT(cursor, 42, 262, 20, customer.city);
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
                this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
                cursor += 20
            }
            if (customer.note) {
                this.plugin.ADD_PRINT_TEXT(cursor, 10, 262, 20, 'Note: ');
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);

                this.plugin.ADD_PRINT_TEXT(cursor, 42, 262, 20, customer.note);
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Agency FB");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 11);
                this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);
                this.plugin.SET_PRINT_STYLEA(0, "LetterSpacing", 1);
                cursor += 20
            }
            this.plugin.ADD_PRINT_LINE(cursor, 6, cursor, 266, 0, 1);
            cursor += 20
        }
        return cursor
    }
    this.body = function (cursor, style, items) {
        let { control } = style;
        
        items.forEach(item => {
            if (control.printPrimary) {
                this.plugin.ADD_PRINT_TEXT(cursor, 0, 30, 20, item.qty > 1 ? item.qty : '');
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
                this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);

                this.plugin.ADD_PRINT_TEXT(cursor, 30, 200, 20, item.zhCN + ' ' + (item.side.zhCN || ''));
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);

                if (control.printPrimaryPrice) {
                    this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, item.total);
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
                    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
                }

                cursor += 22

                item.choiceSet.forEach(choice => {
                    this.plugin.ADD_PRINT_TEXT(cursor, 35, 170, 20, choice.zhCN);
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);

                    this.plugin.ADD_PRINT_TEXT(cursor + 2, 160, 50, 20, (' x ' + choice.qty));
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
                    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 1);

                    this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, choice.price);
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
                    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);

                    cursor += 20
                })
            }
            if (control.printSecondary) {
                this.plugin.ADD_PRINT_TEXT(cursor, 0, 30, 20, item.qty > 1 ? item.qty : '');
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
                this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);

                this.plugin.ADD_PRINT_TEXT(cursor, 30, 200, 20, item.usEN + ' ' + (item.side.usEN || ''));
                this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Light");
                this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);

                if (control.printSecondaryPrice) {
                    this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, item.total);
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Light");
                    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
                }

                cursor += 22

                item.choiceSet.forEach(choice => {
                    this.plugin.ADD_PRINT_TEXT(cursor, 35, 170, 20, choice.usEN);
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Light");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);

                    this.plugin.ADD_PRINT_TEXT(cursor + 2, 160, 50, 20, (' x ' + choice.qty));
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Light");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
                    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 1);

                    this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, choice.price);
                    this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Light");
                    this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
                    this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);

                    cursor += 20
                })
            }

            if (control.printPrimary && control.printSecondary) cursor += 4;
        })

        return cursor
    }
    this.bottom = function (cursor, style, payment) {
        let { control } = style;
        let { subtotal, tax, tip, gratuity, discount, delivery, due } = payment;

        cursor += 20

        this.plugin.ADD_PRINT_TEXT(cursor, 50, 150, 20, 'Subtotal: ');
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);

        this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, subtotal.toFixed(2));
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);

        cursor += 20

        this.plugin.ADD_PRINT_TEXT(cursor, 50, 150, 20, 'Tax: ');
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);

        this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, tax.toFixed(2));
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);

        cursor += 20

        if (delivery > 0) {
            this.plugin.ADD_PRINT_TEXT(cursor, 50, 150, 20, 'Delivery: ');
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
            this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);

            this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, delivery.toFixed(2));
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
            this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);

            cursor += 20
        }

        if (discount > 0) {
            this.plugin.ADD_PRINT_TEXT(cursor, 50, 150, 20, 'Discount: ');
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
            this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);

            this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, discount.toFixed(2));
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
            this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);

            cursor += 20
        }

        cursor += 2

        this.plugin.ADD_PRINT_TEXT(cursor, 50, 150, 20, 'TOTAL: ');
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
        this.plugin.SET_PRINT_STYLEA(0, "Bold", 1);

        this.plugin.ADD_PRINT_TEXT(cursor, 190, 70, 20, due.toFixed(2));
        this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Bold");
        this.plugin.SET_PRINT_STYLEA(0, "Alignment", 3);
        this.plugin.SET_PRINT_STYLEA(0, "FontSize", 14);

        cursor += 20

        return cursor
    }

    this.footer = function (cursor, setting) {
        let { control } = setting

        this.plugin.ADD_PRINT_LINE(cursor, 6, cursor, 266, 0, 1);

        cursor += 2

        control.footer.forEach(line => {
            this.plugin.ADD_PRINT_TEXT(cursor, 10, 262, 20, line);
            this.plugin.SET_PRINT_STYLEA(0, "FontName", "Yuanti-SC Regular");
            this.plugin.SET_PRINT_STYLEA(0, "FontSize", 12);
            this.plugin.SET_PRINT_STYLEA(0, "Alignment", 2);
            cursor += 18
        })
    }
    this.skip = function () {

    }
}

Printer.prototype.setTarget = function (name) {
    this.job = name;
    return this
}

export default Printer