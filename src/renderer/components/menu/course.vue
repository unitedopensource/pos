<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="course window">
      <header class="title">
        <span>{{text("COURSE_TIME")}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="indicator">
          <div class="step" v-for="(course,index) in steps" @click="jumpStep(index)" :class="{active:step===index,done:course.contain.length !== 0}">
            <div class="name">{{text(course.name)}}
              <span v-show="course.delay" class="delay">[{{course.delay | moment('hh:mm')}}]</span>
            </div>
            <ul>
              <li v-for="(item,i) in course.contain" class="">{{item[language]}}
                <i class="fa fa-times" @click="remove(item,i)"></i>
              </li>
            </ul>
          </div>
        </div>
        <div class="content" v-if="list.length !== 0">
          <ul>
            <li v-for="(item,index) in list" class="order" @click="addToCourse(item,index)">
              <span class="f1">{{item.qty}}</span>
              <span class="f4">{{item[language]}}</span>
              <span class="f1">{{item.total}}</span>
            </li>
          </ul>
        </div>
        <div class="timer" v-else>
          <header class="display">
            <div class="time" @click="target = 'hour'" :class="{active:target ==='hour'}">
              <h3>{{text('HOUR')}}</h3>
              <div class="value">{{hour}}</div>
            </div>
            <div class="time" @click="target = 'minute'" :class="{active:target === 'minute'}">
              <h3>{{text('MINUTE')}}</h3>
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
        <button class="btn" @click="init.reject">{{text('CANCEL')}}</button>
        <button class="btn" @click="confirm">{{text('CONFIRM')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  props: ['init'],
  created() {
    this.list = JSON.parse(JSON.stringify(this.init.list));
  },
  data() {
    return {
      component: null,
      componentData: null,
      list: [],
      steps: [
        {
          name: 'STARTER',
          delay: null,
          contain: []
        },
        {
          name: 'APPETIZER',
          delay: null,
          contain: []
        },
        {
          name: 'ENTREE',
          delay: null,
          contain: []
        },
        {
          name: 'DESSERT',
          delay: null,
          contain: []
        }
      ],
      step: 0,
      target: 'minute',
      hour: "00",
      minute: "00"
    }
  },
  methods: {
    jumpStep(index) {
      let current = this.step;
      let hour = this.hour;
      let minute = this.minute;
      if (this.list.length === 0 && (hour !== "00" || minute !== "00"))
        this.steps[current].delay = moment().add(~~hour, 'h').add(~~minute, 'm').format('x');
      if (this.steps[index].delay) {
        let minutes = moment(Number(this.steps[index].delay)).diff(moment(), "minutes") + 1;
        this.hour = ("0" + Math.floor(minutes / 60)).slice(-2);
        this.minute = ("0" + (minutes % 60)).slice(-2);
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
      let steps = this.steps.filter(step => step.contain.length);
      this.init.resolve(steps);
    }
  },
  computed: {
    ...mapGetters(['language'])
  }
}
</script>

<style scoped>
.course {
  width: 605px;
}

footer button.btn {
  margin: 5px 10px;
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
  content: '\f10c';
  font-family: fontAwesome;
  position: absolute;
  top: 16px;
  left: 12px;
  background: whitesmoke;
}

.step.done:before {
  content: '\f058';
  color: #4CAF50;
}

.step.active {
  color: #2196F3;
}

.step.active:before {
  content: '\f111';
  color: #2196F3;
}

.step:after {
  content: ' ';
  width: 2px;
  background: #607D8B;
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
  color: #FF7043;
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
  background: #ECEFF1;
}

section.numpad {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.timer {
  width: 347px;
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
  background: #B0BEC5;
  color: #fff;
}

.value {
  font-size: 43px;
  font-family: 'Agency FB';
  font-weight: bold;
  color: #CFD8DC;
  letter-spacing: 4px;
}

.active h3 {
  background: #607D8B;
}

.active .value {
  color: #616161;
}

.del {
  width: 223px;
  background: #78909C;
}

span.delay {
  float: right;
  padding-right: 25px;
}
</style>
