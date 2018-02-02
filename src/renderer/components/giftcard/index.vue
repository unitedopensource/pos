<template>
    <div class="popupMask dark center">
        <div class="editor" v-show="!component">
            <header class="tab">
                <div>
                    <h5></h5>
                    <h3>{{$t('card.giftCard')}}</h3>
                </div>
                <nav class="tabs">
                    <div>
                        <input type="radio" v-model="tab" value="activation" name="tab" id="activation">
                        <label for="activation">{{$t('card.activation')}}</label>
                    </div>
                    <div>
                        <input type="radio" v-model="tab" value="reload" name="tab" id="reload">
                        <label for="reload">{{$t('card.reload')}}</label>
                    </div>
                    <div>
                        <input type="radio" v-model="tab" value="history" name="tab" id="history">
                        <label for="history">{{$t('card.history')}}</label>
                    </div>
                </nav>
            </header>
            <div class="wrap">
                <template v-if="tab === 'activation'">

                </template>
                <template v-else-if="tab === 'deactivation'">

                </template>
                <template v-else-if="tab === 'reload'">

                </template>
                <template v-else>

                </template>
            </div>
            <footer>
                <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import capture from "./capture";

export default {
  props: ["init"],
  components: { capture },
  data() {
    return {
      activated: false,
      tab: "activation",
      component: null,
      componentData: null
    };
  },
  methods: {

  }
};
</script>

<style scoped>
.editor{
    width: 550px;
}
</style>