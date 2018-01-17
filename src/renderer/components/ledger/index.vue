<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>2018-01-16</h5>
                    <h3>{{$t('title.ledger')}}</h3>
                </div>
                <nav class="tabs">
                    <div>
                        <input type="radio" v-model="tab" value="overview" name="tab" id="overview">
                        <label for="overview">{{$t('text.overview')}}</label>
                    </div>
                    <div>
                        <input type="radio" v-model="tab" value="detail" name="tab" id="detail">
                        <label for="detail">{{$t('text.detail')}}</label>
                    </div>
                </nav>
            </header>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.done')}}</button>
            </footer>
            <loader :display="loading"></loader>
        </div>
    </div>
</template>

<script>
import loader from "../common/loader";
export default {
  props: ["init"],
  components: { loader },
  data() {
    return {
      departments: this.$store.getters.config.departments,
      loading: true,
      tab: "overview"
    };
  },
  created() {
      setTimeout(()=>{
          this.loading= false;
      },5000)
  },
  methods: {
    confirm() {

    }
  }
};
</script>

<style scoped>
.editor {
  width: 900px;
  position: relative;
}

header {
  flex-direction: row;
  justify-content: flex-start;
}
</style>