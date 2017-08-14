<template>
    <div class="printer">
        <section class="setting">
            <smart-option label="PRINTER" v-model="device" :options="devices"></smart-option>
            <div class="wrap">
                <div class="config" v-if="profile">
                    <fieldset class="section">
                        <legend>{{text('SETTING.PRINT.PRINT')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.print.WALK_IN" label="WALK_IN"></checkbox>
                            <checkbox v-model="profile.print.PICK_UP" label="PICK_UP"></checkbox>
                            <checkbox v-model="profile.print.DELIVERY" label="DELIVERY"></checkbox>
                            <checkbox v-model="profile.print.DINE_IN" label="DINE_IN"></checkbox>
                            <checkbox v-model="profile.print.BAR" label="BAR"></checkbox>
                            <checkbox v-model="profile.print.PRE_PAYMENT" label="PRE_PAYMENT"></checkbox>
                            <checkbox v-model="profile.print.PAYMENT" label="PAYMENT"></checkbox>
                            <checkbox v-model="profile.print.REPORT" label="REPORT"></checkbox>
                            <checkbox v-model="profile.print.SALES" label="SALES"></checkbox>
                            <checkbox v-model="profile.print.BUFFET" label="BUFFET"></checkbox>
                            <checkbox v-model="profile.print.CREDITCARD" label="CREDIT_CARD"></checkbox>
                        </div>
                    </fieldset>
                    <fieldset class="section">
                        <legend>{{text('SETTING.PRINT.DOUBLE')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.double.WALK_IN" label="WALK_IN"></checkbox>
                            <checkbox v-model="profile.double.PICK_UP" label="PICK_UP"></checkbox>
                            <checkbox v-model="profile.double.DELIVERY" label="DELIVERY"></checkbox>
                            <checkbox v-model="profile.double.DINE_IN" label="DINE_IN"></checkbox>
                            <checkbox v-model="profile.double.BAR" label="BAR"></checkbox>
                            <checkbox v-model="profile.double.BUFFET" label="BUFFET"></checkbox>
                        </div>
                    </fieldset>
                    <fieldset class="section">
                        <legend>{{text('SETTING.PRINT.CONTROL')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.control.printPrimary" label="PRINT_PRIMARY" @input="togglePrimary"></checkbox>
                            <smart-option v-model="profile.control.primaryFont" label="FONT" :options="chineseFonts"></smart-option>
                            <smart-range v-model="profile.control.primaryFontSize" label="FONT_SIZE" min="10" max="40" step="1"></smart-range>
                            <checkbox v-model="profile.control.printSecondary" label="PRINT_SECONDARY" @input="toggleSecondary"></checkbox>
                            <smart-option v-model="profile.control.secondaryFont" label="FONT" :options="englishFonts"></smart-option>
                            <smart-range v-model="profile.control.secondaryFontSize" label="FONT_SIZE" min="10" max="40" step="1"></smart-range>
                            <checkbox v-model="profile.control.sortItem" label="SORT_ITEM"></checkbox>
                            <checkbox v-model="profile.control.duplicate" label="PRINT_DUPLICATE"></checkbox>
                            <checkbox v-model="profile.control.printStore" label="PRINT_STORE" @input="toggleStore"></checkbox>
                            <checkbox v-model="profile.control.printType" label="PRINT_ORDER_TYPE" @input="toggleType"></checkbox>
                            <checkbox v-model="profile.control.printCustomer" label="PRINT_CUST_INFO" @input="toggleCustomer"></checkbox>
                            <checkbox v-model="profile.control.printActionTime" label="PRINT_PRINTTIME"></checkbox>
                            <checkbox v-model="profile.control.enlargeDetail" label="PRINT_ENLARGE_CUST_INFO"></checkbox>
                            <checkbox v-model="profile.control.printPrice" label="PRINT_PRICE" @input="togglePrice"></checkbox>
                            <checkbox v-model="profile.control.printPayment" label="PRINT_PAYMENT" @input="togglePayment"></checkbox>
                            <checkbox v-model="profile.control.printSuggestion" label="PRINT_TIP_SUGG"></checkbox>
                            <checkbox v-model="profile.control.buzzer" label="BUZZER"></checkbox>
                            <!-- <checkbox v-model="profile.control.printCoupon" label="PRINT_COUPON"></checkbox> -->
                            <!-- <checkbox v-model="profile.control.printMenuID" label="PRINT_MENU_ID"></checkbox> -->
                        </div>
                    </fieldset>
                </div>
            </div>
            <footer>
                <div class="btn" @click="back">{{text('BACK')}}</div>
                <div class="btn f1" @click="save">{{text('SAVE')}}</div>
            </footer>
        </section>
        <section class="preview">
            <div class="receipt">
                <header>
                    <div class="store" :class="{hide:!receipt.store}">
                        <h3>{{store.name}}</h3>
                        <h5>{{store.address}}</h5>
                        <h5>{{store.city}} {{store.state}} {{store.zipCode}}</h5>
                        <h5>{{store.contact}}</h5>
                    </div>
                    <div class="type" :class="{hide:!receipt.type}">
                        <p class="zhCN" :style="style.zhCN">{{text('DELIVERY')}}</p>
                        <p class="usEN" :style="style.usEN">DELIVERY</p>
                    </div>
                    <div class="time">
                        <span>Date: {{date}}</span>
                        <span>Time: {{time}}</span>
                        <div class="number">{{ticket.number}}</div>
                    </div>
                    <div class="server">
                        <p>
                            <span class="wrap">
                                <span class="text">Cashier:</span>
                                <span class="value">{{op.name}}</span>
                            </span>
                        </p>
                    </div>
                    <div class="customer" :class="{hide:!receipt.customer}">
                        <p>
                            <span class="text">Tel:</span>
                            <span class="value" :style="style.info">888.299.0524</span>
                        </p>
                        <p>
                            <span class="text">Addr:</span>
                            <span class="value" :style="style.info">50 Allen St</span>
                        </p>
                        <p>
                            <span class="text">City:</span>
                            <span class="value">New York</span>
                        </p>
                        <p>
                            <span class="text">Name:</span>
                            <span class="value">United POS Inc.</span>
                        </p>
                    </div>
                </header>
                <section class="body">
                    <p class="list" :style="style.zhCN">
                        <span class="qty">2</span>
                        <span class="itemWrap">
                            <span class="item">芥兰鸡
                                <span class="mark"></span>
                            </span>
                            <span class="side">[ 小 ]
                                <span class="mark"></span>
                            </span>
                        </span>
                    </p>
                    <p class="list" :style="style.usEN">
                        <span class="qty">2</span>
                        <span class="itemWrap">
                            <span class="item">Chicken Broccoli
                                <span class="mark"></span>
                            </span>
                            <span class="side">[ Pt. ]
                                <span class="mark"></span>
                            </span>
                        </span>
                        <span class="price" :class="{hide:!receipt.price}">12.59</span>
                    </p>
                    <p class="list mark" :style="style.zhCN">
                        <span class="qty"></span>
                        <span class="itemWrap">
                            <span class="item">炸鸡翅
                                <span class="mark">SPK</span>
                            </span>
                            <span class="side">[ 薯条 ]
                                <span class="mark">K</span>
                            </span>
                        </span>
                    </p>
                    <p class="list mark" :style="style.usEN">
                        <span class="qty"></span>
                        <span class="itemWrap">
                            <span class="item">Fried Chicken Wing
                                <span class="mark">SPK</span>
                            </span>
                            <span class="side">[ F.F. ]
                                <span class="mark">K</span>
                            </span>
                        </span>
                        <span class="price" :class="{hide:!receipt.price}">5.99</span>
                    </p>
                </section>
                <div class="payment" :class="{hide:!receipt.payment}">
                    <p>
                        <span class="text">Subtotal:</span>
                        <span class="value">18.58</span>
                    </p>
                    <p>
                        <span class="text">Tax:</span>
                        <span class="value">1.63</span>
                    </p>
                    <p class="bold">
                        <span class="text">TOTAL:</span>
                        <span class="value">20.21</span>
                    </p>
                </div>
                <div class="footer">
                    Thank You Very Much
                </div>
            </div>
            <aside class="action">
                <i class="fa fa-plus"></i>
                <i class="fa fa-trash" @click="removePrinterConfirm"></i>
                <i class="fa fa-print"></i>
            </aside>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import smartOption from '../common/smartOption'
import smartRange from '../common/smartRange'
import dialoger from '../../common/dialoger'
import checkbox from '../common/checkbox'
import moment from 'moment'
export default {
    components: { smartOption, smartRange, checkbox, dialoger },
    created() {
        this.printers = JSON.parse(JSON.stringify(this.config.printer));
        this.devices = Object.keys(this.printers) || [""];
    },
    data() {
        return {
            englishFonts:["Agency FB","Tahoma","Tensentype RuiHeiJ-W2","Trebuchet MS","Noto Mono","Futura LT Condensed"],
            chineseFonts:["Noto Sans SC Light",  "Yuanti SC", "QingYuan"],
            presets: ["cashier", "kitchen", "bar", "payment", "runner"],
            time: moment().locale('en').format('hh:mm a'),
            date: moment().format('MM-DD-YYYY'),
            componentData: null,
            profile: undefined,
            component: null,
            printers: null,
            devices: [],
            device: null,
            preset: "",
            receipt: {
                zhCN: true,
                usEN: true,
                store: true,
                type: true,
                customer: true,
                price: true,
                payment: true,
                tip: true,
                coupon: true
            },
            style: {
                zhCN: null,
                usEN: null,
                info: null
            }
        }
    },
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        },
        togglePrimary(bool) {
            this.receipt.zhCN = bool;
        },
        toggleSecondary(bool) {
            this.receipt.usEN = bool;
        },
        toggleStore(bool) {
            this.receipt.store = bool
        },
        toggleType(bool) {
            this.receipt.type = bool;
        },
        toggleCustomer(bool) {
            this.receipt.customer = bool;
        },
        togglePrice(bool) {
            this.receipt.price = bool;
        },
        togglePayment(bool) {
            this.receipt.payment = bool;
        },
        removePrinterConfirm() {
            this.device && this.$dialog({ type: "question", title: "REMOVE_PRINTER", msg: this.text("TIP_REMOVE_PRINTER", this.device) })
                .then(() => { this.remove(this.device) }).catch(() => { this.$q() });
        },
        remove(printer) {
            this.$socket.emit("[CMS] REMOVE_PRINTER", printer);
            this.removePrinter(printer);
            this.device = null;
            this.$q();
        },
        save() {
            if (!this.device) return;
            this.$socket.emit("[CMS] UPDATE_PRINTER", { [this.device]: this.profile });
            this.setPrinter({ [this.device]: this.profile });
        },
        ...mapActions(['setPrinter', 'removePrinter'])
    },
    watch: {
        device(profile) {
            this.profile = this.printers[profile];
            let { control } = this.profile;
            Object.assign(this.receipt, {
                zhCN: control.printPrimary,
                usEN: control.printSecondary,
                store: control.printStore,
                type: control.printType,
                customer: control.printCustomer,
                price: control.printPrice,
                payment: control.printPayment,
                tip: control.printSuggestion,
                coupon: control.printCoupon
            })
        },
        profile: {
            handler(n) {
                if (n.hasOwnProperty('control')) {
                    let { printPrimary, primaryFont, primaryFontSize, printSecondary, secondaryFont, secondaryFontSize, enlargeDetail } = n.control;
                    this.style = {
                        zhCN: {
                            "font-family": primaryFont,
                            "font-size": primaryFontSize + "px",
                            "display": printPrimary ? "flex" : "none"
                        },
                        usEN: {
                            "font-family": secondaryFont,
                            "font-size": secondaryFontSize + "px",
                            "display": printSecondary ? "flex" : "none"
                        },
                        info: {
                            "font-family": enlargeDetail ? "Tensentype RuiHeiJ-W2" : "Agency FB",
                            "font-size": enlargeDetail ? "1.25em" : "1em"
                        }
                    }
                }
            }, deep: true
        }

    },
    computed: {
        ...mapGetters(['op', 'config', 'store', 'ticket'])
    }
}
</script>

<style scoped>
.printer {
    display: flex;
    height: 100%;
}

.section .selection {
    display: flex;
    flex-wrap: wrap;
}

.input {
    align-items: center;
    margin: 7px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

fieldset {
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 2px;
    margin: 5px;
    padding: 5px 0;
}

legend {
    margin-left: 10px;
}

section.setting {
    background: rgba(238, 238, 238, 0.57);
    width: 350px;
}

.selection .input {
    width: 325px;
}

.range {
    width: 339px;
    font-size: 13px;
    border-bottom: 1px dashed #ccc;
    padding-bottom: 5px;
    margin-bottom: 5px;
}

.range label {
    width: 100px;
}

.wrap {
    height: 622px;
}

.preview {
    flex: 1;
    background: #525659;
    box-shadow: inset 5px 0 35px -8px rgba(0, 0, 0, .62);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.receipt {
    background: #fff;
    width: 290px;
    padding: 45px 15px 20px;
    box-shadow: 0px 0 25px rgba(0, 0, 0, .62);
}

footer {
    display: flex;
}

.btn {
    margin: 0 5px;
}

.receipt header {
    text-align: center;
    font-family: 'Agency FB';
}

.receipt h3 {
    font-size: 22px;
    font-weight: bold;
}

.receipt h5 {
    font-size: 16px;
    font-weight: lighter;
}

.receipt .type {
    margin: 12px;
}

.receipt .type p {
    justify-content: center;
    align-content: center;
}

.receipt .time {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid #9E9E9E;
    position: relative;
}

.receipt .time span {
    margin: 0 10px;
}

.receipt .time .number {
    position: absolute;
    right: 10px;
    bottom: 12px;
    font-size: 2em;
    font-weight: bold;
}

.server p {
    text-align: left;
    padding: 0 10px;
    border-bottom: 1px solid gray;
}

.receipt .customer {
    text-align: left;
    padding: 2px 10px;
    border-bottom: 1px solid gray;
}

.receipt .customer .text {
    display: inline-block;
    width: 40px;
}

p.list {
    display: flex;
}

p.list .qty {
    width: 35px;
    text-align: center;
}

section.body {
    padding: 10px 10px 15px 0;
}

p.mark {
    margin-top: 10px;
}

.itemWrap .mark {
    position: absolute;
    left: 0;
    right: 0;
    top: -11px;
    text-align: center;
    font-size: 12px;
}

.itemWrap>span {
    position: relative;
}

.price {
    flex: 1;
    text-align: right;
}

.payment {
    font-family: 'Agency FB';
    text-align: right;
    padding: 0 10px;
}

.payment .value {
    display: inline-block;
    width: 40px;
}

.payment .bold {
    font-weight: bolder;
    font-size: 1.25em;
}

.footer {
    text-align: center;
    border-top: 1px solid gray;
    margin-top: 10px;
    padding-top: 5px;
}

.hide {
    display: none;
}

aside.action {
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    padding: 30px;
    opacity: 0;
    transition: opacity 0.22s ease;
}

.action i {
    width: 45px;
    height: 45px;
    line-height: 45px;
    text-align: center;
    display: block;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 2px 1px -1px rgba(0, 0, 0, .12);
    border-radius: 50%;
    background: #f2f4f6;
    color: #5f5d5d;
    margin-bottom: 15px;
    cursor: pointer;
}

section.preview:hover .action {
    opacity: 1;
}

.selection>div {
    min-width: 90px;
}
</style>