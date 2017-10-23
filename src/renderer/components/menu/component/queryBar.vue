<template>
    <transition-group name="fadeUp" appear>
        <div v-show="query.length !== 0" class="bar" key="0">
            <span class="text">{{query}}</span>
        </div>
        <ul v-show="items.length" key="1">
            <li v-for="(item,index) in items" :key="index" class="item">
                <span class="index">{{index+1}}</span>
                <span class="name">{{item[language]}}</span>
            </li>
        </ul>
    </transition-group>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["query", "items"],
  computed: {
    ...mapGetters(["language"])
  }
};
</script>

<style scoped>
.bar {
  position: absolute;
  bottom: 420px;
  left: 10px;
  width: 265px;
  display: flex;
  justify-content: center;
}

.text {
  background: #404040;
  border-radius: 3px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.24);
  color: #fff;
  display: inline-block;
  line-height: 20px;
  margin-top: 8px;
  padding: 10px;
  min-width: 100px;
  text-align: center;
  font-size: 18px;
}

ul {
  position: absolute;
  bottom: 420px;
  left: 10px;
  width: 265px;
  background: rgb(64, 64, 64);
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 2px, rgba(0, 0, 0, 0.24) 0px 2px 4px;
}

li {
  display: flex;
  padding: 3px;
  color: #fff;
}
.index {
  width: 20px;
  padding-right: 10px;
  text-align: center;
}
.name {
  flex: 1;
}
</style>