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
                    <td v-if="log.valid" class="icon"><i class="fa fa-check-circle"></i></td>
                    <td v-else class="icon"><i class="fa fa-check-circle-o"></i></td>
                    <td class="date">{{log.date}}</td>
                    <td>{{log.clockIn | moment('HH:mm:ss')}}</td>
                    <td>{{log.clockOut | moment('HH:mm:ss')}}</td>
                    <td class="hours">{{calculate(log.clockIn,log.clockOut)}}</td>
                    <td class="break">{{log.break && log.break.length}}</td>
                    <td v-if="log.valid" :title="log.note" class="wage decimal">$ {{log.wage | decimal}}<i class="fa fa-exclamation-circle" v-if="log.note"></i></td>
                    <td v-else class="invalid decimal">$ {{(operator.wage || 0) | decimal}}</td>
                    <td class="decimal">$ {{salary(log)}}</td>
                    <td v-if="editable && !log.lock" class="edit" @click="edit(log)">
                        <i class="fa fa-pencil-square"></i>
                    </td>
                    <td v-else>
                        <i class="fa fa-lock"></i>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="9" class="f1">
                        <div class="summary">
                            <span>{{totalHours}}</span>
                            <span>{{totalSalary}}</span>
                            <span>Total Salary</span>
                            <span>From {{dateRange}}</span>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
        <div :is="component" :init="componentData"></div>
    </div>

</template>

<script>
import editor from "./component/timecardEditor"
export default {
    props: ["operator"],
    components: { editor },
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
            if (this.logs.length === 0) return;
            let to = this.logs[0].date;
            let from = this.logs[this.logs.length - 1].date;
            return `${from} ~ ${to}`;
        },
    },
    data() {
        return {
            componentData: null,
            component: null,
            editable: false,
            period: "week",
            from: "",
            to: "",
            logs: []
        }
    },
    created() {
        this.fetchData();
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
            clockOut = clockOut || +new Date();
            const duration = clockOut - clockIn;

            if (duration === 0) return;

            if (isNumber(duration)) {
                const hh = ("00" + Math.floor(duration % 8.64e7 / 3.6e6)).slice(-2);
                const mm = ("00" + Math.floor(duration % 3.6e6 / 6e4)).slice(-2);
                const ss = ("00" + Math.floor(duration % 6e4 / 1e3)).slice(-2);

                return this.$t("text.hhmmss", hh, mm, ss)
            }
        },
        salary(session) {
            const { clockIn, clockOut, wage } = session;
            if (!clockOut) return "0.00";

            const hour = toFixed((clockOut - clockIn) / 3.6e6, 2);

            return ((wage || this.operator.wage || 0) * hour).toFixed(2);
        },
        edit(log) {

        }
    }

}
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
  padding: 20px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
</style>