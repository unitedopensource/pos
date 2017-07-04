<template>
    <div class="giftCard">
        <i class="fa" :class="[icon]"></i>
        <h3>{{msg}}</h3>
        <footer>
            <button class="btn" @click="exit">{{text('CANCEL')}}</button>
        </footer>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            timeout: null,
            card: "",
            icon: "info",
            msg: this.text("GC_SWIPE")
        }
    },
    mounted() {
        window.addEventListener("keydown", this.reader, false);
    },
    methods: {
        reader(e) {
            e.preventDefault();
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.card = "";
            }, 300);
            (e.code.includes('Digit') || e.code.includes('Key')) && (this.card += e.code.slice(-1));
            (e.code ==='Equal') && (this.card += "=");
            (e.code === 'Slash') && (this.card += "/");
            (e.code === 'Semicolon') && (this.card += ";");
            e.code === 'Enter' && this.parser(this.card);
        },
        parser(data) {
            if (data.includes("%E") || data.includes(";E?")) {
                this.msg = this.text("READ_TRACK_FAILED");
                this.card = "";
                return;
            }
            try {
                let number = data.match(/\d{16,16}/)[0];
                this.init.resolve(number);
            } catch (e) {
                this.msg = this.text("READ_TRACK_FAILED");
                this.card = "";
            }
        },
        exit() {
            this.init.reject()
        }
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.reader, false);
    }
}
</script>

<style scoped>
.giftCard {
    background: #EFF3F6;
    width: 400px;
    min-height: 170px;
    border-radius: 4px;
    text-align: center;
    color: #3c3c3c;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
}

i {
    font-size: 6em;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    margin: 15px 0;
}

footer {
    background: #eee;
    margin-top: 15px;
    display: flex;
}

footer .btn {
    margin: 10px;
    flex: 1;
}
</style>
