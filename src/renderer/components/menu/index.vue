<template>
  <div class="menu">
    <section class="category">
      <div v-for="(category,index) in menu" @click="categoryIndex = index" :key="index">{{category[language]}}</div>
    </section>
    <!-- <section class="items sub" v-if="saveItems">
      <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index" :data-menuID="item.menuID">{{item[language]}}</div>
      <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
      <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
      <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
    </section> -->
    <section class="items" v-if="config.display.menuID">
      <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index" :data-menuID="item.menuID">{{item[language]}}</div>
      <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
      <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
      <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
    </section>
    <section class="items" v-else :class="{sub:openSubGroup}">
      <div v-for="(item,index) in page" @click="pick(item)" :class="{disable:!item.clickable,like:item.like}" :key="index">{{item[language]}}</div>
      <div @click="itemPage = 0" v-if="items.length >= 34" class="pageButton">{{$t("button.firstPage")}}</div>
      <div @click="itemPage = 1" v-if="items.length >= 34" class="pageButton">{{$t("button.secondPage")}}</div>
      <div @click="itemPage = 2" v-if="items.length >= 34" class="pageButton">{{$t("button.thirdPage")}}</div>
    </section>
    <section class="sides">
      <div v-for="(side,index) in sides" @click="setOption(side,index)" :key="index">{{side[language]}}</div>
    </section>
    <section class="cart">
      <order-list layout="order" :sort="sort"></order-list>
      <query-bar :query="queryItem" :items="queryResult"></query-bar>
      <buttons :layout="ticket.type"></buttons>
    </section>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import buttons from "./buttons";
import modify from "./component/modify";
import dialoger from "../common/dialoger";
import queryBar from "./component/queryBar";
import orderList from "../common/orderList";
import templateItem from "./component/templateItem";
import temporaryItem from "./component/temporaryItem";

