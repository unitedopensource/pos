<template>
  <div class="table">
    <table class="data">
      <thead>
        <tr>
          <th class="icon">{{$t('thead.verify')}}</th>
          <th class="date">{{$t('thead.date')}}</th>
          <th>{{$t('thead.start')}}</th>
          <th>{{$t('thead.end')}}</th>
          <th class="hours">{{$t('thead.workHour')}}</th>
          <th>{{$t('thead.breakTime')}}</th>
          <th>{{$t('thead.wage')}}</th>
          <th>{{$t('thead.salary')}}</th>
          <th class="padding">{{$t('thead.edit')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log,index) in logs" :key="index">
          <td v-if="log.valid" class="icon">
            <i class="fa fa-check-circle"></i>
          </td>
          <td v-else class="icon">
            <i class="fa fa-check-circle-o"></i>
          </td>
          <td class="date">{{log.date}}</td>
          <td>{{log.clockIn | moment('HH:mm:ss')}}</td>
          <td>{{log.clockOut | moment('HH:mm:ss')}}</td>
          <td class="hours">{{calculate(log.clockIn,log.clockOut)}}</td>
          <td class="break">{{log.break && log.break.length}}</td>
          <td v-if="log.valid" :title="log.note" class="wage decimal">$ {{log.wage | decimal}}
            <i class="fa fa-exclamation-circle" v-if="log.note"></i>
          </td>
          <td v-else class="invalid decimal">$ {{(operator.wage || 0) | decimal}}</td>
          <td class="decimal">$ {{salary(log)}}</td>
          <td v-if="editable && !log.lock" class="edit" @click="edit(log)">
            <i class="fa fa-pencil-square"></i>
          </td>
          <td v-else>
            <i class="fa fa-lock" @click="unlock(log)"></i>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="9" class="f1">
            <div class="summary">
              <div class="static">
                <p class="date">{{dateRange}}</p>
                <p class="value">
                  <span>{{$t("text.workHour",totalHours)}}</span>
                  <span>{{$t("text.workSalary",totalSalary.toFixed(2))}}</span>
                </p>
              </div>
              <div class="option">
                <dropdown label="filter.period" :options="ranges" filter="period" :reverse="true"></dropdown>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
    <div :is="component" :init="componentData" @refresh="fetchData"></div>
  </div>
</template>

<script>
import editor from "./component/timecardEditor";
import dropdown from "../../history/component/dropdown";
export default {
  props: ["operator"],
  components: { editor, dropdown },
  computed: {
    validSession() {
      return this.logs.filter(log => log.valid).length;
    },
    totalHours() {
      let total = this.logs
        .filter(log => log.valid)
        .map(log => log.clockOut - log.clockIn)
        .reduce((a, b) => a + b, 0);
      return this.calculate(0, total);
    },
    totalSalary() {
      return this.logs
        .filter(log => log.valid)
        .map(log => this.salary(log))
        .reduce((a, b) => a + b, 0);
    },
    dateRange() {
      if (this.logs.length === 0) {
        const to = moment(this.to).format("YYYY-MM-DD");
        const from = moment(this.from).format("YYYY-MM-DD");
        return `${from} ~ ${to}`;
      } else {
        const to = this.logs[0].date;
        const from = this.logs.last().date;
        return `${from} ~ ${to}`;
      }
    }
  },
  data() {
    return {
      op: this.$store.getters.op,
      componentData: null,
      component: null,
      editable: false,
      period: "week",
      from: "",
      to: "",
      logs: [],
      ranges: [
        {
          text: this.$t("thead.currentWeek"),
          value: "week"
        },
        {
          text: this.$t("thead.lastWeek"),
          value: "lastWeek"
        },
        {
          text: this.$t("thead.currentMonth"),
          value: "month"
        },
        {
          text: this.$t("thead.lastMonth"),
          value: "lastMonth"
        },
        {
          text: this.$t("report.setDate"),
          value: "specified"
        }
      ]
    };
  },
  created() {
    this.fetchData();
    this.$bus.on("filter", this.setFilter);
    this.editable = this.approval(this.op.permission, "timecard");
  },
  beforeDestroy() {
    this.$bus.off("filter", this.setFilter);
  },
  methods: {
    fetchData() {
      switch (this.period) {
        case "week":
          this.from = +moment()
            .subtract(4, "hours")
            .startOf("week")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "lastWeek":
          this.from = +moment()
            .subtract(4, "hours")
            .subtract(1, "weeks")
            .startOf("week")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .subtract(1, "weeks")
            .endOf("week")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "month":
          this.from = +moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "lastMonth":
          this.from = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .startOf("month")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .subtract(1, "months")
            .endOf("month")
            .add(1, "days")
            .hours(3)
            .minutes(59)
            .seconds(59);
          break;
        case "specified":
          break;
      }
      this.$socket.emit(
        "[TIMECARD] RECORDS",
        { _id: this.operator._id, from: this.from, to: this.to },
        logs => {
          this.logs = logs;
        }
      );
    },
    calculate(clockIn, clockOut) {
      clockOut = isNumber(clockOut) ? clockOut : +new Date();
      const duration = clockOut - clockIn;

      if (duration === 0) return 0;

      if (isNumber(duration)) {
        const hh = ("00" + Math.floor((duration % 8.64e7) / 3.6e6)).slice(-2);
        const mm = ("00" + Math.floor((duration % 3.6e6) / 6e4)).slice(-2);
        const ss = ("00" + Math.floor((duration % 6e4) / 1e3)).slice(-2);

        return this.$t("text.hhmmss", hh, mm, ss);
      }
    },
    salary(session) {
      const { clockIn, clockOut, wage } = session;
      if (!clockOut) return "0.00";

      const hour = toFixed((clockOut - clockIn) / 3.6e6, 2);

      return ((wage || this.operator.wage || 0) * hour).toFixed(2);
    },
    setFilter(opt) {
      this.period = opt.value || "week";
      this.fetchData();
    },
    edit(log) {
      this.$p("editor", { operator: this.operator, log });
    },
    unlock(log) {
      if (this.op.role !== "Developer") return;
      log.lock = false;
    }
  }
};
</script>

<style scoped>
.hours {
  width: 160px;
}

tbody {
  height: 600px;
  display: block;
}

tfoot tr {
  height: 66px;
  display: flex !important;
  align-items: center;
}

.summary {
  flex: 1;
  margin: 5px;
  background: #3f51b5;
  color: #fff;
  padding: 0px 20px;
  border-radius: 2px;
  display: flex;
  height: 58px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

p.date {
  font-size: 14px;
  font-family: "Agency FB";
  color: #e1f5fe;
  letter-spacing: 1px;
}

.value span {
  flex: 1;
}

p.value {
  display: flex;
}

.static {
  flex: 1;
}

.option {
  flex: 2;
  display: flex;
  justify-content: flex-end;
  color: #333;
}
</style>