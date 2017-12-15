<template>
  <div class="popupMask center dark">
    <div class="course window">
      <header class="title">
        <span>{{$t('title.course')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="indicator">
          <div class="step" v-for="(course,index) in steps" @click="jumpStep(index)" :class="{active:step===index,done:course.contain.length !== 0}" :key="index">
            <div class="name">{{$t('text.'+course.name)}}
              <span v-show="course.delay" class="delay">[{{course.delay | moment('hh:mm')}}]</span>
            </div>
            <ul>
              <li v-for="(item,i) in course.contain" :key="i">{{item[language]}}
                <i class="fa fa-times" @click="remove(item,i)"></i>
              </li>
            </ul>
          </div>
        </div>
        <div class="content" v-if="list.length !== 0">
          <ul>
            <li v-for="(item,index) in list" class="order" @click="addToCourse(item,index)" :key="index">
              <span class="f1">{{item.qty}}</span>
              <span class="f4">{{item[language]}}</span>
              <span class="f1">{{item.total}}</span>
            </li>
          </ul>
        </div>
        <div class="timer" v-else>
          <header class="display">
            <div class="time" @click="target = 'hour'" :class="{active:target ==='hour'}">
              <h3>{{$t('menu.hour')}}</h3>
              <div class="value">{{hour}}</div>
            </div>
            <div class="time" @click="target = 'minute'" :class="{active:target === 'minute'}">
              <h3>{{$t('menu.minute')}}</h3>
              <div class="value">{{minute}}</div>
            </div>
          </header>
          <article>
            <section class="numpad">
              <div @click="input('7')">7</div>
              <div @click="input('8')">8</div>
              <div @click="input('9')">9</div>
              <div @click="input('4')">4</div>
              <div @click="input('5')">5</div>
              <div @click="input('6')">6</div>
              <div @click="input('1')">1</div>
              <div @click="input('2')">2</div>
              <div @click="input('3')">3</div>
              <div @click="input('0')">0</div>
              <div @click="del" class="del">←</div>
            </section>
          </article>
        </div>
      </div>
      <footer>
        <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
        <div class="btn" @click="confirm">{{text('button.confirm')}}</div>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      component: null,
      componentData: null,
      list: [],
      steps: [
        {
          name: "starter",
          delay: null,
          contain: []
        },
        {
          name: "appetizer",
          delay: null,
          contain: []
        },
        {
          name: "entree",
          delay: null,
          contain: []
        },
        {
          name: "dessert",
          delay: null,
          contain: []
        }
      ],
      step: 0,
      target: "minute",
      hour: "00",
      minute: "00"
    };
  },
  created() {
    this.initial();
  },
  methods: {
    initial() {
      this.list = JSON.parse(JSON.stringify(this.init.order.content));
    },
    jumpStep(index) {
      let current = this.step;
      let hour = this.hour;
      let minute = this.minute;
      if (this.list.length === 0 && (hour !== "00" || minute !== "00"))
        this.steps[current].delay = moment()
          .add(~~hour, "h")
          .add(~~minute, "m")
          .format("x");
      if (this.steps[index].delay) {
        let minutes =
          moment(Number(this.steps[index].delay)).diff(moment(), "minutes") + 1;
        this.hour = ("0" + Math.floor(minutes / 60)).slice(-2);
        this.minute = ("0" + minutes % 60).slice(-2);
      } else {
        this.hour = "00";
        this.minute = "00";
      }
      this.step = index;
      this.target = "minute";
    },
    addToCourse(item, index) {
      this.steps[this.step].contain.push(item);
      this.list.splice(index, 1);
      if (this.list.length === 0) this.step = 0;
    },
    remove(item, index) {
      this.steps[this.step].contain.splice(index, 1);
      this.list.push(item);
    },
    input(num) {
      let time = this[this.target];
      time = ("0" + Number(time + num)).slice(-2);
      this[this.target] = time;
    },
    del() {
      let time = this[this.target];
      time = ("0" + time).slice(0, -1);
      this[this.target] = time;
    },
    confirm() {
      if (this.list.length !== 0) return;
      this.jumpStep(3);
      this.steps
        .filter(step => step.contain.length)
        .map(schedule => {
          let delay = Number(schedule.delay);
          let order = JSON.parse(JSON.stringify(this.init.order));
          delete order.payment;
          Object.assign(order, {
            type: this.app.mode === "create" ? this.ticket.type : order.type,
            number:
              this.app.mode === "create" ? this.ticket.number : order.number,
            customer: this.customer,
            course: schedule.name,
            delay,
            time: delay,
            content: schedule.contain.map(item => {
              item.pending = true;
              return item;
            })
          });
          return order;
        })
        .forEach(task => {
          this.delayPrint(task);
        });
      this.exit();
    },
    exit() {
      let order = this.init.order;
      let customer = this.customer;
      delete customer.extra;
      Object.assign(order, {
        type: this.app.mode === "create" ? this.ticket.type : order.type,
        number: this.app.mode === "create" ? this.ticket.number : order.number,
        modify: this.app.mode === "create" ? 0 : order.modify++,
        source: this.op.role !== "ThirdParty" ? "POS" : this.op.name,
        status: 1,
        settle: false,
        customer,
        date: today(),
        time: +new Date(),
        content: order.content.map(item => {
          item.pending = true;
          return item;
        })
      });
      this.app.mode === "create"
        ? this.$socket.emit("[TABLE] INVOICE", order)
        : this.$socket.emit("[UPDATE] INVOICE", order);
      this.init.resolve();
      this.resetAll();
      this.setOrder(order);
      this.$router.push({ path: "/main/table" });
    },
    ...mapActions(["setOrder", "resetAll", "delayPrint", "setTableInfo"])
  },
  computed: {
    ...mapGetters([
      "op",
      "app",
      "ticket",
      "customer",
      "language",
      "currentTable"
    ])
  }
};
</script>

