export default {
    install(Vue, options) {
        Vue.prototype.approval = function (credential, permit) {
            let approve = false;

            try {
                approve = (this.op.role === 'Developer' || this.op.role === 'Owner') ? true : credential.includes(permit)
            } catch (error) {
                this.$log({
                    eventID: 9000,
                    type: "bug",
                    source: "plugin/util.js [function] approval",
                    note: `Operator seems does not have ${permit} setting. \nTo fix this issue, please add ${permit}:[] to profile.`
                })
            }
            return approve
        }

        Vue.prototype.$log = function (event) {
            this.$socket.emit("[SYS] LOG", event);
        }

        Vue.prototype.$p = function (component, args) {
            return new Promise((resolve, reject) => {
                this.componentData = Object.assign({ resolve, reject }, args);
                this.component = component;
            }).then(() => this.$q()).catch(() => this.$q())
        }

        Vue.prototype.$open = function (component, args) {
            return new Promise((resolve, reject) => {
                this.componentData = Object.assign({}, { resolve, reject }, args);
                this.component = component;
            }).then(() => this.$q()).catch(() => this.$q())
        }

        Vue.prototype.$dialog = function (args) {
            return new Promise((resolve, reject) => {
                this.componentData = {
                    type: args.type || "alert",
                    title: args.title,
                    msg: args.msg,
                    timeout: args.hasOwnProperty('timeout') ? {
                        duration: args.timeout.duration || 15000,
                        fn: args.timeout.fn === 'resolve' ? resolve : reject
                    } : null,
                    buttons: [],
                    resolve,
                    reject
                };
                args.hasOwnProperty('buttons') ?
                    args.buttons.forEach(button => {
                        this.componentData.buttons.push({
                            text: button.text,
                            fn: button.fn === 'resolve' ? resolve : reject,
                            load: !!button.load
                        })
                    }) :
                    this.componentData.buttons = [
                        { text: 'button.cancel', fn: reject, load: false },
                        { text: 'button.confirm', fn: resolve, load: false }
                    ];
                this.component = "dialoger";
            });
        }

        Vue.prototype.$checkPermission = function (credential, permit) {
            let approve = false;

            const { name, role, restrict } = this.op;
            const permission = this.op[credential];

            approve = (role === 'Developer' || role === 'Owner') ? true : permission.includes(permit);

            return new Promise((authorized, unauthorized) => {
                if (approve) {
                    authorized();
                } else if (restrict) {
                    this.$accessDenied();
                    unauthorized();
                } else {
                    new Promise((resolve, reject) => {
                        this.componentData = { resolve, reject, grant: true };
                        this.component = "unlock"
                    }).then((operator) => {
                        let _approve = false;
                        const _permission = operator[credential];
                        _approve = (operator.role === 'Developer' || operator.role === 'Owner') ? true : _permission.includes(permit);

                        if (_approve) {
                            this.$q();
                            authorized();
                            this.$log({ eventID: 8000, type: "success", source: "plugin/dialog.js", note: `${name} has inherited ${permit} permission from ${operator.name}` });
                        } else {
                            this.$accessDenied();
                            unauthorized();
                            const note = `${name} attempted to grant permission from ${operator.name} but neither has ${permit} permission.`;
                            this.$log({ eventID: 8001, type: "failure", source: "plugin/dialog.js", note });
                        }
                    }).catch(() => {
                        this.$accessDenied();
                        unauthorized();
                    })
                }
            })
        }

        Vue.prototype.$accessDenied = function (prompt) {
            prompt = prompt || {
                type: 'warning',
                title: 'dialog.permissionDenied',
                msg: 'dialog.permissionDeniedTip',
                timeout: { duration: 10000, fn: "reject" },
                buttons: [{ text: 'button.confirm', fn: 'reject' }]
            };

            this.$dialog(prompt).catch(() => this.$q());
        }

        Vue.prototype.$q = function () {
            this.component = null;
            this.componentData = null;
        }

        Vue.prototype.$calculatePayment = function (items) {
            const {
                type,
                guest,
                coupons,
                taxFree = false,
                deliveryFree = false,
                gratuityFree = false
              } = this.order;
            const { enable, rules } = this.dinein.surcharge;

            let delivery =
                type === "DELIVERY" && this.store.delivery && !deliveryFree
                    ? parseFloat(this.store.deliveryCharge)
                    : 0;

            let { tip, gratuity, paid, rounding = 0 } = this.order.payment;
            let subtotal = 0,
                tax = 0,
                discount = 0;

            items.forEach(item => {
                if (item.void) return;

                const single = parseFloat(item.single);
                const qty = item.qty || 1;
                const taxClass = this.tax.class[item.taxClass];

                let amount = toFixed(single * qty, 2);

                item.choiceSet.forEach(set => {
                    const p = parseFloat(set.single);
                    const s = set.qty || 1;
                    const t = toFixed(p * s, 2);
                    amount = toFixed(amount + t, 2);
                });

                subtotal = toFixed(subtotal + amount, 2);

                if (!taxFree && taxClass.apply[type])
                    tax += taxClass.rate / 100 * amount;
            });

            if (this.tax.deliveryTax) {
                /*
                    is Delivery fee taxable?
                    Find out default tax rate and apply to delivery charge
                */

                let taxRate = 0;
                Object.keys(this.tax.class).forEach(type => {
                    this.tax.class[type].default === true &&
                        (taxRate = this.tax.class[type].rate);
                });
                /**
                 * Tax apply Before Discount (For Example: 10% Tax Rate, 20% Discount)
                 *
                 * Subtotal: 10.00
                 * Tax:       1.00
                 * Discount:  2.00
                 * Total:     9.00
                 * ------------------------------------------------------------------
                **/
                tax += toFixed(delivery * taxRate / 100, 2);
            }

            if (type === "DINE_IN" && !gratuityFree && enable) {
                //find rule
                try {
                    const { fee, percentage } = rules
                        .sort((a, b) => a.guest < b.guest)
                        .find(r => guest >= r.guest);
                    gratuity = percentage ? toFixed(subtotal * fee / 100, 2) : fee;
                } catch (e) { }
            }

            if (coupons && coupons.length > 0) {
                let offer = 0;
                coupons.forEach(coupon => {
                    const { reference } = coupon;

                    switch (coupon.type) {
                        // 'rebate':        '满减券',
                        // 'giveaway':      '礼物券',
                        // 'voucher':       '现金券',
                        // 'discount':      '折扣券',
                        case "rebate":
                            offer += coupon.discount;
                            break;
                        case "voucher":
                            offer += coupon.discount;
                            break;
                        case "discount":
                            switch (coupon.apply) {
                                case "category":
                                    let _offer = 0;
                                    this.order.content.forEach(item => {
                                        if (reference.includes(item.category)) {
                                            _offer += coupon.discount / 100 * item.single * item.qty;
                                        }
                                    });
                                    offer += _offer;
                                    break;
                                case "item":
                                    break;
                                default:
                                    offer += coupon.discount / 100 * subtotal;
                            }
                            break;
                    }
                });

                discount += offer;
            }

            const total = subtotal + tax;
            const due = Math.max(0, total + delivery - discount);
            const balance = due + gratuity + rounding;
            const remain = balance - paid;

            Object.assign(this.order.payment, {
                subtotal: toFixed(subtotal, 2),
                tax: toFixed(tax, 2),
                total: toFixed(total, 2),
                discount: toFixed(discount, 2),
                due: toFixed(due, 2),
                balance: toFixed(balance, 2),
                paid: toFixed(paid, 2),
                remain: toFixed(remain, 2),
                tip: toFixed(tip, 2),
                gratuity: toFixed(gratuity, 2),
                delivery: toFixed(delivery, 2),
                rounding: toFixed(rounding, 2)
            });
        }

        //polyfill

        Array.prototype.last = function () {
            return this[this.length - 1] || null;
        }

        Array.prototype.remove = function (object) {
            for (let i = 0; i < this.length; i++) {
                if (this[i] === object) {
                    this.splice(i, 1);
                    break;
                }
            }
        }

        Array.prototype.getLastInsertIndex = function (array) {
            let index = 0;
            for (let i = 0; i < this.length; i++) {
                if (this[i].key === array.key) {
                    index = i;
                }
            }
            return index + 1;
        }

        String.prototype.toFixed = function (places) {
            return isNumber(this) ? parseFloat(this).toFixed(places) : "0.00";
        }

        String.prototype.toCapitalCase = function () {
            return this.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        String.prototype.toFloat = function () {
            return parseFloat(this)
        }

        window.toFixed = (number, fractionSize) => +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);
        window.ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
        window.isNumber = (n) => (/^-?[\d.]+(?:e-?\d+)?$/.test(n));
        window.today = function (offset = 0) {
            let d = new Date();
            d = d.setHours(d.getHours() - 4 + (offset * 24));
            d = new Date(d);
            return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${("0" + d.getDate()).slice(-2)}`;
        }
        window.line = function (line1, line2) {
            const f = function (data) {
                if (typeof data === 'string') {
                    const i = Math.floor(Math.abs(20 - data.length) / 2);
                    return (' '.repeat(i) + data + ' '.repeat(i + 10)).slice(0, 20);
                } else {
                    const string = data[0];
                    const amount = isNumber(data[1]) ? data[1] > 0 ? '$ ' + data[1] : '-$ ' + data[1] : data[1];

                    let i = 20 - (string + amount).length;
                    i < 0 && (i = 0);
                    return (string + ' '.repeat(i) + amount).slice(0, 20);
                }
            }
            return f(line1) + f(line2);
        }
        window.toggleClass = function (target, className) {
            let dom = target instanceof HTMLElement ? target : document.querySelector(target);
            dom.className.includes(className) ? dom.classList.remove(className) : dom.classList.add(className)
        }
    }
}