<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('title.payOut')}}</span>
            </header>
            <div class="inner">
                <section class="item">
                    <div>
                        <label for="receiver">{{$t('text.receiver')}}:</label>
                        <input type="type" v-model="receiver" id="receiver" :placeholder="$t('text.name')" ref="receiver">
                    </div>
                    <div>
                        <label for="price">{{$t('text.price')}}:</label>
                        <input type="type" v-model="amount" id="Price" placeholder="0.00" @keydown.enter="confirm">
                    </div>
                </section>
                <textarea v-model="comment" :placeholder="$t('text.comment')"></textarea>
            </div>
            <footer>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <button class="btn" @click="confirm" :disabled="isNaN(amount)">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import dialoger from "../common/dialoger";
export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      receiver: "",
      amount: "0.00",
      comment: ""
    };
  },
  methods: {
    confirm() {}
  },
  computed: {
    ...mapGetters(["op"])
  }
};
</script>

<style scoped>
.inner {
  padding: 10px;
}

section.item {
  display: flex;
  padding: 0 0 10px;
}

section.item div {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

textarea {
  width: 450px;
  height: 150px;
  margin: auto;
  display: block;
  padding: 10px;
  border: 1px solid #ddd;
}

input {
  font-size: 24px;
  width: 180px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-indent: 5px;
  text-transform: capitalize;
}
</style>