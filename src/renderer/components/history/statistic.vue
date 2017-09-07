<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{$t('title.stats')}}</span>
            </header>
            <div class="inner">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {

        }
    }
}
</script>

<style scoped>
.window{
    width: 850px;
}
.inner{
    height: 650px;
}
</style>