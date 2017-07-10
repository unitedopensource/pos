<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="window">
            <header class="title">
                <span>{{text('GIFT_CARD')}}</span>
                <i class="fa fa-close" @click.self="init.reject"></i>
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
    props:['init']
}
</script>

<style scoped>
.window{
    width: 950px;
    height: 650px;
    display: flex;
    flex-direction: column;
}
.title{
    padding: 13px 27px;
}
.title i{
    padding:16px 25px;
}
.inner{
    flex:1;
}
.btn{
    margin:5px;
}
</style>