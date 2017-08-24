<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="window">
            <header class="title">
                <span>{{$t('history.stats')}}</span>
            </header>
            <div class="inner">
    
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

<style></style>