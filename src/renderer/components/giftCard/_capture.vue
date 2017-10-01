<template>
    <div class="display">
        <div class="creditCard">
            <div class="tm">Gift Card</div>
            <form>
                <h2>{{store.name}}</h2>
                <ul class="inputs">
                    <li>
                        <label>CARD NUMBER</label>
                        <input type="text" v-model="card" class="cardNumber">
                    </li>
                    <li>
                        <label>Activation Date</label>
                        <input type="text" value="December (12)" class="exp">
                        <input type="text" value="$ 25.00" class="balance">
                    </li>
                </ul>
            </form>
            <div class="watermark">POS</div>
        </div>
        <div class="function">
            <div class="btn"></div>
            <div class="btn"></div>
            <div class="btn"></div>
            <div class="btn"></div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    props: ['init'],
    mounted() {
        window.addEventListener("keydown", this.reader, false);
    },
    data() {
        return {
            timeout: null,
            read: "",
            card: ""
        }
    },
    methods: {
        reader(e) {
            e.preventDefault();
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.read = "";
            }, 300);
            (e.code.includes('Digit') || e.code.includes('Key')) && (this.read += e.code.slice(-1));
            (e.code === 'Equal') && (this.read += "=");
            (e.code === 'Slash') && (this.read += "/");
            (e.code === 'Semicolon') && (this.read += ";");
            e.code === 'Enter' && this.parser(this.read);
        },
        parser(data) {
            if (data.includes("%E") || data.includes(";E?")) {
                this.msg = this.text("READ_TRACK_FAILED");
                this.read = "";
                return;
            }
            try {
                let number = data.match(/\d{16,16}/)[0];
                this.$socket.emit("[GIFTCARD] QUERY_CARD",number);
                this.card = number;
            } catch (e) {
                this.msg = this.text("READ_TRACK_FAILED");
                this.read = "";
            }
        }
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.reader, false);
    },
    computed: {
        ...mapGetters(['store'])
    },
    sockets: {
        GIFT_CARD_RESULT(card) {
            //this.giftCard = card;
            console.log(card)
            this.$exitComponent();
        },
    }
}
</script>

<style scoped>
.creditCard {
    font-family: Arial;
    display: block;
    position: relative;
    max-width: 365px;
    margin: 5px;
    padding: 20px;
    overflow: hidden;
    border-radius: 4px;
    z-index: 1;
    color: #fff;
    background: linear-gradient(to bottom, #1db1cf 0%, #1078ab 100%);
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.8), inset 0px 1px 3px rgba(255, 255, 255, 0.3), inset 0px 0px 2px rgba(255, 255, 255, 0.2);
}

.tm {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.25em;
    font-style: italic;
    text-shadow: 0px 0px 3px rgba(17, 123, 173, 0.9);
    position: absolute;
    top: 17px;
    right: 20px;
    text-transform: uppercase;
    font-weight: bold;
}

.tm:before {
    content: ' ';
    position: absolute;
    left: 10px;
    top: 6px;
    width: 0;
    height: 0;
    border-top: 10px solid orange;
    border-left: 10px solid transparent;
}

form {
    position: relative;
}

h2 {
    text-shadow: 1px 1px 2px rgba(17, 121, 173, 0.8);
    font-size: 22px;
}

.inputs {
    list-style: none;
    margin-top: 20px;
}

li {
    margin-bottom: 10px;
}

label {
    display: block;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    font-size: 16px;
    font-weight: bold;
    text-shadow: 0px 1px 2px rgba(17, 123, 173, 0.6);
}

.cardNumber {
    width: 345px;
}

.exp {
    width: 215px;
    display: inline-flex;
}

.balance {
    width: 100px;
    display: inline-flex;
}

input {
    background: linear-gradient(to bottom, #d3d3d3 0%, #d9d9d9 38%, #e5e5e5 82%, #e7e7e7 100%);
    display: block;
    padding: 10px;
    color: #757575;
    font-size: 1em;
    font-weight: bold;
    text-shadow: 1px 1px 1px #fff;
    border: 1px solid rgba(16, 103, 133, 0.6);
    box-shadow: 0px 0px 3px rgba(255, 255, 255, 0.5), inset 0px 1px 4px rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.watermark {
    bottom: -15px;
    left: -50px;
    color: rgba(255, 255, 255, 0.06);
    font-size: 10em;
    font-weight: bold;
    font-style: italic;
    position: absolute;
    z-index: 10;
}
</style>