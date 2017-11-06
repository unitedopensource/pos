<template>
    <div>
        <section class="period">
            <div class="wrap">
                <div>
                    <input type="radio" name="period" id="week" v-model="period" value="week" @change="fetchData">
                    <label for="week">{{$t('thead.currentWeek')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="lastWeek" v-model="period" value="lastWeek" @change="fetchData">
                    <label for="lastWeek">{{$t('thead.lastWeek')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="month" v-model="period" value="month" @change="fetchData">
                    <label for="month">{{$t('thead.currentMonth')}}</label>
                </div>
                <div>
                    <input type="radio" name="period" id="lastMonth" v-model="period" value="lastMonth" @change="fetchData">
                    <label for="lastMonth">{{$t('thead.lastMonth')}}</label>
                </div>
            </div>
            <div class="fn">
                <button :disabled="true">
                    <i class="fa fa-calendar-check-o"></i>Calendar</button>
                <button :disabled="logs.length ===0" @click="generateExcel">
                    <i class="fa fa-external-link"></i>Export</button>
            </div>
        </section>
        <section class="dataList">
            <table>
                <thead>
                    <tr>
                        <th class="period"></th>
                        <th class="date">{{$t('thead.date')}}</th>
                        <th>{{$t('thead.start')}}</th>
                        <th>{{$t('thead.end')}}</th>
                        <th>{{$t('thead.workHour')}}</th>
                        <th>{{$t('thead.wage')}}</th>
                        <th>{{$t('thead.salary')}}</th>
                        <th>{{$t('thead.verify')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(log,index) in logs" :key="index">
                        <td></td>
                        <td>{{log.clockIn | moment('YYYY-MM-DD')}}</td>
                        <td v-if="approval" class="editable" @click="editClockIn(log)">{{log.clockIn | moment('HH:mm:ss')}}</td>
                        <td v-else>{{log.clockIn | moment('HH:mm:ss')}}</td>
                        <td v-if="approval" class="editable" @click="editClockOut(log)">{{log.clockOut | moment('HH:mm:ss')}}</td>
                        <td v-else>{{log.clockOut | moment('HH:mm:ss')}}</td>
                        <td>{{calculate(log.clockIn,log.clockOut)}}</td>
                        <td v-if="log.verified">${{log.wage | decimal}}</td>
                        <td v-else class="unverified">${{(profile.wage || 0) | decimal}}</td>
                        <td>{{salary(log.clockIn,log.clockOut)}}</td>
                        <td v-if="approval" class="editable" @click="verification(log)">
                            <i class="fa fa-pencil-square"></i>
                        </td>
                        <td v-else></td>
                    </tr>
                </tbody>
            </table>
        </section>
        <div :is="component" :init="componentData" @refresh="fetchData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import fileSaver from "file-saver";
import editor from "./editor";
import verify from "./verify";
export default {
  props: ["profile"],
  components: { editor, verify },
  computed: {
    ...mapGetters(["op"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      approval: false,
      period: "week",
      defaultWage: 0,
      from: "",
      to: "",
      logs: []
    };
  },
  created() {
    this.fetchData();
    this.approval = this.op.permission
      ? this.op.permission.includes("timecard")
      : false;
    this.defaultWage = isNumber(this.profile.wage) ? this.profile.wage : 0;
  },
  methods: {
    calculate(clockIn, clockOut) {
      clockOut = clockOut || +new Date();
      let duration = clockOut - clockIn;
      if (isNumber(duration)) {
        let hh = ("00" +
          Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        ).slice(-2);
        let mm = ("00" + Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
        ).slice(-2);
        let ss = ("00" + Math.floor((duration % (1000 * 60)) / 1000)).slice(-2);

        return (
          hh +
          " " +
          this.$t("text.hour") +
          " " +
          mm +
          " " +
          this.$t("text.minute") +
          " " +
          ss +
          " " +
          this.$t("text.second")
        );
      }
    },
    salary(clockIn, clockOut) {
      let hour = isNumber(clockOut)
        ? toFixed((clockOut - clockIn) / 3600000, 2)
        : 0;
      let wage = isNumber(this.profile.wage)
        ? parseFloat(this.profile.wage)
        : 0;
      return "$ " + toFixed(wage * hour, 2).toFixed(2);
    },
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
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
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
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
          break;
        case "month":
          this.from = +moment()
            .subtract(4, "hours")
            .startOf("month")
            .hours(4);
          this.to = +moment()
            .subtract(4, "hours")
            .endOf("month")
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
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
            .add("1", "days")
            .hours(3)
            .minutes(59)
            .seconds(59)
            .milliseconds(0);
          break;
        case "any":
          break;
      }
      this.$socket.emit(
        "[TIMECARD] RECORDS",
        { _id: this.profile._id, from: this.from, to: this.to },
        logs => {
          this.logs = logs;
        }
      );
    },
    edit(log) {
      this.$p("editor", { log });
    },
    editClockIn(log) {
      this.$p("editor", { log, clockIn: true });
    },
    editClockOut(log) {
      this.$p("editor", { log, clockOut: true });
    },
    verification(log) {
      this.$p("verify", { log, profile: this.profile });
    },
    generateExcel() {
      let excel = [
        [
          "Index",
          "Date",
          "Clock In",
          "Clock Out",
          "Work Hours",
          "Wage",
          "Salary",
          "Editor",
          "Edit Time"
        ]
      ];
      let csvRows = [];
      let defaultWage = isNumber(this.profile.wage)
        ? parseFloat(this.profile.wage)
        : 0;
      this.logs
        .slice(0)
        .reverse()
        .forEach((log, index) => {
          let { date, clockIn, clockOut, wage } = log;
          let timeIn = moment(clockIn).format("HH:mm:ss");
          let timeOut = clockOut ? moment(clockOut).format("HH:mm:ss") : "";
          let workHour = isNumber(clockOut)
            ? toFixed((clockOut - clockIn) / 3600000, 2)
            : "N/A";
          wage = isNumber(wage) ? toFixed(wage, 2).toFixed(2) : defaultWage;
          let salary = workHour * (wage || defaultWage);
          let editor = log.editor || "";
          let editTime = log.edit
            ? moment(log.edit).format("YYYY-MM-DD HH:mm:ss")
            : "";
          excel.push([
            index + 1,
            date,
            timeIn,
            timeOut,
            workHour,
            wage,
            salary,
            editor,
            editTime
          ]);
        });

      for (let i = 0; i < excel.length; i++) {
        csvRows.push(excel[i].join(","));
      }
      let to = moment(this.logs[0].clockIn).format("MMMDD");
      let from = moment(this.logs[this.logs.length - 1].clockIn).format(
        "MMMDD"
      );
      let csvFile = csvRows.join("\n");
      let blob = new Blob([csvFile], { type: "text/plain;charset=utf-8" });
      fileSaver.saveAs(
        blob,
        `${this.profile.name} payroll (${from} - ${to}).csv`
      );
    }
  }
};
</script>


<style scoped>
section.period {
  display: flex;
}

.period .wrap {
  display: flex;
}

.fn {
  flex: 1;
  background: #2196f3;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.fn button {
  padding: 10px 20px;
  margin: 0 5px;
  background: #e1f5fe;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 1px #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}

.fn i {
  margin-right: 5px;
}

.period label {
  padding: 20px;
  display: block;
  border-bottom: 2px solid transparent;
  background: #2196f3;
  color: #bbdefb;
  transition: all 0.3s ease;
}

input:checked + label {
  background: #42a5f5;
  color: #fff;
  text-shadow: 0 1px 1px #0d47a1;
  border-bottom: 2px solid #ffb74d;
}

table {
  table-layout: auto;
  border-spacing: 0;
  width: 100%;
}

thead {
  background: #5389a0;
  color: #fff;
  text-shadow: 0 1px 1px #555;
}

td {
  text-align: center;
}

td.editable:hover {
  color: #ff5722;
  cursor: pointer;
  text-decoration: underline;
}

tbody tr:nth-child(even) {
  background: #eceff1;
}

tr {
  height: 40px;
}
.unverified {
  opacity: 0.8;
  color: #9e9e9e;
}
</style>