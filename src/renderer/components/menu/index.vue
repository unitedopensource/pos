<template>
    <div class="menu">
        <section class="category">
            <div v-for="(category,index) in menu" @click="setCategory(index,$event)" :key="index">{{category[language]}}</div>
        </section>
        <section class="items sub" v-if="saveItems">
            <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index" :data-menuID="item.menuID">{{item[language]}}</div>
            <div @click="page = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
            <div @click="page = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
            <div @click="page = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
        </section>
        <section class="items" v-else-if="config.display.menuID">
            <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index" :data-menuID="item.menuID">{{item[language]}}</div>
            <div @click="page = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
            <div @click="page = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
            <div @click="page = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
        </section>
        <section class="items" v-else>
            <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index">{{item[language]}}</div>
            <div @click="page = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
            <div @click="page = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
            <div @click="page = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
        </section>
        <section class="sides">
            <div v-for="(side,index) in sides" @click="setOption(side,index)" :key="index">{{side[language]}}</div>
        </section>
        <section class="cart">
            <order-list layout="order" :sort="sort"></order-list>
            <query-bar :query="queryItem" :items="queryItemResult"></query-bar>
            <buttons :layout="ticket.type" @open="openComponent"></buttons>
        </section>
        <div :is="component" :init="componentData" @execute="fn"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  components: {},
  data() {
    return {
      menuInstance: null,
      componentData: null,
      component: null,
      saveItems: null,
      queryResult: [],
      query: "",
      items: [],
      page: 0,
      sort: 0
    };
  },
  created() {
    this.initialData();
    window.addEventListener("keydown", this.entry, false);
  },
  mounted() {
    toggleClass(".category div", "active");
    this.app.mode === "edit" && this.resetPointer();
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    initialData() {
      this.menuInstance = JSON.parse(JSON.stringify(this.menu));
      this.flatten(this.menuInstance[0].item);
      this.setSides(this.fillOption([]));

      this.$socket.emit("[INQUIRY] TICKET_NUMBER", number => {
        this.app.mode === "create" && this.setTicket({ number });
      });

      if (this.app.mode === "create") {
        this.ticket.type === "DINE_IN" && this.initialDineInTicket();

        !this.order.hasOwnProperty("source") &&
          Object.assign(this.order, { source: "POS" });

        this.setOrder({
          _id: ObjectId(),
          server: this.op.name,
          station: this.station.alias,
          type: this.ticket.type,
          date: today()
        });
      } else {
        this.saveForDiffs(this.order.content);
      }
    },
    initialDineInTicket() {
      if (this.dinein.seatOrder) this.sort = 1;
    },
    entry(e) {
      const disable = document.querySelector("div.popupMask");
      if (disable) return;

      switch (e.key) {
        case "Escape":
          this.query = "";
          this.queryResult = [];
          break;
        case "Enter":
          this.query &&
            this.$socket.emit("[QUERY] ITEM", this.query, items => {
              items.length === 1
                ? this.pick(items[0])
                : (this.queryItemResult = items);
            });
          break;
        case "Backspace":
        case "Delete":
          this.query = this.queryItem.slice(0, -1);
          break;
        case "+":
          if (this.query) return;
          this.moreQty();
          break;
        case "-":
          if (this.query) return;
          this.lessQty();
          break;
        default:
          if (this.queryResult.length > 1) {
            if (isNumber(e.key) && this.queryResult[e.key - 1]) {
              this.pick(this.queryResult[e.key - 1]);
              this.queryResult = [];
              this.query = "";
            }
          } else {
            if (/[a-z0-9]/i.test(e.key) && e.key.length === 1)
              this.query += e.key;
          }
      }
    },
    flatten(items) {
      console.time("clone");

      items = [].concat.apply([], items);

      const { favorite } = this.config.display;
      if (favorite) {
        const target = this.customer.favorite || [];
        items.forEach(item => {
          item.like = target.include(item._id);
        });
      }

      items.forEach(item => {
        if (item.disable) item.clickable = false;
      });

      console.timeEnd("clone");
      this.items = items;
    },
    fillOption(side) {
      const length = side.length;
      let array = side.slice();

      Array(11 - length)
        .fill()
        .forEach(() => {
          array.push({
            usEN: "",
            zhCN: "",
            clickable: false,
            disable: true
          });
        });

      return array;
    },
    poleDisplay(top, bot) {
      if (this.device.poleDisplay) {
        poleDisplay.write("\f");
        poleDisplay.write(line(top, bot));
      }
    },
    setCategory(i, e) {
      toggleClass(".category .active", "active");
      e.currentTarget.classList.add("active");

      this.page = 0;
      this.saveItems = null;
      this.flatten(this.menuInstance[i].item);
    },
    pick(item) {
      this.checkItemAvailable(item)
        .then(this.checkItemType.bind(item))
        .catch(this.itemHandler.bind(item));
    },
    checkItemAvailable(item) {
      return new Promise((next, reject) => {
        item.hasOwnProperty("clickable") && !item.clickable
          ? reject()
          : next();
      });
    },
    checkItemType(item){
        return new Promise((next,reject)=>{
            
        })
    }
  }
};
</script>