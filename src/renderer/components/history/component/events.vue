<template>
    <div class="popupMask dark center">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('text.event')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {};
  },
  methods: {
    confirm() {}
  }
};
</script>