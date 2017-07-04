<template>
    <section>
        <form>
            <data-input label="PHONE" v-model="customer.phone" :autoComplete="predict.phone" @focus="setInput" @fill="autoFill"></data-input>
            <data-input label="EXTENSION" v-model="customer.extension" :autoComplete="predict.extension" @focus="setInput"></data-input>
            <data-input label="NAME" v-model="customer.name" :autoComplete="predict.name" @focus="setInput"></data-input>
            <data-input label="ADDRESS" v-model="customer.address" :autoComplete="predict.address" :distance="customer.distance" :duration="customer.duration" @focus="setInput" class="address" @fill="autoAddress">
            </data-input>
            <data-input label="CITY" v-model="customer.city" :autoComplete="predict.city" @focus="setInput"></data-input>
            <data-input label="NOTE" v-model="customer.note" @focus="setInput" class="note"></data-input>
        </form>
        <keyboard @input="input" @backspace="delChar" @cancel="cancelOrder" @create="createOrder" @clear="clearInput" @search="search"></keyboard>
    </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dataInput from './dataInput'
import keyboard from '../common/keyboard'
export default {
    created() {
        this.resetAutoComplete();
    },
    mounted() {
        document.querySelector("input#phone").classList.add("active");
        document.querySelector("main.window").classList.add("moveUp");
        this.toggleKeyboard(true);
        this.customer.phone.length === 10 && this.anchor("address");
    },
    data() {
        return {
            predict: null,
            target: 'phone',
            caret: 0
        }
    },
    methods: {
        setInput(field) {
            this.target = field.target;
            this.caret = field.caret;
            this.toggleKeyboard(true);
            this.resetAutoComplete();
        },
        input(char) {
            this.autoComplete(this.validator(char));
            this.focus();
        },
        delChar() {
            let text = this.customer[this.target];
            this.customer[this.target] = text.substr(0, this.caret - 1) + text.substr(this.caret);
            this.caret = this.caret === 0 ? 0 : this.caret - 1;
            this.focus();
            this.autoComplete();
        },
        focus() {
            this.$nextTick(() => {
                let dom = document.querySelector("input.active");
                dom.focus();
                dom.setSelectionRange(this.caret, this.caret);
            })
        },
        validator(char) {
            let type = this.target;
            let value = this.customer[this.target];
            let length = value.length;
            let keyword = null;
            switch (type) {
                case "phone":
                    if (isNumber(char)) {
                        if (length === 0) {
                            this.customer[this.target] = char;
                            this.caret = 1;
                        } else if (length < 10) {
                            let a = value.substr(0, this.caret);
                            let b = value.substr(this.caret);
                            this.customer[this.target] = a + char + b;
                            this.caret++;
                        }
                        this.customer[this.target].length === 10 && this.anchor("address");
                        keyword = this.customer.phone;
                    }
                    break;
                case "address":
                    if (length === 0) {
                        this.customer[this.target] = char;
                        this.caret = 1;
                    } else if (length < 40) {
                        let a = value.substr(0, this.caret);
                        let b = value.substr(this.caret);
                        this.customer[this.target] = a + char + b;
                        this.caret++;
                    }
                    keyword = this.customer.address.replace(/ +/g, ' ').trim().split(" ").slice(1).join(" ");
                    break;
                case "extension":
                case "name":
                case "city":
                    if (length === 0) {
                        this.customer[this.target] = char;
                        this.caret = 1;
                    } else if (length < 16) {
                        let a = value.substr(0, this.caret);
                        let b = value.substr(this.caret);
                        this.customer[this.target] = a + char + b;
                        this.caret++;
                    }
                    break;
                case "note":
                    if (length === 0) {
                        this.customer[this.target] = char;
                        this.caret = 1;
                    } else if (length < 50) {
                        let a = value.substr(0, this.caret);
                        let b = value.substr(this.caret);
                        this.customer[this.target] = a + char + b;
                        this.caret++;
                    }
                    break;
            }
            return keyword
        },
        autoComplete(keyword) {
            keyword = keyword ? keyword : this.customer[this.target];
            if (!keyword) return;
            this.$socket.emit("[SEARCH] AUTO_COMPLETE", {
                type: this.target, keyword
            })
        },
        autoFill(data) {
            this.setCustomer(data);
            this.resetAutoComplete();
            this.anchor("address");
            if (data.address && (!data.duration || !data.distance)) {
                this.calculateDistance({
                    address: data.address,
                    city: data.city || this.store.city
                })
            }
        },
        autoAddress(data) {
            let address = this.customer.address.replace(/ +/g, ' ').split(" ")[0] + " " + data.street;
            this.setCustomer({
                address, city: data.city
            });
            this.resetAutoComplete();
            this.calculateDistance({
                address, city: data.city
            });
            this.anchor("address");
            this.highlight([]);
        },
        resetAutoComplete() {
            this.predict = {
                phone: null,
                extension: null,
                name: null,
                address: null,
                city: null
            }
        },
        anchor(target) {
            this.$nextTick(() => {
                let dom = document.querySelector("input.active");
                dom && dom.classList.remove("active");
                dom = document.querySelector("input#" + target);
                dom.classList.add("active");
                dom.focus();
                this.target = target;
                this.caret =  this.customer[target].length;
                dom.setSelectionRange(this.caret, this.caret);
            })
        },
        calculateDistance(data) {
            if (!this.store.mapAPI) return;
            let api = this.store.mapAPI;
            let origin = `${this.store.address.split(' ').join('+')},${this.store.city.split(' ').join('+')}+${this.store.state}`;
            let destination = this.$options.filters.formatAddress(data.address).split(' ').join('+');
            let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination},${data.city.split(' ').join('+')}+${this.store.state}&key=${api}&language=en&units=imperial`;
            this.$socket.emit("[INQUIRY] GOOGLE_DISTANCE_MATRIX", url);
        },
        highlight(list) {
            let p = this.customer.address.replace(/ +/g, ' ').trim().split(" ").slice(1).join(" ").length;
            let next = list.map(address => (address.street[p] && address.street[p]))
                .filter((v, i, s) => s.indexOf(v) === i);
            let doms = document.querySelectorAll("span.next");
            doms.forEach(dom => {
                dom.classList.remove("next");
            });

            next.forEach(key => {
                document.getElementById(key) && document.getElementById(key).classList.add("next");
            })
        },
        cancelOrder() {
            this.resetDashboard();
            this.setApplication({
                opLastAction: new Date
            });
            this.$router.push({ path: '/main' });
        },
        createOrder() {
            //set mode to create
            this.setApplication({ mode: 'create' });
            if (this.ticket.type === 'DELIVERY' && this.customer.phone.length !== 10) return;

            this.$socket.emit("[UPDATE] CUSTOMER", this.customer);
            this.$router.push({ path: '/main/menu' });
        },
        clearInput() {
            this.customer[this.target] = "";
            this.target === 'address' &&
                this.setCustomer({
                    distance: "",
                    duration: "",
                    city: ""
                })
        },
        search() {

        },
        ...mapActions(['toggleKeyboard', 'resetDashboard', 'setApplication', 'setCustomer'])
    },
    beforeDestroy() {
        let dom = document.querySelector("main.window");
        dom && dom.classList.remove("moveUp");
    },
    computed: {
        ...mapGetters(['store', 'customer','ticket'])
    },
    components: {
        keyboard, dataInput
    },
    filters: {
        formatAddress(address) {
            let reg = /\d+(\s+\w+){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd|road|lane|drive|way|court|plaza|square|run|parkway|point|pike|square|driveway|trace|park|terrace|blvd)/i;
            let match = address.match(reg);
            return match ? match[0] : address;
        }
    },
    sockets: {
        AUTO_COMPLETE(data) {
            data.results.length && (this.predict[data.type] = data.results);
            data.type === 'address' && this.highlight(data.results);
        }
    }
}
</script>

<style scoped>
form {
    width: 608px;
    padding: 5px 20px 15px;
}
</style>