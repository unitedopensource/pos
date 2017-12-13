<template>
    <div>        
        <header class="nav">
            <div class="title">
                <h5></h5>
                <h3>{{$t("title.printer")}}</h3>
            </div>
            <nav>
                <span class="add" @click="create">{{$t('button.new')}}</span>
            </nav>
        </header>
        <external :title="printer" v-for="(printer,index) in printers" :key="index" @open="config(printer)"></external>
    </div>
</template>

<script>
import external from "../common/external";
export default {
  components: { external },
  data() {
    return {
      printers: Object.keys(this.$store.getters.config.printers)
    };
  },
  methods:{
      create(){

      },
      config(printer){

      }
  }
};
</script>