<template>
    <div>
        <div class="main">
            <span class="qty">{{item.qty}}</span>
            <span>
                <span class="item">{{item[language]}}</span>
                <span class="side">{{item.side[language]}}</span>
            </span>
            <template v-if="split">
                <i class="fa fa-unlock" @click.stop="setLock" v-if="lock"></i>
                <i class="fa fa-lock" @click.stop="setLock" v-else></i>
            </template>
            <template v-else>
                <span></span>
            </template>
        </div>
        <div class="sub">
            <p v-for="(sub,idx) in item.choiceSet" :key="idx">
                <span class="qty">{{item.qty}}</span>
                <span>{{sub[language]}}</span>
            </p>
        </div>
    </div>
</template>

<script>
export default {
  props: ["item", "split", "language"],
  data() {
    return {
      lock: false
    };
  },
  methods:{
      setLock(){
          this.lock = !this.lock;
      }
  }
};
</script>

<style scoped>
.main {
  position: relative;
}

.main i {
  display: none;
  position: absolute;
  right: -5px;
  top: -5px;
  padding: 5px 15px;
  background: #9e9e9e;
  cursor: pointer;
}

.picked .main i {
  display: initial;
}

.main .qty {
  display: inline-block;
  min-width: 20px;
  text-align: center;
}

.side {
  color: rgba(0, 0, 0, 0.5);
  margin-left: 2px;
}

.sub {
  color: #ff9800;
  font-size: 0.8em;
  text-indent: 2em;
}

.sub .qty:after {
  content: " x ";
}

li.picked .main,
li.picked .main .side,
li.picked .sub {
  color: #fff;
}
</style>