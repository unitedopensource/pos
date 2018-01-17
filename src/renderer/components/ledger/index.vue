<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>{{today}}</h5>
                    <h3>{{$t('title.ledger')}}</h3>
                </div>
                <nav class="tabs">
                    <div>
                        <input type="radio" v-model="tab" value="overview" name="tab" id="overview">
                        <label for="overview">{{$t('nav.overview')}}</label>
                    </div>
                    <div>
                        <input type="radio" v-model="tab" value="department" name="tab" id="department">
                        <label for="department">{{$t('nav.department')}}</label>
                    </div>
                    <div>
                        <input type="radio" v-model="tab" value="invoice" name="tab" id="invoice">
                        <label for="invoice">{{$t('text.invoice')}}</label>
                    </div>
                </nav>
            </header>
            <template v-if="tab === 'overview'">
                <div class="wrap">

                </div>
            </template>
            <template v-else-if="tab === 'department'">
                <div class="wrap">
                    <table class="department">
                        <thead>
                            <tr>
                                <th></th>
                                <th>{{$t('type.WALK_IN')}}</th>
                                <th>{{$t('type.PICK_UP')}}</th>
                                <th>{{$t('type.DELIVERY')}}</th>
                                <th>{{$t('type.DINE_IN')}}</th>
                                <th>{{$t('type.HIBACHI')}}</th>
                                <th>{{$t('text.subtotal')}}</th>
                                <th>{{$t('text.tax')}}</th>
                                <th>{{$t('text.total')}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(department,index) in departments" :key="index">
                                <td>{{department[language]}}</td>
                                <td>{{department.WALK_IN.subtotal | decimal}}</td>
                                <td>{{department.PICK_UP.subtotal | decimal}}</td>
                                <td>{{department.DELIVERY.subtotal | decimal}}</td>
                                <td>{{department.DINE_IN.subtotal | decimal}}</td>
                                <td>{{department.HIBACHI.subtotal | decimal}}</td>
                                <td>{{department.subtotal | decimal}}</td>
                                <td>{{department.tax | decimal}}</td>
                                <td>{{department.total | decimal}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>

            <footer>
                <button class="btn" @click="confirm">{{$t('button.done')}}</button>
            </footer>
            <loader :display="loading"></loader>
        </div>
    </div>
</template>

<script>
import loader from "../common/loader";

export default {
  props: ["init"],
  components: { loader },
  data() {
    return {
      language: this.$store.getters.language,
      tax: this.$store.getters.tax,
      today: today(),
      departments: [],
      dateRange: {
        from: +moment()
          .subtract(4, "hours")
          .set({ hour: 4, minute: 0, second: 0 }),
        to: +moment()
          .subtract(4, "hours")
          .set({ hour: 3, minute: 59, second: 59 })
          .add(1, "days")
      },
      summary: {},
      hourlySales: [],
      loading: true,
      tab: "overview"
    };
  },
  created() {
    this.initialDepartment()
      .then(this.fetchData)
      .then(this.initialData)
      .catch(this.initialFailed);
  },
  methods: {
    initialDepartment() {
      return new Promise(next => {
        this.departments = JSON.parse(
          JSON.stringify(this.$store.getters.config.departments)
        ).map(department => {
          Object.assign(department, {
            WALK_IN: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            PICK_UP: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            DELIVERY: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            DINE_IN: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            BUFFET: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            HIBACHI: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            BAR: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            SALES: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            }
          });

          return department;
        });
        console.log(this.$store.getters.config);

        this.departments.push({
          zhCN: this.$t("text.other"),
          usEN: "Other",
          contain: [],

          WALK_IN: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          PICK_UP: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          DELIVERY: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          DINE_IN: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          BUFFET: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          HIBACHI: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          BAR: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          SALES: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          }
        });

        next();
      });
    },
    fetchData() {
      return new Promise(next => {
        this.$socket.emit("[REPORT] INITIAL_DATA", this.dateRange, data => {
          next(data);
        });
      });
    },
    initialData({ invoices, transactions }) {
      //console.log(invoices, transactions);
      this.departmentAnalysis(invoices);
      this.hourlySalesAnalysis(invoices);

      this.loading = false;
    },
    initialFailed(e) {
      console.log(e);
    },
    departmentAnalysis(invoices) {
      const departments = this.departments.map(d => d.contain);
      const last = departments.length - 1;

      invoices.forEach(invoice => {
        const { type, status, content, taxFree = false } = invoice;
        if (status) {
          content.forEach(item => {
            const { category, choiceSet, qty, single, taxClass } = item;
            const Tax = this.tax.class[taxClass];

            const index = departments.findIndex(contain =>
              contain.includes(category)
            );

            let tax = 0;
            let subtotal = 0;
            let amount = toFixed(qty * single, 2);

            item.choiceSet.forEach(set => {
              const p = parseFloat(set.single);
              const s = set.qty || 1;
              const t = toFixed(p * s, 2);
              amount = toFixed(amount + t, 2);
            });

            subtotal = toFixed(subtotal + amount, 2);

            if (!taxFree && Tax.apply[type])
              tax += (Tax.rate / 100 * amount).toPrecision(12).toFloat();

            if (index !== -1) {
              let pointer = this.departments[index][type];
              pointer.count += qty;
              pointer.tax += tax;
              pointer.subtotal += subtotal;
              pointer.total += subtotal + tax;
            } else {
              let pointer = this.departments[last][type];
              pointer.count += qty;
              pointer.tax += tax;
              pointer.subtotal += subtotal;
              pointer.total += subtotal + tax;
            }
          });
        }
      });

      this.departments.forEach(department => {
        let subtotal = 0;
        let tax = 0;
        let total = 0;
        Object.keys(department).forEach(key => {
          if (department[key].hasOwnProperty("subtotal")) {
            subtotal += department[key].subtotal;
          }
          if (department[key].hasOwnProperty("tax")) {
            tax += department[key].tax;
          }
          if (department[key].hasOwnProperty("total")) {
            total += department[key].total;
          }
        });

        Object.assign(department, { subtotal, tax, total });
      });
    },
    hourlySalesAnalysis(invoices) {
      let hours = {};

      invoices.forEach(invoice => {
        if (invoice.status === 1) {
          const hour = new Date(invoice.time).getHours();
          const { due } = invoice.payment;
          if (hours.hasOwnProperty(hour)) {
            hours[hour].value += due;
            hours[hour].count++;
          } else {
            hours[hour] = {
              count: 1,
              value: due
            };
          }
        }
      });

      let report = [];

      Object.keys(hours).forEach(hour => {
        report.push({
          text: `${hour}:00 (${hours[hour].count})`,
          value: hours[hour].value.toFixed(2)
        });
      });

      this.hourlySales = report;
    },
    confirm() {}
  }
};
</script>

<style scoped>
.editor {
  width: 900px;
  position: relative;
}

header {
  flex-direction: row;
  justify-content: flex-start;
}
.wrap {
  min-height: 500px;
  background: #f5f5f5;
}

.department {
  box-shadow: var(--shadow);
  border-radius: 4px;
  overflow: hidden;
}

tr td {
  text-align: center;
  padding: 10px 0;
}

tr th {
  border-bottom: 1px solid #eceff1;
  padding: 5px 0;
  color: rgba(0, 0, 0, 0.75);
  background: linear-gradient(#fafafa, #eeeeee);
}
</style>