export default {
  components: {
    modify,
    buttons,
    dialoger,
    queryBar,
    orderList,
    templateItem,
    temporaryItem
  },
  computed: {
    page() {
      if (this.items.length > 33) {
        let min = this.itemPage * 30;
        let max = min + 30;
        return this.items.slice(min, max);
      }
      return this.items;
    },
    ...mapGetters([
      "op",
      "app",
      "menu",
      "item",
      "submenu",
      "device",
      "config",
      "order",
      "station",
      "ticket",
      "sides",
      "customer",
      "language"
    ])
  },
  data() {
    return {
      menuInstance: null,
      componentData: null,
      openSubGroup: false,
      categoryIndex: 0,
      component: null,
      saveItems: null,
      queryResult: [],
      queryItem: "",
      itemPage: 0,
      query: "",
      items: [],
      sort: 0
    };
  },
  created() {
    this.initialData();
    window.addEventListener("keydown", this.entry, false);
    this.$socket.emit("[INQUIRY] TICKET_NUMBER", number => {
      this.app.newTicket ? this.setTicket({ number }) : this.resetPointer();
    });
  },
  mounted() {
    toggleClass(".category div", "active");
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.entry, false);
  },
  methods: {
    initialData() {
      this.menuInstance = JSON.parse(JSON.stringify(this.menu));
      this.flatten(this.menuInstance[0].item);
      this.setSides(this.fillOption([]));

      if (this.app.newTicket) {
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
          item.like = target.includes(item._id);
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
    setCategory(index) {
      index = index || this.categoryIndex;
      toggleClass(".category .active", "active");
      // e.currentTarget.classList.add("active");
      document.querySelectorAll("section.category div")[index].classList.add("active");

      this.itemPage = 0;
      this.saveItems = null;
      this.categoryIndex = index;
      this.flatten(this.menuInstance[index].item);
    },
    pick(item) {
      item = JSON.parse(JSON.stringify(item));
      !this.app.newTicket && Object.assign(item, { new: true });

      this.checkItemAvailable(item)
        .then(this.checkOption)
        .then(this.checkItemType)
        .then(this.addToOrder)
        .catch(this.specialItemHandler.bind(null, item));
    },
    checkItemAvailable(item) {
      return new Promise((next, stop) => {
        if (item.hasOwnProperty("clickable") && !item.clickable) {
          stop("unavailable");
        } else {
          next(item);
        }
      });
    },
    checkOption(item) {
      return new Promise((next, stop) => {
        item.option && this.setSides(this.fillOption(item.option));
        Object.assign(item, { side: {} });

        if (item.manual) {
          next(item);
        } else {
          const { option } = item;

          if (option && option.length) {
            const { zhCN = "", usEN = "", ignore } = option[0];
            const replace = option[0].hasOwnProperty("replace")
              ? option[0].replace
              : option[0].overWrite;

            if (replace) {
              Object.assign(item, { zhCN, usEN });
              next(item);
            } else {
              !ignore &&
                Object.assign(item, {
                  side: { zhCN: `[${zhCN}]`, usEN: `[${usEN}]` }
                });
              next(item);
            }
          } else {
            next(item);
          }
        }
      });
    },
    checkItemType(item) {
      return new Promise((next, stop) => {
        const { option, manual = false, subItem = false } = item;

        if (item.temporary) stop("openFood");

        if (item.marketPrice) stop("marketPrice");

        if (subItem) {
          this.addSubMenuItem(item);
          stop();
        }

        if (!manual && option[0]) {
          if (option[0].template)
            this.config.display.autoTemplate ? stop("template") : stop();
          if (option[0].subMenu) stop("subMenu");
        }

        next(item);
      });
    },
    specialItemHandler(item, type, index) {
      index = index || 0;

      switch (type) {
        case "openFood":
          this.$p("temporaryItem", { item });
          break;
        case "marketPrice":
          this.$p("modify", { item, marketPrice: true });
          break;
        case "weightFood":
          break;
        case "subMenu":
          item ? this.addToOrder(item) : (item = this.item);
          const { subMenu, maxSubItem, overCharge } = item.option[index];
          Object.assign(this.item, { rules: { maxSubItem, overCharge } });
          this.getSubMenuItem(subMenu);
          break;
        case "template":
          item ? this.addToOrder(item) : (item = this.item);
          this.$p("templateItem", { side: item.option[index], index });
          break;
        default:
      }
    },
    setOption(side, index) {
      const { skip, ignore } = side;

      side.subMenu && this.specialItemHandler(null, "subMenu", index);
      side.template && this.specialItemHandler(null, "template", index);

      (!skip || !ignore) && this.alterItemOption({ side, index });
    },
    getSubMenuItem(groups) {
      if (this.openSubGroup) {
        this.setCategory();
        this.openSubGroup = false;
        return;
      }

      const lastIndex = groups.length - 1;
      let items = [];

      groups.forEach((name, index) => {
        let subItems = JSON.parse(JSON.stringify(this.submenu[name] || []));
        let align = 6 - subItems.length % 3;
        align === 6 && (align = 3);

        index !== lastIndex &&
          Array(align)
            .fill()
            .forEach(_ =>
              subItems.push({
                zhCN: "",
                usEN: "",
                clickable: false,
                group: null
              })
            );
        items.push(...subItems);
      });

      length < 33 &&
        Array(33 - items.length)
          .fill()
          .forEach(_ =>
            items.push({ zhCN: "", usEN: "", clickable: false, group: null })
          );

      this.items = items;
      this.openSubGroup = true;
    },
    addSubMenuItem(item) {
      const { zhCN, usEN, print, price, subItem, _id } = item;

      let content = {
        qty: 1,
        zhCN,
        usEN,
        print,
        single: price,
        subItem,
        price: price.toFixed(2),
        key: _id.slice(-4)
      };

      const itemCount = Array.isArray(this.item.choiceSet)
        ? this.item.choiceSet
            .filter(i => i.subItem)
            .map(i => i.qty)
            .reduce((a, b) => a + b, 0)
        : 0;

      if (subItem && this.item.hasOwnProperty("rules")) {
        const maxAllow = this.item.rules.maxSubItem * this.item.qty || Infinity;
        const overCharge = this.item.rules.overCharge || 0;

        if (itemCount >= maxAllow && overCharge === 0) {
          const prompt = {
            title: "dialog.unableAdd",
            msg: ["dialog.maxSubItem", this.item[this.language], maxAllow],
            timeout: { duration: 5000, fn: "resolve" },
            buttons: [{ text: "button.confirm", fn: "resolve" }]
          };

          this.$dialog(prompt).then(() => this.$q());
          return;
        } else if (overCharge > 0) {
          content.single += overCharge;
          content.price = content.single.toFixed(2);
        }

        let dom = document.querySelector(".sub.target");
        dom ? this.alertChoiceSet(content) : this.setChoiceSet(content);
      }

      let printer = {};
      print.forEach(device => (printer[device] = {}));
      Object.assign(this.item.printer, printer);
    },
    ...mapActions([
      "setApp",
      "setOrder",
      "setTicket",
      "setSides",
      "addToOrder",
      "setChoiceSet",
      "alertChoiceSet",
      "alterItemOption"
    ])
  },
  watch: {
    categoryIndex(index) {
      this.setCategory(index);
    }
  }
};
</script>