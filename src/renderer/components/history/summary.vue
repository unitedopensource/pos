<template>
  <div class="summary" :class="{hide:!isDisplay}">
    <div class="filter active" @click="setFilter('',$event)">
      <span class="text">{{$t('type.allInvoice')}}</span>
      <span>({{summary.total}})</span>
      <div class="value">$ {{summary.totalAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('WALK_IN',$event)" v-show="summary.walkIn">
      <div class="text">{{$t('type.walkInInvoice')}}
        <span>({{summary.walkIn}})</span>
      </div>
      <div class="value">$ {{summary.walkInAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('PICK_UP',$event)" v-show="summary.pickUp">
      <div class="text">{{$t('type.pickUpInvoice')}}
        <span>({{summary.pickUp}})</span>
      </div>
      <div class="value">$ {{summary.pickUpAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('DELIVERY',$event)" v-show="summary.deliveries">
      <div class="text">{{$t('type.deliveryInvoice')}}
        <span>({{summary.deliveries}})</span>
      </div>
      <div class="value">$ {{summary.deliveryAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('DINE_IN',$event)" v-show="summary.dineIn">
      <div class="text">{{$t('type.dineInInvoice')}}
        <span>({{summary.dineIn}})</span>
      </div>
      <div class="value">$ {{summary.dineInAmount | decimal}}</div>
    </div>
    <div class="filter" @click="setFilter('UNSETTLE',$event)" v-show="summary.unsettle">
      <div class="text">{{$t('type.unpaidInvoice')}}
        <span>({{summary.unsettle}})</span>
      </div>
      <div class="value">$ {{summary.unsettleAmount |decimal}}</div>
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
      let totalAmount = 0, walkIn = 0, walkInAmount = 0, pickUp = 0, pickUpAmount = 0, deliveries = 0, deliveryAmount = 0,
        dineIn = 0, dineInAmount = 0, buffet = 0, buffetAmount = 0, hibachi = 0, hibachiAmount = 0, bar = 0, barAmount = 0,
        unsettle = 0, unsettleAmount = 0, voided = 0, voidedAmount = 0, driver = {};

      let invoices = this.approval(this.op.view, "invoices") ? this.data : this.data.filter(ticket => ticket.server === this.op.name);
      let total = invoices.length;

      invoices.forEach(invoice => {
        let { subtotal, tax, tip, gratuity, delivery, discount, total } = invoice.payment;
        let amount = parseFloat(subtotal) + parseFloat(tax) - parseFloat(discount);

        if (invoice.status === 1) {
          totalAmount += amount;

          switch (invoice.type) {
            case 'WALK_IN':
              walkIn++;
              walkInAmount += amount;
              break;
            case 'PICK_UP':
              pickUp++;
              pickUpAmount += amount;
              break;
            case 'DELIVERY':
              deliveries++;
              deliveryAmount += amount + parseFloat(delivery);

              if (invoice.driver) {
                if (driver.hasOwnProperty(invoice.driver)) {
                  let name = invoice.driver;
                  driver[name].count++;
                  driver[name].total += amount;
                  driver[name].discount += parseFloat(discount);
                  driver[name].tip += parseFloat(tip);
                  driver[name].gratuity += parseFloat(gratuity);
                  driver[name].charge += invoice.deliveryFree ? 0 : parseFloat(delivery);
                } else {
                  driver[invoice.driver] = {
                    count: 1,
                    total: amount,
                    discount: parseFloat(discount),
                    tip: parseFloat(tip),
                    gratuity: parseFloat(gratuity),
                    charge: invoice.deliveryFree ? 0 : parseFloat(delivery)
                  }
                }
              }
              break;
            case 'DINE_IN':
              dineIn++;
              dineInAmount += amount;
              break;
            case 'BUFFET':
              buffet++;
              buffetAmount += amount;
              break;
            case 'HIBACHI':
              hibachi++;
              hibachiAmount += amount;
              break;
            case 'BAR':
              bar++;
              barAmount += amount;
              break;
          }

          //unsettled
          if (!invoice.settled) {
            unsettle++;
            unsettleAmount += amount;
          }

        } else {
          voided++;
          voidedAmount += amount
        }
      })

      return {
        total, totalAmount,
        pickUp, pickUpAmount,
        walkIn, walkInAmount,
        deliveries, deliveryAmount,
        dineIn, dineInAmount,
        buffet, buffetAmount,
        hibachi, hibachiAmount,
        bar, barAmount,
        unsettle, unsettleAmount,
        driver
      }
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