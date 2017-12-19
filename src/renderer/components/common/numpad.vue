<template>
    <div class="pad">
        <section>
            <div @click="input('7')" class="numKey">7</div>
            <div @click="input('8')" class="numKey">8</div>
            <div @click="input('9')" class="numKey">9</div>
            <div @click="input('4')" class="numKey">4</div>
            <div @click="input('5')" class="numKey">5</div>
            <div @click="input('6')" class="numKey">6</div>
            <div @click="input('1')" class="numKey">1</div>
            <div @click="input('2')" class="numKey">2</div>
            <div @click="input('3')" class="numKey">3</div>
            <div @click="input('0')" class="numKey">0</div>
            <div @click="input('00')" class="double numKey">00</div>
        </section>
        <aside class="padCtrl">
            <div @click="del">&#8592;</div>
            <div @click="clear">C</div>
            <div @click="$emit('enter')">&#8626;</div>
        </aside>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: [String, Number],
            default: "0.00"
        },
        type: {
            type: String,
            default: "decimal"
        }
    },
    data() {
        return {
            reset: true
        }
    },
    methods: {
        input(value) {
            switch (this.type) {
                case "number":
                    this.reset ? this.$emit("input", value) : this.$emit("input", this.value + value);
                    break;
                case "decimal":
                    const _value = (((this.value * 100).toFixed(0) + value) / 100).toFixed(2);
                    this.reset ? this.$emit("input", (value / 100).toFixed(2)) : this.$emit("input", _value);
                    break;
            }
            this.reset = false;
        },
        del() {
            switch (this.type) {
                case "number":
                    this.$emit("input", this.value.slice(0, -1));
                    break;
                case "decimal":
                    this.$emit("input", (this.value.slice(0, -1) / 10).toFixed(2));
                    break;
            }
        },
        clear() {
            this.type === 'number' ? this.$emit("input", "0") : this.$emit("input", "0.00");
            this.reset = true;
        }
    },
    watch: {
        type(n) {
            this.clear()
        }
    }
}
</script>

<style scoped>
.pad {
  display: flex;
  padding: 5px 4px 1px 6px;
}

section {
  display: flex;
  flex-wrap: wrap;
  width: 315px;
}

aside {
  display: flex;
  flex-direction: column;
}
</style>