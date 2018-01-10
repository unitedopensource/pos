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
      <div>
        <div class="wk">
          <span>{{$t('calendar.mon')}}</span>
          <span>{{$t('calendar.tue')}}</span>
          <span>{{$t('calendar.wed')}}</span>
          <span>{{$t('calendar.thu')}}</span>
          <span>{{$t('calendar.fri')}}</span>
          <span>{{$t('calendar.sat')}}</span>
          <span>{{$t('calendar.sun')}}</span>
        </div>
        <div class="dayWrap">
          <div class="day" v-for="(calendar,index) in days" :class="{current:calendar.current}" :data-day="calendar.day" @click="setCalendar(calendar.date)" :key="index">{{calendar.day}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  created() {
    this.initial();
  },
  data() {
    return {
      calendarDay: +moment().subtract(4, "hours"),
      today: +moment().subtract(4, "hours"),
      loading: false,
      flip: "M",
      days: null
    };
  },
  methods: {
    initial() {
      let dom = document.getElementById("calendar");
      let calendar = dom.innerText;

      this.calendarDay = +moment(calendar, "YYYY-MM-DD");
      this.generateCalendar();
    },
    setTarget(flip, e) {
      document.querySelector(".target").classList.remove("target");
      e.currentTarget.classList.add("target");
      this.flip = flip;
    },
    prev() {
      this.calendarDay = +moment(this.calendarDay)
        .subtract(1, this.flip)
        .format("x");
      this.generateCalendar();
    },
    next() {
      this.calendarDay = +moment(this.calendarDay)
        .add(1, this.flip)
        .format("x");
      this.generateCalendar();
    },
    setCalendar(date) {
      this.init.resolve(date);
    },
    generateCalendar() {
      let time = this.calendarDay;
      let isCurrentMonth =
        moment(this.today).format("YYYY-MM-DD") ===
        moment(time).format("YYYY-MM-DD");

      let days = moment(time).daysInMonth();
      let start = +moment(time)
        .startOf("month")
        .format("d");
      start = start === 0 ? 6 : start - 1;
      let lastMonthDay =
        +moment(time)
          .subtract(1, "M")
          .endOf("month")
          .format("D") - start;
      let calendar = [];
      let date = moment(time)
        .subtract(1, "M")
        .format("YYYY-MM-");
      for (let i = 1; i <= start; i++) {
        calendar.push({
          current: false,
          day: lastMonthDay + i,
          date: date + ("0" + (lastMonthDay + i)).slice(-2)
        });
      }
      date = moment(time).format("YYYY-MM-");
      for (let i = 0; i < days; i++) {
        calendar.push({
          current: true,
          day: i + 1,
          date: date + ("0" + (i + 1)).slice(-2)
        });
      }
      date = moment(time)
        .add(1, "M")
        .format("YYYY-MM-");
      for (let i = 1; calendar.length < 42; i++) {
        calendar.push({
          current: false,
          day: i,
          date: date + ("0" + i).slice(-2)
        });
      }
      this.days = calendar;

      this.$nextTick(() => {
        let dom = document.querySelector(".currentMonth");
        dom && dom.classList.remove("currentMonth");
        dom = document.querySelector(".day.today");
        dom && dom.classList.remove("today");
        if (isCurrentMonth) {
          document.querySelector(".dayWrap").classList.add("currentMonth");
          let today = moment().format("D") - 1;
          today = document.querySelectorAll("[data-day]")[start + today];
          today.classList.add("today");
        }
      });
    },
    exit() {
      this.init.reject();
    }
  }
};
</script>

<style scoped>
.calendar {
  width: 650px;
}

.calendar > header {
  text-align: center;
  display: flex;
  border-bottom: 1px solid #bdbdbd;
}

.calendar header i {
  flex: 1;
  text-align: center;
  color: #1780d0;
  padding: 15px 25px;
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
  text-shadow: 0 1px 1px #333;
}

.display {
  flex: 1;
}

.display span {
  color: #214b6b;
  text-shadow: 0 1px 1px #64b5f6;
  cursor: pointer;
}

.dayWrap {
  display: flex;
  flex-wrap: wrap;
}

.day {
  padding: 25px 18px;
  width: 55px;
  font-size: 1.5em;
  text-align: center;
  background: #f9f9f9;
  color: lightgray;
  border: 1px solid transparent;
  border-right: 1px solid #fff;
  border-bottom: 1px solid #fff;
  position: relative;
}

.day.current {
  background: #eee;
  color: #555;
  font-weight: bold;
}

.today:before {
  content: attr(data-day);
  top: 2px;
  left: 4px;
  width: 82px;
  height: 70px;
  position: absolute;
  background: linear-gradient(#299efb, #047fe0);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 2px 3px -1px #607d8b;
}

.dayWrap .day:nth-child(7n) {
  border-right: none;
}

.wk {
  display: flex;
  padding: 5px 0;
  background: #cfd8dc;
  color: #455a64;
  border-bottom: 1px solid #c9d5da;
}

.wk span {
  flex: 1;
  text-align: center;
  font-size: 20px;
}
</style>
