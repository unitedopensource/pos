<template>
    <div>
        <section class="period">
            <nav>
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
            </nav>
            <div class="functions">
                <button v-show="editable" @click="newRecord">
                    <i class="fa fa-plus-square"></i>
                    <span>{{$t('button.newRecord')}}</span>
                </button>
                <button :disabled="true">
                    <i class="fa fa-calendar-check-o"></i>
                    <span>{{$t('button.setDate')}}</span>
                </button>
                <button :disabled="logs.length ===0" @click="generateExcel">
                    <i class="fa fa-external-link"></i>
                    <span>{{$t('button.export')}}</span>
                </button>
            </div>
        </section>
        <section>
            <table>
                <thead>
                    <tr>
                        <th class="icon">{{$t('thead.verify')}}</th>
                        <th class="date">{{$t('thead.date')}}</th>
                        <th>{{$t('thead.start')}}</th>
                        <th>{{$t('thead.end')}}</th>
                        <th class="hours">{{$t('thead.workHour')}}</th>
                        <th>{{$t('thead.wage')}}</th>
                        <th>{{$t('thead.salary')}}</th>
                        <th class="padding">{{$t('thead.edit')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(log,index) in logs" :key="index" :class="{lock:log.lock}">
                        <td v-if="log.valid" class="icon"><i class="fa fa-check-circle"></i></td>
                        <td v-else class="icon"><i class="fa fa-check-circle-o"></i></td>
                        <td class="date">{{log.date}}</td>
                        <td>{{log.clockIn | moment('HH:mm:ss')}}</td>
                        <td>{{log.clockOut | moment('HH:mm:ss')}}</td>
                        <td class="hours">{{calculate(log.clockIn,log.clockOut)}}</td>
                        <td v-if="log.verified">${{log.wage | decimal}}</td>
                        <td v-else class="unverified">${{(profile.wage || 0) | decimal}}</td>
                        <td>{{salary(log.clockIn,log.clockOut)}}</td>
                        <td v-if="editable" class="editable" @click="edit(log)">
                            <i class="fa fa-pencil-square"></i>
                        </td>
                        <td v-else></td>
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
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import fileSaver from "file-saver";
import editor from "./component/editor";
export default {
  props: ["profile"],
  components: { editor },
  computed: {
    ...mapGetters(["op"])
  },
  data() {
    return {
      componentData: null,
      component: null,
      editable: false,
      period: "week",
      defaultWage: 0,
      from: "",
      to: "",
      logs: []
    };
  },
  created() {
    this.fetchData();
    this.editable = this.approval(this.op.permission, "timecard");
    this.defaultWage = isNumber(this.profile.wage) ? this.profile.wage : 0;
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
        { _id: this.profile._id, from: this.from, to: this.to },
        logs => {
          this.logs = logs;
        }
      );
    },
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
    edit(log) {
      this.$p("editor", { log, profile: this.profile, new: false });
    },
    newRecord() {
      let log = {
        date: today(),
        clockIn: +new Date(),
        clockOut: +new Date(),
        op: this.profile._id,
        valid: false,
        wage: this.profile.wage || 0,
        verifier: null,
        verified: false,
        verifyDate: null
      };
      this.$p("editor", { log, profile: this.profile, new: true });
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
.period {
  display: flex;
  background: #607d8b;
  color: aliceblue;
  align-items: center;
}

nav {
  display: flex;
  flex: 1;
}

.functions {
  padding: 0 5px;
  display: flex;
}

.functions button {
  padding: 10px 20px;
  margin: 0 5px;
  background: #fdfeff;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 3px #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}

.functions i {
  margin-right: 5px;
}

label {
  padding: 15px 5px;
  width: 100px;
  text-align: center;
  cursor: pointer;
  display: block;
  transition: all 0.3s ease-out;
  border-bottom: 3px solid transparent;
}

input:checked + label {
  background: #768f9a;
  border-bottom: 3px solid #ff9800;
}

table {
  table-layout: auto;
  border-spacing: 0;
  width: 100%;
}

thead {
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
}

thead th {
  padding: 5px 0;
}

thead,
tbody tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

tbody {
  background: #fafafa;
  max-height: 616px;
  overflow: auto;
  display: block;
}
tbody td {
  text-align: center;
  padding: 10px 0;
}

tbody tr {
  background: #fafafa;
}

tbody tr:nth-child(even) {
  background: #eee;
}

.fa-check-circle-o {
  color: rgba(0, 0, 0, 0.4);
}

.fa-check-circle {
  color: #009688;
}

.date {
  width: 100px;
}

.lock {
  pointer-events: none;
  opacity: 0.8;
}
.icon {
  width: 65px;
}
.padding{
  padding-right: 5px;
}
.hours{
  width: 200px;
}
</style>