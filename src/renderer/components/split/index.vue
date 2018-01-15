<template>
  <div class="popupMask dark center">
    <div class="editor">
      <header>
        <h5>{{$t('title.create')}}</h5>
        <h3>{{$t('title.split')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="view" ref="scroll">
          <div class="scroll" :style="scroll">
            <ticket v-for="(order,index) in splits" :key="index" :index="index" :data="order" @acquire="transfer" :master="false"></ticket>
          </div>
        </div>
        <div class="option" @click="create" v-if="!done">
          <div>
            <i class="fa fa-3x fa-plus"></i>
          </div>
        </div>
        <div class="option" v-else>
          <div @click="create">
            <i class="fa fa-3x fa fa-plus"></i>
          </div>
          <div @click="restore">
            <i class="fa fa-3x fa fa-minus"></i>
          </div>
        </div>
        <ticket :data="order" :master="true" @acquire="restore" @done="setDone"></ticket>
      </div>
      <footer>
        <div class="opt">
          <div class="switches">
            <label class="input-toggle">
              <input type="checkbox" v-model="swipeMode" :disabled="true">
              <span></span>
            </label>
            <label class="label indent">{{$t("text.swipeMode")}}</label>
          </div>
        </div>
        <button class="btn" @click="init.reject">{{$t('button.back')}}</button>
        <button class="btn" @click="confirm" :disabled="!done">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ticket from "./ticket";
import Hammer from "hammerjs";

export default {
  props: ["init"],
  components: { ticket },
  computed: {
    scroll() {
      return { transform: `translate3d(${this.offset}px,0,0)` };
    },
    ...mapGetters(["app", "ticket"])
  },
  data() {
    return {
      order: Object.assign(Object.create(Object.getPrototypeOf(this.$store.getters.order)), this.$store.getters.order),//JSON.parse(JSON.stringify(this.$store.getters.order)),
      swipeMode: false,
      hammer: null,
      done: false,
      splits: [],
      offset: 0
    };
  },
  created() {
    this.order.split && this.getSplitOrder();
  },
  mounted() {
    this.registerSwipeEvent();
  },
  methods: {
    getSplitOrder() {
      this.$socket.emit("[SPLIT] GET", this.order.children, splits => {
        this.splits = splits;
        this.done = this.order.content.filter(i => !i.split).length === 0;
      });
    },
    create() {
      const _id = ObjectId();
      const order = Object.assign(Object.create(Object.getPrototypeOf(this.order)), this.order);//JSON.parse(JSON.stringify(this.order));

      let content = [];
      let payment = {
        subtotal: 0,
        tax: 0,
        total: 0,
        due: 0,
        balance: 0,
        paid: 0,
        gratuity: 0,
        tip: 0,
        discount: 0,
        delivery: 0,
        surcharge: 0,
        remain: 0,
        log: []
      };

      this.$children.map(vm => content.push(...vm.buffer));
      const split = Object.assign({}, order, { _id, content, payment });
      this.splits.push(split);
      this.$bus.emit("remove");

      content.length && content[0].__split__ && this.$bus.emit("release");
    },
    transfer({ unique, index }) {
      let buffer = [];
      this.$children.map(vm =>
        vm.buffer.forEach(item => buffer.push(Object.assign(Object.create(Object.getPrototypeOf(item)), item)))//JSON.parse(JSON.stringify(item)
      );
      this.$bus.emit("transfer", {
        unique,
        items: buffer
      });
    },
    restore() {
      let buffer = [];
      this.$children.map(vm => vm.buffer.forEach(item => buffer.push(item)));

      const items = buffer.filter(item => item.parent).map(item => item.parent);
      this.$bus.emit("restore", items);

      if (items.length) this.done = false;

      const __split__ = buffer.some(item => item.__split__);
      __split__ && this.$bus.emit("destroy", items);
    },
    registerSwipeEvent() {
      this.hammer = new Hammer(this.$refs.scroll);
      this.hammer.get("swipe").set({ direction: Hammer.DIRECTION_HORIZONTAL });
      this.hammer.on("swipeleft swiperight", e => {
        const base = Math.abs(e.velocityX) > 2.5 ? 2 : 1;

        switch (e.type) {
          case "swipeleft":
            this.offset -= 260 * base;

            break;
          case "swiperight":
            this.offset += 260 * base;
            break;
        }

        this.checkBoundary(e.direction);
      });
    },
    checkBoundary(direction) {
      this.$nextTick(() => {
        const container = 875;
        const { left, right, width } = document
          .querySelector(".editor .scroll")
          .getBoundingClientRect();

        direction === 2 &&
          setTimeout(() => {
            const overflow = Math.abs(left) % 250;
            const fixed = this.offset + overflow;
            this.offset = fixed;
          }, 300);
        direction === 4 &&
          right > width &&
          setTimeout(() => {
            this.offset -= right - width > 250 ? 500 : 250;
          }, 300);
      });
    },
    setDone(boolean) {
      this.done = boolean;
    },
    confirm() {
      const parent = this.order._id;
      const splits = this.$children
        .map(vm => vm.order)
        .filter((order, index) => index !== 0 && order.content.length !== 0);

      if (this.app.newTicket && this.$route.name === "Menu") {
        const { number, type } = this.ticket;

        this.order.number = number;
        this.order.type = type;
      }

      let tip = 0;
      let subtotal = 0;
      let total = 0;
      let discount = 0;
      let balance = 0;
      let remain = 0;

      if (splits.length > 1) {
        splits.forEach((order, index) => {
          order.parent = parent;
          order.number = `${this.order.number}-${index + 1}`;

          tip += order.payment.tip;
          subtotal += order.payment.subtotal;
          total += order.payment.total;
          discount += order.payment.discount;
          balance += order.payment.balance;
          remain += order.payment.remain;
        });

        this.$socket.emit("[SPLIT] SAVE", { splits, parent });

        this.order.payment.tip = toFixed(tip, 2);
        this.order.payment.subtotal = toFixed(subtotal, 2);
        this.order.payment.total = toFixed(total, 2);
        this.order.payment.discount = toFixed(discount, 2);
        this.order.payment.due = toFixed(total - discount, 2);
        this.order.payment.balance = toFixed(balance, 2);
        this.order.payment.remain = toFixed(remain, 2);
        this.order.content.forEach(item => (item.split = true));
        this.order.children = splits.map(i => i._id);
        this.order.split = true;

        this.$socket.emit("[UPDATE] INVOICE", this.order);

        if (this.$route.name === "Menu" && this.app.newTicket) {
          this.setOrder(this.order);
          this.init.resolve();
        } else {
          this.init.resolve();
        }
      } else {
        this.$socket.emit("[SPLIT] SAVE", { splits: [], parent });

        const { payment } = splits.find(order => order.content !== 0);

        payment.discount = 0;
        payment.paid = 0;

        Object.assign(this.order, { payment });

        this.order.content.forEach(item => (item.split = false));
        this.order.split = false;
        this.order.children = [];
        this.order.coupons = [];
        this.$socket.emit("[UPDATE] INVOICE", this.order);
        this.init.resolve();
      }
    },
    ...mapActions(["setOrder"])
  }
};
</script>

<style scoped>
.editor {
  width: 1000px;
}

.wrap {
  display: flex;
  min-height: 500px;
  padding: initial;
  background: url(../../assets/image/grid.png) #fcfcfc;
}

.view {
  flex: 1;
  display: flex;
  flex-direction: row-reverse;
  width: 618px;
  overflow: hidden;
}

.view .scroll {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  transition: transform 0.3s ease-in-out;
}

.option {
  display: flex;
  flex-direction: column;
}

.option div {
  display: flex;
  width: 110px;
  flex: 1;
  justify-content: center;
  align-items: center;
  color: #757575;
  border: 2px dashed #eee;
  margin: 4px;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.switches {
  display: flex;
}

.switches .label {
  margin-left: 5px;
}
</style>