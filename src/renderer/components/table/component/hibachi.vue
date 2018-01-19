<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{$t('button.select')}}</h5>
        <h3>{{$t('title.hibachiTable')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="layout">
          <div class="left">
            <div class="seat" v-for="(seat,index) in left" @click="select(seat)" :data-id="seat._id">
              <span>{{seat.name}}</span>
            </div>
          </div>
          <div class="middle"></div>
          <div class="right">
            <div class="seat" v-for="(seat,index) in right" @click="select(seat)" :data-id="seat._id">
              <span>{{seat.name}}</span>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      left: this.init.seats[0],
      right: this.init.seats[1],
      seats: []
    };
  },
  methods: {
    select(seat) {
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
      this.init.resolve(this.seats);
    }
  }
};
</script>

<style scoped>
.editor {
  width: 800px;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "left middle right";
}

.left,
.right {
  display: grid;
  height: 500px;
  padding: 1px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 1px;
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
}

.left .seat:last-child {
  grid-column: 2/4;
  grid-row: 2/6;
}

.right .seat:last-child {
  grid-column: 1/3;
  grid-row: 2/6;
}

div.selected {
  background: #ffe0b2;
  color: #3c3c3c;
}
</style>