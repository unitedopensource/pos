<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.discount')}}</h3>
            </header>
            <div class="header">
                <h3>$ {{discount}}</h3>
                <h5></h5>
            </div>
            <div class="input">
                <input type="text" v-model="discount" placeholder="0.00">
                <span class="unit" v-if="unit === '%'" @click="unit = '$'">%</span>
                <span class="unit" v-else @click="unit = '%'">$</span>
            </div>
            <num-pad v-model="discount"></num-pad>
        </div>
    </div>
</template>

<script>
import numPad from "../common/numpad"
export default {
    props: ["init"],
    components: { numPad },
    data() {
        return {
            unit: "%",
            discount: "0.00",
            reset: true
        }
    },
    methods: {
        input(val) {

        },
        del() {

        },
        clear() {

        },
        enter() {

        }

    }
}
</script>

<style scoped>
.input {
  position: relative;
  display: flex;
  height: 54px;
  align-items: center;
  margin: 2px 7px;
  border: none;
  border-radius: 4px;
  color: #656565;
  box-shadow: inset 0 1px 6px -1px rgba(0, 0, 0, 0.4);
  background: #fafafa;
}

.header {
  text-align: center;
  height: 45px;
  padding: 10px;
  font-family: "Agency FB";
  font-weight: bold;
}

input {
  border: none;
  flex: 1;
  text-align: right;
  font-size: 34px;
  padding-right: 15px;
  font-weight: bold;
  font-family: "Agency FB";
  color: #3c3c3c;
  background: transparent;
}

.unit {
  position: absolute;
  left: 10px;
  padding: 8px 0;
  width: 50px;
  text-align: center;
  background: #607d8b;
  color: #fff;
  border-radius: 4px;
  font-weight: bold;
  font-family: "Agency FB";
  cursor: pointer;
  font-size: 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>