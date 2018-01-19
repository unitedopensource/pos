<template>
    <div class="popupMask dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('title.hibachiTable')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.alias" v-model="init.group"></inputer>
                <div class="layout">
                    <div class="left" @click="setLayout('left')">
                        <div class="seat" v-for="(seat,index) in left">
                            <span>{{seat.name}}</span>
                        </div>
                    </div>
                    <div class="middle"></div>
                    <div class="right" @click="setLayout('right')">
                        <div class="seat" v-for="(seat,index) in right">
                            <span>{{seat.name}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t("button.confirm")}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";

export default {
  props: ["init"],
  components: { inputer },
  data() {
    return {
      direction: "left",
      left: [8, 9, 10, 7, 6, 5, 4, 3, 2, 1, null].map((seat, index) => ({
        group: "",
        grid: index,
        name: seat,
        session: ""
      })),
      right: [10, 9, 8, 7, 6, 5, 4, 1, 2, 3, null].map((seat, index) => ({
        group: "",
        grid: index,
        name: seat,
        session: ""
      }))
    };
  },
  created() {},
  mounted() {
    this.setLayout("left");
  },
  methods: {
    setLayout(direction) {
      this.direction = direction;
      document.querySelector(".selected").classList.remove("selected");
      document.querySelector(`.${direction}`).classList.add("selected");
    },
    select() {},
    confirm() {}
  }
};
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 10px 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "left middle right";
}

.seat {
  margin: 2px;
  background: #fcfcfc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1em;
  font-family: "Agency FB";
  font-weight: bold;
  color: #b0bec5;
  border-radius: 4px;
}

.left,
.right {
  display: grid;
  height: 235px;
  padding: 1px;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 1px;
  border: 2px solid #eee;
  border-radius: 4px;
  background: #eceff1;
}

.left {
  grid-area: left;
}

.right {
  grid-area: right;
}

.middle {
  grid-area: middle;
}

.left .seat:last-child {
  grid-column: 2/4;
  grid-row: 2/6;
}

.right .seat:last-child {
  grid-column: 1/3;
  grid-row: 2/6;
}

.selected {
  background: #607d8b;
}
</style>