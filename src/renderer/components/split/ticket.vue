<template>
  <ul @click.self="tap" v-if="enable" :class="[{remove:order.content.length === 0},unique]">
    <li v-for="(item,index) in order.content" :key="index" @click="pick(item)" :data-unique="item.unique" v-show="!item.split">
      <div class="main">
        <span class="qty">{{item.qty}}</span>
        <span>{{item[language]}}
          <span class="side">{{item.side[language]}}</span>
        </span>
        <span></span>
      </div>
      <div class="sub">
        <p v-for="(sub,idx) in item.choiceSet" :key="idx">
          <span class="qty">{{item.qty}}</span>
          <span>{{sub[language]}}</span>
        </p>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  props: ["data", "master", "index"],
  computed: {
    enable() {
      return this.master
        ? this.order.content.filter(i => !i.split).length !== 0
        : true;
    }
  },
  data() {
    return {
      order: JSON.parse(JSON.stringify(this.data)),
      language: this.$store.getters.language,
      buffer: [],
      unique:
        "s" +
        Math.random()
          .toString(36)
          .substr(2, 2)
    };
  },
  created() {
    if (this.master) {
      this.$bus.on("reset", this.hide);
      this.$bus.on("restore", this.restore);
    } else {
      this.$bus.on("reset", this.remove);
      this.$bus.on("transfer", this.transfer);
    }
  },
  beforeDestroy() {
    if (this.master) {
      this.$bus.off("reset", this.hide);
      this.$bus.off("restore", this.restore);
    } else {
      this.$bus.off("reset", this.remove);
      this.$bus.off("transfer", this.transfer);
    }
  },
  methods: {
    pick(item) {
      if (this.master) {
        item = JSON.parse(JSON.stringify(item));
        item.parent = item.unique;
      }

      const index = this.buffer.findIndex(i => i.unique === item.unique);
      index !== -1 ? this.buffer.splice(index, 1) : this.buffer.push(item);
    },
    hide(item) {
      this.buffer.forEach(item => {
        const { unique } = item;
        const index = this.order.content.findIndex(i => i.unique === unique);
        this.order.content[index].split = true;
      });
      this.order.content.splice();
      this.buffer = [];
    },
    remove() {
      this.buffer.forEach(item => {
        const { unique } = item;
        const index = this.order.content.findIndex(i => i.unique === unique);
        this.order.content.splice(index, 1);
      });
      this.buffer = [];
    },
    restore(items) {
      this.order.content.forEach(item => {
        if (items.includes(item.unique)) item.split = false;
      });
      this.buffer = [];
      this.order.content.splice();
      this.$bus.emit("reset");
    },
    transfer({ unique, items }) {
      this.unique === unique && this.order.content.push(...items);
      this.$bus.emit("reset");
    },
    tap() {
      this.buffer = [];
      this.order.content.length === 0
        ? this.$emit("destroy", this.index)
        : this.$emit("acquire", { index: this.index, unique: this.unique });
    }
  },
  watch: {
    buffer(items) {
      const uniques = items.map(i => i.unique);

      let picked = document.querySelectorAll(`ul.${this.unique} li.picked`);
      for (let dom of picked) {
        dom.classList.remove("picked");
      }

      let doms = document.querySelectorAll(`ul.${this.unique} [data-unique]`);
      for (let dom of doms) {
        const { unique } = dom.dataset;
        uniques.includes(unique) && dom.classList.add("picked");
      }
    }
  }
};
</script>

<style scoped>
ul {
  min-width: 250px;
  min-height: 400px;
  margin: 5px;
  background: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  position: relative;
}

li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 30px;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 5px;
}

.side {
  color: rgba(0, 0, 0, 0.5);
  margin-left: 2px;
}

.main .qty {
  display: inline-block;
  min-width: 20px;
  text-align: center;
}

.sub {
  color: #ff9800;
  font-size: 0.8em;
  text-indent: 2em;
}

.sub .qty:after {
  content: " x ";
}

li.picked {
  background: #9e9e9e;
}

li.picked .main,
li.picked .sub {
  color: #fff;
}

ul.remove {
  background: rgba(0, 0, 0, 0.15);
  position: relative;
}

ul.remove:before {
  position: absolute;
  font-family: FontAwesome;
  content: "\F00D";
  font-size: 4em;
  color: #f44336;
  cursor: pointer;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 50px;
  height: 70px;
}
</style>