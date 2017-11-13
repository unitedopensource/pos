<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('menu.temporary')}}</span>
            </header>
            <div class="inner">
                <section class="item">
                    <div>
                        <label for="item">{{$t('text.item')}}:</label>
                        <input type="type" v-model="item" id="item" placeholder="Temporary Item" ref="item">
                    </div>
                    <div>
                        <label for="price">{{$t('text.price')}}:</label>
                        <input type="type" v-model.number="single" id="Price" placeholder="0.00" @keydown.enter="confirm">
                    </div>
                </section>
                <textarea v-model="comment" :placeholder="$t('')"></textarea>
            </div>
            <footer>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      item: "",
      single: 0,
      comment: ""
    };
  },
  mounted() {
    this.$refs.item.focus();
  },
  methods: {
    confirm() {
      let item = JSON.parse(JSON.stringify(this.init.item));
      let single = isNumber(this.single) ? this.single : 0;
      let name = this.item.replace(/\b[a-z]/g, t => t.toUpperCase());
      Object.assign(item, {
        zhCN: `* ${name} *`,
        usEN: `* ${name} *`,
        single,
        price: [single],
        comment: this.comment,
        temporary: true,
        prices: {
          DEFAULT: [single]
        }
      });
      this.addToOrder(item);
      this.setSides(Array(11).fill({ zhCN: "", usEN: "", disable: true }));
      this.init.resolve();
    },
    ...mapActions(["addToOrder", "setSides"])
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