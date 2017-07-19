<template>
  <div class="summary" :class="{hide:!isDisplay}">
    <div class="filter active" @click="setFilter('',$event)">
      <span class="text">{{text('ALL_INVOICE')}}</span>
      <span>({{summary.total}})</span>
      <div class="value">$ {{summary.totalSum}}</div>
    </div>
    <div class="filter" @click="setFilter('WALK_IN',$event)" v-show="summary.walkin">
      <div class="text">{{text('WALK_IN_INVOICE')}}
        <span>({{summary.walkin}})</span>
      </div>
      <div class="value">$ {{summary.walkinSum}}</div>
    </div>
    <div class="filter" @click="setFilter('PICK_UP',$event)" v-show="summary.pickup">
      <div class="text">{{text('PICK_UP_INVOICE')}}
        <span>({{summary.pickup}})</span>
      </div>
      <div class="value">$ {{summary.pickupSum}}</div>
    </div>
    <div class="filter" @click="setFilter('DELIVERY',$event)" v-show="summary.delivery">
      <div class="text">{{text('DELIVERY_INVOICE')}}
        <span>({{summary.delivery}})</span>
      </div>
      <div class="value">$ {{summary.deliverySum}}</div>
    </div>
    <div class="filter" @click="setFilter('DINE_IN',$event)" v-show="summary.dinein">
      <div class="text">{{text('DINE_IN_INVOICE')}}
        <span>({{summary.dinein}})</span>
      </div>
      <div class="value">$ {{summary.dineinSum}}</div>
    </div>
    <div class="filter" @click="setFilter('UNSETTLE',$event)" v-show="summary.unsettle">
      <div class="text">{{text('UNPAID_INVOICE')}}
        <span>({{summary.unsettle}})</span>
      </div>
      <div class="value">$ {{summary.unsettleSum}}</div>
    </div>
    <div class="filter dropdown" @click="setFilter('DRIVER',$event)" v-show="Object.keys(summary.driver).length !== 0">
      <div class="text">{{text('BY_DRIVER')}}<span v-if="driver">{{driver}} ({{summary.driver[driver].count}})</span></div>
      <div class="value">{{driver ? '$ '+summary.driver[driver].total.toFixed(2) : Object.keys(summary.driver).length}}</div>
      <div class="drivers" v-show="!driver">
        <div class="driver" v-for="(value,key,index) in summary.driver" :key="index" @click.stop="setDriver(key)">
          <span>Driver #{{key}}</span>
          <span class="price">$ {{value.total.toFixed(2)}}</span>
        </div>
      </div>
    </div>
    <div class="date">{{date}}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['data', 'date'],
  created() {
    this.isDisplay = this.op.view && this.op.view.includes("summary");
  },
  methods: {
    setFilter(type, e) {
      this.driver = null;
      document.querySelector('.filter.active').classList.remove("active");
      e.currentTarget.classList.add("active");
      let dom = document.querySelector(".invoice.active");
      dom && dom.classList.add("active");
      this.$emit("filter", type);
    },
    setDriver(id) {
      this.driver = id;
      this.$emit("filter", "DRIVER", id)
    }
  },
  data() {
    return {
      isDisplay: false,
      driver: null
    }
  },
  computed: {
    summary() {
      let total = 0, totalSum = 0, totalTip = 0, totalGratuity = 0,
        walkin = 0, walkinSum = 0, walkinTip = 0, walkinGratuity = 0,
        pickup = 0, pickupSum = 0, pickupTip = 0, pickupGratuity = 0,
        delivery = 0, deliverySum = 0, deliveryTip = 0, deliveryGratuity = 0, deliveryFee = 0,
        dinein = 0, dineinSum = 0, dineinTip = 0, dineinGratuity = 0,
        bar = 0, barSum = 0, barTip = 0, barGratuity = 0,
        hibachi = 0, hibachiSum = 0, hibachiTip = 0, hibachiGratuity = 0,
        settle = 0, settleSum = 0, unsettle = 0, unsettleSum = 0,
        voided = 0, voidedSum = 0,
        cash = 0, credit = 0, gift = 0, discountSum = 0,
        corrupted = 0,
        driver = {},
        length = this.data.length;

      for (let i = 0; i < length; i++) {
        let invoice = this.data[i];
        if (this.data[i].status === 1) {
          if (invoice.payment) {
            total++;
            totalSum += (invoice.payment.total - invoice.payment.discount);
            discountSum += invoice.payment.discount;
          } else {
            corrupted++;
            continue;
          }

          switch (invoice.type) {
            case "WALK_IN":
              walkin++;
              walkinSum += (invoice.payment.total - invoice.payment.discount);
              walkinTip += invoice.payment.tip;
              walkinGratuity += invoice.payment.gratuity;
              break;
            case "PICK_UP":
              pickup++;
              pickupSum += (invoice.payment.total - invoice.payment.discount);
              pickupTip += invoice.payment.tip;
              pickupGratuity += invoice.payment.gratuity;
              break;
            case "DELIVERY":
              delivery++;
              deliverySum += (invoice.payment.total - invoice.payment.discount);
              deliveryTip += invoice.payment.tip;
              deliveryGratuity += invoice.payment.gratuity;
              deliveryFee += invoice.deliveryFree ? 0 : invoice.payment.delivery;
              if (invoice.driver) {
                if (driver.hasOwnProperty(invoice.driver)) {
                  let name = invoice.driver;
                  driver[name].count++;
                  driver[name].total += (invoice.payment.total - invoice.payment.discount);
                  driver[name].discount += (invoice.payment.discount ? invoice.payment.discount : 0);
                  driver[name].tip += (invoice.payment.tip ? invoice.payment.tip : 0);
                  driver[name].gratuity += (invoice.payment.gratuity ? invoice.payment.grauity : 0);
                  driver[name].charge += (invoice.deliveryFree ? 0 : invoice.payment.delivery ? invoice.payment.delivery : 0);
                } else {
                  driver[invoice.driver] = {
                    count: 1,
                    total: invoice.payment.total,
                    discount: invoice.payment.discount ? invoice.payment.discount : 0,
                    tip: invoice.payment.tip ? invoice.payment.tip : 0,
                    gratuity: invoice.payment.gratuity ? invoice.payment.gratuity : 0,
                    charge: invoice.deliveryFree ? 0 : invoice.payment.delivery ? invoice.payment.delivery : 0
                  }
                }
              }
              break;
            case "DINE_IN":
              dinein++;
              dineinSum += (invoice.payment.total - invoice.payment.discount);
              dineinTip += invoice.payment.tip;
              dineinGratuity += invoice.payment.gratuity;
              break;
            case "BAR":
              bar++;
              barSum += (invoice.payment.total - invoice.payment.discount);
              barTip += invoice.payment.tip;
              barGratuity += invoice.payment.gratuity;
          }
          if (!invoice.settled) {
            unsettle++;
            unsettleSum += (invoice.payment.total - invoice.payment.paid);
          } else {
            settle++;
            settleSum += invoice.payment.paid;
            invoice.payment.hasOwnProperty('paidCash') && (cash += parseFloat(invoice.payment.paidCash));
            invoice.payment.hasOwnProperty('paidCredit') && (credit += parseFloat(invoice.payment.paidCredit));
            invoice.payment.hasOwnProperty('paidGift') && (credit += parseFloat(invoice.payment.paidGift));
          }
        } else if (this.data[i].status === 0) {
          voided++;
          voidedSum += invoice.payment.total;
        }
      }
      totalSum = totalSum.toFixed(2);
      totalTip = totalTip.toFixed(2);
      totalGratuity = totalGratuity.toFixed(2);
      walkinSum = walkinSum.toFixed(2);
      walkinTip = walkinTip.toFixed(2);
      walkinGratuity = walkinGratuity.toFixed(2);
      pickupSum = pickupSum.toFixed(2);
      pickupTip = pickupTip.toFixed(2);
      pickupGratuity = pickupGratuity.toFixed(2);
      deliverySum = deliverySum.toFixed(2);
      deliveryTip = deliveryTip.toFixed(2);
      deliveryFee = deliveryFee.toFixed(2);
      dineinSum = dineinSum.toFixed(2);
      dineinTip = dineinTip.toFixed(2);
      dineinGratuity = dineinGratuity.toFixed(2);
      unsettleSum = unsettleSum.toFixed(2);
      voidedSum = voidedSum.toFixed(2);
      cash = cash.toFixed(2);
      credit = credit.toFixed(2);
      gift = gift.toFixed(2);


      return {
        total, totalSum, totalTip, totalGratuity,
        walkin, walkinSum, walkinTip, walkinGratuity,
        pickup, pickupSum, pickupTip, pickupGratuity,
        delivery, deliverySum, deliveryTip, deliveryGratuity, deliveryFee,
        dinein, dineinSum, dineinTip, dineinGratuity,
        unsettle, unsettleSum,
        voided, voidedSum,
        cash, credit, gift,
        driver, corrupted
      };
    },
    ...mapGetters(['op'])
  }
}
</script>

<style scoped>
.filter {
  padding: 13px 10px;
  cursor: pointer;
  text-align: center;
  color: #FAFAFA;
  min-width: 70px;
  transition: background 0.22s linear;
}

.filter.active {
  background: #fff;
  font-weight: bold;
  border-bottom: 2px solid #FF9800;
  color: #263238;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.dropdown {
  position: relative;
}

.dropdown.active .drivers {
  display: block;
}

.dropdown.active::after {
  content: ' ';
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  margin: auto;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 10px 0 10px;
  border-color: #FF9800 transparent transparent transparent;
}

.summary.hide .value {
  visibility: hidden;
}

.date {
  position: absolute;
  right: 0;
  font-size: 3em;
  font-style: italic;
  padding: 0px 37px;
  font-family: fantasy;
  color: #F5F5F5;
  text-shadow: 0 1px 3px #000;
}

.drivers {
  position: absolute;
  display: none;
  z-index: 2;
  top: 75px;
  left: 0;
  width: 100%;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.driver {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.price {
  font-weight: lighter;
  color: gray;
}
</style>