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
                <tr>
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
export default {
  props: ["init"],
  components: {},
  data() {
    return {
      transactions: [],
      viewable:false
    };
  },
  created() {
    this.checkPermission().then(this.initialData);
  },
  methods: {
    checkPermission() {
        return new Promise((resolve,reject)=>{



        })
    },
    initialData() {
      this.transactions = this.init.data;
    }
  }
};
</script>

<style scoped>

</style>