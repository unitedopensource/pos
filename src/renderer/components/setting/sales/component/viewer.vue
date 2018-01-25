<template>
    <div class="popupMask dark center setting" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.cashflow')}}</h3>
            </header>
            <div class="wrap">
                
            </div>
            <footer>
                <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
        
    };
  },
  methods: {

  }
};
</script>