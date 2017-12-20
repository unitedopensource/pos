<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('text.printer')}}</h3>
            </header>
            <div class="wrap">
                <inputer v-model="name" title="text.alias" :autoFocus="true" @keydown.enter.native="confirm"></inputer>
                <!-- label printer option -->
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="!name">{{$t('button.create')}}</button>
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
      if (!this.init.printers.includes(this.name)) return;

      this.init.resolve(this.name);
    }
  }
};
</script>