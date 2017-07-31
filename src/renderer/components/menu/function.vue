<template>
  <div class="function" v-if="layout ==='DINE_IN'">
    <div class="top">
      <div class="btn" @click="trigger('less')">
        <i class="fa fa-minus-square"></i>
        <span class="text">{{text("LESS")}}</span>
      </div>
      <div class="btn" @click="trigger('moreQty')">
        <i class="fa fa-plus-square"></i>
        <span class="text">{{text("MORE")}}</span>
      </div>
      <div class="btn" @click="trigger('request')">
        <i class="fa fa-commenting-o"></i>
        <span class="text">{{text("REQUEST")}}</span>
      </div>
    </div>
    <div class="bottomLeft">
      <div class="btn" @click="trigger('switchGuest')" v-if="store.table.seatOrder">
        <i class="fa fa-users"></i>
        <span class="text">{{text("SWITCH")}}</span>
      </div>
      <div class="btn" @click="trigger('split')" v-else>
        <i class="fa fa-columns"></i>
        <span class="text">{{text("SPLIT")}}</span>
      </div>
      <div class="btn" @click="trigger('course')">
        <i class="fa fa-clock-o"></i>
        <span class="text">{{text("TIMER")}}</span>
      </div>
      <div class="btn" @click="trigger('search')">
        <i class="fa fa-search"></i>
        <span class="text">{{text("SEARCH")}}</span>
      </div>
      <div class="btn" @click="trigger('done',false)">
        <i class="fa fa-save"></i>
        <span class="text">{{text("HOLD")}}</span>
      </div>
      <button class="btn" @click="trigger('modify')">
        <i class="fa fa-calculator"></i>
        <span class="text">{{text("MODIFY")}}</span>
      </button>
      <div class="btn" @click="trigger('exitConfirm')">
        <i class="fa fa-times"></i>
        <span class="text">{{text("EXIT")}}</span>
      </div>
    </div>
    <div class="bottomRight">
      <button class="btn long" @click="trigger('done',true)">
        <i class="fa fa-print"></i>
        <span class="text">{{text("DONE")}}</span>
      </button>
      <div class="btn" @click="trigger('switchLanguage')">
        <i class="fa fa-language"></i>
        <span class="text">中/EN</span>
      </div>
    </div>
  </div>
  <div class="grid" v-else-if="layout === 'BUFFET'">
    <div class="btn" @click="trigger('less')">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{text("LESS")}}</span>
    </div>
    <div class="btn" @click="trigger('moreQty')">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{text("MORE")}}</span>
    </div>
    <button class="btn" @click="trigger('modify')">
      <i class="fa fa-calculator"></i>
      <span class="text">{{text("MODIFY")}}</span>
    </button>
    <div class="btn settle" @click="trigger('settle')">
      <i class="fa fa-money"></i>
      <span class="text">{{text("PAYMENT")}}</span>
    </div>
    <div class="btn split" @click="trigger('split')">
      <i class="fa fa-columns"></i>
      <span class="text">{{text("SPLIT")}}</span>
    </div>
    <div class="btn" @click="trigger('save',false)">
      <i class="fa fa-save"></i>
      <span class="text">{{text("SAVE")}}</span>
    </div>
    <div class="btn" @click="trigger('exitConfirm')">
      <i class="fa fa-times"></i>
      <span class="text">{{text("EXIT")}}</span>
    </div>
    <div class="btn" @click="trigger('switchLanguage')">
      <i class="fa fa-language"></i>
      <span class="text">中/EN</span>
    </div>
  </div>
  <div class="function" v-else>
    <div class="btn" @click="trigger('less')">
      <i class="fa fa-minus-square"></i>
      <span class="text">{{text("LESS")}}</span>
    </div>
    <div class="btn" @click="trigger('moreQty')">
      <i class="fa fa-plus-square"></i>
      <span class="text">{{text("MORE")}}</span>
    </div>
    <div class="btn" @click="trigger('request')">
      <i class="fa fa-commenting-o"></i>
      <span class="text">{{text("REQUEST")}}</span>
    </div>
    <div class="btn" @click="trigger('settle')">
      <i class="fa fa-money"></i>
      <span class="text">{{text("PAYMENT")}}</span>
    </div>
    <div class="btn" @click="trigger('course')">
      <i class="fa fa-clock-o"></i>
      <span class="text">{{text("TIMER")}}</span>
    </div>
    <button class="btn" @click="trigger('save',true)">
      <i class="fa fa-print"></i>
      <span class="text">{{text("PRINT")}}</span>
    </button>
    <div class="btn" @click="trigger('search')">
      <i class="fa fa-search"></i>
      <span class="text">{{text("SEARCH")}}</span>
    </div>
    <div class="btn" @click="trigger('split')">
      <i class="fa fa-columns"></i>
      <span class="text">{{text("SPLIT")}}</span>
    </div>
    <div class="btn" @click="trigger('save',false)">
      <i class="fa fa-save"></i>
      <span class="text">{{text("SAVE")}}</span>
    </div>
    <button class="btn" @click="trigger('modify')">
      <i class="fa fa-calculator"></i>
      <span class="text">{{text("MODIFY")}}</span>
    </button>
    <div class="btn" @click="trigger('exitConfirm')">
      <i class="fa fa-times"></i>
      <span class="text">{{text("EXIT")}}</span>
    </div>
    <div class="btn" @click="trigger('switchLanguage')">
      <i class="fa fa-language"></i>
      <span class="text">中/EN</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['layout', 'split'],
  data() {
    return {
      isDisplayGuests: false
    }
  },
  methods: {
    trigger(fn, params) {
      this.$emit('trigger', fn, params);
      fn === 'switchLanguage' && this.$forceUpdate();
    }
  },
  computed: {
    ...mapGetters(['store'])
  }
}
</script>

<style scoped>
.bottomLeft {
  display: inline-block;
  width: 184px;
}

.bottomRight {
  display: inline-block;
  width: 90px;
  vertical-align: top;
}

.long {
  height: 129px;
}

.guests {
  display: inline-flex;
}

.grid {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto auto;
  padding: 3px 0 0 3px;
}

.btn.settle {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  width: 185px;
  height: 129px;
}

.btn.split {
  grid-column-start: 3;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
  height: 129px;
}
</style>
