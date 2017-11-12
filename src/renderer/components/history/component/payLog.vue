<template>
  <div class="popupMask dark center">
    <div class="record">
      <header>
        <h3>{{$t('title.payLog')}}</h3>
        <h5>{{$t('tip.paidRecords',init.logs.length)}}</h5>
      </header>
      <table>
        <thead>
          <tr>
            <th>{{$t('thead.time')}}</th>
            <th>{{$t('thead.paymentType')}}</th>
            <th>{{$t('thead.amount')}}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log,index) in logs" :key="index">
            <td>{{log.time | moment("HH:mm:ss")}}</td>
            <td v-if="log.type ==='CASH'">{{$t('type.'+log.type)}}</td>
            <td v-else-if="log.type === 'CREDIT'">
              <span>{{$t('type.'+log.type)}}</span>
              <span>{{log.subType}}</span>
            </td>
            <td v-else-if="log.type ==='GIFT'"></td>
            <td class="amount">$ {{log.actual | decimal}}</td>
            <td>
              <button @click="removeConfirm(log,index)">{{$t("button.remove")}}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <footer>
        <button class="btn">{{$t("button.removeAll")}}</button>
        <div class="f1">
          <pagination :of="init.logs" @page="setPage" :contain="10" :max="6"></pagination>
        </div>
        <button class="btn" @click="close">{{$t('button.close')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import dialoger from "../../common/dialoger";
import pagination from "../../common/pagination";

export default {
  props: ["init"],
  components: { dialoger, pagination },
  data() {
    return {
      componentData: null,
      component: null,
      page: 0
    };
  },
  methods: {
    setPage(number) {
      this.page = number;
    },
    removeConfirm(payment, index) {
      this.$dialog({
        type: "warning",
        title: "dialog.paymentRemoveConfirm",
        msg: ["dialog.paymentRemoveConfirmTip", this.$t("type." + payment.type)]
      })
        .then(() => {
          switch (payment.type) {
            case "CREDIT":
              break;
            case "GIFT":
              break;
            default:
              this.remove(payment, index);
          }
        })
        .catch(() => {
          this.$q();
        });
    },
    remove(payment, index) {
      this.$q();
      this.$socket.emit("[PAYMENT] REMOVE", payment);
      this.init.logs.splice(index, 1);
    },
    close() {
      this.init.resolve();
    }
  },
  computed: {
    logs() {
      let min = this.page * 10;
      let max = min + 10;
      return this.init.logs.slice(min, max);
    }
  }
};
</script>

<style scoped>
.record {
  background: #fff;
  width: 500px;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
}

header {
  padding: 15px 20px 10px;
  border-bottom: 1px solid #eee;
}

h3 {
  color: #333;
}

h5 {
  font-weight: normal;
  color: #757575;
  margin-top: 3px;
}

table {
  table-layout: auto;
  border-spacing: 0;
  width: 100%;
}

thead th {
  padding: 5px 0;
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

tbody {
  background: #fafafa;
  display: block;
  height: 390px;
}

thead,
tbody tr {
  text-align: center;
  display: table;
  width: 100%;
  table-layout: fixed;
}

tbody td {
  text-align: center;
  padding: 5px 0;
}

td button {
  border: none;
  background: #ff5722;
  color: #fff;
  padding: 7px 10px;
  font-family: Yuanti-SC;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

tbody tr:nth-child(odd) {
  background: #eeeeee;
}
.amount {
  font-weight: bold;
  font-family: "Agency FB";
  color: #3c3c3c;
}
footer {
  display: flex;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.f1 {
  display: flex;
  justify-content: center;
}
</style>