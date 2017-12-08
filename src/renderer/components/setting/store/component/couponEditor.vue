<template>
    <div class="popupMask setting center">
        <div class="editor">
            <header></header>
            <div class="wrap">
                
            </div>
            <footer>
                <button class="btn" @click="init.confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props:["init"]
};
</script>

<style scoped>

</style>