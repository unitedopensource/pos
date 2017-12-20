<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.footer')}}</h3>
            </header>
            <div class="wrap">
                <inputer type="textarea" v-model="footer" title="text.footer" :center="true"></inputer>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
export default {
  props: ["init"],
  components: { inputer },
  data() {
    return {
      footer: this.init.footer
    };
  },
  methods: {
    confirm() {
      this.init.resolve(this.footer.split(String.fromCharCode(10)));
    }
  }
};
</script>