<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="login shadow">
            <h2>{{$t('text.enterPin')}}</h2>
            <div class="input">
                <span v-for="(circle,index) in pin" :key="index"></span>
            </div>
            <section class="numpad">
                <div @click="setPin(7)">7</div>
                <div @click="setPin(8)">8</div>
                <div @click="setPin(9)">9</div>
                <div @click="setPin(4)">4</div>
                <div @click="setPin(5)">5</div>
                <div @click="setPin(6)">6</div>
                <div @click="setPin(1)">1</div>
                <div @click="setPin(2)">2</div>
                <div @click="setPin(3)">3</div>
                <div @click="reset">X</div>
                <div @click="setPin(0)">0</div>
                <div @click="access">√</div>
            </section>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            pin: []
        }
    },
    mounted() {
        window.addEventListener("keydown", this.input, false);
    },
    methods: {
        setPin(num) {
            this.pin.push(num)
        },
        reset() {
            this.pin = []
        },
        delPin() {
            this.pin.pop()
        },
        input(e) {
            e.preventDefault();
            switch (e.key) {
                case "Enter":
                    this.access()
                    break;
                case "Backspace":
                    this.delPin()
                    break;
                default:
                    /^[a-z,A-z,0-9]$/.test(e.key) && this.setPin(e.key);
            }
        },
        access() {
            this.$socket.emit("[ACCESS] CODE", this.pin.join(""), (op) => {
                op ? this.init.resolve(op) : this.init.reject()
            })

        }
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.input, false);
    }
}
</script>

<style scoped>
.login {
    width: 337px;
    background-color: #f9f9f9;
    border-radius: 4px;
    color: rgba(0, 0, 0, 0.87);
    text-align: center;
    padding: 10px 9px 4px;
}

.input {
    background: lightgray;
    text-align: center;
    color: #fff;
    width: 275px;
    height: 40px;
    overflow: hidden;
    margin: auto;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    flex-wrap: wrap;
    box-shadow: inset 0px 0px 6px rgba(105, 81, 81, 0.285);
}

.input span {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.3);
    margin: 5px;
}

h2 {
    padding: 20px 10px;
}

section {
    margin-top: 15px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

section div:nth-child(3n+3) {
    margin-right: 0;
}
</style>