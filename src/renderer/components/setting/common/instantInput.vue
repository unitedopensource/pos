<template>
    <div class="input">
        <label for="autoComplete">{{text(label)}}</label>
        <input id="autoComplete" :value="value" type="text" @input="input($event)" @focus="focus($event)" @keydown.enter="fill" @keydown.up="up" @keydown.down="down" @blur="blur">
        <div class="frame">
            <p>{{text('AUTO_COMPLETE')}}</p>
            <ul>
                <li v-for="item in items" class="ac">
                    <h4>{{item.usEN}}</h4>
                    <h5>{{item.zhCN}}</h5>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import dict from './dict'
export default {
    props: ['value', 'label'],
    data() {
        return {
            items: [],
            index: null
        }
    },
    methods: {
        input(e) {
            this.$emit('input', e.target.value);
            this.items = dict(e.target.value);
            this.index = this.items.length === 0 ? null : 0;
        },
        focus(e) {
            e.currentTarget.select();
        },
        blur() {
            this.items = [];
            this.index = null;
        },
        fill() {
            if (this.items.length === 0) return;
            this.items[this.index] && this.$emit("fill", this.items[this.index]);
            this.$nextTick(() => {
                let target = document.querySelectorAll("input")[4];
                target.focus();
                target.select();
                console.log("active",target)
            })

        },
        up() {
            this.index = this.index > 0 ? this.index - 1 : 0;
        },
        down() {
            this.index = this.index < this.items.length - 1 ? this.index + 1 : this.index;
        }
    },
    watch: {
        index(n) {
            let dom = document.querySelector(".ac.active");
            dom && dom.classList.remove("active");
            if (isNumber(n)) {
                this.$nextTick(() => {
                    dom = document.querySelectorAll(".ac");
                    dom[n] && dom[n].classList.add("active");
                })

            }
        }
    }
}
</script>

<style scoped>
.input {
    display: flex;
    position: relative;
}

label {
    min-width: 130px;
    padding-right: 20px;
    text-align: right;
    color: #666;
}

input {
    border: none;
    padding: 7px 0;
    font-size: 1em;
    flex: 1;
    font-family: 'Yuanti-SC';
    outline: none;
}

input:focus {
    z-index: 2;
}

input:focus+.frame {
    display: block;
}

.frame {
    position: absolute;
    display: none;
    width: 460px;
    min-height: 51px;
    top: -19px;
    right: 0px;
    background: #fff;
    z-index: 1;
    box-shadow: -1px 2px 3px rgba(0, 0, 0, 0.45);
    text-indent: 10px;
}

p {
    margin-bottom: 32px;
    border-bottom: 1px solid #eee;
    background: #CFD8DC;
    color: #666;
}

ul {
    border-top: 1px solid #ddd;
}

li.ac.active {
    background: #eee;
}
</style>