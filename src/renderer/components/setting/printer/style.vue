<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.printer.config',params:{printer}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <div class="title"><h3>{{printer}}</h3></div>
            <nav>
                <span class="add">{{$t('button.default')}}</span>
            </nav>
        </header>
        <toggle title="print.storeContact"></toggle>
        <toggle title="print.title"></toggle>
        <toggle title="print.customer"></toggle>
        <toggle title="print.payment"></toggle>
        <section class="cards">
            <div class="card">
                <div class="header">
                    <span>{{$t('text.primary')}}</span>
                    <i class="fa fa-bars"></i>
                    <switches></switches>
                </div>
                <div>
                    <inputer title="print.fontFamily"></inputer>
                    <range title="print.fontSize" :min="0" :max="40" :step="1"></range>
                    <switches title="print.itemPrice"></switches>
                    <switches title="print.menuID"></switches>
                </div>
            </div>
             <div class="card">
                <div class="header">
                    <span>{{$t('text.secondary')}}</span>
                    <i class="fa fa-bars"></i>
                    <switches></switches>
                </div>
                <div>
                    <inputer title="print.fontFamily"></inputer>
                    <range title="print.fontSize" :min="0" :max="40" :step="1"></range>
                    <switches title="print.itemPrice"></switches>
                    <switches title="print.menuID"></switches>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import range from "../common/range";
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import options from "../common/options";
import switches from "../common/switches";


export default {
    props: ["printer"],
    components: { range, inputer, switches, options, toggle },
    data() {
        return {
            layout: {}
        };
    },
    created() {
        this.layout = this.$store.getters.config.printers[this.printer].style;
    },
    methods: {

    }
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  height: 25px;
}

.card {
  margin-top: 5px;
  padding: 5px 18px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.header span {
  flex: 1;
}

.header i {
  width: 50px;
  text-align: center;
  margin-right: 20px;
  cursor: pointer;
}

section.cards {
  padding: 0px 5px 5px;
}
</style>