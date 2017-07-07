<template>
    <div class="popupMask center dark">
        <div class="itemEditor window" v-if="!coding">
            <header class="title">
                <span>{{text('ITEM_EDITOR')}}</span>
                <i class="fa fa-code" @click.ctrl="viewCode"></i>
            </header>
            <div class="inner">
                <section class="card">
                    <header>{{text('ITEM_INFO')}}</header>
                    <article>
                        <smart-input v-model="item.menuID" reg="^[a-zA-Z0-9_. ]{0,3}$" label="MENU_ID"></smart-input>
                        <smart-option v-model="item.category" label="CATEGORY" :options="init.categories"></smart-option>
                        <smart-input v-model.trim="item.categoryCN" reg="^.{0,10}$" label="CATEGORY_CN"></smart-input>
                        <smart-input v-model="item.zhCN" reg="^.{0,15}$" label="ZH_CN"></smart-input>
                        <smart-input v-model="item.usEN" reg="^.{0,25}$" label="US_EN"></smart-input>
                        <smart-input v-model="item.price" reg="^[0-9.,]{3,}$" label="PRICE" :more="true" @toggle="extraPrice = !extraPrice"></smart-input>
                        <div class="extraPrice" v-if="extraPrice">
                            <div>
                                <label>{{text('WALK_IN')}}</label>
                                <input v-model="item.prices.WALK_IN">
                            </div>
                            <div>
                                <label>{{text('PICK_UP')}}</label>
                                <input v-model="item.prices.PICK_UP">
                            </div>
                            <div>
                                <label>{{text('DELIVERY')}}</label>
                                <input v-model="item.prices.DELIVERY">
                            </div>
                            <div>
                                <label>{{text('DINE_IN')}}</label>
                                <input v-model="item.prices.DINE_IN">
                            </div>
                            <div>
                                <label>{{text('BAR')}}</label>
                                <input v-model="item.prices.BAR">
                            </div>
                        </div>
                        <smart-switch v-model="item.spicy" label="IS_SPICY"></smart-switch>
                        <smart-option v-model="item.taxClass" :options="taxOption" label="TAX_CLASS"></smart-option>
                        <smart-input v-model="item.priority" label="PRIORITY" name="priority" @change="set"></smart-input>
                    </article>
                </section>
                <section class="card">
                    <header>{{text('ITEM_SIDE')}}
                        <checkbox v-model="item.disableAutoOption" label="DISABLE_AUTO_ADD"></checkbox>
                        <span class="tip">({{text('MAX_ITEM',11)}})</span>
                    </header>
                    <article class="option">
                        <draggable v-model="item.option" :options="dragtions">
                            <transition-group tag="div">
                                <div v-for="(side,index) in item.option" class="side" :key="index">
                                    <div class="index">{{index+1}}</div>
                                    <div class="item">
                                        <div>
                                            <label>{{text('ZH_CN')}}</label>
                                            <input type="text" v-model="side.zhCN">
                                        </div>
                                        <div>
                                            <label>{{text('US_EN')}}</label>
                                            <input type="text" v-model="side.usEN">
                                        </div>
                                        <div>
                                            <label>{{text('PRICE_EXTRA')}}</label>
                                            <input type="text" v-model.number="side.extra">
                                        </div>
                                        <div>
                                            <label>{{text('PRICE')}}</label>
                                            <input type="text" v-model.number="side.price">
                                        </div>
                                    </div>
                                    <div class="ctrl">
                                        <checkbox v-model="side.sub" label="SUBITEM"></checkbox>
                                    </div>
                                    <i class="fa fa-trash remove" @click="removeOption(index)"></i>
                                </div>
                            </transition-group>
                        </draggable>
                        <div v-show="addButton">
                            <div class="add" @click="addOption">
                                <i class="fa fa-plus"></i>{{text('ADD_SIDE')}}</div>
                        </div>
                    </article>
                </section>
                <section class="card">
                    <header>{{text('PRINT_SETUP')}}</header>
                    <div v-for="(printer,index) in printers" :id="printer" :key="index">
                        <div class="printer" @click="togglePrinter(printer,$event)">
                            <div class="name">
                                <i class="fa fa-print"></i>{{printer}}</div>
                            <div class="more" @click.stop="moreOption(printer)" v-show="item.printer[printer]">
                                <i class="fa fa-level-down"></i>
                            </div>
                        </div>
                        <div class="extra" v-if="item.printer[printer]">
                            <i class="fa fa-exclamation-circle"></i>
                            <span>{{text('PRT_ITEM_OR')}}</span>
                            <label>{{text('ZH_CN')}}</label>
                            <input v-model="item.printer[printer]['zhCN']">
                            <label>{{text('US_EN')}}</label>
                            <input v-model="item.printer[printer]['usEN']">
                        </div>
                    </div>
                </section>
            </div>
            <footer class="relative">
                <span class="del" @click="del" v-show="item._id">
                    <i class="fa fa-trash-o"></i>{{text('DELETE')}}</span>
                <div class="tip" v-show="errorText">
                    <i class="fa fa-exclamation-circle"></i>
                    <span class="text">{{errorText}}</span>
                </div>
                <div class="buttons">
                    <div class="btn" @click="exit" id="cancelEdit">{{text('CANCEL')}}</div>
                    <div class="btn" @click="confirm" id="confirmEdit">{{text('CONFIRM')}}</div>
                </div>
            </footer>
        </div>
        <div class="coding window" v-else>
            <header class="title">
                <span>{{text('CODE_EDITOR')}}</span>
                <i class="fa fa-list-alt" @click="hateCoding"></i>
            </header>
            <div class="inner">
                <aside class="edit">
                    <textarea v-model="code" id="code"></textarea>
                    <!--<div class="status" :class="{expaned:errorLog.length > 1}">
                                    <i class="fa fa-circle" v-show="errorLog.length === 1"></i>
                                    <div v-for="log in errorLog" class="log" :class="{passed:errorLog.length === 1}">{{log}}</div>
                                </div>-->
                </aside>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import jsonlint from 'jsonlint'
