<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('nav.submenu')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.alias" v-model="name" :autoFocus="true" @keydown.enter.native="confirm"></inputer>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!name">{{$t('button.confirm')}}</button>
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
      name: ""
    };
  },
  methods: {
    confirm() {
      if (!this.name) return;
      this.init.resolve(this.name);
    }
  }
};
</script>