<style scoped>
.course {
  width: 605px;
}

.btn {
  flex: 1;
}

.course .inner {
  display: flex;
  min-height: 458px;
}

.indicator {
  border-right: 1px solid #ddd;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 1em;
}

.content {
  flex: 2;
  background: #fff;
}

.step {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: color 0.3s linear;
}

.name {
  padding: 1em 0 0 2em;
  display: inline-block;
  width: 225px;
}

.step:before {
  content: "\f10c";
  font-family: fontAwesome;
  position: absolute;
  top: 16px;
  left: 12px;
  background: whitesmoke;
}

.step.done:before {
  content: "\f058";
  color: #4caf50;
}

.step.active {
  color: #2196f3;
}

.step.active:before {
  content: "\f111";
  color: #2196f3;
}

.step:after {
  content: " ";
  width: 2px;
  background: #607d8b;
  height: 100%;
  position: absolute;
  left: 18px;
  top: 32px;
}

.step:last-child:after {
  content: none;
}

ul {
  max-height: 525px;
  overflow-y: auto;
}

.indicator li {
  margin-left: 3em;
  list-style-type: circle;
  color: #555;
}

.indicator .active li {
  list-style-type: disc;
}

.indicator li i {
  display: none;
  color: #ff7043;
  float: right;
  padding-right: 10px;
}

.active li i {
  display: inline-block;
}

.content li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
}

.content li:nth-child(2n) {
  background: #eceff1;
}

section.numpad {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.timer {
  width: 320px;
}

.timer article {
  padding-left: 5px;
}

.time {
  flex: 1;
  height: 90px;
  margin: 6px;
  border-radius: 2px;
  background: #fff;
  box-shadow: var(--shadow);
}

header.display {
  display: flex;
  text-align: center;
}

h3 {
  padding: 8px 5px;
  border-bottom: 1px solid #eee;
  background: #b0bec5;
  color: #fff;
}

.value {
  font-size: 43px;
  font-family: "Agency FB";
  font-weight: bold;
  color: #cfd8dc;
  letter-spacing: 4px;
}

.active h3 {
  background: #607d8b;
}

.active .value {
  color: #616161;
}

.del {
  width: 205px;
  background: #78909c;
}

span.delay {
  float: right;
  padding-right: 25px;
}

.f4 {
  flex: 4;
}
</style>
