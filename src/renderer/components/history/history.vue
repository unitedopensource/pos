<template>
    <div class="popupMask center dark">
        <header>
            <span>Payment History</span>
        </header>
        <table>
            <thead>
                <tr>
                    <th>Ticket</th>
                    <th>Type</th>
                    <th>Time</th>
                    <th>Cashier</th>
                    <th>Station</th>
                    <th>payment</th>
                    <th>amount</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="(record,index) in transactions" :key="index">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  components: {},
  computed: {
    ...mapGetters(["op"])
  },
  data() {
    return {
      transactions: [],
      viewable: false
    };
  },
  created() {
    this.checkPermission()
      .then(this.initialData)
      .catch(this.initialFailed);
  },
  methods: {
    checkPermission() {
      return new Promise((resolve, reject) => {
        this.viewable = this.approval(this.op.view, "invoices");

        resolve()
      });
    },
    initialData() {
      this.transactions = this.viewable
        ? this.init.data
        : this.init.data.filter(t => t.cashier === this.op.name);
    },
    initialFailed() {}
  }
};
</script>

<style scoped>

</style>