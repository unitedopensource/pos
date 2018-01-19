<template>
  <div class="groups">
    <div class="group" v-for="(group,index) in groups" :key="index">
      <div class="seat">{{seats[index]}}</div>
      <div class="items">
        <div v-for="(item,idx) in group" :key="idx">
          <div class="main">
            <span class="qty">{{item.qty}}</span>
            <span class="wrap">
              <span class="item">{{item[language]}}</span>
              <span class="side">{{item.side[language]}}</span>
            </span>
            <span class="price">{{item.total}}</span>
          </div>
          <div class="sub" v-for="(set,i) in item.choiceSet" :key="i">
            <span class="qty">{{set.qty}}</span>
            <span class="name">{{set[language]}}</span>
            <span class="price" :class="{hide:parseFloat(set.price) === 0}">({{set.price | decimal}})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["items", "seats"],
  data() {
    return {
      language: this.$store.getters.language,
      groups: []
    };
  },
  created() {

  },
  watch: {
    items: {
      handler(items) {
        let groups = [];
        this.seats.forEach((seat, index) => {
          groups[index].push(items.filter(item => item.seat === seat))
        });

        this.groups = groups;
      }, deep: true
    }
  }
};
</script>

<style scoped>

</style>