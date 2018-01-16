<template>
    <div class="popupMask dark center" @click.stop="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('text.selectHibachiTable')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <div class="layout">
                    <div class="left"></div>
                    <div class="middle"></div>
                    <div class="right"></div>
                </div>
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
    return {
      tables: []
    };
  },
  methods: {
    confirm() {}
  }
};
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 30px 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  grid-template-areas: "left middle right";
}

.left {
  background: #2c3e50;
  grid-area: left;
}

.right {
  background: #c0392b;
  grid-area: right;
}

.middle {
  background: #7f8c8d;
  grid-area: middle;
}
</style>