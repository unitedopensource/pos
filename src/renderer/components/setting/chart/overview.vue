<template>
  <div class="overview">
    <line-chart :chart-data="collection"></line-chart>
  </div>
</template>

<script>
import lineChart from "./component/lineChart";
export default {
  components: { lineChart },
  data() {
    return {
      collection: null,
      gradient: null
    };
  },

  mounted() {
    this.initialChartData();
  },
  methods: {
    initialChartData() {
      // this.$socket.emit("[CHART] RANGE", collection => {
      //   this.collection = collection;
      // })
      this.collection = {
        labels: ["2017-12-01", "2017-12-02", "2017-12-04", "2017-12-05", "2017-12-06", "2017-12-07", "2017-12-08", "2017-12-09", "2017-12-11", "2017-12-12", "2017-12-13", "2017-12-14", "2017-12-15", "2017-12-16", "2017-12-18", "2017-12-19", "2017-12-20", "2017-12-21", "2017-12-22", "2017-12-23", "2017-12-26"],
        datasets: [{
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          borderColor: "rgb(255, 99, 132)",
          data: [2940.24, 1448.02, 1619.54, 1611.24, 2062.77, 1738.52, 2356.96, 1203.83, 1431.87, 1452.6, 1278.63, 1644.79, 1638.63, 918.9, 1473.3, 1763.4, 1976.98, 1560.62, 1312.01, 694.96, 1280.5],
          fill: "start",
          label: "SALES",
          cubicInterpolationMode: "monotone",
          borderWidth: 2,
          borderDash: [3, 3],
          pointHoverRadius: 10,
          pointStyle: "circle"
        }]
      }
    }
  }
};
</script>

<style scoped>
.overview {
  width: 100%;
  margin: initial;
}
</style>