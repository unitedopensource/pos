<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.calendar')}}</h3>
            </header>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn">{{$t('button.confirm')}}</button>
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
  methods: {}
};
</script>

<style scoped>

</style>

