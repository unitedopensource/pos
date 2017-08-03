<template>
  <div class="popupMask center dark" @click.self="exit">
    <div class="calendar window">
      <header class="title">
        <i class="fa fa-chevron-left" @click="prev"></i>
        <div class="display">
          <span class="month target" @click="setTarget('M',$event)">{{calendarDay | moment('MMM')}}</span>
          <span class="year" @click="setTarget('Y',$event)">{{calendarDay | moment('YYYY')}}</span>
        </div>
        <i class="fa fa-chevron-right" @click="next"></i>
      </header>
      <div class="inner">
        <div class="wk">
          <span>{{text('MON')}}</span>
          <span>{{text('TUE')}}</span>
          <span>{{text('WEN')}}</span>
          <span>{{text('THU')}}</span>
          <span>{{text('FRI')}}</span>
          <span>{{text('SAT')}}</span>
          <span>{{text('SUN')}}</span>
        </div>
        <div class="dayWrap">
          <div class="day" v-for="calendar in days" :class="{current:calendar.current}" :data-day="calendar.day" @click="setCalendar(calendar.date)">{{calendar.day}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  props: ['init'],
  created() {
    this.generateCalendar();
  },
  data() {
    return {
      today: +new Date,
      calendarDay: +new Date,
      loading: false,
      flip: "M",
      days: null
    }
  },
  methods: {
    setTarget(flip, e) {
      document.querySelector('.target').classList.remove('target');
      e.currentTarget.classList.add('target');
      this.flip = flip;
    },
    prev() {
      this.calendarDay = +moment(this.calendarDay).subtract(1, this.flip).format('x');
      this.generateCalendar();
    },
    next() {
      this.calendarDay = +moment(this.calendarDay).add(1, this.flip).format('x');
      this.generateCalendar();
    },
    setCalendar(date) {
      this.init.resolve(date);
    },
    generateCalendar() {
      let time = this.calendarDay;
      let isCurrentMonth = moment(this.today).format("YYYY-MM-DD") === moment(time).format('YYYY-MM-DD');
      let days = moment(time).daysInMonth();
      let start = +moment(time).startOf('month').format('d');
      start = start === 0 ? 6 : start - 1;
      let lastMonthDay = +moment(time).subtract(1, 'M').endOf('month').format('D') - start;
      let calendar = [];
      let date = moment(time).subtract(1, 'M').format('YYYY-MM-');
      for (let i = 1; i <= start; i++) {
        calendar.push({
          current: false,
          day: lastMonthDay + i,
          date: date + ("0" + (lastMonthDay + i)).slice(-2)
        })
      }
      date = moment(time).format('YYYY-MM-');
      for (let i = 0; i < days; i++) {
        calendar.push({
          current: true,
          day: i + 1,
          date: date + ("0" + (i + 1)).slice(-2)
        });
      }
      date = moment(time).add(1, 'M').format('YYYY-MM-');
      for (let i = 1; calendar.length < 42; i++) {
        calendar.push({
          current: false,
          day: i,
          date: date + ("0" + i).slice(-2)
        })
      }
      this.days = calendar;

      this.$nextTick(() => {
        let dom = document.querySelector('.currentMonth');
        dom && dom.classList.remove('currentMonth');
        dom = document.querySelector('.day.today');
        dom && dom.classList.remove('today');
        if (isCurrentMonth) {
          document.querySelector('.dayWrap').classList.add("currentMonth");
          let today = moment().format('D') - 1;
          today = document.querySelectorAll('[data-day]')[(start + today)];
          today.classList.add("today");
        }
      });
    },
    exit() {
      this.init.reject();
    }
  }
}
</script>

<style scoped>
.calendar {
  width: 685px;
}

.calendar>header {
  text-align: center;
  display: flex;
  font-size: 2em;
  padding: 20px 0 15px;
  border-bottom: 1px solid #BDBDBD;
}

.calendar header i {
  flex: 1;
  text-align: center;
  color: #1780d0;
  padding: 20px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
}

i.fa-chevron-left {
  left: 0;
  right: inherit;
}

.calendar header i:active {
  color: #0b6892;
}

.calendar span.target {
  color: #deedf9;
  border-bottom: 1px dashed #42b5da;
}

.display {
  flex: 1;
}

.display span {
  color: #444;
}

.dayWrap {
  display: flex;
  flex-wrap: wrap;
}

.day {
  padding: 25px 18px;
  width: 60px;
  font-size: 1.5em;
  text-align: center;
  background: #f9f9f9;
  color: lightgray;
  border: 1px solid transparent;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
}

.day.current {
  background: #eee;
  color: #555;
  font-weight: bold;
}

.day.today {
  background: #4FC3F7!important;
  color: #fcfcfc;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.dayWrap .day:nth-child(7n) {
  border-right: none;
}

.wk {
  display: flex;
  padding: 5px 0;
  background: aliceblue;
  color: #666;
}

.wk span {
  flex: 1;
  text-align: center;
  font-family: 'Microsoft YaHei';
  font-size: 20px;
}
</style>
