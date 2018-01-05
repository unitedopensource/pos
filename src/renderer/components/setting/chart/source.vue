<template>
  <div>
    <range-select @update="fetchData"></range-select>
    <pie :chart-data="collection"></pie>
  </div>
</template>

<script>
import pie from "./component/pie";
import rangeSelect from "./component/range";

export default {
  components: { pie, rangeSelect },
  data() {
    return {
      collection: [],
      base: "count"
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      let from, to;
      switch (range) {
        case "currentWeek":
          from = +moment()
            .startOf("w")
            .hours(4);
          to = +moment()
            .endOf("w")
            .add(4, "h");
          this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
            this.initialChartData(result)
          );
          break;
        case "lastWeek":
          from = +moment()
            .subtract(1, "w")
            .startOf("w")
            .hours(4);
          to = +moment()
            .subtract(1, "w")
            .endOf("w")
            .add(4, "h");

          this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
            this.initialChartData(result)
          );
          break;
        case "lastMonth":
          from = +moment()
            .subtract(1, "M")
            .startOf("M")
            .hours(4);
          to = +moment()
            .subtract(1, "M")
            .endOf("M")
            .add(4, "h");
          this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
            this.initialChartData(result)
          );
          break;
        default:
          from = +moment()
            .startOf("M")
            .hours(4);
          to = +moment()
            .endOf("M")
            .add(4, "h");

          this.$socket.emit("[CHART] SOURCE", { from, to }, result =>
            this.initialChartData(result)
          );
      }
    },
    initialChartData(result) {
      const { labels, counts, sales } = result;
      this.collection = {
        labels: labels.map(t => this.$t("type." + t)),
        datasets: [
          {
            data: this.base === "count" ? counts : sales,
            backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"]
          }
        ]
      };
    }
  }
};
</script>