import debounce from 'lodash.debounce'
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
import smartOption from '../common/smartOption'
import checkbox from '../common/checkbox'
export default {
    props: ['init'],
    components: { smartInput, smartSwitch, smartOption, draggable, checkbox },
    created() {
        this.taxOption = Object.keys(this.tax.class).map(key => ({
            value: key,
            label: this.tax.class[key].alies + " - " + this.tax.class[key].rate + " %"
        }));
    },
    mounted() {
        let item = Object.assign({}, this.init.item);
        delete item.clickable;
        let price = [];
        item.price.forEach(v => {
            price.push(isNumber(v) ? v.toFixed(2) : "0.00");
        })
        item.price = price.join(",");
        item.option.forEach(option => {
            option.overWrite = option.overWrite || false;
        })
        this.item = item;
        this.printers = Object.keys(this.configuration.printer);
        document.querySelectorAll(".itemEditor input")[2].focus();
        if (Array.isArray(this.item.printer)) {
            this.item.printer = {};
        } else {
            this.$nextTick(() => {
                Object.keys(item.printer).forEach(name => {
                    let dom = document.querySelector("#" + name + " .printer");
                    dom && dom.classList.add('selected');
                })
            })
        }
    },
    data() {
        return {
            item: {},
            code: null,
            coding: false,
            checking: false,
            errorLine: null,
            extraPrice: false,
            taxOption: [],
            printers: [],
            dragtions: {
                animation: 300,
                ghostClass: 'ghost'
            },
            errorText: ""
        }
    },
    methods: {
        set(key, value) {
            this.item[key] = value;
        },
        viewCode() {
            this.code = JSON.stringify(this.item, null, 4);
            this.coding = true;
        },
        // verifyJSON: debounce(function (code) {
        //     try {
        //         jsonlint.parse(code);
        //         this.errorLog = ['Code passed'];
        //         this.errorLine = null;
        //     } catch (e) {
        //         this.errorLog = String(e).split('\n');
        //         this.errorLine = this.errorLog[0].split(" ").pop().slice(0, -1);
        //         this.highlight();
        //     }
        //     this.checking = false;
        // }, 3000),
        highlight() {
            let dom = document.getElementById('code');
            let value = dom.value.split("\n");
            let p = this.errorLine - 1;
            let start = 0;
            let end = 0;
            for (let i = 0; i < p; i++) {
                start += value[i].length + 1;
            }
            end = start + value[p].length;
            dom.setSelectionRange(start, end);
        },
        addOption() {
            this.item.option.push({
                zhCN: "",
                usEN: "",
                price: "",
                overWrite: false
            })
        },
        removeOption(i) {
            this.item.option.splice(i, 1);
        },
        togglePrinter(name, e) {
            if (this.item.printer.hasOwnProperty(name)) {
                e.currentTarget.classList.remove('selected');
                let dom = document.getElementById(name).classList;
                dom.contains("show") && dom.remove("show");
                delete this.item.printer[name];
            } else {
                e.currentTarget.classList.add('selected');
                this.item.printer[name] = {};
            }
        },
        moreOption(name) {
            if (!this.item.printer.hasOwnProperty(name)) return;
            let dom = document.getElementById(name).classList;
            dom.contains("show") ? dom.remove("show") : dom.add("show");
        },
        morePrice() {
            this.extraPrice = !this.extraPrice;
        },
        hateCoding() {
            this.item = JSON.parse(this.code);
            this.$nextTick(() => {
                Object.keys(this.item.printer).forEach(name => {
                    let dom = document.getElementById("#" + name + " .printer");
                    dom && dom.classList.add('selected');
                })
            })
            this.coding = false;
        },
        confirm(revive) {
            let pass = document.querySelectorAll('i.invalid');
            if (pass.length === 0) {
                this.item.price = String(this.item.price).split(",").map(parseFloat);
                Object.keys(this.item.prices).forEach(type => {
                    type === "DEFAULT" ?
                        this.item.prices.DEFAULT = this.item.price :
                        this.item.prices[type].length === 0 ? delete this.item.prices[type] :
                            this.item.prices[type] = String(this.item.prices[type]).split(",").map(parseFloat);
                })
                this.item.option = this.item.option.map((item, index) => {
                    if (!isNumber(item.price)) delete item.price;
                    if (!isNumber(item.extra)) delete item.extra;
                    if (!item.price && !item.extra && !isNumber(this.item.price[index])) item.extra = 0;
                    return item
                }).filter((item, index) => (item.zhCN && item.usEN));
                this.init.resolve({
                    item: this.item,
                    revive
                })
            } else {
                let dom = document.querySelector(".invalid");
                let text = dom.parentElement.children[0].innerText;
                this.errorText = this.text("INVALID_VALUE", text);
                dom.scrollIntoView({ behavior: "smooth" });
                dom.parentElement.children[1].focus();
            }
        },
        compile() {

        },
        del() {
            this.init.reject(this.item)
        },
        exit() {
            this.init.reject(false);
        }
    },
    computed: {
        addButton() {
            if (this.item.hasOwnProperty('option')) {
                return this.item.option.length < 11
            }
            return true
        },
        ...mapGetters(['configuration', 'tax'])
    }
}
</script>

