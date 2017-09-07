<template>
  <div class="summary" :class="{hide:!isDisplay}">
    <div class="filter active" @click="setFilter('',$event)">
      <span class="text">{{$t('type.allInvoice')}}</span>
      <span>({{summary.total}})</span>
      <div class="value">$ {{summary.totalSum}}</div>
    </div>
    <div class="filter" @click="setFilter('WALK_IN',$event)" v-show="summary.walkin">
      <div class="text">{{$t('type.walkInInvoice')}}
        <span>({{summary.walkin}})</span>
      </div>
      <div class="value">$ {{summary.walkinSum}}</div>
    </div>
    <div class="filter" @click="setFilter('PICK_UP',$event)" v-show="summary.pickup">
      <div class="text">{{$t('type.pickUpInvoice')}}
        <span>({{summary.pickup}})</span>
      </div>
      <div class="value">$ {{summary.pickupSum}}</div>
    </div>
    <div class="filter" @click="setFilter('DELIVERY',$event)" v-show="summary.delivery">
      <div class="text">{{$t('type.deliveryInvoice')}}
        <span>({{summary.delivery}})</span>
      </div>
      <div class="value">$ {{summary.deliverySum}}</div>
    </div>
    <div class="filter" @click="setFilter('DINE_IN',$event)" v-show="summary.dinein">
      <div class="text">{{$t('type.dineInInvoice')}}
        <span>({{summary.dinein}})</span>
      </div>
      <div class="value">$ {{summary.dineinSum}}</div>
    </div>
    <div class="filter" @click="setFilter('UNSETTLE',$event)" v-show="summary.unsettle">
      <div class="text">{{$t('type.unpaidInvoice')}}
        <span>({{summary.unsettle}})</span>
      </div>
      <div class="value">$ {{summary.unsettleSum}}</div>
    </div>
    <div class="filter dropDown" @click="setFilter('DRIVER',$event)" v-show="Object.keys(summary.driver).length !== 0">
      <div class="text">{{$t('type.driverInvoice')}}
        <span v-if="driver">{{driver}} ({{summary.driver[driver].count}})</span>
      </div>
      <div class="value">{{driver ? '$ '+summary.driver[driver].total.toFixed(2) : Object.keys(summary.driver).length}}</div>
      <div class="drivers" v-show="!driver">
        <div class="driver" v-for="(value,key,index) in summary.driver" :key="index" @click.stop="setDriver(key)">
          <span>{{$t('text.driver')}} #{{key}}</span>
          <span class="price">$ {{value.total.toFixed(2)}}</span>
        </div>
      </div>
    </div>
    <transition name="fadeDown" appear>
      <div class="date">{{date}}</div>
    </transition>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['data', 'date'],
  data() {
    return {
      isDisplay: false,
      driver: null
    }
  },
  created() {
    this.isDisplay = (this.op.view && this.op.view.includes("summary") || this.op.role === 'Admin');
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

  computed: {
    summary() {
      let invoices = this.approval(this.op.view, "invoices") ? this.data : this.data.filter(ticket => ticket.server === this.op.name);

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
        length = invoices.length;

      for (let i = 0; i < length; i++) {
        let invoice = invoices[i];
        let due = isNumber(invoice.payment.due) ? parseFloat(invoice.payment.due) : invoice.payment.total - invoice.payment.discount;
        if (invoices[i].status === 1) {
          if (invoice.payment) {
            total++;
            totalSum += due;
            discountSum += parseFloat(invoice.payment.discount);
          } else {
            corrupted++;
            continue;
          }

          switch (invoice.type) {
            case "WALK_IN":
              walkin++;
              walkinSum += due;
              walkinTip += parseFloat(invoice.payment.tip);
              walkinGratuity += parseFloat(invoice.payment.gratuity);
              break;
            case "PICK_UP":
              pickup++;
              pickupSum += due;
              pickupTip += parseFloat(invoice.payment.tip);
              pickupGratuity += parseFloat(invoice.payment.gratuity);
              break;
            case "DELIVERY":
              delivery++;
              deliverySum += due;
              deliveryTip += parseFloat(invoice.payment.tip);
              deliveryGratuity += parseFloat(invoice.payment.gratuity);
              deliveryFee += invoice.deliveryFree ? 0 : parseFloat(invoice.payment.delivery);
              if (invoice.driver) {
                if (driver.hasOwnProperty(invoice.driver)) {
                  let name = invoice.driver;
                  driver[name].count++;
                  driver[name].total += due;
                  driver[name].discount += parseFloat(invoice.payment.discount);
                  driver[name].tip += parseFloat(invoice.payment.tip);
                  driver[name].gratuity += parseFloat(invoice.payment.gratuity);
                  driver[name].charge += (invoice.deliveryFree ? 0 : parseFloat(invoice.payment.delivery) ? parseFloat(invoice.payment.delivery) : 0);
                } else {
                  driver[invoice.driver] = {
                    count: 1,
                    total: due,
                    discount: invoice.payment.discount ? parseFloat(invoice.payment.discount) : 0,
                    tip: invoice.payment.tip ? parseFloat(invoice.payment.tip) : 0,
                    gratuity: invoice.payment.gratuity ? parseFloat(invoice.payment.gratuity) : 0,
                    charge: invoice.deliveryFree ? 0 : parseFloat(invoice.payment.delivery) ? parseFloat(invoice.payment.delivery) : 0
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
        } else if (invoices[i].status === 0) {
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

.dropDown {
  position: relative;
}

.dropDown.active .drivers {
  display: block;
}

.dropDown.active::after {
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
  padding: 0px 20px;
  font-family: 'Agency FB';
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgb(25, 25, 25);
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