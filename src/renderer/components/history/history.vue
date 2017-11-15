<template>
    <div class="popupMask center dark">
        <div class="wrap">
        <header>
            <div>
                <h3>{{$t('title.paymentHistory')}}</h3>
                <h5>{{$t('tip.foundPaymentRecords',transactions.length)}}</h5>
            </div>
            <nav class="filter">

            </nav>
        </header>
        <table>
            <thead>
                <tr>
                    <th class="num">{{$t('thead.ticket')}}</th>
                    <th class="type">{{$t('thead.orderType')}}</th>
                    <th>{{$t('thead.time')}}</th>
                    <th>{{$t('thead.cashier')}}</th>
                    <th>{{$t('thead.server')}}</th>
                    <th class="settlement">{{$t('thead.paymentType')}}</th>
                    <th>{{$t('thead.tip')}}</th>
                    <th>{{$t('thead.amount')}}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(record,index) in records" :key="index">
                    <td class="num">{{record.ticket.number}}</td>
                    <td class="type">{{$t('type.'+record.ticket.type)}}</td>
                    <td>{{record.time | moment("HH:mm:ss")}}</td>
                    <td>{{record.cashier}}</td>
                    <td>{{record.server}}</td>
                    <td class="settlement">{{$t('type.'+record.type)}}<span class="subType">{{record.subType}}</span></td>
                    <td class="amount adjustable" :class="{zero:record.tip === 0}" v-if="record.type ==='THIRD' && editable">$ {{record.tip | decimal}}</td>
                    <td class="amount" :class="{zero:record.tip === 0}" v-else>$ {{record.tip | decimal}}</td>
                    <td class="amount">$ {{record.actual | decimal}}</td>
                    <td>{{record.splitPayment}}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="num">{{totalCount}}</td>
                    <td class="type"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td class="settlement"></td>
                    <td class="amount">$ {{totalTip | decimal}}</td>
                    <td class="amount">$ {{totalAmount | decimal}}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
        <footer>
            <div class="f1">
                <pagination :of="transactions" :max="12" :contain="13" @page="setPage"></pagination>
            </div>
            <div class="btn" @click="init.resolve">{{$t('button.exit')}}</div>
        </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import pagination from "../common/pagination";
export default {
  props: ["init"],
  components: { pagination },
  computed: {
    filteredTransactions() {
      return this.transactions;
    },
    records() {
      let min = this.page * 13;
      let max = min + 13;

      return this.filteredTransactions.slice(min, max);
    },
    totalCount() {
      return this.records.length;
    },
    totalTip() {
      return this.filteredTransactions
        .map(t => t.tip)
        .reduce((a, b) => a + b, 0);
    },
    totalAmount() {
      return this.filteredTransactions
        .map(t => t.actual)
        .reduce((a, b) => a + b, 0);
    },
    ...mapGetters(["op"])
  },
  data() {
    return {
      transactions: [],
      editable: false,
      page: 0
    };
  },
  created() {
    this.checkPermission()
      .then(this.initialData)
      .catch(this.initialFailed);
  },
  methods: {
    checkPermission() {
      return new Promise(next => {
        this.editable = this.approval(this.op.modify, "tip");
        next();
      });
    },
    initialData() {
      this.transactions = this.init.data.filter(t => t.for === "Order");
    },
    initialFailed() {},
    setPage(number) {
      this.page = number;
    }
  }
};
</script>

<style scoped>
.wrap {
  box-shadow: var(--shadow);
  background: #fff;
  width: 900px;
  border-radius: 4px 4px 0 0;
}

h5 {
  color: #666;
  font-weight: normal;
  margin-top: 2px;
}

table {
  border-spacing: 0;
  table-layout: auto;
  width: 100%;
}
thead tr {
  background: #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}

thead th {
  padding: 3px 0;
  border-bottom: 1px solid #eeeeee;
}

.wrap header {
  display: flex;
  padding: 10px 20px;
}

tbody {
  display: block;
  height: 507px;
  text-align: center;
}

thead,
tbody tr,
tfoot tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

tbody td {
  padding: 10px 0;
}

tbody tr {
  background: #fafafa;
}

tbody tr:nth-child(even) {
  background: #eeeeee;
}

.amount {
  font-family: "Agency FB";
  font-weight: bold;
}

.zero {
  color: gray;
}

footer {
  display: flex;
  align-items: center;
  background: #eceff1;
  border-top: 1px solid #eeeeee;
}

tfoot tr {
  background: #ffffff;
  text-align: center;
  border-top: 1px solid #f5f5f5;
  text-align: center;
}

tfoot td {
  padding: 5px 0;
}

.num {
  width: 70px;
}

.type {
  width: 100px;
}

.adjustable {
  cursor: pointer;
  color: #ff9800;
}

.settlement {
  width: 180px;
}

.subType {
  margin-left: 5px;
  color: gray;
}
</style>