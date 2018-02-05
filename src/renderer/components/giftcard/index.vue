<template>
  <div class="popupMask dark center">
    <div class="editor" v-show="!component">
      <header class="tab">
        <div>
          <h5>{{giftcard.number | card}}</h5>
          <h3>{{$t('card.giftCard')}}</h3>
        </div>
        <nav class="tabs">
          <div>
            <input type="radio" v-model="tab" value="activation" name="tab" id="activation">
            <label for="activation">{{$t('card.activation')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="reload" name="tab" id="reload">
            <label for="reload">{{$t('card.reload')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="history" name="tab" id="history">
            <label for="history">{{$t('card.history')}}</label>
          </div>
        </nav>
      </header>
      <template v-if="tab === 'activation'">
        <div class="wrap"></div>
      </template>
      <template v-else-if="tab === 'deactivation'">
        <div class="wrap"></div>
      </template>
      <template v-else-if="tab === 'reload'">
        <div class="wrap"></div>
      </template>
      <template v-else>
        <div class="wrap table">
          <table class="event">
            <thead>
              <tr>
                <th>{{$t('thead.date')}}</th>
                <th>{{$t('thead.type')}}</th>
                <th>{{$t('thead.cashier')}}</th>
                <th>{{$t('thead.change')}}</th>
                <th>{{$t('thead.balance')}}</th>
                <th>{{$t('thead.ticket')}}</th>
                <th>{{$t('thead.view')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log,index) in records" :key="index">
                <td>{{log.date}}</td>
                <td>{{$t('type.'+log.type)}}</td>
                <td>{{log.cashier}}</td>
                <td v-if="log.change > 0" class="positive">{{log.change | decimal}}</td>
                <td v-else class="negative">{{log.change | decimal}}</td>
                <td>{{log.balance | decimal}}</td>
                <td v-if="log.order">
                  <span>#{{log.order.number}}</span>
                  <span>{{$t('type.'+log.order.type)}}</span>
                </td>
                <td v-else></td>
                <td>
                  <i class="fa fa-file-text-o" @click="viewReceipt(log.order._id)" v-show="log.order && log.order._id"></i>
                </td>
              </tr>
            </tbody>
          </table>
          <pagination :of="logs" @page="setPage" :max="10" :contain="15"></pagination>
        </div>
      </template>
      <footer>
        <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import search from "./search";
import capture from "./capture";
import ticket from "../common/ticket";
import pagination from "../common/pagination";

export default {
  props: ["init"],
  components: { search, capture, ticket, pagination },
  data() {
    return {
      activated: false,
      tab: "activation",
      component: null,
      componentData: null,
      giftcard: {},
      page: 0,
      logs: []
    };
  },
  mounted() {
    this.swipeCard()
      .then(this.initialData)
      .catch(this.initialFailed);
  },
  computed: {
    records() {
      const min = this.page * 15;
      const max = min + 15;

      return this.logs.slice(min, max);
    }
  },
  methods: {
    swipeCard() {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "capture";
      });
    },
    inputCard() {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "search";
      });
    },
    initialData(card) {
      this.giftcard = card;
      this.$socket.emit("[GIFTCARD] HISTORY", card.number, logs => {
        this.logs = logs;
        this.$q();
      });
    },
    initialFailed(exception) {
      if (typeof exception === "boolean") this.$q();

      switch (exception) {
        case "manual":
          this.inputCard()
            .then(this.initialData)
            .catch(this.initialFailed);
          break;
        case "":
          break;
      }
    },
    viewReceipt(id) {
      this.$socket.emit("[VIEW] INVOICE", id, ticket => {
        this.$open("ticket", { ticket, exit: true });
      });
    },
    setPage(page) {
      this.page = page;
    }
  }
};
</script>

<style scoped>
.popupMask{
  padding: inherit;
}
.editor {
  width: 575px;
}
.table.wrap{
  padding:initial;
}
.tab > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.positive {
  color: green;
}

.negative {
  color: #ff5722;
}
</style>