<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="window">
            <header class="title">
                <span>{{text('STATISTIC')}}</span>
            </header>
            <div class="inner">
    
            </div>
            <footer>
                <div class="btn">{{text('CONFIRM')}}</div>
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