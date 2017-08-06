<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="config" :style="offsetTop">
      <div class="option">
        <span class="text">{{text('TAX_FREE')}}</span>
        <label class="input-toggle">
          <input type="checkbox" v-model="init.taxFree" @change="toggleTax">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="text">{{text('DELIVERY_FREE')}}</span>
        <label class="input-toggle" @change="toggleDelivery">
          <input type="checkbox" v-model="init.deliveryFree">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="text">{{text('DP_CATEGORY')}}</span>
        <label class="input-toggle" @change="toggleViewCategory">
          <input type="checkbox" v-model="viewCategory">
          <span></span>
        </label>
      </div>
      <div class="option">
        <span class="text">{{text('MENU_ID')}}</span>
        <label class="input-toggle" @change="toggleMenuID">
          <input type="checkbox" v-model="init.menuID">
          <span></span>
        </label>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  props: ['init'],
  mounted() {
    let dom = document.querySelector('.order.showCategory');
    dom && (this.viewCategory = true);
    dom = document.querySelector('.middle');
    this.offsetTop = {
      bottom: (dom.offsetParent.offsetHeight - dom.offsetTop + 3) + 'px'
    };
  },
  data() {
    return {
      viewCategory: false,
      offsetTop: {}
    }
  },
  methods: {
    toggleTax() {
      this.$emit("trigger", {
        taxFree: this.init.taxFree
      });
    },
    toggleDelivery() {
      this.$emit("trigger", {
        deliveryFree: this.init.deliveryFree
      })
    },
    toggleMenuID() {
      let display = Object.assign({}, this.config.display, { menuID: this.init.menuID });
      this.setConfig({ display });
    },
    toggleViewCategory() {
      let dom = document.querySelector('.order');
      this.viewCategory ?
        dom.classList.add("showCategory") :
        dom.classList.remove("showCategory");
    },
    ...mapActions(['setConfig'])
  },
  computed: {
    ...mapGetters(['config'])
  }
}
</script>
<style scoped>
.popupMask {
  z-index: 1;
}

.config {
  position: absolute;
  right: 0px;
  width: 285px;
  z-index: 3;
  background: #fff;
}

.option {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #ddd;
  border-left: 3px solid #00BCD4;
}

.option:last-child {
  border-bottom: none;
}

.text {
  min-width: 120px;
  text-align: right;
}
</style>
