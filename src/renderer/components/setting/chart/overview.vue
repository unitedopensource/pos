<template>
    <div class="overview">
        <line-chart :chart-data="collection" :options="{responsive: false, maintainAspectRatio: false}"></line-chart>
    </div>
</template>

<script>
import lineChart from "./component/lineChart";
export default {
  components: { lineChart },
  data() {
    return {
      collection: null
    };
  },
  mounted() {
    this.initialChartData();
  },
  methods: {
    initialChartData() {
      this.collection = {
        labels: ["January","January","January"],
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
          }
        ]
      };
    },
    getRandomInt() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    }
  }
};
</script>

<style scoped>
.overview {
  background: transparent;
}
</style>