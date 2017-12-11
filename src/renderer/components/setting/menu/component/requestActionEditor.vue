<template>
    <div class="popupMask setting dark center">
        <div class="editor">
            <header>
                <h5></h5>
                <h3></h3>
            </header>
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
  }
};
</script>