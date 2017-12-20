<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('text.printer')}}</h3>
            </header>
            <div class="wrap">
                <inputer v-model="name" title="text.alias" :autoFocus="true" @keydown.enter.native="confirm"></inputer>
                <switches title="text.labelPrinter" v-model="label"></switches>
            </div>
            <footer>
                <div class="opt">
                    <checkbox title="text.assignToItems" v-model="assign"></checkbox>
                </div>
                <button class="btn" @click="confirm" :disabled="!name">{{$t('button.create')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";
import switches from "../../common/switches";
export default {
  props: ["init"],
  components: { inputer, switches, checkbox },
  data() {
    return {
      name: "",
      label: false,
      assign: true
    };
  },
  methods: {
    confirm() {
      if (!this.name) return;
      if (this.init.printers.includes(this.name)) return;

      this.init.resolve({
        name: this.name,
        label: this.label,
        assign: this.assign
      });
    }
  }
};
</script>