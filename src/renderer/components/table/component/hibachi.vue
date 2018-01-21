<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{$t('button.select')}}</h5>
        <h3>{{$t('title.hibachiTable')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="hibachi">
          <div class="left">
            <div class="seat" v-for="(seat,index) in left" @click="select('left',seat)" :data-id="seat._id">
              <span>{{seat.name}}</span>
              <template v-if="seat.session">
                <span class="server">{{seat.server}}</span>
                <span class="ticket">#{{seat.ticket}}</span>
              </template>
            </div>
          </div>
          <div class="middle"></div>
          <div class="right">
            <div class="seat" v-for="(seat,index) in right" @click="select('right',seat)" :data-id="seat._id">
              <span>{{seat.name}}</span>
              <template v-if="seat.session">
                <span class="server">{{seat.server}}</span>
                <span class="ticket">#{{seat.ticket}}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm" :disabled="seats.length===0">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      left: this.init.seats[0],
      right: this.init.seats[1],
      layout: null,
      table: null,
      seats: []
    };
  },
  methods: {
    select(side, seat) {
      if (!seat._id) {
        this.table = seat.name;
        this.layout = side;
        this.seats = [];
        const dom = document.querySelector(".hibachi .active");
        dom && dom.classList.remove("active");

        document.querySelector(`.${side}`).classList.add("active");
        return;
      }

      if (!this.layout) return;

      const index = this.seats.findIndex(table => table._id === seat._id);
      index === -1 ? this.seats.push(seat) : this.seats.splice(index, 1);

      this.update();
    },
    update() {
      const doms = document.querySelectorAll(".seat.selected");
      for (let dom of doms) {
        dom.classList.remove("selected");
      }

      this.seats.forEach(seat => {
        const { _id } = seat;
        _id &&
          document
            .querySelector(`[data-id="${_id}"]`)
            .classList.add("selected");
      });
    },
    confirm() {
      this.init.resolve({ seats: this.seats, table: this.table });
    }
  }
};
</script>

<style scoped>
.editor {
  width: 800px;
}

.hibachi {
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "left middle right";
}

.left,
.right {
  display: grid;
  height: 330px;
  padding: 1px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  padding: 1px;
  filter: grayscale(1) opacity(0.3);
}

.left.active,
.right.active {
  filter: initial;
}

.left {
  background: #2c3e50;
  grid-area: left;
}

.right {
  background: #2c3e50;
  grid-area: right;
}

.middle {
  grid-area: middle;
}

.seat {
  margin: 2px;
  background: #fcfcfc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  font-family: "Agency FB";
  font-weight: bold;
  color: #b0bec5;
  border-radius: 4px;
  position: relative;
}

.left .seat:last-child {
  grid-column: 2/5;
  grid-row: 2/4;
}

.right .seat:last-child {
  grid-column: 1/4;
  grid-row: 2/4;
}

div.selected {
  background: #ffe0b2;
  color: #3c3c3c;
}

.server {
  position: absolute;
  font-size: 14px;
  z-index: 1;
  background: #ff5722;
  color: #fff;
  width: 77px;
  text-align: center;
}

.ticket {
  position: absolute;
  bottom: 0;
  right: 3px;
  font-size: 14px;
  color: #607d8b;
}
</style>