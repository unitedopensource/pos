<template>
    <div class="popupMask dark center">
        <div class="editor">
            <header>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.footer')}}</h3>
            </header>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    footer: "";
  },
  methods: {
    confirm() {}
  }
};
</script>