<style scoped>
.itemEditor,
.coding {
    width: 700px;
}

textarea {
    outline: none;
    flex: 1;
    border: none;
    background: #2C2F43;
    color: #f9f9f9;
    resize: none;
    font-size: 1em;
    font-family: 'Microsoft YaHei'!important;
}

.intro footer {
    background: #ddd;
    position: absolute;
    bottom: 0;
    width: 200px;
}

.intro footer .btn {
    margin: 10px;
    width: 90%;
}

.coding .inner {
    display: flex;
    height: 585px;
}

aside.edit {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
}

aside.intro {
    flex: 2;
    position: relative;
}

.status i {
    color: #4CAF50;
}

.status {
    overflow: hidden;
    flex: 1;
    line-height: 26px;
    padding: 5px 10px;
    background: #1d213a;
    color: #FF5722;
    width: 480px;
    transition: flex .3s ease-out;
}

.expaned {
    flex: 4;
}

.log:first-of-type {
    display: inline-block;
    width: 90%;
}

.log:nth-child(3) {
    color: #FFEE58;
    text-align: center;
}

.log.passed {
    color: #CFD8DC;
}

.itemEditor .inner {
    height: 512px;
    overflow-y: scroll;
    background: url(../../../assets/image/grid.png) #fcfcfc;
}

