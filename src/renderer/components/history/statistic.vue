<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="window">
            <header class="title">
                <span>{{$t('title.stats')}}</span>
            </header>
            <div class="inner">
    123
            </div>
            <footer>
                <div class="btn">{{$t('button.confirm')}}</div>
            </footer>
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

</style>