.itemEditor footer .btn {
    margin: 5px;
    width: 150px;
}

article.option {
    box-shadow: none;
    background: none;
}

.side {
    background: #fff;
    margin: 5px 0;
    display: flex;
    position: relative;
    box-shadow: var(--shadow);
}

i.remove {
    position: absolute;
    right: -36px;
    top: 30px;
    color: #F44336;
    opacity: 0.2;
    z-index: 0;
    padding: 10px;
    background: #fff;
    font-size: 1.25em;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    cursor: pointer;
    border-bottom: 1px solid #ccc;
    transition: opacity 0.3s ease;
    box-shadow: 3px 0px 5px -3px rgba(0, 0, 0, 0.4);
}

.index {
    background: #03A9F4;
    width: 20px;
    text-align: center;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
}

.item {
    padding: 10px 15px;
    border-left: 1px solid #E0E0E0;
}

.item input[type="text"] {
    width: 170px;
}

.side:hover i.remove {
    opacity: 1;
}

footer .tip {
    position: absolute;
    top: 17px;
    left: 120px;
    color: #555;
    border-left: 4px solid #FFC107;
    padding: 10px 15px 10px 10px;
    background: #fff;
    box-shadow: var(--shadow);
}

footer .tip i {
    color: #ffc107;
}

.printer {
    margin: 0 0 5px;
    border-left: 10px solid #BBDEFB;
    background: #F5F5F5;
    color: #B0BEC5;
    box-shadow: var(--shadow);
    text-indent: 15px;
    text-transform: uppercase;
    display: flex;
    cursor: pointer;
}

.printer i {
    margin-right: 10px;
}

.printer .name {
    padding: 15px 0px;
    flex: 4;
}

.printer .more {
    padding: 15px 10px;
    flex: 1;
    text-align: right;
    color: #F5F5F5;
}

.printer.selected {
    border-left: 10px solid #03a9f4;
    background: #fff;
    color: #333;
}

.printer.selected .more {
    color: #333;
}

.extra {
    display: none;
    width: 589px;
    padding: 10px 0;
    text-indent: 15px;
    background: #fff;
    margin: 0px 0 5px 10px;
    box-shadow: var(--shadow);
}

.extra i {
    color: #FF9800;
}

.extra span {
    margin-right: 2.5em;
    color: #FF9800;
}

.show .extra {
    display: block;
}

label {
    min-width: 40px;
    display: inline-block;
}

.buttons {
    flex: 6;
    text-align: right;
}

span.del {
    color: #ff786e;
    border-bottom: 1px dashed #ffbeba;
    position: absolute;
    left: 45px;
    top: 25px;
    cursor: pointer;
}

.del i {
    margin-right: 5px;
}

div.add {
    background: #fff;
    padding: 15px;
    box-shadow: var(--shadow);
    border-left: 10px solid #E0E0E0;
    border-right: 10px solid #E0E0E0;
    text-align: center;
    cursor: pointer;
    color: #444;
}

.add i {
    margin: 0 10px;
}

.ghost {
    opacity: 0.5;
}

.checkbox {
    font-size: 18px;
    vertical-align: sub;
    float: right;
    padding-top: 8px;
}

.extraPrice div {
    display: flex;
    border-bottom: 1px solid #ccc;
    align-items: center;
}

.extraPrice label {
    width: 115px;
    text-align: right;
    background: #F5F5F5;
    padding: 10px;
    font-style: italic;
    color: #607D8B;
}

.extraPrice input {
    font-size: 1em;
    border: none;
    padding: 10px;
    flex: 1;
    background: #F5F5F5;
}

.ctrl {
    display: flex;
}
</style>
